import React, { Suspense } from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router';
import TopBar from './app/TopBar.jsx';
import HomeLauncher from './app/HomeLauncher.jsx';
import modules from './app/moduleRegistry.jsx';
import { ThemeProvider } from './shared/ThemeContext.jsx';
import { DataProvider } from './data/DataProvider.jsx';

// MemoryRouter, not Hash or Browser routing. The built page is rendered inside
// an <iframe srcdoc>, whose document URL is the literal string "about:srcdoc".
// Any router that reaches for `location` to derive a path throws
// "Failed to construct 'URL': Invalid URL" there and the app renders nothing —
// which is exactly what happened the first time this was smoke-tested. Routing
// entirely in memory has no URL to get wrong, and the browser address bar
// belongs to the host SharePoint page anyway.

function ModuleFallback() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="muted text-[0.83rem]">Loading module…</div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <MemoryRouter>
          <div className="min-h-dvh">
            <TopBar />
            <main>
              <Suspense fallback={<ModuleFallback />}>
                <Routes>
                  <Route path="/" element={<HomeLauncher />} />
                  {modules.map(({ id, route, Component }) => (
                    <Route key={id} path={`/${route}/*`} element={<Component />} />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </MemoryRouter>
      </DataProvider>
    </ThemeProvider>
  );
}
