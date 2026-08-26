import { evaluate } from './qaEngine.js';

// ---------------------------------------------------------------------------
// Seed data, so the app is fully interactive the moment it opens.
// ---------------------------------------------------------------------------
// Auditor and metrologist names here are placeholders. This repository is
// public; the real roster belongs in the SharePoint list at runtime, not in
// version control. Site codes and artifact models are the genuine ones,
// because the program's shape is not sensitive and the app is useless
// without them.

const artifacts = [
  { Id: 1, Title: '10 kΩ Reference Resistor', MeasurementArea: 'Electrical', Model: 'SRX-10K', SerialNumber: 'SRX-4471', NominalValue: 10000, Unit: 'Ω', RequiredAccuracy: 0.4, ReferenceValue: 10000.31 },
  { Id: 2, Title: 'DC Voltage Standard', MeasurementArea: 'Electrical', Model: 'Fluke 732B', SerialNumber: '7325-0192', NominalValue: 10, Unit: 'V', RequiredAccuracy: 0.00004, ReferenceValue: 10.0000068 },
  { Id: 3, Title: 'Digital Multimeter', MeasurementArea: 'Electrical', Model: 'HP 3458A', SerialNumber: '3458-8830', NominalValue: 1, Unit: 'V', RequiredAccuracy: 0.000008, ReferenceValue: 0.99999942 },
  { Id: 4, Title: 'Thermometry Readout', MeasurementArea: 'Pressure', Model: 'Hart 1620A', SerialNumber: '1620-0455', NominalValue: 25, Unit: '°C', RequiredAccuracy: 0.012, ReferenceValue: 25.004 },
  { Id: 5, Title: 'Pressure Transfer Standard', MeasurementArea: 'Pressure', Model: 'PTS-3000', SerialNumber: 'PTS-1188', NominalValue: 1000, Unit: 'psi', RequiredAccuracy: 0.5, ReferenceValue: 999.86 },
  { Id: 6, Title: 'Gage Block Set, 1.000 in', MeasurementArea: 'Dimensional', Model: 'GB-1000', SerialNumber: 'GB-7741', NominalValue: 1.0, Unit: 'in', RequiredAccuracy: 0.000004, ReferenceValue: 1.0000012 },
  { Id: 7, Title: 'Power Sensor, 10 GHz', MeasurementArea: 'Microwave', Model: 'PWS-10G', SerialNumber: 'PWS-2260', NominalValue: 0, Unit: 'dB', RequiredAccuracy: 0.06, ReferenceValue: -0.014 },
];

const custody = [
  { Id: 1, ArtifactId: 1, CurrentSite: 'SDP', DestinationSite: 'SDB', Status: 'At-Lab', ScheduledArrival: '2026-07-28', ScheduledDeparture: '2026-08-22', TransitCaseNumber: 'TC-0431', AIIS_Completed: true },
  { Id: 2, ArtifactId: 2, CurrentSite: 'CPB', DestinationSite: 'PRL', Status: 'In-Transit', ScheduledArrival: '2026-08-25', ScheduledDeparture: '2026-09-19', TransitCaseNumber: 'TC-0518', AIIS_Completed: false },
  { Id: 3, ArtifactId: 3, CurrentSite: 'PRL', DestinationSite: 'JFB', Status: 'QA-Review', ScheduledArrival: '2026-07-11', ScheduledDeparture: '2026-08-20', TransitCaseNumber: 'TC-0392', AIIS_Completed: true },
  { Id: 4, ArtifactId: 4, CurrentSite: 'JFB', DestinationSite: 'SDP', Status: 'At-Lab', ScheduledArrival: '2026-08-04', ScheduledDeparture: '2026-08-29', TransitCaseNumber: 'TC-0466', AIIS_Completed: true },
  { Id: 5, ArtifactId: 5, CurrentSite: 'SDB', DestinationSite: 'CPB', Status: 'Scheduled', ScheduledArrival: '2026-09-02', ScheduledDeparture: '2026-09-26', TransitCaseNumber: 'TC-0533', AIIS_Completed: false },
  { Id: 6, ArtifactId: 6, CurrentSite: 'SDP', DestinationSite: 'JFB', Status: 'At-Lab', ScheduledArrival: '2026-08-11', ScheduledDeparture: '2026-09-05', TransitCaseNumber: 'TC-0501', AIIS_Completed: true },
  { Id: 7, ArtifactId: 7, CurrentSite: 'CPB', DestinationSite: 'SDB', Status: 'In-Transit', ScheduledArrival: '2026-08-27', ScheduledDeparture: '2026-09-24', TransitCaseNumber: 'TC-0547', AIIS_Completed: false },
];

