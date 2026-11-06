import React, { useEffect, useState } from 'react';
import { hostingMode, mayUsePortal, readPortalAudience } from '../data/portalAccess.js';

export default function PortalAccessGate({ children }) {
  const [access, setAccess] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      // Preserve the open module and unsaved work during a background check.
      // A denied/unverified result still removes the portal immediately.
      const mode = hostingMode();
      const next = mode === 'preview' ? 'preview' : mode === 'sharepoint' ? await readPortalAudience() : 'unknown';
      if (!cancelled) setAccess(next);
    };
    check();
    const onReturn = () => { if (!document.hidden) setAttempt(value => value + 1); };
    document.addEventListener('visibilitychange', onReturn);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', onReturn); };
  }, [attempt]);

  if (access === 'preview' || mayUsePortal(access)) return children;
  const loading = access === 'loading';
  return (
    <main className="mx-auto max-w-xl px-6 py-24" aria-busy={loading}>
      <h1 className="text-2xl font-semibold">{loading ? 'Checking portal access…' : access === 'other' ? 'Portal access required' : 'Portal access could not be verified'}</h1>
      <p className="muted mt-4" role="status">
        {loading ? 'Verifying your SharePoint access.' : 'This portal is available to Site Owners and members of METCAL Users. Ask a site owner to review your access.'}
      </p>
      {!loading && <button type="button" className="surface mt-6 rounded-lg px-4 py-2" onClick={() => { setAccess('loading'); setAttempt(value => value + 1); }}>Check again</button>}
    </main>
  );
}
