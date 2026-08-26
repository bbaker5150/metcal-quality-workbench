# METCAL Quality &amp; Training Workbench

A workbench-style app for the NAVAIR METCAL Quality and Training Program: the
regional round-robin proficiency test, from the moment an artifact leaves one
lab to the METER card that closes it out.

It ships as **one self-contained HTML file** dropped into a SharePoint document
library, reading and writing SharePoint lists, and falls back to a seeded
dataset when those lists are not there yet.

```bash
npm install
npm run dev                # http://localhost:3000
npm run build:singlefile   # -> build-singlefile/metcal-quality.html
npm test
```

## Modules

| | |
| --- | --- |
| **RRPT Logistics** | Custody matrix, digital AIIS intake, shipping dispatch |
| **Test Execution &amp; SPC** | Six-run worksheet, QA evaluation engine, cross-site Shewhart charts |
| **Auditor &amp; Lab Scheduler** | JNACT/NACT calendar and competency pre-brief dossiers |
| **Training Library** | Procedures and templates by measurement discipline |
| **MEASURE Cards** | METER card automation for NARRPTR / RRPT |

The launcher, theme, routing, and data layer are built. The modules render live
data and each lists what it still needs; see the "Next up" panel in each one.

## The QA engine

`src/data/qaEngine.js` is the only definition of a verdict in the app, and it is
pure — numbers in, verdict out, no I/O. Every screen that shows a status calls it.

```
sigma_pt = RequiredAccuracy / 2
z        = |x̄ − X_ref| / sigma_pt

|z| ≤ 2      PASS
2 < |z| < 3  EVALUATE
|z| ≥ 3      FAIL
```

It also raises a **repeatability warning** when the lab's own scatter exceeds
sigma_pt. A lab can land on the reference value by luck while being unable to
repeat itself, and a z-score alone will not say so — the seeded PWS-10G result
is exactly that case (z = 0.04, s = 0.044 against sigma_pt = 0.030).

## Deployment

The build target is an `<iframe srcdoc>` on a SharePoint page, which constrains
things in ways worth knowing before changing them:

- **Everything is inlined.** A srcdoc document has no URL, so any asset left as
  a separate request simply fails. `assetsInlineLimit` is set to infinity and
  the seal becomes a data URI.
- **Routing is `MemoryRouter`.** A srcdoc document's URL is the literal string
  `about:srcdoc`; a router that derives a path from `location` throws
  *Failed to construct 'URL': Invalid URL* and renders nothing. This was caught
  by the smoke test rather than in production, which is the point of having one.
- **Nothing may look like markup.** `scripts/hardenInlineHtml.mjs` rewrites
  tag-like sequences inside string, template, and regex literals so a sanitiser
  reading the file cannot mistake a string for a tag and cut the bundle in half.
- **The Forge runtime is vendored** and injected at build time, so the file is
  deployable without a manual ship step. See `vendor/forge/README.md`.

Verify a change with:

```bash
npm run build:singlefile
npm i --no-save playwright && npx playwright install chromium
node scripts/smoke-srcdoc.mjs      # 13 checks in a real srcdoc frame
```

## SharePoint lists

Five lists, prefixed `METCAL` by default: `Artifacts`, `CustodySchedule`,
`PTResults`, `Auditors`, `TrainingDocs`. Schemas live in
`src/data/listSchema.js`.

Columns are created from Field schema XML, not a JSON POST — the Fields
collection is polymorphic and rejects an untyped body with a bare 400.

Configure a deployment by editing the `<head>` of the built file, no rebuild:

```html
<script>
  window.METCAL_CONFIG = {
    listPrefix: 'METCAL',
    webUrl: 'https://tenant/sites/other',
    useMockData: true
  };
</script>
```

## Seed data

`src/data/seedData.js` makes the app fully interactive on first open. Averages,
standard deviations, z-scores, and verdicts are all **derived by the engine**
rather than written by hand, so the seed can never disagree with the code.

Auditor and metrologist names are placeholders. This repository is public; the
real roster belongs in the SharePoint list at runtime, not in version control.
A test enforces that.
