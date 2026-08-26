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
// first-run path and the app is expected to fall back to sample data.
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
check('launcher rendered', /Quality & Training Program/.test(text));
check('all five modules listed', ['RRPT Logistics', 'Test Execution', 'Auditor', 'Training Library', 'MEASURE Cards']
  .every((t) => text.includes(t)));
check('fell back to sample data when the lists 404', /Sample/.test(text));

if (frame) {
  check('Forge runtime installed its globals',
    await frame.evaluate(() => typeof window.__PseudoDevConsole !== 'undefined'));
  check('page carries a build stamp',
    Boolean(await frame.evaluate(() => window.__METCAL_BUILD__)));
  const images = await frame.evaluate(() =>
    [...document.images].map((i) => ({ embedded: i.currentSrc.startsWith('data:'), decoded: i.naturalWidth > 0 })));
  check('every image embedded and decoded', images.length > 0 && images.every((i) => i.embedded && i.decoded),
    `(${images.length} images)`);

  await frame.getByRole('link', { name: /Test Execution/ }).first().click();
  await page.waitForTimeout(900);
  const after = await frame.locator('body').innerText();
  check('routing into a module works', /Proficiency test results/.test(after));
  check('QA engine evaluated the seed data', /EVALUATE/.test(after) && /FAIL/.test(after));
}

check('no uncaught errors', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
console.log(`\n${fail === 0 ? 'SMOKE: ALL PASS' : `SMOKE: ${fail} FAILED`}  (${pass} passed)`);
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
