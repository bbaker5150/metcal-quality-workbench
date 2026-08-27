import { evaluate } from '../qaEngine.js';

// ---------------------------------------------------------------------------
// Mock data for the Quality side of the portal.
// ---------------------------------------------------------------------------
// Shaped to be demonstrable rather than merely present: every evaluation tier
// appears, one PT round is complete enough for a final report and two are
// mid-round for interim reports, one capability is down, and preventive
// maintenance has something overdue.
//
// Personnel names are placeholders and a test enforces it. This repository is
// public and the single-file build is a public release asset. Site codes,
// models, and document numbers are the genuine shape of the program.

const artifacts = [
  {
    Id: 1, Title: '10 kΩ Reference Resistor', MeasurementArea: 'Electrical',
    Model: 'SRX-10K', SerialNumber: 'SRX-4471',
    NominalValue: 10000, Unit: 'Ω', RequiredAccuracy: 0.4, ReferenceValue: 10000.31,
    PtInstructionDoc: 'NA 17-35FR-06', PtTemplateDoc: 'RRPT-TPL-E01',
  },
  {
    Id: 2, Title: 'DC Voltage Standard', MeasurementArea: 'Electrical',
    Model: 'Fluke 732B', SerialNumber: '7325-0192',
    NominalValue: 10, Unit: 'V', RequiredAccuracy: 0.00004, ReferenceValue: 10.0000068,
    PtInstructionDoc: 'NA 17-35FR-06', PtTemplateDoc: 'RRPT-TPL-E02',
  },
  {
    Id: 3, Title: 'Digital Multimeter', MeasurementArea: 'Electrical',
    Model: 'HP 3458A', SerialNumber: '3458-8830',
    NominalValue: 1, Unit: 'V', RequiredAccuracy: 0.000008, ReferenceValue: 0.99999942,
    PtInstructionDoc: 'NA 17-35FR-06', PtTemplateDoc: 'RRPT-TPL-E03',
  },
  {
    Id: 4, Title: 'Thermometry Readout', MeasurementArea: 'Temperature',
    Model: 'Hart 1620A', SerialNumber: '1620-0455',
    NominalValue: 25, Unit: '°C', RequiredAccuracy: 0.012, ReferenceValue: 25.004,
    PtInstructionDoc: 'NPSL 17-80TP-02', PtTemplateDoc: 'RRPT-TPL-T01',
  },
  {
    Id: 5, Title: 'Pressure Transfer Standard', MeasurementArea: 'Pressure',
    Model: 'PTS-3000', SerialNumber: 'PTS-1188',
    NominalValue: 1000, Unit: 'psi', RequiredAccuracy: 0.5, ReferenceValue: 999.86,
    PtInstructionDoc: 'NPSL 17-51PR-03', PtTemplateDoc: 'RRPT-TPL-P01',
  },
  {
    Id: 6, Title: 'Gage Block Set, 1.000 in', MeasurementArea: 'Dimensional',
    Model: 'GB-1000', SerialNumber: 'GB-7741',
    NominalValue: 1.0, Unit: 'in', RequiredAccuracy: 0.000004, ReferenceValue: 1.0000012,
    PtInstructionDoc: 'NPSL 17-60DM-02', PtTemplateDoc: 'RRPT-TPL-D01',
  },
  {
    Id: 7, Title: 'Power Sensor, 10 GHz', MeasurementArea: 'Microwave',
    Model: 'PWS-10G', SerialNumber: 'PWS-2260',
    NominalValue: 0, Unit: 'dB', RequiredAccuracy: 0.06, ReferenceValue: -0.014,
    PtInstructionDoc: 'NPSL 17-70MW-05', PtTemplateDoc: 'RRPT-TPL-M01',
  },
  {
    Id: 8, Title: 'Deadweight Tester, 10–1000 psi', MeasurementArea: 'Pressure',
    Model: 'DWT-1000', SerialNumber: 'DWT-0663',
    NominalValue: 500, Unit: 'psi', RequiredAccuracy: 0.25, ReferenceValue: 500.042,
    PtInstructionDoc: 'NPSL 17-51PR-03', PtTemplateDoc: 'RRPT-TPL-P02',
  },
  {
    Id: 9, Title: 'Coaxial Attenuator, 20 dB', MeasurementArea: 'Microwave',
    Model: 'ATT-20D', SerialNumber: 'ATT-3312',
    NominalValue: 20, Unit: 'dB', RequiredAccuracy: 0.04, ReferenceValue: 20.0113,
    PtInstructionDoc: 'NPSL 17-70MW-05', PtTemplateDoc: 'RRPT-TPL-M02',
  },
  {
    Id: 10, Title: 'Ring Gage, 0.750 in', MeasurementArea: 'Dimensional',
    Model: 'RG-750', SerialNumber: 'RG-1904',
    NominalValue: 0.75, Unit: 'in', RequiredAccuracy: 0.000006, ReferenceValue: 0.7500021,
    PtInstructionDoc: 'NPSL 17-60DM-02', PtTemplateDoc: 'RRPT-TPL-D02',
  },
];

// ---------------------------------------------------------------------------
// PT Program — rotation legs
// ---------------------------------------------------------------------------
// One row per leg, not one row per artifact, which is what makes the tracker's
// two questions answerable from the same table: who has it now (the At-Lab or
// In-Transit leg) and who is scheduled to (every later leg).

