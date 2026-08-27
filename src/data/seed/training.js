// ---------------------------------------------------------------------------
// Mock data for the Training side of the portal.
// ---------------------------------------------------------------------------
// Personnel are placeholders — "Technician A", "Metrologist B" — and a test
// enforces it. This repository is public and the single-file build is a public
// release asset, so a real by-name roster belongs in the SharePoint list at
// runtime. Course codes, schoolhouse names, and CANTRAC are the genuine shape
// of Navy training; none of that is sensitive.

// ---------------------------------------------------------------------------
// Annual scheduling letters
// ---------------------------------------------------------------------------
// The letters are not routed through this portal — they are signed elsewhere
// and published here to be read. So there is no approval state to model and no
// per-site acknowledgement to chase: a letter is either the one in effect or
// one it superseded, and what a visitor wants is the file.

const annualLtr = [
  { Id: 1, FiscalYear: 'FY26', Serial: '4355 Ser METCAL/26-014', Title: 'Annual NAVAIR METCAL Program Scheduling Letter', Status: 'Current', IssuedOn: '2025-10-07', FileName: 'FY26-METCAL-Scheduling-Letter.pdf', FileSize: '412 KB', Url: '', Summary: 'Establishes required courses by billet, quota allocation per site, and the convening schedule for the fiscal year.' },
  { Id: 2, FiscalYear: 'FY25', Serial: '4355 Ser METCAL/25-011', Title: 'Annual NAVAIR METCAL Program Scheduling Letter', Status: 'Superseded', IssuedOn: '2024-10-02', FileName: 'FY25-METCAL-Scheduling-Letter.pdf', FileSize: '388 KB', Url: '', Summary: 'Superseded by the FY26 letter. Kept for reference against seats scheduled under it.' },
  { Id: 3, FiscalYear: 'FY24', Serial: '4355 Ser METCAL/24-009', Title: 'Annual NAVAIR METCAL Program Scheduling Letter', Status: 'Superseded', IssuedOn: '2023-10-05', FileName: 'FY24-METCAL-Scheduling-Letter.pdf', FileSize: '371 KB', Url: '', Summary: 'Superseded by the FY25 letter.' },
];

// ---------------------------------------------------------------------------
// Course catalogue
// ---------------------------------------------------------------------------
// CANTRAC is the Navy's course catalogue; the CDP is how a quota is actually
// requested, which is why it is carried alongside the course identifier.

const courses = [
  { Id: 1, CourseCode: 'A-100-0060', Title: 'Basic Metrology and Calibration', Cdp: '01AB', Schoolhouse: 'NAVSEA Biloxi', LengthDays: 20, Discipline: 'All', External: false, CantracUrl: 'https://app.prod.cetars.training.navy.mil/cantrac/vol2.html', Prerequisite: '' },
  { Id: 2, CourseCode: 'A-100-0061', Title: 'DC / Low Frequency Standards', Cdp: '02CD', Schoolhouse: 'NAVSEA Biloxi', LengthDays: 15, Discipline: 'DC', External: false, CantracUrl: 'https://app.prod.cetars.training.navy.mil/cantrac/vol2.html', Prerequisite: 'A-100-0060' },
  { Id: 3, CourseCode: 'A-100-0074', Title: 'Microwave Measurement Standards', Cdp: '03EF', Schoolhouse: 'NAVSEA Biloxi', LengthDays: 15, Discipline: 'RF & Microwave', External: false, CantracUrl: 'https://app.prod.cetars.training.navy.mil/cantrac/vol2.html', Prerequisite: 'A-100-0061' },
  { Id: 4, CourseCode: 'A-670-0100', Title: 'Physical / Dimensional Standards', Cdp: '04GH', Schoolhouse: 'Corona Division', LengthDays: 10, Discipline: 'Dimensional', External: false, CantracUrl: 'https://app.prod.cetars.training.navy.mil/cantrac/vol2.html', Prerequisite: 'A-100-0060' },
  { Id: 5, CourseCode: 'A-670-0110', Title: 'Pressure and Vacuum Standards', Cdp: '05JK', Schoolhouse: 'Corona Division', LengthDays: 10, Discipline: 'Pressure', External: false, CantracUrl: 'https://app.prod.cetars.training.navy.mil/cantrac/vol2.html', Prerequisite: 'A-100-0060' },
  { Id: 6, CourseCode: 'WPT-5730', Title: 'Fluke 5730A Operation and Maintenance', Cdp: '', Schoolhouse: 'Vendor — Fluke Calibration', LengthDays: 5, Discipline: 'AC', External: true, CantracUrl: '', Prerequisite: 'A-100-0061' },
  { Id: 7, CourseCode: 'WPT-MUA', Title: 'Measurement Uncertainty Analysis', Cdp: '', Schoolhouse: 'Vendor — NCSLI', LengthDays: 4, Discipline: 'All', External: true, CantracUrl: '', Prerequisite: 'A-100-0060' },
  { Id: 8, CourseCode: 'WPT-17025', Title: 'ISO/IEC 17025 Internal Auditor', Cdp: '', Schoolhouse: 'Vendor — A2LA WorkPlace Training', LengthDays: 3, Discipline: 'All', External: true, CantracUrl: '', Prerequisite: '' },
];

