import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import { assertSanitiserSafe } from './hardenInlineHtml.mjs';

// Proves the built file survives the container it actually ships into: an
// <iframe srcdoc> on a SharePoint page. A srcdoc document has no URL, so any
// asset that was not inlined simply fails, and it inherits the parent origin,
// which is what makes same-origin /_api/ calls possible at all.

const PORT = 4291;
const WEB = `http://127.0.0.1:${PORT}/sites/ISEA`;
// Defaults to the local build, but takes a path so a *downloaded release
// asset* can be put through the same checks — verifying the artifact that will
// actually be deployed, rather than a rebuild that merely ought to match it.
const target = process.argv[2]
  ? new URL(process.argv[2], `file://${process.cwd()}/`)
  : new URL('../build-singlefile/metcal-quality.html', import.meta.url);
const appHtml = readFileSync(target, 'utf8');

const hostPage = `<!doctype html><html><head><meta charset="utf-8"></head>
<body style="margin:0">
  <script>window._spPageContextInfo = { webAbsoluteUrl: ${JSON.stringify(WEB)} };</script>
  <iframe id="app" style="width:100%;height:1000px;border:0"></iframe>
  <script>document.getElementById('app').srcdoc = window.__APP_HTML__;</script>
</body></html>`;

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/sites/ISEA/pages/app.aspx')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(hostPage);
  }
  res.writeHead(404).end();
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

const failures = [];
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));
page.on('requestfailed', (r) => failures.push(r.url()));
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().includes('/_api/')) failures.push(`${r.status()} ${r.url()}`);
});
// The lists are not provisioned in this harness; 404 is the documented
// first-run path and the app is expected to fall back to mock data.
await page.route('**/_api/**', (route) => route.fulfill({ status: 404, body: '{}' }));