// Raw runs; the average, s, z, and verdict are all derived below rather than
// stored, so the seed can never disagree with the engine.
const rawResults = [
  { Id: 1, ArtifactId: 1, LabCode: 'SDP', MetrologistName: 'Metrologist A', StartDate: '2026-07-29', StopDate: '2026-07-31', LabTempF: 71.4, LabHumidityRH: 43, MeasureCardHours: 6.5, runs: [10000.28, 10000.33, 10000.30, 10000.31, 10000.29, 10000.32] },
  { Id: 2, ArtifactId: 1, LabCode: 'SDB', MetrologistName: 'Metrologist B', StartDate: '2026-06-12', StopDate: '2026-06-14', LabTempF: 69.8, LabHumidityRH: 51, MeasureCardHours: 7.0, runs: [10000.05, 10000.11, 10000.02, 10000.09, 10000.07, 10000.04] },
  { Id: 3, ArtifactId: 1, LabCode: 'CPB', MetrologistName: 'Metrologist C', StartDate: '2026-05-06', StopDate: '2026-05-08', LabTempF: 73.1, LabHumidityRH: 38, MeasureCardHours: 5.5, runs: [10000.79, 10000.74, 10000.86, 10000.71, 10000.82, 10000.76] },
  { Id: 4, ArtifactId: 1, LabCode: 'PRL', MetrologistName: 'Metrologist D', StartDate: '2026-04-02', StopDate: '2026-04-04', LabTempF: 70.2, LabHumidityRH: 47, MeasureCardHours: 8.0, runs: [10000.30, 10000.34, 10000.28, 10000.33, 10000.31, 10000.29] },
  { Id: 5, ArtifactId: 1, LabCode: 'JFB', MetrologistName: 'Metrologist E', StartDate: '2026-03-05', StopDate: '2026-03-07', LabTempF: 72.6, LabHumidityRH: 41, MeasureCardHours: 6.0, runs: [9999.62, 9999.71, 9999.58, 9999.66, 9999.74, 9999.60] },
  { Id: 6, ArtifactId: 4, LabCode: 'JFB', MetrologistName: 'Metrologist E', StartDate: '2026-08-05', StopDate: '2026-08-06', LabTempF: 68.9, LabHumidityRH: 44, MeasureCardHours: 4.5, runs: [25.003, 25.006, 25.004, 25.005, 25.003, 25.005] },
  { Id: 7, ArtifactId: 4, LabCode: 'SDP', MetrologistName: 'Metrologist A', StartDate: '2026-06-24', StopDate: '2026-06-25', LabTempF: 71.0, LabHumidityRH: 46, MeasureCardHours: 4.0, runs: [25.011, 25.019, 25.008, 25.022, 25.014, 25.017] },
  { Id: 8, ArtifactId: 6, LabCode: 'SDP', MetrologistName: 'Metrologist F', StartDate: '2026-08-12', StopDate: '2026-08-13', LabTempF: 68.2, LabHumidityRH: 39, MeasureCardHours: 5.0, runs: [1.0000010, 1.0000014, 1.0000011, 1.0000013, 1.0000012, 1.0000010] },
  { Id: 9, ArtifactId: 7, LabCode: 'CPB', MetrologistName: 'Metrologist C', StartDate: '2026-07-15', StopDate: '2026-07-16', LabTempF: 74.5, LabHumidityRH: 36, MeasureCardHours: 3.5, runs: [-0.062, 0.031, -0.048, 0.019, -0.055, 0.024] },
];