// ---------------------------------------------------------------------------
// Schoolhouses
// ---------------------------------------------------------------------------

const schoolhouses = [
  { Id: 1, Name: 'NAVSEA Biloxi', City: 'Biloxi, MS', Building: 'Bldg 4204, Keesler AFB', PocRole: 'Course Coordinator', PocEmail: '', CheckInProcedure: 'Report to Bldg 4204 quarterdeck NLT 0700 the first training day, in service dress. Bring orders, CAC, and a copy of the by-name confirmation sheet. Base access is via the Pass & ID office on White Ave; allow 45 minutes.', Parking: 'Lot C, permit issued at check-in', LodgingNote: 'Navy Gateway Inns; certificate of non-availability required before commercial lodging.' },
  { Id: 2, Name: 'Corona Division', City: 'Norco, CA', Building: 'Bldg 3, Measurement Science Directorate', PocRole: 'Training Officer', PocEmail: '', CheckInProcedure: 'Visit request must be on file 10 working days prior. Report to the Bldg 3 lobby at 0730; escort required until a badge is issued. Bring orders and CAC.', Parking: 'Visitor lot, west gate', LodgingNote: 'On-station lodging is limited; book early in peak season.' },
  { Id: 3, Name: 'Vendor — Fluke Calibration', City: 'Everett, WA', Building: 'Fluke Calibration training centre', PocRole: 'Registrar', PocEmail: '', CheckInProcedure: 'Vendor course. Registration confirmation arrives by email; report to reception at 0800 on day one. No base access required.', Parking: 'On site', LodgingNote: 'Commercial lodging, per diem rate applies.' },
  { Id: 4, Name: 'Vendor — NCSLI', City: 'Boulder, CO', Building: 'Conference venue, varies by session', PocRole: 'Registrar', PocEmail: '', CheckInProcedure: 'Vendor course, venue confirmed 30 days out. Report per the registration email.', Parking: 'Venue dependent', LodgingNote: 'Conference block rate, book through the registrar.' },
  { Id: 5, Name: 'Vendor — A2LA WorkPlace Training', City: 'Frederick, MD', Building: 'A2LA headquarters', PocRole: 'Registrar', PocEmail: '', CheckInProcedure: 'Vendor course. Report to reception at 0830 on day one.', Parking: 'On site', LodgingNote: 'Commercial lodging, per diem rate applies.' },
];

// ---------------------------------------------------------------------------
// Travel restrictions
// ---------------------------------------------------------------------------

const travelRestrictions = [
  { Id: 1, Scope: 'CONUS — all', Status: 'Open', EffectiveFrom: '2025-10-01', Detail: 'Routine TAD travel approved at the site level within the FY26 training budget.', Authority: 'FY26 Training LTR' },
  { Id: 2, Scope: 'Vendor / WPT courses', Status: 'Restricted', EffectiveFrom: '2026-01-15', Detail: 'Commercial vendor training requires program office endorsement before quota request. Justify against the billet requirement and confirm no CANTRAC equivalent exists.', Authority: 'Program office' },
  { Id: 3, Scope: 'Conference attendance', Status: 'Restricted', EffectiveFrom: '2025-10-01', Detail: 'Conference travel requires flag-level approval and must be submitted 90 days prior.', Authority: 'DoD conference policy' },
  { Id: 4, Scope: 'OCONUS', Status: 'Approval required', EffectiveFrom: '2025-10-01', Detail: 'Country clearance and theatre clearance required. Submit through APACS no later than 45 days prior.', Authority: 'DoD FCG' },
];

