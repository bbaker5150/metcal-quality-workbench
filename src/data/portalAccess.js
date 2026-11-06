// This UI gate does not replace SharePoint page, asset, or list permissions.
// Keep the matching embedded helper in Metrology-Software-Homepage in sync.
export const PORTAL_WEB = 'https://flankspeed.sharepoint-mil.us/sites/metsoft';
export const PORTAL_GROUP = 'METCAL Users';

export function hostingMode(win = window) {
  const hints = [];
  try { hints.push(win.location.href, win._spPageContextInfo?.webAbsoluteUrl); } catch {}
  try { hints.push(win.parent.location.href, win.parent._spPageContextInfo?.webAbsoluteUrl); } catch {}
  try { hints.push(win.document.referrer); } catch {}
  const urls = hints.flatMap(value => { try { return [new URL(value)]; } catch { return []; } });
  if (urls.some(url => url.origin === new URL(PORTAL_WEB).origin)) return 'sharepoint';
  const local = url => ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (urls.some(url => /^https?:$/.test(url.protocol) && !local(url))) return 'unavailable';
  return urls.some(url => url.protocol === 'file:' || /^https?:$/.test(url.protocol) && local(url)) ? 'preview' : 'unavailable';
}

export async function readPortalAudience({ fetchImpl = fetch, timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  let timer;
  const read = async path => {
    const response = await fetchImpl(PORTAL_WEB + path, {
      method: 'GET', credentials: 'include', cache: 'no-store', redirect: 'error',
      headers: { Accept: 'application/json;odata=nometadata' }, signal: controller.signal,
    });
    if (!response.ok || response.redirected || !/\bapplication\/json\b/i.test(response.headers.get('content-type') || '')) throw new Error('Access could not be verified');
    const body = await response.json();
    return body?.d ?? body;
  };
  const pending = (async () => {
    try {
      const user = await read('/_api/web/currentuser?$select=Id,IsSiteAdmin');
      if (!Number.isSafeInteger(user?.Id) || user.Id <= 0 || typeof user.IsSiteAdmin !== 'boolean') return 'unknown';
      // Site collection administrators retain their intrinsic SharePoint access.
      if (user.IsSiteAdmin) return 'owner';
      const [groups, owners] = await Promise.all([
        read('/_api/web/currentuser/groups?$select=Id,Title&$top=5000'),
        read('/_api/web/associatedownergroup?$select=Id'),
      ]);
      const memberships = groups?.value ?? groups?.results;
      if (!Array.isArray(memberships) || groups['@odata.nextLink'] || groups['odata.nextLink'] || groups.__next ||
          !Number.isSafeInteger(owners?.Id) || owners.Id <= 0 ||
          memberships.some(group => !Number.isSafeInteger(group?.Id) || group.Id <= 0 || typeof group.Title !== 'string')) return 'unknown';
      if (memberships.some(group => group.Id === owners.Id)) return 'owner';
      return memberships.some(group => group.Title === PORTAL_GROUP) ? 'metcal' : 'other';
    } catch { return 'unknown'; }
  })();
  try {
    return await Promise.race([pending, new Promise(resolve => {
      timer = setTimeout(() => { controller.abort(); resolve('unknown'); }, timeoutMs);
    })]);
  } finally { clearTimeout(timer); }
}

export function mayUsePortal(audience) {
  return audience === 'owner' || audience === 'metcal';
}
