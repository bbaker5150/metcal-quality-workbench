import { lazy } from 'react';
import {
  Activity, CalendarCheck, Library, Gauge, ClipboardCheck, AlertTriangle,
  Wrench, GitCompare, Stethoscope, Contact, FileSignature, CalendarDays,
  MapPin, PlaneTakeoff, GraduationCap, UserCheck,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// The portal, split into its two sides.
// ---------------------------------------------------------------------------
// Quality is the metrology programme — audits, proficiency testing, declared
// capability, and the maintenance that keeps it all in service. Training is
// the schoolhouse pipeline. Each module owns its own subtree and is loaded on
// demand; the shell knows nothing but this table.
//
// `category` drives the launcher's two sections. `dashboard: true` floats a
// module to the head of its section, since a rollup is where you start rather
// than one tile among many.

export const CATEGORIES = [
  { key: 'Quality', blurb: 'Audits, proficiency testing, declared capability, and maintenance.' },
  { key: 'Training', blurb: 'The annual letter through to seats, orders, and check-in.' },
];

const modules = [
  // -- Quality ------------------------------------------------------------
  {
    id: 'quality-dashboard', route: 'quality-dashboard', category: 'Quality', dashboard: true,
    title: 'Dashboard Metrics', subtitle: 'Quality at a glance',
    blurb: 'Where every programme stands right now: rounds in flight, audits due, capability down, and maintenance overdue.',
    icon: Gauge, accent: 'signal',
    Component: lazy(() => import('../modules/dashboards/QualityDashboard.jsx')),
  },
  {
    id: 'audits', route: 'audits', category: 'Quality',
    title: 'Audit Schedule', subtitle: 'Roster and lab audit calendar',
    blurb: 'The NAVAIR auditor roster with scope competency and certification currency, against every lab code and its scheduled audit date.',
    icon: CalendarCheck, accent: 'brass',
    Component: lazy(() => import('../modules/audits/AuditsModule.jsx')),
  },
  {
    id: 'pt', route: 'pt', category: 'Quality',
    title: 'PT Program', subtitle: 'Tracker, data sheets, and reports',
    blurb: 'Where every artifact is and where it goes next, the instruction and data sheet for each one, and the interim and final reports the round produces.',
    icon: Activity, accent: 'signal',
    Component: lazy(() => import('../modules/pt/PtModule.jsx')),
  },
  {
    id: 'scopes', route: 'scopes', category: 'Quality',
    title: 'Scopes of Competency', subtitle: 'Generated per laboratory',
    blurb: 'Declared capability by parameter, range, and CMC — assembled into a scope for any lab in the shape ISO/IEC 17025 asks for.',
    icon: ClipboardCheck, accent: 'brass',
    Component: lazy(() => import('../modules/scopes/ScopesModule.jsx')),
  },
  {
    id: 'capability', route: 'capability', category: 'Quality',
    title: 'Loss of Capability', subtitle: 'What is down, and since when',
    blurb: 'Labs declare a capability out of service with its range, reason, and date, so the programme office can see the gap and what it puts at risk.',
    icon: AlertTriangle, accent: 'signal',
    Component: lazy(() => import('../modules/capability/CapabilityModule.jsx')),
  },
  {
    id: 'pm', route: 'pm', category: 'Quality',
    title: 'Preventive Maintenance', subtitle: 'Calendar and running-hours',
    blurb: 'Models needing routine maintenance, what each needs, and when it falls due — by date or by hours run, whichever governs.',
    icon: Wrench, accent: 'brass',
    Component: lazy(() => import('../modules/pm/PmModule.jsx')),
  },
  {
    id: 'crosscheck', route: 'crosscheck', category: 'Quality',
    title: 'Cross-Check Procedures', subtitle: 'Between-lab comparisons',
    blurb: 'The procedures governing cross-checks between laboratories, held on MEASURE.',
    icon: GitCompare, accent: 'signal',
    Component: lazy(() => import('../modules/procedures/CrossCheckModule.jsx')),
  },
  {
    id: 'inservice', route: 'inservice', category: 'Quality',
    title: 'In-Service Check Procedures', subtitle: 'Between calibrations',
    blurb: 'Checks a lab runs on its own standards between scheduled calibrations.',
    icon: Stethoscope, accent: 'brass',
    Component: lazy(() => import('../modules/procedures/InServiceModule.jsx')),
  },
  {
    id: 'providers', route: 'providers', category: 'Quality',
    title: 'Authorized Service Providers', subtitle: 'Approved for repair and service',
    blurb: 'The authorised list, held on MEASURE.',
    icon: Contact, accent: 'signal',
    Component: lazy(() => import('../modules/procedures/ProvidersModule.jsx')),
  },

  // -- Training -----------------------------------------------------------
  {
    id: 'training-dashboard', route: 'training-dashboard', category: 'Training', dashboard: true,
    title: 'Dashboard Metrics', subtitle: 'Training at a glance',
    blurb: 'Seats confirmed, instructors notified, orders outstanding, and what the annual letter is still waiting on.',
    icon: Gauge, accent: 'brass',
    Component: lazy(() => import('../modules/dashboards/TrainingDashboard.jsx')),
  },
  {
    id: 'annual-ltr', route: 'annual-ltr', category: 'Training',
    title: 'Annual Training LTR', subtitle: 'Requirements and quotas by FY',
    blurb: 'The letter that sets required courses and quota allocation for the year, and which sites have acknowledged it.',
    icon: FileSignature, accent: 'signal',
    Component: lazy(() => import('../modules/training/AnnualLtrModule.jsx')),
  },
  {
    id: 'confirmation', route: 'confirmation', category: 'Training',
    title: 'By Name Confirmation Sheet', subtitle: 'Who is confirmed for what',
    blurb: 'Every name against its course and convening date, with confirmation, quota, and orders status in one sheet.',
    icon: UserCheck, accent: 'brass',
    Component: lazy(() => import('../modules/training/ConfirmationModule.jsx')),
  },
  {
    id: 'training-schedule', route: 'training-schedule', category: 'Training',
    title: 'Schedule (02)', subtitle: 'Auto-schedule and instructor notice',
    blurb: 'The convening calendar, seats built from the billet matrix, and the schoolhouse notice that follows a confirmation.',
    icon: CalendarDays, accent: 'signal',
    Component: lazy(() => import('../modules/training/ScheduleModule.jsx')),
  },
  {
    id: 'schoolhouses', route: 'schoolhouses', category: 'Training',
    title: 'Schoolhouse Locations', subtitle: 'Check-in procedures',
    blurb: 'Where each course convenes, what a student needs at the gate, and the parking and lodging notes that go with it.',
    icon: MapPin, accent: 'brass',
    Component: lazy(() => import('../modules/training/SchoolhouseModule.jsx')),
  },
  {
    id: 'travel', route: 'travel', category: 'Training',
    title: 'Travel Restrictions', subtitle: 'What needs approval, and from whom',
    blurb: 'Current restrictions on TAD travel, vendor courses, conferences, and OCONUS, with the authority behind each.',
    icon: PlaneTakeoff, accent: 'signal',
    Component: lazy(() => import('../modules/training/TravelModule.jsx')),
  },
  {
    id: 'wpt', route: 'wpt', category: 'Training',
    title: 'External Training: WPT', subtitle: 'Vendor and workplace training',
    blurb: 'Vendor courses outside CANTRAC, what each requires as a prerequisite, and the endorsement they need before a quota is requested.',
    icon: GraduationCap, accent: 'brass',
    Component: lazy(() => import('../modules/training/WptModule.jsx')),
  },
  {
    id: 'library', route: 'library', category: 'Training',
    title: 'Training Resource Library', subtitle: 'CANTRAC, references, and procedures',
    blurb: 'Technical and training documents by measurement area, alongside CANTRAC and the references the programme runs on.',
    icon: Library, accent: 'signal',
    Component: lazy(() => import('../modules/library/LibraryModule.jsx')),
  },
];

export default modules;
export const moduleByRoute = (route) => modules.find((m) => m.route === route);
export const modulesInCategory = (category) => modules.filter((m) => m.category === category);