// ---------------------------------------------------------------------------
// Scheduled training — the by-name sheet and the schedule are one list
// ---------------------------------------------------------------------------
// Held together on purpose. The confirmation sheet and the schedule are the
// same rows read two ways: one asks "who is confirmed", the other asks "what
// is happening when". Splitting them would put the same person in two places
// and invite them to disagree.

const enrollments = [
  { Id: 1, Person: 'Technician A', Site: 'SDP', LabCode: 'SDP-1140', CourseCode: 'A-100-0060', StartDate: '2026-09-14', EndDate: '2026-10-09', Status: 'Confirmed', QuotaStatus: 'Seated', Confirmed: true, ConfirmedOn: '2026-07-30', InstructorNotified: true, NotifiedOn: '2026-08-01', OrdersStatus: 'Issued' },
  { Id: 2, Person: 'Technician B', Site: 'SDB', LabCode: 'SDB-2210', CourseCode: 'A-100-0060', StartDate: '2026-09-14', EndDate: '2026-10-09', Status: 'Confirmed', QuotaStatus: 'Seated', Confirmed: true, ConfirmedOn: '2026-08-03', InstructorNotified: true, NotifiedOn: '2026-08-04', OrdersStatus: 'Issued' },
  { Id: 3, Person: 'Technician C', Site: 'CPB', LabCode: 'CPB-3301', CourseCode: 'A-100-0061', StartDate: '2026-10-05', EndDate: '2026-10-23', Status: 'Confirmed', QuotaStatus: 'Seated', Confirmed: true, ConfirmedOn: '2026-08-12', InstructorNotified: false, NotifiedOn: '', OrdersStatus: 'Drafted' },
  { Id: 4, Person: 'Metrologist B', Site: 'SDB', LabCode: 'SDB-2214', CourseCode: 'A-100-0074', StartDate: '2026-11-02', EndDate: '2026-11-20', Status: 'Pending confirmation', QuotaStatus: 'Requested', Confirmed: false, ConfirmedOn: '', InstructorNotified: false, NotifiedOn: '', OrdersStatus: 'Not started' },
  { Id: 5, Person: 'Metrologist D', Site: 'PRL', LabCode: 'PRL-4423', CourseCode: 'A-670-0100', StartDate: '2026-09-21', EndDate: '2026-10-02', Status: 'Confirmed', QuotaStatus: 'Seated', Confirmed: true, ConfirmedOn: '2026-07-18', InstructorNotified: true, NotifiedOn: '2026-07-19', OrdersStatus: 'Issued' },
  { Id: 6, Person: 'Technician E', Site: 'JFB', LabCode: 'JFB-5510', CourseCode: 'A-670-0110', StartDate: '2026-10-12', EndDate: '2026-10-23', Status: 'Pending confirmation', QuotaStatus: 'Waitlisted', Confirmed: false, ConfirmedOn: '', InstructorNotified: false, NotifiedOn: '', OrdersStatus: 'Not started' },
  { Id: 7, Person: 'Metrologist A', Site: 'SDP', LabCode: 'SDP-1140', CourseCode: 'WPT-5730', StartDate: '2026-09-28', EndDate: '2026-10-02', Status: 'Confirmed', QuotaStatus: 'Seated', Confirmed: true, ConfirmedOn: '2026-08-05', InstructorNotified: true, NotifiedOn: '2026-08-06', OrdersStatus: 'Issued' },
  { Id: 8, Person: 'Metrologist C', Site: 'CPB', LabCode: 'CPB-3305', CourseCode: 'WPT-MUA', StartDate: '2026-12-07', EndDate: '2026-12-10', Status: 'Endorsement required', QuotaStatus: 'Requested', Confirmed: false, ConfirmedOn: '', InstructorNotified: false, NotifiedOn: '', OrdersStatus: 'Not started' },
  { Id: 9, Person: 'Auditor Three', Site: 'CPB', LabCode: 'CPB-3301', CourseCode: 'WPT-17025', StartDate: '2026-09-08', EndDate: '2026-09-10', Status: 'Confirmed', QuotaStatus: 'Seated', Confirmed: true, ConfirmedOn: '2026-07-25', InstructorNotified: true, NotifiedOn: '2026-07-26', OrdersStatus: 'Issued' },
  { Id: 10, Person: 'Auditor Six', Site: 'SDP', LabCode: 'SDP-1145', CourseCode: 'WPT-17025', StartDate: '2026-09-08', EndDate: '2026-09-10', Status: 'Pending confirmation', QuotaStatus: 'Requested', Confirmed: false, ConfirmedOn: '', InstructorNotified: false, NotifiedOn: '', OrdersStatus: 'Not started' },
  { Id: 11, Person: 'Technician F', Site: 'JFB', LabCode: 'JFB-5514', CourseCode: 'A-100-0061', StartDate: '2026-10-05', EndDate: '2026-10-23', Status: 'Confirmed', QuotaStatus: 'Seated', Confirmed: true, ConfirmedOn: '2026-08-14', InstructorNotified: false, NotifiedOn: '', OrdersStatus: 'Drafted' },
  { Id: 12, Person: 'Technician G', Site: 'SDB', LabCode: 'SDB-2210', CourseCode: 'A-670-0110', StartDate: '2026-10-12', EndDate: '2026-10-23', Status: 'Confirmed', QuotaStatus: 'Seated', Confirmed: true, ConfirmedOn: '2026-08-20', InstructorNotified: false, NotifiedOn: '', OrdersStatus: 'Drafted' },
  { Id: 13, Person: 'Metrologist E', Site: 'JFB', LabCode: 'JFB-5510', CourseCode: 'A-100-0074', StartDate: '2026-11-02', EndDate: '2026-11-20', Status: 'Pending confirmation', QuotaStatus: 'Requested', Confirmed: false, ConfirmedOn: '', InstructorNotified: false, NotifiedOn: '', OrdersStatus: 'Not started' },
  { Id: 14, Person: 'Technician H', Site: 'PRL', LabCode: 'PRL-4420', CourseCode: 'A-100-0060', StartDate: '2027-01-11', EndDate: '2027-02-05', Status: 'Pending confirmation', QuotaStatus: 'Requested', Confirmed: false, ConfirmedOn: '', InstructorNotified: false, NotifiedOn: '', OrdersStatus: 'Not started' },
];

