// ---------------------------------------------------------------------------
// The five SharePoint lists this program runs on.
// ---------------------------------------------------------------------------
// Field types are SharePoint's FieldTypeKind: 2 Text, 3 Note, 4 DateTime,
// 8 Boolean, 9 Number. Columns are created from schema XML rather than a JSON
// POST — the Fields collection is polymorphic and rejects an untyped body with
// a bare 400. That lesson came the hard way on the uncertainty tool.

export const FIELD = { TEXT: 2, NOTE: 3, DATE: 4, BOOL: 8, NUMBER: 9 };
export const LIST_TEMPLATE = { GENERIC: 100, LIBRARY: 101 };

export const SITES = ['SDP', 'SDB', 'CPB', 'PRL', 'JFB'];
export const MEASUREMENT_AREAS = ['Electrical', 'Pressure', 'Microwave', 'Dimensional'];

/** |z| <= 2 PASS, 2 < |z| < 3 EVALUATE, |z| >= 3 FAIL. */
export const EVALUATION_TIERS = ['PASS', 'EVALUATE', 'FAIL'];

export const CONTAINERS = [
  {
    key: 'artifacts',
    suffix: 'Artifacts',
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
    ],
  },
  {
    key: 'custody',
    suffix: 'CustodySchedule',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Which site holds which artifact, and where it goes next.',
    fields: [
      { name: 'ArtifactId', title: 'Artifact', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'CurrentSite', title: 'Current Site', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'DestinationSite', title: 'Destination', type: FIELD.TEXT, inView: true },
      { name: 'Status', title: 'Status', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'ScheduledArrival', title: 'Scheduled Arrival', type: FIELD.DATE, inView: true },
      { name: 'ScheduledDeparture', title: 'Scheduled Departure', type: FIELD.DATE },
      { name: 'TransitCaseNumber', title: 'Transit Case', type: FIELD.TEXT },
      { name: 'AIIS_Completed', title: 'AIIS Completed', type: FIELD.BOOL, inView: true },
    ],
  },
  {
    key: 'ptResults',
    suffix: 'PTResults',
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
      { name: 'MeasureCardHours', title: 'Hours', type: FIELD.NUMBER },
    ],
  },
  {
    key: 'auditors',
    suffix: 'Auditors',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Audit assignments and their scheduling windows.',
    fields: [
      { name: 'AuditorName', title: 'Auditor', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'LabCode', title: 'Lab', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'AuditType', title: 'Type', type: FIELD.TEXT, inView: true },
      { name: 'ScheduledDate', title: 'Scheduled', type: FIELD.DATE, inView: true },
      { name: 'AuditStatus', title: 'Status', type: FIELD.TEXT, inView: true },
      { name: 'ScopeCompetencyStatus', title: 'Scope Competency', type: FIELD.TEXT },
    ],
  },
  {
    key: 'trainingDocs',
    suffix: 'TrainingDocs',
    template: LIST_TEMPLATE.GENERIC,
    description: 'Technical library: procedures, instructions, guides, templates.',
    fields: [
      { name: 'MeasurementArea', title: 'Measurement Area', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'DocNumber', title: 'Document No.', type: FIELD.TEXT, indexed: true, inView: true },
      { name: 'Version', title: 'Version', type: FIELD.TEXT },
      { name: 'ResourceUrl', title: 'Resource', type: FIELD.TEXT },
      { name: 'Category', title: 'Category', type: FIELD.TEXT, indexed: true, inView: true },
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
