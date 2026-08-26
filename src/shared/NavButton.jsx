import React from 'react';
import { useNavigate } from 'react-router';

// ---------------------------------------------------------------------------
// In-app navigation that renders no href.
// ---------------------------------------------------------------------------
// Routing is entirely in memory — there is no /rrpt anywhere, on this server
// or any other. A <Link> still renders `href="/rrpt"`, and it only stays
// harmless because React cancels the click before the browser acts on it.
//
// Inside a SharePoint page that assumption does not hold. The host installs
// document-level click handlers of its own, and anything that reaches an
// anchor with a path href before React does will send the browser to a URL
// that was never real — which is a 404 on the tenant, not a routing failure
// in here. A button has no default navigation to intercept, so the class of
// bug disappears rather than being defended against.
//
// A button is also the honest ARIA role: these change a view, they do not
// address a document. Nothing is lost — under MemoryRouter, opening one in a
// new tab could only ever have reloaded the app at its start route.

export default function NavButton({ to, className = '', children, ...rest }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)} className={className} {...rest}>
      {children}
    </button>
  );
}
