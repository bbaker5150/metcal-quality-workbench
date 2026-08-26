# METCAL Quality & Training Workbench

A workbench-style app for the NAVAIR METCAL Quality and Training Program,
covering three core functions: the regional round-robin proficiency test, the
lab audit schedule, and the training library.

It ships as **one self-contained HTML file** dropped into a SharePoint document
library, reading and writing SharePoint lists, and falls back to a seeded
dataset when those lists are not there yet.

```bash
npm install
npm run dev                # http://localhost:3000
npm run build:singlefile   # -> build-singlefile/metcal-quality.html
npm test
```

## The three core functions

### 1. Round-Robin Proficiency Tests

Four views over one artifact population, filtered by measurement area:

- **Tracker** — which site holds which model right now, and which site is
  scheduled to receive which model next. Both questions come off the same
  rotation table, one row per leg rather than one row per artifact, which is
  what lets a single query answer them separately.
- **Live SPC** — cross-site control charts, one per artifact with results from
  three or more sites. Plotted in *z* rather than engineering units, so ohms,
  volts, and degrees share a chart whose ±2 and ±3 lines mean the same thing on
  every series. The *z* is signed here even though the tiers are set on |z|:
  a lab reading consistently high is a different problem from one that scatters.
- **Results** — every submission with its average, s, z, and verdict.
- **Instructions & submission** — the PT instruction and template that belong
  with each artifact, plus workbook import.

### 2. Schedule Auditor

The NAVAIR auditor roster — home site, qualified measurement areas, scope
competency, certification expiry — against every lab code and its scheduled
audit date. Overdue audits, open findings, and lapsing competency are counted
at the top, because those are the three things that make somebody open it.

### 3. Training Library

Technical and training documents grouped by measurement area, filterable by
area and document type and searchable across titles, document numbers, and
summaries.

## Mock data

Everything runs on `src/data/seedData.js` until the SharePoint lists exist:
10 artifacts across 5 measurement areas, 39 rotation legs, 21 PT results,
8 auditors, 12 lab codes, and 16 library documents.

It is shaped to be demonstrable rather than merely present. Tests enforce the
properties a demo depends on — all three evaluation tiers appear, at least one
repeatability warning appears, at least two artifacts have enough cross-site
history to fill a control chart, no artifact is in two places at once, and each
leg starts after the previous one ends.

**Personnel names are placeholders, and a test fails the build if they are
not.** This repository is public and the single-file build is published as a
public release asset, so every name reaching version control reaches the
internet. The real roster belongs in the SharePoint list at runtime. Site
codes, models, and document numbers are the genuine shape of the program —
none of that is sensitive, and the app is meaningless without it.

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
node scripts/smoke-srcdoc.mjs      # 16 checks in a real srcdoc frame

# ...or point it at a downloaded release, to check what actually ships:
# node scripts/smoke-srcdoc.mjs ./metcal-quality.html
```

### The build that actually ships

CI does all of the above on every push to `main`
(`.github/workflows/singlefile.yml`) and publishes the file as a release asset,
so the newest deployable build is always at a stable URL:

    https://github.com/bbaker5150/metcal-quality-workbench/releases/latest/download/metcal-quality.html

Deploying is then a file copy: overwrite `metcal-quality.html` in the library
the app page points at. The `.aspx` never changes, and the library keeps the
previous version for rollback.

Nothing in CI touches SharePoint. A commercial runner cannot reach a `.mil`
tenant, and a credential that could write to one does not belong in commercial
CI — the last hop stays on a CAC-authenticated workstation.

The page carries the build it came from, in a `<meta name="x-app-build">`
tag and on `window.__METCAL_BUILD__`. Since the file is overwritten in place,
its URL says nothing about which build is live; that stamp is how you tell.

## SharePoint lists

Six lists, prefixed `METCAL` by default, grouped by the module that owns them:

| Module | Lists |
| --- | --- |
| RRPT | `Artifacts`, `Rotation`, `PTResults` |
| Schedule Auditor | `Auditors`, `LabAudits` |
| Training Library | `TrainingDocs` |

Schemas live in `src/data/listSchema.js`, and a test asserts the schema and the
seed describe exactly the same set — a container the app never reads would
provision an empty list on the live site, and a collection with no container
would have nowhere to be saved.

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

## How the seed stays honest

Averages, standard deviations, z-scores, and verdicts in `seedData.js` are
**derived by the engine** rather than written by hand, so the seed can never
disagree with the code. See *Mock data* above for what it contains and what the
tests hold it to.
A test enforces that.
