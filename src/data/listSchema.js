// ---------------------------------------------------------------------------
// The SharePoint lists this program runs on.
// ---------------------------------------------------------------------------
// Field types are SharePoint's FieldTypeKind: 2 Text, 3 Note, 4 DateTime,
// 8 Boolean, 9 Number. Columns are created from schema XML rather than a JSON
// POST — the Fields collection is polymorphic and rejects an untyped body with
// a bare 400. That lesson came the hard way on the uncertainty tool.
//
// Six lists, grouped by the module that owns them:
//
//   RRPT              artifacts, rotation, ptResults
//   Schedule Auditor  auditors, labAudits
//   Training Library  trainingDocs

export const FIELD = { TEXT: 2, NOTE: 3, DATE: 4, BOOL: 8, NUMBER: 9 };
export const LIST_TEMPLATE = { GENERIC: 100, LIBRARY: 101 };

export const SITES = ['SDP', 'SDB', 'CPB', 'PRL', 'JFB'];

export const MEASUREMENT_AREAS = [
  'Electrical',
  'Pressure',
  'Microwave',
  'Dimensional',
  'Temperature',
];

/**
 * Disciplines a scope of competency is written against.
 *
 * Finer than MEASUREMENT_AREAS on purpose: an artifact belongs to one broad
 * area, but a lab declares capability parameter by parameter, and "Electrical"
 * is far too coarse to say whether a lab can do AC current at 100 kHz.
 */
export const DISCIPLINES = [
  'DC',
  'AC',
  'RF & Microwave',
  'Mass',
  'Pressure',
  'Flow',
  'Temperature',
  'Dimensional',
];

/**
 * The reference laboratory. It measures the artifact before the round starts
 * and again after it returns, which is what makes an interim report possible
 * partway through and a drift check possible at the end.
 */
export const REFERENCE_LAB = 'PRL';

/** Where a PT measurement sits in the round. */
export const MEASUREMENT_ROLES = ['Opening', 'Participant', 'Closing'];

/** |z| <= 2 PASS, 2 < |z| < 3 EVALUATE, |z| >= 3 FAIL. */
export const EVALUATION_TIERS = ['PASS', 'EVALUATE', 'FAIL'];

/** Where an artifact is in its trip around the region. */
export const ROTATION_STATUS = ['Completed', 'At-Lab', 'In-Transit', 'Scheduled'];