const ptResults = rawResults.map((row) => {
  const artifact = artifacts.find((a) => a.Id === row.ArtifactId);
  const verdict = evaluate({
    runs: row.runs,
    referenceValue: artifact?.ReferenceValue,
    requiredAccuracy: artifact?.RequiredAccuracy,
  });
  return {
    ...row,
    Title: `${artifact?.Model || 'Artifact'} · ${row.LabCode}`,
    Average: verdict.average,
    StdDev: verdict.stdDev,
    ZScore: verdict.z,
    EvaluationStatus: verdict.status,
    repeatabilityWarning: verdict.repeatabilityWarning,
  };
});

const auditors = [
  { Id: 1, AuditorName: 'Auditor One', LabCode: 'SDP', AuditType: 'JNACT', ScheduledDate: '2026-09-15', AuditStatus: 'Scheduled', ScopeCompetencyStatus: 'Current' },
  { Id: 2, AuditorName: 'Auditor Two', LabCode: 'SDB', AuditType: 'NACT', ScheduledDate: '2026-08-26', AuditStatus: 'In-Progress', ScopeCompetencyStatus: 'Current' },
  { Id: 3, AuditorName: 'Auditor Three', LabCode: 'CPB', AuditType: 'Capability Review', ScheduledDate: '2026-07-22', AuditStatus: 'Completed', ScopeCompetencyStatus: 'Current' },
  { Id: 4, AuditorName: 'Auditor Four', LabCode: 'PRL', AuditType: 'JNACT', ScheduledDate: '2026-10-08', AuditStatus: 'Scheduled', ScopeCompetencyStatus: 'Renewal due' },
  { Id: 5, AuditorName: 'Auditor Five', LabCode: 'JFB', AuditType: 'NACT', ScheduledDate: '2026-09-30', AuditStatus: 'Scheduled', ScopeCompetencyStatus: 'Current' },
];

const trainingDocs = [
  { Id: 1, Title: 'RRPT Proficiency Test Instruction', MeasurementArea: 'Electrical', DocNumber: 'NA 17-35FR-06', Version: 'Rev C', ResourceUrl: '', Category: 'Instruction' },
  { Id: 2, Title: 'AIIS Intake and Handling Checklist', MeasurementArea: 'Electrical', DocNumber: 'Appendix B', Version: 'Rev B', ResourceUrl: '', Category: 'Template' },
  { Id: 3, Title: 'High-Resistance Substitution Procedure', MeasurementArea: 'Electrical', DocNumber: 'NPSL 17-42AE-01', Version: 'Rev A', ResourceUrl: '', Category: 'SOP' },
  { Id: 4, Title: 'Deadweight Tester Operation', MeasurementArea: 'Pressure', DocNumber: 'NPSL 17-51PR-03', Version: 'Rev D', ResourceUrl: '', Category: 'SOP' },
  { Id: 5, Title: 'Gage Block Wringing and Care', MeasurementArea: 'Dimensional', DocNumber: 'NPSL 17-60DM-02', Version: 'Rev B', ResourceUrl: '', Category: 'Guide' },
  { Id: 6, Title: 'Power Sensor Calibration, 10 MHz–18 GHz', MeasurementArea: 'Microwave', DocNumber: 'NPSL 17-70MW-05', Version: 'Rev A', ResourceUrl: '', Category: 'SOP' },
  { Id: 7, Title: 'MEASURE METER Card Completion', MeasurementArea: 'Electrical', DocNumber: 'Appendix D', Version: 'Rev E', ResourceUrl: '', Category: 'Guide' },
  { Id: 8, Title: 'Six-Run PT Worksheet', MeasurementArea: 'Pressure', DocNumber: 'Appendix C', Version: 'Rev C', ResourceUrl: '', Category: 'Template' },
];

export default { artifacts, custody, ptResults, auditors, trainingDocs };
