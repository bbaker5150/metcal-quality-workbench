import { lazy } from 'react';
import { Truck, Activity, CalendarCheck, Library, IdCard } from 'lucide-react';

// ---------------------------------------------------------------------------
// The five modules, in the order the work actually happens.
// ---------------------------------------------------------------------------
// An artifact arrives (logistics), gets measured (testing), the lab gets
// audited on the result (audits), people are trained against the procedures
// (training), and the hours get reported (measure). Each module owns its own
// subtree and is loaded on demand; the shell knows nothing but this table.

const modules = [
  {
    id: 'logistics',
    route: 'logistics',
    title: 'RRPT Logistics',
    subtitle: 'Custody, intake, and dispatch',
    blurb:
      'Track which site holds which artifact, run the digital AIIS intake, and generate handoff tickets between participating labs.',
    icon: Truck,
    accent: 'signal',
    Component: lazy(() => import('../modules/logistics/LogisticsModule.jsx')),
  },
  {
    id: 'testing',
    route: 'testing',
    title: 'Test Execution & SPC',
    subtitle: 'Six-run worksheet and QA engine',
    blurb:
      'Environmental pre-check, the six-run grid, automatic z-score evaluation, and live cross-site Shewhart charts.',
    icon: Activity,
    accent: 'brass',
    Component: lazy(() => import('../modules/testing/TestingModule.jsx')),
  },
  {
    id: 'audits',
    route: 'audits',
    title: 'Auditor & Lab Scheduler',
    subtitle: 'JNACT / NACT windows',
    blurb:
      'The master audit calendar, plus a pre-brief dossier synthesising a lab’s pass rates, z-score history, and logged hours.',
    icon: CalendarCheck,
    accent: 'signal',
    Component: lazy(() => import('../modules/audits/AuditsModule.jsx')),
  },
  {
    id: 'training',
    route: 'training',
    title: 'Training Library',
    subtitle: 'Procedures by discipline',
    blurb:
      'A filterable hub of SOPs, instructions, and templates across Electrical, Pressure, Microwave, and Dimensional.',
    icon: Library,
    accent: 'brass',
    Component: lazy(() => import('../modules/training/TrainingModule.jsx')),
  },
  {
    id: 'measure',
    route: 'measure',
    title: 'MEASURE Cards',
    subtitle: 'METER card automation',
    blurb:
      'One-click METER cards pre-populated for NARRPTR / RRPT, with logged hours filled into Block 40.',
    icon: IdCard,
    accent: 'signal',
    Component: lazy(() => import('../modules/measure/MeasureModule.jsx')),
  },
];

export default modules;
export const moduleByRoute = (route) => modules.find((m) => m.route === route);
