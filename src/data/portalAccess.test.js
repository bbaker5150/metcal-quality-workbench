import { expect, test } from 'vitest';
import { hostingMode, mayUsePortal, readPortalAudience } from './portalAccess.js';

const host = 'https://flankspeed.sharepoint-mil.us/sites/metsoft/SitePages/METCAL%20Quality%20&%20Training%20Portal.aspx';
const win = (href, parent = href) => ({ location: { href }, parent: { location: { href: parent } }, document: {} });
const json = body => ({ ok: true, redirected: false, headers: new Headers({ 'content-type': 'application/json' }), json: async () => body });

test('SharePoint hosting wins over localhost and mock-data preferences', () => {
  const w = { ...win('http://localhost:4176/', host), METCAL_CONFIG: { useMockData: true }, _USE_MOCK_DATA: true };
  expect(hostingMode(w)).toBe('sharepoint');
  expect(hostingMode(win('about:srcdoc', host))).toBe('sharepoint');
  const sandbox = win('about:srcdoc');
  sandbox.document.referrer = host;
  Object.defineProperty(sandbox.parent, 'location', { get() { throw Error('Restricted'); } });
  expect(hostingMode(sandbox)).toBe('sharepoint');
});

test('only local development can use preview without membership', () => {
  expect(hostingMode(win('http://127.0.0.1:4176/'))).toBe('preview');
  expect(hostingMode(win('file:///C:/preview.html'))).toBe('preview');
  expect(hostingMode(win('about:srcdoc'))).toBe('unavailable');
  expect(hostingMode(win('http://localhost:4176/', 'https://example.com/'))).toBe('unavailable');
  expect(hostingMode(win('https://example.com/'))).toBe('unavailable');
});

test.each([
  [[], 'other'],
  [[{ Id: 19, Title: 'METCAL Users' }], 'metcal'],
  [[{ Id: 7, Title: 'Actual Site Owners' }, { Id: 19, Title: 'METCAL Users' }], 'owner'],
])('verifies real SharePoint memberships before opening the portal', async (groups, audience) => {
  const methods = [];
  const result = await readPortalAudience({ fetchImpl: async (url, options) => {
    methods.push(options.method);
    return json(url.includes('/groups?') ? { value: groups } : url.includes('associatedownergroup') ? { Id: 7 } : { Id: 44, IsSiteAdmin: false });
  } });
  expect(result).toBe(audience);
  expect(mayUsePortal(result)).toBe(audience !== 'other');
  expect(methods).toEqual(['GET', 'GET', 'GET']);
});

test('network failure stays closed', async () => {
  const result = await readPortalAudience({ fetchImpl: async () => { throw Error('Signed out'); } });
  expect(result).toBe('unknown');
  expect(mayUsePortal(result)).toBe(false);
});
