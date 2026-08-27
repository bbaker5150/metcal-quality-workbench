import quality from './seed/quality.js';
import training from './seed/training.js';

// ---------------------------------------------------------------------------
// The mock dataset the portal runs on until the SharePoint lists exist.
// ---------------------------------------------------------------------------
// Split by side of the house rather than kept in one file: the Quality data is
// metrology and the Training data is scheduling, they are edited by different
// people, and one long module made both harder to find.
//
// Personnel names are placeholders throughout and a test enforces it. This
// repository is public and the single-file build is published as a public
// release asset, so every name reaching version control reaches the internet.
// The real roster belongs in the SharePoint list at runtime.

/** "Today", for the purpose of what is overdue and what is upcoming. */
export const TODAY = '2026-08-26';

export default { ...quality, ...training };