await page.addInitScript((html) => { window.__APP_HTML__ = html; }, appHtml);
await page.goto(`http://127.0.0.1:${PORT}/sites/ISEA/pages/app.aspx`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const frame = page.frames().find((f) => f.url() === 'about:srcdoc');
const text = frame ? await frame.locator('body').innerText() : '';

let pass = 0;
let fail = 0;
const check = (label, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? `  ${extra}` : ''}`);
  ok ? pass++ : fail++;
};

let safe = true;
let problem = '';
try { assertSanitiserSafe(appHtml); } catch (e) { safe = false; problem = e.message.split('\n')[1] || e.message; }
check('nothing in the file can be mistaken for markup', safe, problem);
check('manifest is the first line', appHtml.startsWith('<!--WFC-MANIFEST:'));
check('runs inside an about:srcdoc frame', !!frame);
check('zero failed subresource requests', failures.length === 0, failures.slice(0, 3).join(' | '));
check('launcher rendered', /Quality & Training Portal/.test(text));
check('both categories and their modules listed',
  ['Quality', 'Training', 'PT Program', 'Audit Schedule', 'Scopes of Competency',
   'Loss of Capability', 'Preventive Maintenance', 'Annual Training LTR',
   'Schoolhouse Locations', 'External Training: WPT',
   'Training Resource Library'].every((t) => text.includes(t)));
check('the parked modules are not on the launcher',
  !['Cross-Check Procedures', 'In-Service Check', 'Authorized Service Providers']
    .some((t) => text.includes(t)));
check('fell back to mock data when the lists 404', /Mock data/.test(text));

if (frame) {
  check('Forge runtime installed its globals',
    await frame.evaluate(() => typeof window.__PseudoDevConsole !== 'undefined'));
  check('page carries a build stamp',
    Boolean(await frame.evaluate(() => window.__METCAL_BUILD__)));
  const images = await frame.evaluate(() =>
    [...document.images].map((i) => ({ embedded: i.currentSrc.startsWith('data:'), decoded: i.naturalWidth > 0 })));
  check('every image embedded and decoded', images.length > 0 && images.every((i) => i.embedded && i.decoded),
    `(${images.length} images)`);

  // PT Program — the tracker is the landing tab, so custody must be on screen.
  await frame.getByRole('button', { name: /^PT Program/ }).first().click();
  await page.waitForTimeout(900);
  const rrpt = await frame.locator('body').innerText();
  check('routing into a module works', /Current custody/.test(rrpt));
  check('tracker answers both of its questions',
    /Current custody/.test(rrpt) && /Scheduled to receive/.test(rrpt));

  // SPC charts live with the results now. Recharts needs a real layout pass —
  // a zero-height container silently draws nothing, and that is exactly the
  // failure a DOM-only test cannot see.
  await frame.getByRole('button', { name: /^Results$/ }).click();
  await page.waitForTimeout(1400);
  const svgs = await frame.evaluate(() =>
    [...document.querySelectorAll('svg.recharts-surface')]
      .map((el) => ({ w: el.clientWidth, h: el.clientHeight, dots: el.querySelectorAll('circle').length })));
  check('SPC charts drew with real dimensions and points',
    svgs.length > 0 && svgs.every((c) => c.w > 100 && c.h > 80 && c.dots > 0),
    `(${svgs.length} charts)`);

  const results = await frame.locator('body').innerText();
  check('QA engine evaluated the seed data', /EVALUATE/.test(results) && /FAIL/.test(results));

  // Reports are the new heart of the module: an interim and a final, scored
  // against the reference lab's opening measurement, with a drift figure.
  await frame.getByRole('button', { name: /^Reports$/ }).click();
  await page.waitForTimeout(900);
  const reports = await frame.locator('body').innerText();
  check('interim and final reports both render',
    /Interim report/.test(reports) && /Final report/.test(reports));
  check('reports show reference, closing, and drift',
    /Reference value/i.test(reports) && /Closing measurement/i.test(reports) && /Artifact drift/i.test(reports));
  check('a failed lab is raised for corrective action', /Corrective action required/.test(reports));

  // Training Library — the filter chips are the whole interaction.
  await frame.getByRole('button', { name: /All modules/ }).click();
  await page.waitForTimeout(600);
  await frame.getByRole('button', { name: /Training Resource Library/ }).first().click();
  await page.waitForTimeout(900);
  const beforeFilter = await frame.locator('body').innerText();
  await frame.getByRole('button', { name: /^Microwave/ }).click();
  await page.waitForTimeout(500);
  const afterFilter = await frame.locator('body').innerText();
  check('library filters down to one measurement area',
    /Electrical/.test(beforeFilter) && !/Deadweight Tester Operation/.test(afterFilter)
      && /Coaxial Connector Care/.test(afterFilter));

  // Every module must at least mount. A lazy chunk that throws only shows up
  // when somebody opens that one tile, which in a demo is the worst moment.
  const routes = [
    ['Dashboard Metrics', /Where the program stands|Where the pipeline stands/i],
    ['Audit Schedule', /Lab audit calendar/],
    ['Scopes of Competency', /Scope of competency/],
    ['Loss of Capability', /Currently down/],
    ['Preventive Maintenance', /Maintenance schedule/],
    ['Annual Training LTR', /Annual training letters/],
    ['Schoolhouse Locations', /Check-in/i],
    ['External Training: WPT', /Vendor and workplace courses/],
  ];
  let mounted = 0;
  const brokeOn = [];
  for (const [name, expected] of routes) {
    await frame.getByRole('button', { name: /All modules/ }).click();
    await page.waitForTimeout(350);
    await frame.getByRole('button', { name: new RegExp(name) }).first().click();
    await page.waitForTimeout(650);
    const body = await frame.locator('body').innerText();
    if (expected.test(body)) mounted += 1; else brokeOn.push(name);
  }
  check('every module mounts and renders its own content',
    brokeOn.length === 0, `(${mounted}/${routes.length})${brokeOn.length ? ' failed: ' + brokeOn.join(', ') : ''}`);

  // The annual letter absorbed the by-name sheet and the schedule, so all
  // three have to be reachable from inside it rather than from the launcher.
  await frame.getByRole('button', { name: /All modules/ }).click();
  await page.waitForTimeout(400);
  await frame.getByRole('button', { name: /Annual Training LTR/ }).first().click();
  await page.waitForTimeout(700);
  const ltrTabs = ['By-name confirmation', 'Schedule', 'Instructor notice', 'Auto-schedule'];
  const seen = [];
  for (const label of ltrTabs) {
    await frame.getByRole('button', { name: new RegExp(`^${label}`) }).click();
    await page.waitForTimeout(600);
    seen.push(await frame.locator('body').innerText());
  }
  check('the letter carries the by-name sheet, schedule, and notices',
    /confirmation sheet/i.test(seen[0]) && /Convening calendar/i.test(seen[1])
      && /instructor notice/i.test(seen[2]) && /Propose seats/i.test(seen[3]));

  // Travel restrictions moved inside the schoolhouse tile, since somebody
  // reading a check-in procedure is planning a trip.
  await frame.getByRole('button', { name: /All modules/ }).click();
  await page.waitForTimeout(400);
  await frame.getByRole('button', { name: /Schoolhouse Locations/ }).first().click();
  await page.waitForTimeout(700);
  await frame.getByRole('button', { name: /^Travel restrictions/ }).click();
  await page.waitForTimeout(600);
  check('schoolhouses carry the travel restrictions',
    /Current restrictions/i.test(await frame.locator('body').innerText()));

  check('nothing says programme', !/programme/i.test(await frame.locator('body').innerText()));
}

if (frame) {
  // Nothing in the app may carry a navigable href. Routing is in memory, so
  // any path href points at a URL that exists on no server — and inside a
  // SharePoint page, a host click handler reaching that anchor before React
  // does sends the browser to a 404 on the tenant. This is the check that
  // srcdoc alone cannot make: a srcdoc document inherits its parent's base
  // URL, so such an href really is navigable there too.
  const hrefs = await frame.evaluate(() =>
    [...document.querySelectorAll('a[href]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && !/^(https?:|mailto:|#)/.test(h)));
  check('no in-app anchor carries a navigable href', hrefs.length === 0, hrefs.slice(0, 3).join(' | '));

  // The Forge runtime's floating controls are hidden, but its globals — which
  // are what silence the host's "Not Secured" advisory — must survive that.
  //
  // Asked as "is any fixed overlay visible", not "are these two ids hidden".
  // The id form passes when the ids do not exist, which is exactly how the
  // first attempt at this shipped visible buttons alongside a green check.
  const forge = await frame.evaluate(() => {
    const overlays = [...document.body.querySelectorAll('*')]
      .filter((el) => getComputedStyle(el).position === 'fixed')
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .map((el) => `${el.tagName}#${el.id || '?'}:${(el.textContent || '').trim().slice(0, 12)}`);
    return { overlays, globalStillThere: typeof window.__PseudoDevConsole !== 'undefined' };
  });
  check('no floating overlay is visible, and the Forge globals survive',
    forge.overlays.length === 0 && forge.globalStillThere,
    JSON.stringify(forge));
}

check('no uncaught errors', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
console.log(`\n${fail === 0 ? 'SMOKE: ALL PASS' : `SMOKE: ${fail} FAILED`}  (${pass} passed)`);
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