export const CONTAINERS = [
  {
    key: 'artifacts',
    suffix: 'Artifacts',
    module: 'pt',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Round-robin proficiency test artifacts and their reference values.',
    fields: [
      { name: 'MeasurementArea', title: 'Measurement Area', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Model', title: 'Model', type: FIELD.TEXT, inView: true },
      { name: 'SerialNumber', title: 'Serial Number', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'NominalValue', title: 'Nominal Value', type: FIELD.NUMBER, inView: true },
      { name: 'Unit', title: 'Unit', type: FIELD.TEXT, inView: true },
      { name: 'RequiredAccuracy', title: 'Required Accuracy', type: FIELD.NUMBER },
      // sigma_pt = RequiredAccuracy / 2, so it is derived rather than stored;
      // holding both invites them to disagree.
      { name: 'ReferenceValue', title: 'Reference Value', type: FIELD.NUMBER },
      { name: 'PtInstructionDoc', title: 'PT Instruction', type: FIELD.TEXT },
      { name: 'PtTemplateDoc', title: 'PT Template', type: FIELD.TEXT },
    ],
  },
  {
    key: 'rotation',
    suffix: 'Rotation',
    module: 'pt',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Every leg of every artifact’s trip: who has it now, who is next.',
    fields: [
      { name: 'ArtifactId', title: 'Artifact', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Leg', title: 'Leg', type: FIELD.NUMBER, inView: true },
      { name: 'Site', title: 'Site', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Status', title: 'Status', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'ArrivalDate', title: 'Arrival', type: FIELD.DATE, inView: true },
      { name: 'DepartureDate', title: 'Departure', type: FIELD.DATE, inView: true },
      { name: 'TransitCaseNumber', title: 'Transit Case', type: FIELD.TEXT },
      { name: 'AIIS_Completed', title: 'AIIS Completed', type: FIELD.BOOL },
    ],
  },
  {
    key: 'ptResults',
    suffix: 'PTResults',
    module: 'pt',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Six-run proficiency test results and their QA evaluation.',
    fields: [
      { name: 'ArtifactId', title: 'Artifact', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'LabCode', title: 'Lab', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'MetrologistName', title: 'Metrologist', type: FIELD.TEXT },
      { name: 'StartDate', title: 'Start', type: FIELD.DATE, inView: true },
      { name: 'StopDate', title: 'Stop', type: FIELD.DATE },
      { name: 'LabTempF', title: 'Lab Temp (F)', type: FIELD.NUMBER },
      { name: 'LabHumidityRH', title: 'Humidity (%RH)', type: FIELD.NUMBER },
      // The six runs are stored as one JSON payload rather than Run1..Run6
      // columns: the QA engine always reads them as a set, and six sparse
      // numeric columns are six chances for one to go missing.
      { name: 'RunsJson', title: 'Runs', type: FIELD.NOTE, lines: 4 },
      { name: 'Average', title: 'Average', type: FIELD.NUMBER, inView: true },
      { name: 'StdDev', title: 'Std Dev', type: FIELD.NUMBER },
      { name: 'ZScore', title: 'z', type: FIELD.NUMBER, inView: true },
      { name: 'EvaluationStatus', title: 'Evaluation', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'SubmittedVia', title: 'Submitted Via', type: FIELD.TEXT },
      // Opening and Closing are the reference lab's own measurements, book-ending
      // the round. Storing the role rather than inferring it from the lab code
      // means the reference lab can also take part as a participant one day
      // without the reports quietly mis-reading its rows.
      { name: 'MeasurementRole', title: 'Role', type: FIELD.TEXT, indexed: true, inView: true },
    ],
  },
  {
    key: 'auditors',
    suffix: 'Auditors',
    module: 'audits',
    template: LIST_TEMPLATE.GENERIC,
    description: 'The NAVAIR auditor roster and what each is qualified to audit.',
    fields: [
      { name: 'AuditorName', title: 'Auditor', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'HomeSite', title: 'Home Site', type: FIELD.TEXT, inView: true },
      { name: 'QualifiedAreas', title: 'Qualified Areas', type: FIELD.TEXT, inView: true },
      { name: 'CertificationExpires', title: 'Certification Expires', type: FIELD.DATE, inView: true },
      { name: 'ScopeCompetencyStatus', title: 'Scope Competency', type: FIELD.TEXT, inView: true },
    ],
  },
  {
    key: 'labAudits',
    suffix: 'LabAudits',
    module: 'audits',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Lab codes and their scheduled audit dates.',
    fields: [
      { name: 'LabCode', title: 'Lab Code', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'LabName', title: 'Lab', type: FIELD.TEXT, inView: true },
      { name: 'Site', title: 'Site', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'AuditType', title: 'Type', type: FIELD.TEXT, inView: true },
      { name: 'ScheduledDate', title: 'Scheduled', type: FIELD.DATE, inView: true },
      { name: 'LastAuditDate', title: 'Last Audit', type: FIELD.DATE },
      { name: 'AssignedAuditor', title: 'Auditor', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'AuditStatus', title: 'Status', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'OpenFindings', title: 'Open Findings', type: FIELD.NUMBER, inView: true },
    ],
  },
  {
    key: 'scopes',
    suffix: 'Scopes',
    module: 'scopes',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Declared capability per lab, per parameter — the rows a scope of competency is generated from.',
    fields: [
      { name: 'LabCode', title: 'Lab Code', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Site', title: 'Site', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Discipline', title: 'Discipline', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Parameter', title: 'Parameter / Equipment', type: FIELD.TEXT, inView: true },
      { name: 'RangeText', title: 'Range', type: FIELD.TEXT, inView: true },
      // Calibration and Measurement Capability, the ± figure an ISO/IEC 17025
      // scope is actually written in. Kept as text because a CMC is quoted with
      // its own units and qualifiers, not as a bare number.
      { name: 'CMC', title: 'CMC (±)', type: FIELD.TEXT, inView: true },
      { name: 'Comments', title: 'Comments', type: FIELD.TEXT },
      { name: 'Status', title: 'Status', type: FIELD.TEXT, indexed: true, inView: true },
    ],
  },
  {
    key: 'capabilityLoss',
    suffix: 'CapabilityLoss',
    module: 'capability',
    template: LIST_TEMPLATE.GENERIC,
    description: 'What is down, where, why, and since when.',
    fields: [
      { name: 'Site', title: 'Site', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'LabCode', title: 'Lab Code', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Discipline', title: 'Discipline', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Parameter', title: 'Parameter', type: FIELD.TEXT, inView: true },
      { name: 'RangeText', title: 'Range', type: FIELD.TEXT, inView: true },
      { name: 'Reason', title: 'Reason', type: FIELD.TEXT, inView: true },
      { name: 'LossDate', title: 'Loss of Capability', type: FIELD.DATE, inView: true },
      // Empty while the capability is still down; that emptiness is the query.
      { name: 'RestoredDate', title: 'Capability Restored', type: FIELD.DATE, inView: true },
      { name: 'ImpactedArtifacts', title: 'Impacted PT Artifacts', type: FIELD.TEXT },
    ],
  },
  {
    key: 'pmSchedule',
    suffix: 'PMSchedule',
    module: 'pm',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Models requiring routine preventive maintenance, with what is due and when.',
    fields: [
      { name: 'Model', title: 'Model', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Maker', title: 'Maker', type: FIELD.TEXT },
      { name: 'Site', title: 'Site', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Task', title: 'Task', type: FIELD.NOTE, lines: 3, inView: true },
      // Calendar-based and hours-based intervals do not reduce to one number:
      // an air filter is due monthly, a compressor is due at 10,000 running
      // hours whenever that arrives. Both are carried, and Basis says which
      // one governs.
      { name: 'Basis', title: 'Basis', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'IntervalText', title: 'Interval', type: FIELD.TEXT, inView: true },
      { name: 'IntervalMonths', title: 'Interval (months)', type: FIELD.NUMBER },
      { name: 'LastDone', title: 'Last Done', type: FIELD.DATE, inView: true },
      { name: 'NextDue', title: 'Next Due', type: FIELD.DATE, inView: true },
      { name: 'HoursRun', title: 'Hours Run', type: FIELD.NUMBER },
      { name: 'HoursThreshold', title: 'Hours Threshold', type: FIELD.NUMBER },
    ],
  },
  {
    key: 'procedures',
    suffix: 'Procedures',
    module: 'crosscheck',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Cross-check and in-service check procedures, the service provider list, and the PT process manual.',
    fields: [
      { name: 'Category', title: 'Category', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'DocNumber', title: 'Document No.', type: FIELD.TEXT, inView: true },
      { name: 'Discipline', title: 'Discipline', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Url', title: 'Link', type: FIELD.TEXT },
      { name: 'Summary', title: 'Summary', type: FIELD.NOTE, lines: 3 },
      { name: 'UpdatedOn', title: 'Updated', type: FIELD.DATE, inView: true },
    ],
  },
  {
    key: 'trainingDocs',
    suffix: 'TrainingDocs',
    module: 'library',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Technical library: procedures, instructions, guides, templates.',
    fields: [
      { name: 'MeasurementArea', title: 'Measurement Area', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'DocNumber', title: 'Document No.', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Version', title: 'Version', type: FIELD.TEXT, inView: true },
      { name: 'ResourceUrl', title: 'Resource', type: FIELD.TEXT },
      { name: 'Category', title: 'Category', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Summary', title: 'Summary', type: FIELD.NOTE, lines: 3 },
      { name: 'UpdatedOn', title: 'Updated', type: FIELD.DATE, inView: true },
    ],
  },
  {
    key: 'annualLtr',
    suffix: 'AnnualLTR',
    module: 'annual-ltr',
    template: LIST_TEMPLATE.GENERIC,
    description: 'The annual training letter by fiscal year, and which sites have acknowledged it.',
    fields: [
      { name: 'FiscalYear', title: 'FY', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Serial', title: 'Serial', type: FIELD.TEXT, inView: true },
      { name: 'Status', title: 'Status', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'IssuedOn', title: 'Issued', type: FIELD.DATE, inView: true },
      { name: 'SignedBy', title: 'Signed By', type: FIELD.TEXT },
      { name: 'Distribution', title: 'Distribution', type: FIELD.TEXT },
      { name: 'AcknowledgedSites', title: 'Acknowledged', type: FIELD.TEXT, inView: true },
      { name: 'Summary', title: 'Summary', type: FIELD.NOTE, lines: 3 },
    ],
  },
  {
    key: 'courses',
    suffix: 'Courses',
    module: 'annual-ltr',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Course catalogue. CDP is carried alongside the course identifier because a quota is requested by CDP.',
    fields: [
      { name: 'CourseCode', title: 'Course', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Cdp', title: 'CDP', type: FIELD.TEXT, inView: true },
      { name: 'Schoolhouse', title: 'Schoolhouse', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'LengthDays', title: 'Days', type: FIELD.NUMBER, inView: true },
      { name: 'Discipline', title: 'Discipline', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'External', title: 'External / WPT', type: FIELD.BOOL, indexed: true, inView: true },
      { name: 'CantracUrl', title: 'CANTRAC', type: FIELD.TEXT },
      { name: 'Prerequisite', title: 'Prerequisite', type: FIELD.TEXT },
    ],
  },
  {
    key: 'enrollments',
    suffix: 'Enrollments',
    module: 'annual-ltr',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Who is scheduled for what. The by-name confirmation sheet and the schedule read the same rows.',
    fields: [
      { name: 'Person', title: 'Name', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Site', title: 'Site', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'LabCode', title: 'Lab Code', type: FIELD.TEXT },
      { name: 'CourseCode', title: 'Course', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'StartDate', title: 'Start', type: FIELD.DATE, inView: true },
      { name: 'EndDate', title: 'End', type: FIELD.DATE },
      { name: 'Status', title: 'Status', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'QuotaStatus', title: 'Quota', type: FIELD.TEXT, inView: true },
      { name: 'Confirmed', title: 'Confirmed', type: FIELD.BOOL, inView: true },
      { name: 'ConfirmedOn', title: 'Confirmed On', type: FIELD.DATE },
      { name: 'InstructorNotified', title: 'Instructor Notified', type: FIELD.BOOL, inView: true },
      { name: 'NotifiedOn', title: 'Notified On', type: FIELD.DATE },
      { name: 'OrdersStatus', title: 'Orders', type: FIELD.TEXT },
    ],
  },
  {
    key: 'schoolhouses',
    suffix: 'Schoolhouses',
    module: 'schoolhouses',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Where courses convene, and what a student has to do to get through the gate.',
    fields: [
      { name: 'Name', title: 'Schoolhouse', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'City', title: 'Location', type: FIELD.TEXT, inView: true },
      { name: 'Building', title: 'Building', type: FIELD.TEXT },
      { name: 'PocRole', title: 'POC', type: FIELD.TEXT },
      { name: 'PocEmail', title: 'POC Email', type: FIELD.TEXT },
      { name: 'CheckInProcedure', title: 'Check-in Procedure', type: FIELD.NOTE, lines: 5 },
      { name: 'Parking', title: 'Parking', type: FIELD.TEXT },
      { name: 'LodgingNote', title: 'Lodging', type: FIELD.TEXT },
    ],
  },
  {
    key: 'travelRestrictions',
    suffix: 'TravelRestrictions',
    module: 'schoolhouses',
    template: LIST_TEMPLATE.GENERIC,
    description: 'What travel is open, restricted, or needs approval, and on whose authority.',
    fields: [
      { name: 'Scope', title: 'Scope', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Status', title: 'Status', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'EffectiveFrom', title: 'Effective', type: FIELD.DATE, inView: true },
      { name: 'Authority', title: 'Authority', type: FIELD.TEXT, inView: true },
      { name: 'Detail', title: 'Detail', type: FIELD.NOTE, lines: 4 },
    ],
  },
  {
    key: 'trainingRefs',
    suffix: 'TrainingRefs',
    module: 'library',
    template: LIST_TEMPLATE.GENERIC,
    description: 'CANTRAC and the other links and references the training library points at.',
    fields: [
      { name: 'Category', title: 'Category', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Url', title: 'Link', type: FIELD.TEXT },
      { name: 'Summary', title: 'Summary', type: FIELD.NOTE, lines: 3 },
      { name: 'UpdatedOn', title: 'Updated', type: FIELD.DATE, inView: true },
    ],
  },
];

export const DEFAULT_PREFIX = 'METCAL';

export function listTitle(prefix, key) {
  const container = CONTAINERS.find((c) => c.key === key);
  if (!container) throw new Error(`Unknown container '${key}'.`);
  const cleaned = String(prefix || DEFAULT_PREFIX).replace(/[^A-Za-z0-9]/g, '');
  return `${cleaned || DEFAULT_PREFIX}${container.suffix}`;
}