// ---------------------------------------------------------------------------
// Training references — the links tile
// ---------------------------------------------------------------------------

const trainingRefs = [
  { Id: 1, Title: 'CANTRAC Volume II — Course Catalogue', Category: 'Link', Url: 'https://app.prod.cetars.training.navy.mil/cantrac/vol2.html', Summary: 'The authoritative course catalogue. Search by course identification number or CDP to confirm convening dates and quotas.', UpdatedOn: '' },
  { Id: 2, Title: 'MEASURE — NAVAIR Metrology and Calibration', Category: 'Link', Url: 'https://measure.navair.navy.mil/', Summary: 'Program documents, procedures, and the authorised service provider list. Needs a CAC.', UpdatedOn: '' },
  { Id: 3, Title: 'NAVEDTRA 43100-1 — Personnel Qualification Standards', Category: 'Reference', Url: '', Summary: 'PQS structure and sign-off authority for the calibration rating.', UpdatedOn: '2025-06-01' },
  { Id: 4, Title: 'Billet Training Matrix', Category: 'Reference', Url: '', Summary: 'Which courses are required, recommended, or optional for each billet, by measurement discipline.', UpdatedOn: '2025-10-07' },
  { Id: 5, Title: 'Quota Request Procedure', Category: 'Reference', Url: '', Summary: 'How a site requests a seat: CDP lookup, request routing, and the confirmation deadline.', UpdatedOn: '2025-10-07' },
];

export default {
  annualLtr, courses, schoolhouses, travelRestrictions, enrollments, trainingRefs,
};
