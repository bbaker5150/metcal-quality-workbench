import { lazy } from 'react';
import { Activity, CalendarCheck, Library } from 'lucide-react';

// ---------------------------------------------------------------------------
// The three core functions, in the order the program runs.
// ---------------------------------------------------------------------------
// Artifacts go round the region and get measured (RRPT), labs get audited on
// the strength of those results (Schedule Auditor), and the procedures behind
// both live in one place (Training Library). Each module owns its own subtree
// and is loaded on demand; the shell knows nothing but this table.

const modules = [
  {
    id: 'rrpt',
    route: 'rrpt',
    title: 'Round-Robin Proficiency Tests',
    short: 'RRPT',
    subtitle: 'Tracker, submission, and live SPC',
    blurb:
      'Where every artifact is and where it goes next, the PT instruction and template for each one, result submission by import or web form, and live SPC across all sites.',
    icon: Activity,
    accent: 'signal',
    Component: lazy(() => import('../modules/rrpt/RrptModule.jsx')),
  },
  {
    id: 'audits',
    route: 'audits',
    title: 'Schedule Auditor',
    short: 'Auditors',
    subtitle: 'Roster and lab audit calendar',
    blurb:
      'The NAVAIR auditor roster with scope competency and certification currency, against every lab code and its scheduled audit date.',
    icon: CalendarCheck,
    accent: 'brass',
    Component: lazy(() => import('../modules/audits/AuditsModule.jsx')),
  },
  {
    id: 'library',
    route: 'library',
    title: 'Training Library',
    short: 'Library',
    subtitle: 'Documents by measurement area',
    blurb:
      'Technical and training documents with their links and resources, categorised by measurement area so a lab finds its own procedures first.',
    icon: Library,
    accent: 'signal',
    Component: lazy(() => import('../modules/library/LibraryModule.jsx')),
  },
];

export default modules;
export const moduleByRoute = (route) => modules.find((m) => m.route === route);