const rotation = [
  // SRX-10K — a full lap, currently at SDP
  { Id: 1, ArtifactId: 1, Leg: 1, Site: 'JFB', Status: 'Completed', ArrivalDate: '2026-03-05', DepartureDate: '2026-03-28', TransitCaseNumber: 'TC-0331', AIIS_Completed: true },
  { Id: 2, ArtifactId: 1, Leg: 2, Site: 'PRL', Status: 'Completed', ArrivalDate: '2026-04-02', DepartureDate: '2026-04-25', TransitCaseNumber: 'TC-0358', AIIS_Completed: true },
  { Id: 3, ArtifactId: 1, Leg: 3, Site: 'CPB', Status: 'Completed', ArrivalDate: '2026-05-06', DepartureDate: '2026-05-29', TransitCaseNumber: 'TC-0374', AIIS_Completed: true },
  { Id: 4, ArtifactId: 1, Leg: 4, Site: 'SDB', Status: 'Completed', ArrivalDate: '2026-06-12', DepartureDate: '2026-07-03', TransitCaseNumber: 'TC-0392', AIIS_Completed: true },
  { Id: 5, ArtifactId: 1, Leg: 5, Site: 'SDP', Status: 'At-Lab', ArrivalDate: '2026-08-04', DepartureDate: '2026-09-05', TransitCaseNumber: 'TC-0431', AIIS_Completed: true },
  { Id: 6, ArtifactId: 1, Leg: 6, Site: 'JFB', Status: 'Scheduled', ArrivalDate: '2026-09-14', DepartureDate: '2026-10-09', TransitCaseNumber: '', AIIS_Completed: false },

  // 732B — in transit between CPB and PRL
  { Id: 7, ArtifactId: 2, Leg: 1, Site: 'SDP', Status: 'Completed', ArrivalDate: '2026-04-13', DepartureDate: '2026-05-08', TransitCaseNumber: 'TC-0361', AIIS_Completed: true },
  { Id: 8, ArtifactId: 2, Leg: 2, Site: 'SDB', Status: 'Completed', ArrivalDate: '2026-05-18', DepartureDate: '2026-06-12', TransitCaseNumber: 'TC-0379', AIIS_Completed: true },
  { Id: 9, ArtifactId: 2, Leg: 3, Site: 'CPB', Status: 'Completed', ArrivalDate: '2026-06-22', DepartureDate: '2026-07-24', TransitCaseNumber: 'TC-0404', AIIS_Completed: true },
  { Id: 10, ArtifactId: 2, Leg: 4, Site: 'PRL', Status: 'In-Transit', ArrivalDate: '2026-08-31', DepartureDate: '2026-09-25', TransitCaseNumber: 'TC-0518', AIIS_Completed: false },
  { Id: 11, ArtifactId: 2, Leg: 5, Site: 'JFB', Status: 'Scheduled', ArrivalDate: '2026-10-05', DepartureDate: '2026-10-30', TransitCaseNumber: '', AIIS_Completed: false },

  // 3458A — at PRL, in QA review
  { Id: 12, ArtifactId: 3, Leg: 1, Site: 'SDB', Status: 'Completed', ArrivalDate: '2026-05-04', DepartureDate: '2026-05-29', TransitCaseNumber: 'TC-0371', AIIS_Completed: true },
  { Id: 13, ArtifactId: 3, Leg: 2, Site: 'CPB', Status: 'Completed', ArrivalDate: '2026-06-08', DepartureDate: '2026-07-02', TransitCaseNumber: 'TC-0388', AIIS_Completed: true },
  { Id: 14, ArtifactId: 3, Leg: 3, Site: 'PRL', Status: 'At-Lab', ArrivalDate: '2026-07-11', DepartureDate: '2026-08-28', TransitCaseNumber: 'TC-0397', AIIS_Completed: true },
  { Id: 15, ArtifactId: 3, Leg: 4, Site: 'JFB', Status: 'Scheduled', ArrivalDate: '2026-09-07', DepartureDate: '2026-10-02', TransitCaseNumber: '', AIIS_Completed: false },
  { Id: 16, ArtifactId: 3, Leg: 5, Site: 'SDP', Status: 'Scheduled', ArrivalDate: '2026-10-12', DepartureDate: '2026-11-06', TransitCaseNumber: '', AIIS_Completed: false },

  // 1620A — at JFB
  { Id: 17, ArtifactId: 4, Leg: 1, Site: 'CPB', Status: 'Completed', ArrivalDate: '2026-05-11', DepartureDate: '2026-06-05', TransitCaseNumber: 'TC-0376', AIIS_Completed: true },
  { Id: 18, ArtifactId: 4, Leg: 2, Site: 'SDP', Status: 'Completed', ArrivalDate: '2026-06-22', DepartureDate: '2026-07-17', TransitCaseNumber: 'TC-0402', AIIS_Completed: true },
  { Id: 19, ArtifactId: 4, Leg: 3, Site: 'PRL', Status: 'Completed', ArrivalDate: '2026-07-20', DepartureDate: '2026-07-31', TransitCaseNumber: 'TC-0419', AIIS_Completed: true },
  { Id: 20, ArtifactId: 4, Leg: 4, Site: 'JFB', Status: 'At-Lab', ArrivalDate: '2026-08-05', DepartureDate: '2026-08-29', TransitCaseNumber: 'TC-0466', AIIS_Completed: true },
  { Id: 21, ArtifactId: 4, Leg: 5, Site: 'SDB', Status: 'Scheduled', ArrivalDate: '2026-09-08', DepartureDate: '2026-10-03', TransitCaseNumber: '', AIIS_Completed: false },

  // PTS-3000 — waiting to start
  { Id: 22, ArtifactId: 5, Leg: 1, Site: 'SDB', Status: 'At-Lab', ArrivalDate: '2026-08-18', DepartureDate: '2026-09-12', TransitCaseNumber: 'TC-0533', AIIS_Completed: false },
  { Id: 23, ArtifactId: 5, Leg: 2, Site: 'CPB', Status: 'Scheduled', ArrivalDate: '2026-09-21', DepartureDate: '2026-10-16', TransitCaseNumber: '', AIIS_Completed: false },
  { Id: 24, ArtifactId: 5, Leg: 3, Site: 'PRL', Status: 'Scheduled', ArrivalDate: '2026-10-26', DepartureDate: '2026-11-20', TransitCaseNumber: '', AIIS_Completed: false },

  // Gage blocks — at SDP
  { Id: 25, ArtifactId: 6, Leg: 1, Site: 'JFB', Status: 'Completed', ArrivalDate: '2026-06-15', DepartureDate: '2026-07-10', TransitCaseNumber: 'TC-0395', AIIS_Completed: true },
  { Id: 26, ArtifactId: 6, Leg: 2, Site: 'SDP', Status: 'At-Lab', ArrivalDate: '2026-08-11', DepartureDate: '2026-09-05', TransitCaseNumber: 'TC-0501', AIIS_Completed: true },
  { Id: 27, ArtifactId: 6, Leg: 3, Site: 'CPB', Status: 'Scheduled', ArrivalDate: '2026-09-15', DepartureDate: '2026-10-10', TransitCaseNumber: '', AIIS_Completed: false },

  // Power sensor — in transit
  { Id: 28, ArtifactId: 7, Leg: 1, Site: 'PRL', Status: 'Completed', ArrivalDate: '2026-06-01', DepartureDate: '2026-06-26', TransitCaseNumber: 'TC-0384', AIIS_Completed: true },
  { Id: 29, ArtifactId: 7, Leg: 2, Site: 'CPB', Status: 'Completed', ArrivalDate: '2026-07-06', DepartureDate: '2026-07-31', TransitCaseNumber: 'TC-0413', AIIS_Completed: true },
  { Id: 30, ArtifactId: 7, Leg: 3, Site: 'SDB', Status: 'In-Transit', ArrivalDate: '2026-08-27', DepartureDate: '2026-09-24', TransitCaseNumber: 'TC-0547', AIIS_Completed: false },
  { Id: 31, ArtifactId: 7, Leg: 4, Site: 'SDP', Status: 'Scheduled', ArrivalDate: '2026-10-05', DepartureDate: '2026-10-30', TransitCaseNumber: '', AIIS_Completed: false },

  // Deadweight tester — at CPB
  { Id: 32, ArtifactId: 8, Leg: 1, Site: 'SDP', Status: 'Completed', ArrivalDate: '2026-06-29', DepartureDate: '2026-07-24', TransitCaseNumber: 'TC-0409', AIIS_Completed: true },
  { Id: 33, ArtifactId: 8, Leg: 2, Site: 'CPB', Status: 'At-Lab', ArrivalDate: '2026-08-10', DepartureDate: '2026-09-04', TransitCaseNumber: 'TC-0498', AIIS_Completed: true },
  { Id: 34, ArtifactId: 8, Leg: 3, Site: 'JFB', Status: 'Scheduled', ArrivalDate: '2026-09-14', DepartureDate: '2026-10-09', TransitCaseNumber: '', AIIS_Completed: false },

  // Attenuator — at SDB
  { Id: 35, ArtifactId: 9, Leg: 1, Site: 'SDP', Status: 'Completed', ArrivalDate: '2026-07-06', DepartureDate: '2026-07-31', TransitCaseNumber: 'TC-0415', AIIS_Completed: true },
  { Id: 36, ArtifactId: 9, Leg: 2, Site: 'SDB', Status: 'At-Lab', ArrivalDate: '2026-08-17', DepartureDate: '2026-09-11', TransitCaseNumber: 'TC-0528', AIIS_Completed: true },
  { Id: 37, ArtifactId: 9, Leg: 3, Site: 'PRL', Status: 'Scheduled', ArrivalDate: '2026-09-21', DepartureDate: '2026-10-16', TransitCaseNumber: '', AIIS_Completed: false },

  // Ring gage — not yet dispatched
  { Id: 38, ArtifactId: 10, Leg: 1, Site: 'PRL', Status: 'Scheduled', ArrivalDate: '2026-09-07', DepartureDate: '2026-10-02', TransitCaseNumber: '', AIIS_Completed: false },
  { Id: 39, ArtifactId: 10, Leg: 2, Site: 'SDB', Status: 'Scheduled', ArrivalDate: '2026-10-12', DepartureDate: '2026-11-06', TransitCaseNumber: '', AIIS_Completed: false },
];

