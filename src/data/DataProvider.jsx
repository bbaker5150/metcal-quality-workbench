import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import seed from './seedData.js';
import { CONTAINERS, DEFAULT_PREFIX, listTitle } from './listSchema.js';
import { resolveWebUrl, spGet, SharePointError } from './spContext.js';

// ---------------------------------------------------------------------------
// One place that knows where the data came from.
// ---------------------------------------------------------------------------
// The app runs in two worlds: inside a SharePoint page against real lists, and
// on a bench with no network at all. Rather than scatter that decision, the
// provider resolves it once at boot and every screen just consumes the result.
//
// Falling back is silent by design but never invisible — `source` is surfaced
// in the top bar and on the launcher, because a page quietly showing mock
// data while someone believes it is live is the worst outcome available.

const DataContext = createContext(null);

const config = (typeof window !== 'undefined' && window.METCAL_CONFIG) || {};
const prefix = config.listPrefix || DEFAULT_PREFIX;

/** True when the host has no SharePoint to talk to, or has opted out. */
function mockForced() {
  if (config.useMockData === true) return true;
  if (typeof window !== 'undefined' && window._USE_MOCK_DATA === true) return true;
  return false;
}

async function loadFromSharePoint(webUrl) {
  const out = {};
  for (const container of CONTAINERS) {
    const title = listTitle(prefix, container.key);
    const body = await spGet(webUrl, `/_api/web/lists/getbytitle('${encodeURIComponent(title)}')/items?$top=2000`);
    out[container.key] = body.value || [];
  }
  return out;
}

export function DataProvider({ children }) {
  const [state, setState] = useState({ phase: 'loading', source: null, data: seed, error: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (mockForced()) {
        if (!cancelled) setState({ phase: 'ready', source: 'mock', data: seed, error: null });
        return;
      }

      const webUrl = config.webUrl || resolveWebUrl();
      if (!webUrl) {
        if (!cancelled) setState({ phase: 'ready', source: 'mock', data: seed, error: null });
        return;
      }

      try {
        const data = await loadFromSharePoint(webUrl);
        if (!cancelled) setState({ phase: 'ready', source: 'sharepoint', data, error: null });
      } catch (error) {
        // A 404 means the lists are not provisioned yet, which is an ordinary
        // first-run state rather than a fault. Anything else is worth keeping
        // so the storage panel can explain itself.
        const expected = error instanceof SharePointError && error.status === 404;
        if (!cancelled) {
          setState({
            phase: 'ready',
            source: 'mock',
            data: seed,
            error: expected ? null : error,
          });
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => {
    const data = state.data || seed;
    return {
      ...state,
      data,
      counts: {
        artifacts: data.artifacts?.length || 0,
        sites: new Set((data.rotation || []).map((r) => r.Site)).size,
        ptResults: data.ptResults?.length || 0,
        auditors: data.auditors?.length || 0,
        labAudits: data.labAudits?.length || 0,
        trainingDocs: data.trainingDocs?.length || 0,
      },
      artifactById: (id) => (data.artifacts || []).find((a) => a.Id === id),
    };
  }, [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside a DataProvider');
  return ctx;
}