// ---------------------------------------------------------------------------
// PT Program — proficiency test results
// ---------------------------------------------------------------------------
// Raw runs only. The average, s, z, and verdict are all derived below rather
// than stored, so the seed can never disagree with the engine.

const rawResults = [
  // SRX-10K across all five sites — the flagship SPC series
  { Id: 1, ArtifactId: 1, LabCode: 'JFB', MetrologistName: 'Metrologist E', StartDate: '2026-03-09', StopDate: '2026-03-11', LabTempF: 72.6, LabHumidityRH: 41, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [9999.62, 9999.71, 9999.58, 9999.66, 9999.74, 9999.60] },
  { Id: 2, ArtifactId: 1, LabCode: 'PRL', MetrologistName: 'Metrologist D', StartDate: '2026-02-16', StopDate: '2026-02-18', LabTempF: 70.2, LabHumidityRH: 47, SubmittedVia: 'Web form', MeasurementRole: 'Opening', runs: [10000.30, 10000.34, 10000.28, 10000.33, 10000.31, 10000.29] },
  { Id: 3, ArtifactId: 1, LabCode: 'CPB', MetrologistName: 'Metrologist C', StartDate: '2026-05-11', StopDate: '2026-05-13', LabTempF: 73.1, LabHumidityRH: 38, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [10000.79, 10000.74, 10000.86, 10000.71, 10000.82, 10000.76] },
  { Id: 4, ArtifactId: 1, LabCode: 'SDB', MetrologistName: 'Metrologist B', StartDate: '2026-06-16', StopDate: '2026-06-18', LabTempF: 69.8, LabHumidityRH: 51, SubmittedVia: 'Web form', MeasurementRole: 'Participant', runs: [10000.05, 10000.11, 10000.02, 10000.09, 10000.07, 10000.04] },
  { Id: 5, ArtifactId: 1, LabCode: 'SDP', MetrologistName: 'Metrologist A', StartDate: '2026-08-07', StopDate: '2026-08-09', LabTempF: 71.4, LabHumidityRH: 43, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [10000.28, 10000.33, 10000.30, 10000.31, 10000.29, 10000.32] },

  // 732B across four sites
  { Id: 6, ArtifactId: 2, LabCode: 'SDP', MetrologistName: 'Metrologist A', StartDate: '2026-04-16', StopDate: '2026-04-18', LabTempF: 70.9, LabHumidityRH: 45, SubmittedVia: 'Web form', MeasurementRole: 'Participant', runs: [10.0000070, 10.0000075, 10.0000068, 10.0000073, 10.0000071, 10.0000074] },
  { Id: 7, ArtifactId: 2, LabCode: 'SDB', MetrologistName: 'Metrologist B', StartDate: '2026-05-21', StopDate: '2026-05-23', LabTempF: 68.7, LabHumidityRH: 49, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [10.0000180, 10.0000186, 10.0000175, 10.0000183, 10.0000178, 10.0000184] },
  { Id: 8, ArtifactId: 2, LabCode: 'CPB', MetrologistName: 'Metrologist C', StartDate: '2026-06-25', StopDate: '2026-06-27', LabTempF: 74.2, LabHumidityRH: 37, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [9.9999602, 9.9999611, 9.9999598, 9.9999607, 9.9999604, 9.9999609] },
  { Id: 9, ArtifactId: 2, LabCode: 'PRL', MetrologistName: 'Metrologist D', StartDate: '2026-03-30', StopDate: '2026-04-01', LabTempF: 70.5, LabHumidityRH: 46, SubmittedVia: 'Web form', MeasurementRole: 'Opening', runs: [10.0000094, 10.0000101, 10.0000097, 10.0000099, 10.0000095, 10.0000100] },

  // 1620A across four sites — one FAIL
  { Id: 10, ArtifactId: 4, LabCode: 'CPB', MetrologistName: 'Metrologist C', StartDate: '2026-05-14', StopDate: '2026-05-15', LabTempF: 75.1, LabHumidityRH: 35, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [25.0221, 25.0229, 25.0218, 25.0231, 25.0224, 25.0227] },
  { Id: 11, ArtifactId: 4, LabCode: 'SDP', MetrologistName: 'Metrologist A', StartDate: '2026-06-25', StopDate: '2026-06-26', LabTempF: 71.0, LabHumidityRH: 46, SubmittedVia: 'Web form', MeasurementRole: 'Participant', runs: [25.0148, 25.0155, 25.0151, 25.0158, 25.0149, 25.0153] },
  { Id: 12, ArtifactId: 4, LabCode: 'PRL', MetrologistName: 'Metrologist D', StartDate: '2026-04-27', StopDate: '2026-04-28', LabTempF: 69.4, LabHumidityRH: 48, SubmittedVia: 'Web form', MeasurementRole: 'Opening', runs: [25.0066, 25.0071, 25.0064, 25.0069, 25.0067, 25.0070] },
  { Id: 13, ArtifactId: 4, LabCode: 'JFB', MetrologistName: 'Metrologist E', StartDate: '2026-08-08', StopDate: '2026-08-09', LabTempF: 68.9, LabHumidityRH: 44, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [25.0041, 25.0046, 25.0043, 25.0044, 25.0042, 25.0045] },

  // Gage blocks
  { Id: 14, ArtifactId: 6, LabCode: 'JFB', MetrologistName: 'Metrologist E', StartDate: '2026-06-18', StopDate: '2026-06-19', LabTempF: 68.0, LabHumidityRH: 40, SubmittedVia: 'Web form', MeasurementRole: 'Participant', runs: [1.0000009, 1.0000013, 1.0000010, 1.0000012, 1.0000011, 1.0000009] },
  { Id: 15, ArtifactId: 6, LabCode: 'SDP', MetrologistName: 'Metrologist F', StartDate: '2026-08-14', StopDate: '2026-08-15', LabTempF: 68.2, LabHumidityRH: 39, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [1.0000010, 1.0000014, 1.0000011, 1.0000013, 1.0000012, 1.0000010] },

  // Power sensor — repeatable enough on average, but the scatter is the story
  { Id: 16, ArtifactId: 7, LabCode: 'PRL', MetrologistName: 'Metrologist D', StartDate: '2026-05-11', StopDate: '2026-05-12', LabTempF: 71.8, LabHumidityRH: 42, SubmittedVia: 'Web form', MeasurementRole: 'Opening', runs: [-0.019, -0.011, -0.016, -0.013, -0.015, -0.012] },
  { Id: 17, ArtifactId: 7, LabCode: 'CPB', MetrologistName: 'Metrologist C', StartDate: '2026-07-09', StopDate: '2026-07-10', LabTempF: 74.5, LabHumidityRH: 36, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [-0.062, 0.031, -0.048, 0.019, -0.055, 0.024] },

  // Deadweight tester
  { Id: 18, ArtifactId: 8, LabCode: 'SDP', MetrologistName: 'Metrologist F', StartDate: '2026-07-02', StopDate: '2026-07-03', LabTempF: 70.1, LabHumidityRH: 44, SubmittedVia: 'Web form', MeasurementRole: 'Participant', runs: [500.041, 500.046, 500.039, 500.044, 500.042, 500.045] },
  { Id: 19, ArtifactId: 8, LabCode: 'CPB', MetrologistName: 'Metrologist C', StartDate: '2026-08-13', StopDate: '2026-08-14', LabTempF: 73.8, LabHumidityRH: 37, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [500.398, 500.404, 500.391, 500.409, 500.396, 500.402] },

  // Attenuator
  { Id: 20, ArtifactId: 9, LabCode: 'SDP', MetrologistName: 'Metrologist A', StartDate: '2026-07-09', StopDate: '2026-07-10', LabTempF: 71.2, LabHumidityRH: 43, SubmittedVia: 'Web form', MeasurementRole: 'Participant', runs: [20.0110, 20.0116, 20.0109, 20.0114, 20.0112, 20.0115] },
  { Id: 21, ArtifactId: 9, LabCode: 'SDB', MetrologistName: 'Metrologist B', StartDate: '2026-08-20', StopDate: '2026-08-21', LabTempF: 69.5, LabHumidityRH: 50, SubmittedVia: 'Excel import', MeasurementRole: 'Participant', runs: [20.0441, 20.0448, 20.0437, 20.0451, 20.0443, 20.0446] },
  { Id: 22, ArtifactId: 1, LabCode: 'PRL', MetrologistName: 'Metrologist D', StartDate: '2026-08-20', StopDate: '2026-08-22', LabTempF: 70.0, LabHumidityRH: 46, SubmittedVia: 'Web form', MeasurementRole: 'Closing', runs: [10000.317, 10000.321, 10000.316, 10000.320, 10000.318, 10000.319] },
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

// ---------------------------------------------------------------------------
// Audit Schedule — the roster
// ---------------------------------------------------------------------------

const auditors = [
  { Id: 1, AuditorName: 'Auditor One', HomeSite: 'SDP', QualifiedAreas: 'Electrical, Microwave', CertificationExpires: '2027-03-31', ScopeCompetencyStatus: 'Current' },
  { Id: 2, AuditorName: 'Auditor Two', HomeSite: 'SDB', QualifiedAreas: 'Pressure, Temperature', CertificationExpires: '2026-11-30', ScopeCompetencyStatus: 'Current' },
  { Id: 3, AuditorName: 'Auditor Three', HomeSite: 'CPB', QualifiedAreas: 'Electrical, Dimensional', CertificationExpires: '2026-09-30', ScopeCompetencyStatus: 'Renewal due' },
  { Id: 4, AuditorName: 'Auditor Four', HomeSite: 'PRL', QualifiedAreas: 'Microwave', CertificationExpires: '2027-06-30', ScopeCompetencyStatus: 'Current' },
  { Id: 5, AuditorName: 'Auditor Five', HomeSite: 'JFB', QualifiedAreas: 'Pressure, Dimensional, Temperature', CertificationExpires: '2027-01-31', ScopeCompetencyStatus: 'Current' },
  { Id: 6, AuditorName: 'Auditor Six', HomeSite: 'SDP', QualifiedAreas: 'Electrical, Pressure', CertificationExpires: '2026-10-15', ScopeCompetencyStatus: 'Renewal due' },
  { Id: 7, AuditorName: 'Auditor Seven', HomeSite: 'CPB', QualifiedAreas: 'Temperature', CertificationExpires: '2027-05-31', ScopeCompetencyStatus: 'Current' },
  { Id: 8, AuditorName: 'Auditor Eight', HomeSite: 'JFB', QualifiedAreas: 'Dimensional, Microwave', CertificationExpires: '2026-08-31', ScopeCompetencyStatus: 'Expiring' },
];

// ---------------------------------------------------------------------------
// Audit Schedule — lab codes and their scheduled audit dates
// ---------------------------------------------------------------------------

const labAudits = [
  { Id: 1, LabCode: 'SDP-1140', LabName: 'Standards & Calibration, Electrical', Site: 'SDP', AuditType: 'JNACT', ScheduledDate: '2026-09-15', LastAuditDate: '2024-09-10', AssignedAuditor: 'Auditor One', AuditStatus: 'Scheduled', OpenFindings: 0 },
  { Id: 2, LabCode: 'SDP-1142', LabName: 'Standards & Calibration, Physical', Site: 'SDP', AuditType: 'NACT', ScheduledDate: '2026-11-03', LastAuditDate: '2025-10-28', AssignedAuditor: 'Auditor Six', AuditStatus: 'Scheduled', OpenFindings: 1 },
  { Id: 3, LabCode: 'SDB-2210', LabName: 'Precision Measurement Equipment Lab', Site: 'SDB', AuditType: 'NACT', ScheduledDate: '2026-08-26', LastAuditDate: '2025-08-19', AssignedAuditor: 'Auditor Two', AuditStatus: 'In-Progress', OpenFindings: 2 },
  { Id: 4, LabCode: 'SDB-2214', LabName: 'Microwave & RF Standards', Site: 'SDB', AuditType: 'Capability Review', ScheduledDate: '2026-10-20', LastAuditDate: '2025-04-15', AssignedAuditor: 'Auditor Four', AuditStatus: 'Scheduled', OpenFindings: 0 },
  { Id: 5, LabCode: 'CPB-3301', LabName: 'Calibration Production Branch', Site: 'CPB', AuditType: 'JNACT', ScheduledDate: '2026-07-22', LastAuditDate: '2024-07-16', AssignedAuditor: 'Auditor Three', AuditStatus: 'Completed', OpenFindings: 3 },
  { Id: 6, LabCode: 'CPB-3305', LabName: 'Temperature & Humidity Standards', Site: 'CPB', AuditType: 'NACT', ScheduledDate: '2026-08-11', LastAuditDate: '2025-08-05', AssignedAuditor: 'Auditor Seven', AuditStatus: 'Overdue', OpenFindings: 1 },
  { Id: 7, LabCode: 'PRL-4420', LabName: 'Primary Reference Laboratory', Site: 'PRL', AuditType: 'JNACT', ScheduledDate: '2026-10-08', LastAuditDate: '2024-10-02', AssignedAuditor: 'Auditor Four', AuditStatus: 'Scheduled', OpenFindings: 0 },
  { Id: 8, LabCode: 'PRL-4423', LabName: 'Dimensional Standards', Site: 'PRL', AuditType: 'NACT', ScheduledDate: '2026-12-01', LastAuditDate: '2025-11-24', AssignedAuditor: 'Auditor Five', AuditStatus: 'Scheduled', OpenFindings: 0 },
  { Id: 9, LabCode: 'JFB-5510', LabName: 'Fleet Support Calibration Lab', Site: 'JFB', AuditType: 'NACT', ScheduledDate: '2026-09-30', LastAuditDate: '2025-09-23', AssignedAuditor: 'Auditor Five', AuditStatus: 'Scheduled', OpenFindings: 1 },
  { Id: 10, LabCode: 'JFB-5514', LabName: 'Electrical & Electronic Standards', Site: 'JFB', AuditType: 'Capability Review', ScheduledDate: '2026-09-09', LastAuditDate: '2025-03-11', AssignedAuditor: 'Auditor Eight', AuditStatus: 'Scheduled', OpenFindings: 0 },
  { Id: 11, LabCode: 'SDP-1145', LabName: 'Torque & Force Standards', Site: 'SDP', AuditType: 'NACT', ScheduledDate: '2026-08-04', LastAuditDate: '2025-07-29', AssignedAuditor: 'Auditor Six', AuditStatus: 'Overdue', OpenFindings: 4 },
  { Id: 12, LabCode: 'CPB-3309', LabName: 'Pressure & Vacuum Standards', Site: 'CPB', AuditType: 'JNACT', ScheduledDate: '2027-01-19', LastAuditDate: '2025-01-13', AssignedAuditor: 'Auditor Two', AuditStatus: 'Scheduled', OpenFindings: 0 },
];

// ---------------------------------------------------------------------------
// Training Resource Library
// ---------------------------------------------------------------------------
// ResourceUrl is left empty rather than pointed at a plausible-looking address.
// A link that resolves to nothing is worse than a visible gap, and on the real
// site these become links into the document library.

const trainingDocs = [
  { Id: 1, Title: 'RRPT Proficiency Test Instruction', MeasurementArea: 'Electrical', DocNumber: 'NA 17-35FR-06', Version: 'Rev C', ResourceUrl: '', Category: 'Instruction', UpdatedOn: '2026-02-11', Summary: 'Governing instruction for the regional round-robin: artifact handling, the six-run protocol, and z-score acceptance.' },
  { Id: 2, Title: 'AIIS Intake and Handling Checklist', MeasurementArea: 'Electrical', DocNumber: 'Appendix B', Version: 'Rev B', ResourceUrl: '', Category: 'Template', UpdatedOn: '2025-11-04', Summary: 'Receipt inspection, transit-case condition, and acclimation dwell before a PT may begin.' },
  { Id: 3, Title: 'High-Resistance Substitution Procedure', MeasurementArea: 'Electrical', DocNumber: 'NPSL 17-42AE-01', Version: 'Rev A', ResourceUrl: '', Category: 'SOP', UpdatedOn: '2026-01-22', Summary: 'Substitution method for 1 MΩ and 10 MΩ artifacts, including the linearity dwell.' },
  { Id: 4, Title: 'DC Voltage Transfer, 10 V', MeasurementArea: 'Electrical', DocNumber: 'NPSL 17-42AE-04', Version: 'Rev B', ResourceUrl: '', Category: 'SOP', UpdatedOn: '2026-03-30', Summary: 'Zener reference transfer with drift correction and thermal EMF reversal.' },
  { Id: 5, Title: 'Six-Run PT Worksheet', MeasurementArea: 'Electrical', DocNumber: 'Appendix C', Version: 'Rev C', ResourceUrl: '', Category: 'Template', UpdatedOn: '2026-02-11', Summary: 'The importable workbook: six runs, environmentals, and metrologist attestation.' },
  { Id: 6, Title: 'Deadweight Tester Operation', MeasurementArea: 'Pressure', DocNumber: 'NPSL 17-51PR-03', Version: 'Rev D', ResourceUrl: '', Category: 'SOP', UpdatedOn: '2025-09-17', Summary: 'Mass set handling, local gravity correction, and float-and-spin technique.' },
  { Id: 7, Title: 'Pressure Transfer Standard PT Instruction', MeasurementArea: 'Pressure', DocNumber: 'NPSL 17-51PR-07', Version: 'Rev A', ResourceUrl: '', Category: 'Instruction', UpdatedOn: '2026-04-08', Summary: 'Round-robin protocol for the PTS-3000, including head-height correction.' },
  { Id: 8, Title: 'Vacuum Standards Familiarisation', MeasurementArea: 'Pressure', DocNumber: 'TRN-PR-011', Version: 'Rev A', ResourceUrl: '', Category: 'Training', UpdatedOn: '2025-12-02', Summary: 'Self-paced module on capacitance manometers and spinning rotor gauges.' },
  { Id: 9, Title: 'Power Sensor Calibration, 10 MHz–18 GHz', MeasurementArea: 'Microwave', DocNumber: 'NPSL 17-70MW-05', Version: 'Rev A', ResourceUrl: '', Category: 'SOP', UpdatedOn: '2026-05-19', Summary: 'Calorimetric transfer, mismatch uncertainty, and connector torque discipline.' },
  { Id: 10, Title: 'Coaxial Connector Care and Gauging', MeasurementArea: 'Microwave', DocNumber: 'TRN-MW-004', Version: 'Rev C', ResourceUrl: '', Category: 'Training', UpdatedOn: '2026-01-15', Summary: 'Pin-depth gauging, cleaning, and the damage patterns that end a PT early.' },
  { Id: 11, Title: 'Attenuation Measurement Uncertainty', MeasurementArea: 'Microwave', DocNumber: 'NPSL 17-70MW-09', Version: 'Rev B', ResourceUrl: '', Category: 'Guide', UpdatedOn: '2026-06-24', Summary: 'Budget construction for the 20 dB step, worked end to end.' },
  { Id: 12, Title: 'Gage Block Wringing and Care', MeasurementArea: 'Dimensional', DocNumber: 'NPSL 17-60DM-02', Version: 'Rev B', ResourceUrl: '', Category: 'Guide', UpdatedOn: '2025-10-08', Summary: 'Wringing technique, stabilisation time, and when a block leaves service.' },
  { Id: 13, Title: 'Ring and Plug Gage Measurement', MeasurementArea: 'Dimensional', DocNumber: 'NPSL 17-60DM-06', Version: 'Rev A', ResourceUrl: '', Category: 'SOP', UpdatedOn: '2026-03-03', Summary: 'Comparator setup, thermal soak, and roundness averaging.' },
  { Id: 14, Title: 'Thermometry Readout Comparison', MeasurementArea: 'Temperature', DocNumber: 'NPSL 17-80TP-02', Version: 'Rev C', ResourceUrl: '', Category: 'Instruction', UpdatedOn: '2026-05-06', Summary: 'SPRT comparison in a stirred bath, with self-heating and immersion checks.' },
  { Id: 15, Title: 'Fixed-Point Cell Maintenance', MeasurementArea: 'Temperature', DocNumber: 'TRN-TP-002', Version: 'Rev B', ResourceUrl: '', Category: 'Training', UpdatedOn: '2025-08-21', Summary: 'Triple point of water cells: realisation, storage, and plateau assessment.' },
  { Id: 16, Title: 'Environmental Control Requirements', MeasurementArea: 'Temperature', DocNumber: 'Appendix A', Version: 'Rev D', ResourceUrl: '', Category: 'Guide', UpdatedOn: '2026-02-11', Summary: 'The 67–79 °F and ≤70 %RH envelope every PT is measured inside, and what to do when a lab falls outside it.' },
];


// ---------------------------------------------------------------------------
// Scopes of competency
// ---------------------------------------------------------------------------
// Written in the shape an ISO/IEC 17025 scope of accreditation uses:
// parameter, range, and CMC. Declared per parameter rather than per broad
// area, because "Electrical" says nothing about whether a lab can do AC
// current at 100 kHz.

const scopes = [
  { Id: 1, LabCode: 'SDP-1140', Site: 'SDP', Discipline: 'DC', Parameter: 'DC Voltage — Source', RangeText: '0 to 1000 V', CMC: '2.5 ppm', Comments: 'Zener reference, 10 V direct', Status: 'Current' },
  { Id: 2, LabCode: 'SDP-1140', Site: 'SDP', Discipline: 'DC', Parameter: 'Resistance — Measure', RangeText: '1 Ω to 10 MΩ', CMC: '3.0 ppm', Comments: 'Substitution against SRX standards', Status: 'Current' },
  { Id: 3, LabCode: 'SDP-1140', Site: 'SDP', Discipline: 'AC', Parameter: 'AC Voltage — Source', RangeText: '10 mV to 1000 V, 10 Hz to 1 MHz', CMC: '45 ppm', Comments: 'Thermal transfer above 100 kHz', Status: 'Current' },
  { Id: 4, LabCode: 'SDP-1140', Site: 'SDP', Discipline: 'AC', Parameter: 'AC Current — Source', RangeText: '10 µA to 20 A, 10 Hz to 100 kHz', CMC: '120 ppm', Comments: 'Shunt / TVC transfer', Status: 'Current' },
  { Id: 5, LabCode: 'SDP-1145', Site: 'SDP', Discipline: 'Mass', Parameter: 'Torque — Measure', RangeText: '0.5 to 2000 lbf·ft', CMC: '0.08 %', Comments: 'Deadweight torque arm', Status: 'Suspended' },
  { Id: 6, LabCode: 'SDB-2210', Site: 'SDB', Discipline: 'DC', Parameter: 'DC Voltage — Measure', RangeText: '1 mV to 1000 V', CMC: '4.0 ppm', Comments: '', Status: 'Current' },
  { Id: 7, LabCode: 'SDB-2210', Site: 'SDB', Discipline: 'DC', Parameter: 'Resistance — Measure', RangeText: '1 Ω to 10 kΩ', CMC: '5.0 ppm', Comments: 'Upper range limited pending bridge repair', Status: 'Suspended' },
  { Id: 8, LabCode: 'SDB-2214', Site: 'SDB', Discipline: 'RF & Microwave', Parameter: 'RF Power', RangeText: '10 MHz to 18 GHz, −30 to +20 dBm', CMC: '1.8 %', Comments: 'Calorimetric transfer', Status: 'Current' },
  { Id: 9, LabCode: 'SDB-2214', Site: 'SDB', Discipline: 'RF & Microwave', Parameter: 'Attenuation', RangeText: 'DC to 18 GHz, 0 to 60 dB', CMC: '0.03 dB', Comments: '', Status: 'Current' },
  { Id: 10, LabCode: 'CPB-3301', Site: 'CPB', Discipline: 'DC', Parameter: 'DC Voltage — Source', RangeText: '0 to 1000 V', CMC: '3.5 ppm', Comments: '', Status: 'Current' },
  { Id: 11, LabCode: 'CPB-3305', Site: 'CPB', Discipline: 'Temperature', Parameter: 'Temperature — SPRT Comparison', RangeText: '−40 to 250 °C', CMC: '4.0 mK', Comments: 'Stirred fluid baths', Status: 'Current' },
  { Id: 12, LabCode: 'CPB-3305', Site: 'CPB', Discipline: 'Temperature', Parameter: 'Humidity — Generate', RangeText: '10 to 95 %RH', CMC: '0.5 %RH', Comments: 'Two-pressure generator', Status: 'Current' },
  { Id: 13, LabCode: 'CPB-3309', Site: 'CPB', Discipline: 'Pressure', Parameter: 'Pressure — Gauge', RangeText: '10 to 10 000 psi', CMC: '0.008 % rdg', Comments: 'Deadweight, local gravity corrected', Status: 'Current' },
  { Id: 14, LabCode: 'CPB-3309', Site: 'CPB', Discipline: 'Flow', Parameter: 'Gas Flow Rate', RangeText: '1×10⁻⁴ to 1×10² atm·cm³/s', CMC: '4.5 %', Comments: 'Primary calibration system', Status: 'Current' },
  { Id: 15, LabCode: 'PRL-4420', Site: 'PRL', Discipline: 'DC', Parameter: 'DC Voltage — Source', RangeText: '0 to 1000 V', CMC: '1.2 ppm', Comments: 'Reference laboratory', Status: 'Current' },
  { Id: 16, LabCode: 'PRL-4420', Site: 'PRL', Discipline: 'DC', Parameter: 'Resistance — Measure', RangeText: '1 mΩ to 100 MΩ', CMC: '1.5 ppm', Comments: 'Reference laboratory', Status: 'Current' },
  { Id: 17, LabCode: 'PRL-4420', Site: 'PRL', Discipline: 'AC', Parameter: 'AC Voltage — Source', RangeText: '1 mV to 1000 V, 10 Hz to 1 MHz', CMC: '22 ppm', Comments: 'Reference laboratory', Status: 'Current' },
  { Id: 18, LabCode: 'PRL-4423', Site: 'PRL', Discipline: 'Dimensional', Parameter: 'Gage Blocks — Length', RangeText: '0.05 to 4 in', CMC: '(0.8 + 0.6L) µin', Comments: 'Mechanical comparison', Status: 'Current' },
  { Id: 19, LabCode: 'PRL-4423', Site: 'PRL', Discipline: 'Dimensional', Parameter: 'Ring & Plug Gages', RangeText: '0.1 to 6 in', CMC: '(2 + 1.2L) µin', Comments: '', Status: 'Current' },
  { Id: 20, LabCode: 'JFB-5510', Site: 'JFB', Discipline: 'Pressure', Parameter: 'Pressure — Gauge', RangeText: '0 to 1000 psi', CMC: '0.02 % rdg', Comments: '', Status: 'Current' },
  { Id: 21, LabCode: 'JFB-5510', Site: 'JFB', Discipline: 'Temperature', Parameter: 'Temperature — Readout', RangeText: '−20 to 150 °C', CMC: '9.0 mK', Comments: '', Status: 'Current' },
  { Id: 22, LabCode: 'JFB-5514', Site: 'JFB', Discipline: 'DC', Parameter: 'DC Voltage — Measure', RangeText: '1 mV to 1000 V', CMC: '6.0 ppm', Comments: '', Status: 'Current' },
  { Id: 23, LabCode: 'JFB-5514', Site: 'JFB', Discipline: 'AC', Parameter: 'AC Voltage — Measure', RangeText: '10 mV to 750 V, 20 Hz to 100 kHz', CMC: '90 ppm', Comments: '', Status: 'Current' },
  { Id: 24, LabCode: 'JFB-5514', Site: 'JFB', Discipline: 'RF & Microwave', Parameter: 'RF Power', RangeText: '10 MHz to 8 GHz, −20 to +16 dBm', CMC: '2.4 %', Comments: '', Status: 'Current' },
];

// ---------------------------------------------------------------------------
// Loss of capability
// ---------------------------------------------------------------------------
// A lab reports what is down, in what range, why, and since when. An empty
// RestoredDate is the whole query: it is what "still down" means.

const capabilityLoss = [
  { Id: 1, Site: 'SDB', LabCode: 'SDB-2210', Discipline: 'DC', Parameter: 'Resistance', RangeText: '1 Ω to 10 kΩ', Reason: 'Broken bridge', LossDate: '2026-07-14', RestoredDate: '', ImpactedArtifacts: 'SRX-10K' },
  { Id: 2, Site: 'SDP', LabCode: 'SDP-1145', Discipline: 'Mass', Parameter: 'Torque', RangeText: '0.5 to 2000 lbf·ft', Reason: 'Transducer failed, awaiting service provider', LossDate: '2026-06-02', RestoredDate: '', ImpactedArtifacts: '' },
  { Id: 3, Site: 'CPB', LabCode: 'CPB-3305', Discipline: 'Temperature', Parameter: 'Humidity — Generate', RangeText: '10 to 95 %RH', Reason: 'Compressor past 10 000 h, PM overdue', LossDate: '2026-08-11', RestoredDate: '', ImpactedArtifacts: '' },
  { Id: 4, Site: 'JFB', LabCode: 'JFB-5514', Discipline: 'AC', Parameter: 'AC Voltage — Measure', RangeText: '10 mV to 750 V', Reason: 'Transfer standard out for calibration', LossDate: '2026-05-19', RestoredDate: '2026-07-08', ImpactedArtifacts: '' },
  { Id: 5, Site: 'PRL', LabCode: 'PRL-4423', Discipline: 'Dimensional', Parameter: 'Ring & Plug Gages', RangeText: '0.1 to 6 in', Reason: 'Comparator drive rebuild', LossDate: '2026-03-02', RestoredDate: '2026-04-17', ImpactedArtifacts: 'RG-750' },
];

// ---------------------------------------------------------------------------
// Preventive maintenance
// ---------------------------------------------------------------------------
// Calendar-based and hours-based intervals do not reduce to one number: an air
// filter is due monthly, a compressor is due at 10 000 running hours whenever
// that arrives. Both are carried, and Basis says which one governs.

const pmSchedule = [
  { Id: 1, Model: 'RV8 Vacuum Pump', Maker: 'Edwards', Site: 'CPB', Task: 'Inspection and oil change.', Basis: 'Calendar', IntervalText: 'Every 6 months', IntervalMonths: 6, LastDone: '2026-03-18', NextDue: '2026-09-18', HoursRun: null, HoursThreshold: null },
  { Id: 2, Model: 'RV8 Vacuum Pump', Maker: 'Edwards', Site: 'PRL', Task: 'Inspection and oil change.', Basis: 'Calendar', IntervalText: 'Every 6 months', IntervalMonths: 6, LastDone: '2026-01-22', NextDue: '2026-07-22', HoursRun: null, HoursThreshold: null },
  { Id: 3, Model: 'ACS2520 Compressor (2500ST)', Maker: 'Thunder Scientific', Site: 'CPB', Task: 'Inspect hours run. At 10 000 h the scheduled overhaul is required — valve plate, filters, and oil.', Basis: 'Hours', IntervalText: '10 000 running hours', IntervalMonths: null, LastDone: '2024-11-05', NextDue: '', HoursRun: 10420, HoursThreshold: 10000 },
  { Id: 4, Model: 'ACS2520 Compressor (2500ST)', Maker: 'Thunder Scientific', Site: 'SDB', Task: 'Inspect hours run. At 10 000 h the scheduled overhaul is required — valve plate, filters, and oil.', Basis: 'Hours', IntervalText: '10 000 running hours', IntervalMonths: null, LastDone: '2025-06-30', NextDue: '', HoursRun: 7180, HoursThreshold: 10000 },
  { Id: 5, Model: '5730A Calibrator', Maker: 'Fluke', Site: 'SDP', Task: 'Clean air filters.', Basis: 'Calendar', IntervalText: 'Monthly', IntervalMonths: 1, LastDone: '2026-08-04', NextDue: '2026-09-04', HoursRun: null, HoursThreshold: null },
  { Id: 6, Model: '5730A Calibrator', Maker: 'Fluke', Site: 'SDB', Task: 'Clean air filters.', Basis: 'Calendar', IntervalText: 'Monthly', IntervalMonths: 1, LastDone: '2026-07-09', NextDue: '2026-08-09', HoursRun: null, HoursThreshold: null },
  { Id: 7, Model: '5730A Calibrator', Maker: 'Fluke', Site: 'PRL', Task: 'Clean air filters.', Basis: 'Calendar', IntervalText: 'Monthly', IntervalMonths: 1, LastDone: '2026-08-12', NextDue: '2026-09-12', HoursRun: null, HoursThreshold: null },
  { Id: 8, Model: '7015 Oil Bath', Maker: 'Fluke', Site: 'CPB', Task: 'Annual inspection. Fluid changed at least every 10 years, sooner on drastic contamination.', Basis: 'Calendar', IntervalText: 'Every 12 months', IntervalMonths: 12, LastDone: '2025-10-14', NextDue: '2026-10-14', HoursRun: null, HoursThreshold: null },
  { Id: 9, Model: '7015 Oil Bath', Maker: 'Fluke', Site: 'JFB', Task: 'Annual inspection. Fluid changed at least every 10 years, sooner on drastic contamination.', Basis: 'Calendar', IntervalText: 'Every 12 months', IntervalMonths: 12, LastDone: '2026-02-27', NextDue: '2027-02-27', HoursRun: null, HoursThreshold: null },
  { Id: 10, Model: '2500ST Humidity Generator', Maker: 'Thunder Scientific', Site: 'CPB', Task: 'Saturator inspection and desiccant change.', Basis: 'Calendar', IntervalText: 'Every 12 months', IntervalMonths: 12, LastDone: '2025-08-20', NextDue: '2026-08-20', HoursRun: null, HoursThreshold: null },
];

// ---------------------------------------------------------------------------
// Procedures, manuals, and the service provider list
// ---------------------------------------------------------------------------
// Three tiles read this one list, separated by Category. Links are the bare
// measure.navair.navy.mil addresses, not the Office SafeLinks wrappers they
// arrived in — those carry the sender's email address and tenant id in the
// query string, and this repository is public.

const MEASURE = 'https://measure.navair.navy.mil/DownloadFileHandler.ashx?id=';

const procedures = [
  { Id: 1, Title: 'PT Program Process Manual', Category: 'PT Manual', DocNumber: 'METCAL-PT-001', Discipline: 'All', Url: '', Summary: 'The quality manual governing the round-robin programme end to end: artifact selection, reference measurements, participant protocol, evaluation, and corrective action.', UpdatedOn: '2026-02-11' },
  { Id: 2, Title: 'ISO/IEC 17043 — Conformity assessment: requirements for proficiency testing', Category: 'PT Manual', DocNumber: 'ISO/IEC 17043:2023', Discipline: 'All', Url: 'https://www.iso.org/standard/80864.html', Summary: 'The international standard the programme is written against. Referenced, not reproduced.', UpdatedOn: '2023-05-01' },
  { Id: 3, Title: 'Authorized Service Provider List', Category: 'Service Providers', DocNumber: '', Discipline: 'All', Url: `${MEASURE}34020DE418204A4B8DD3BCC8BAF40898`, Summary: 'Providers authorised to service and repair calibration standards. Held on MEASURE; opens in a new tab and needs a CAC.', UpdatedOn: '' },
  { Id: 4, Title: 'Cross-Check Procedure', Category: 'Cross-Check', DocNumber: '', Discipline: 'All', Url: `${MEASURE}5AEDC0FED1761045B2991136C5DA8816`, Summary: 'Held on MEASURE; opens in a new tab and needs a CAC.', UpdatedOn: '' },
  { Id: 5, Title: 'Cross-Check Procedure', Category: 'Cross-Check', DocNumber: '', Discipline: 'All', Url: `${MEASURE}DB1F90AB47EE294C90F83D3C46008F37`, Summary: 'Held on MEASURE; opens in a new tab and needs a CAC.', UpdatedOn: '' },
  { Id: 6, Title: 'In-Service Check Procedure', Category: 'In-Service Check', DocNumber: '', Discipline: 'All', Url: '', Summary: 'Placeholder. The source document has not been identified yet — see the note on this tile.', UpdatedOn: '' },
];

export default {
  artifacts, rotation, ptResults, auditors, labAudits,
  scopes, capabilityLoss, pmSchedule, procedures, trainingDocs,
};
