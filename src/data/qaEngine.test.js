import { describe, it, expect } from 'vitest';
import {
  mean, sampleStdDev, sigmaPt, zScore, evaluationTier, evaluate, environmentCheck, ptRound,
} from './qaEngine.js';
import seed from './seedData.js';
import { CONTAINERS, listTitle, REFERENCE_LAB, SITES } from './listSchema.js';
import modules, { allModules } from '../app/moduleRegistry.jsx';

describe('sigmaPt', () => {
  it('is half the required accuracy', () => {
    expect(sigmaPt(0.4)).toBe(0.2);
  });
  it('refuses a zero or missing accuracy rather than dividing by it', () => {
    expect(sigmaPt(0)).toBeNull();
    expect(sigmaPt(undefined)).toBeNull();
    expect(sigmaPt(-1)).toBeNull();
  });
});

describe('mean and sampleStdDev', () => {
  it('computes the sample standard deviation with n-1', () => {
    // s for [2,4,4,4,5,5,7,9] is 2.138... with n-1, 2.0 with n.
    expect(sampleStdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.13809, 4);
  });
  it('needs two runs before scatter means anything', () => {
    expect(sampleStdDev([5])).toBeNull();
    expect(sampleStdDev([])).toBeNull();
  });
  it('ignores blanks so a partly-filled grid still averages', () => {
    expect(mean([1, undefined, 3, null, NaN])).toBe(2);
  });
});

describe('zScore', () => {
  it('is the absolute deviation in units of sigma_pt', () => {
    // |10000.78 - 10000.31| / (0.4/2) = 0.47 / 0.2 = 2.35
    expect(zScore({ average: 10000.78, referenceValue: 10000.31, requiredAccuracy: 0.4 }))
      .toBeCloseTo(2.35, 2);
  });
  it('is unsigned — a lab that reads low fails the same as one that reads high', () => {
    const high = zScore({ average: 11, referenceValue: 10, requiredAccuracy: 1 });
    const low = zScore({ average: 9, referenceValue: 10, requiredAccuracy: 1 });
    expect(high).toBe(low);
  });
});

describe('evaluationTier', () => {
  it.each([
    [0, 'PASS'], [1.99, 'PASS'], [2, 'PASS'],
    [2.01, 'EVALUATE'], [2.999, 'EVALUATE'],
    [3, 'FAIL'], [7.4, 'FAIL'],
  ])('z of %s is %s', (z, tier) => {
    expect(evaluationTier(z)).toBe(tier);
  });

  it('puts the boundaries where the standard puts them', () => {
    // |z| <= 2 passes and |z| >= 3 fails, so both boundaries belong to the
    // outer tier, not the middle one.
    expect(evaluationTier(2)).toBe('PASS');
    expect(evaluationTier(3)).toBe('FAIL');
  });
});

describe('evaluate', () => {
  it('flags poor repeatability even when the average lands on the reference', () => {
    // The case the warning exists for: dead-on by luck, unable to repeat.
    const result = evaluate({
      runs: [-0.062, 0.031, -0.048, 0.019, -0.055, 0.024],
      referenceValue: -0.014,
      requiredAccuracy: 0.06,
    });
    expect(result.status).toBe('PASS');
    expect(result.z).toBeLessThan(0.5);
    expect(result.repeatabilityWarning).toBe(true);
  });

  it('does not warn when scatter is inside sigma_pt', () => {
    const result = evaluate({
      runs: [10000.28, 10000.33, 10000.30, 10000.31, 10000.29, 10000.32],
      referenceValue: 10000.31,
      requiredAccuracy: 0.4,
    });
    expect(result.repeatabilityWarning).toBe(false);
  });

  it('reports how many runs it actually had', () => {
    expect(evaluate({ runs: [1, 2, null, 3], referenceValue: 2, requiredAccuracy: 1 }).runCount).toBe(3);
  });
});

describe('environmentCheck', () => {
  it('accepts the middle of the NA 17-35FR-06 band', () => {
    expect(environmentCheck({ tempF: 71, humidityRH: 45 }).ok).toBe(true);
  });
  it.each([[66.9], [79.1]])('rejects %s F', (tempF) => {
    expect(environmentCheck({ tempF }).ok).toBe(false);
  });
  it('accepts both endpoints, which are in the band', () => {
    expect(environmentCheck({ tempF: 67 }).ok).toBe(true);
    expect(environmentCheck({ tempF: 79 }).ok).toBe(true);
  });
  it('says what is wrong, not just that something is', () => {
    expect(environmentCheck({ tempF: 84 }).problems[0]).toMatch(/84.0 °F is outside 67–79/);
  });
  it('treats a missing temperature as a problem rather than a pass', () => {
    expect(environmentCheck({}).ok).toBe(false);
  });
});

describe('the seeded dataset', () => {
  // The seed exists to make the app demonstrable, so it has to exercise every
  // tier — otherwise the first thing anyone sees is a wall of PASS.
  it('covers all three evaluation tiers', () => {
    const tiers = new Set(seed.ptResults.map((r) => r.EvaluationStatus));
    expect(tiers).toEqual(new Set(['PASS', 'EVALUATE', 'FAIL']));
  });

  it('includes a repeatability warning', () => {
    expect(seed.ptResults.some((r) => r.repeatabilityWarning)).toBe(true);
  });

  it('agrees with the engine — nothing is hand-written', () => {
    for (const row of seed.ptResults) {
      const artifact = seed.artifacts.find((a) => a.Id === row.ArtifactId);
      const fresh = evaluate({
        runs: row.runs,
        referenceValue: artifact.ReferenceValue,
        requiredAccuracy: artifact.RequiredAccuracy,
      });
      expect(row.ZScore).toBeCloseTo(fresh.z, 12);
      expect(row.EvaluationStatus).toBe(fresh.status);
    }
  });

  it('carries no real personnel names, since this repository is public', () => {
    // The single-file build is published as a public release asset, so every
    // name that reaches version control reaches the internet. The real roster
    // belongs in the SharePoint list at runtime. Every surface that renders a
    // person is checked here, not just the two that existed first.
    const names = [
      ...seed.auditors.map((a) => a.AuditorName),
      ...seed.ptResults.map((r) => r.MetrologistName),
      ...seed.labAudits.map((l) => l.AssignedAuditor),
      ...seed.enrollments.map((e) => e.Person),
    ];
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name).toMatch(/^(Auditor|Metrologist|Technician) /);
    }
  });

  it('assigns every lab audit to somebody on the roster', () => {
    const roster = new Set(seed.auditors.map((a) => a.AuditorName));
    for (const lab of seed.labAudits) {
      expect(roster.has(lab.AssignedAuditor)).toBe(true);
    }
  });

  it('gives every rotation leg an artifact that exists', () => {
    const ids = new Set(seed.artifacts.map((a) => a.Id));
    for (const leg of seed.rotation) expect(ids.has(leg.ArtifactId)).toBe(true);
    for (const row of seed.ptResults) expect(ids.has(row.ArtifactId)).toBe(true);
  });

  it('leaves no artifact in two places at once', () => {
    // "At-Lab" and "In-Transit" are both exclusive custody states, so an
    // artifact having two of them between them is a scheduling bug, and the
    // tracker would show the same model at two sites simultaneously.
    const holders = new Map();
    for (const leg of seed.rotation) {
      if (leg.Status !== 'At-Lab' && leg.Status !== 'In-Transit') continue;
      holders.set(leg.ArtifactId, (holders.get(leg.ArtifactId) || 0) + 1);
    }
    for (const [artifactId, count] of holders) {
      expect({ artifactId, count }).toEqual({ artifactId, count: 1 });
    }
  });

  it('orders every artifact’s legs so arrival follows the one before', () => {
    const byArtifact = new Map();
    for (const leg of seed.rotation) {
      if (!byArtifact.has(leg.ArtifactId)) byArtifact.set(leg.ArtifactId, []);
      byArtifact.get(leg.ArtifactId).push(leg);
    }
    for (const [artifactId, legs] of byArtifact) {
      const sorted = [...legs].sort((a, b) => a.Leg - b.Leg);
      for (let i = 1; i < sorted.length; i += 1) {
        expect({
          artifactId,
          leg: sorted[i].Leg,
          startsAfterPreviousEnds: sorted[i].ArrivalDate > sorted[i - 1].DepartureDate,
        }).toEqual({ artifactId, leg: sorted[i].Leg, startsAfterPreviousEnds: true });
      }
    }
  });

  it('has enough cross-site history for at least one control chart', () => {
    // The SPC view needs three or more sites on one artifact before it plots
    // anything, so a seed that cannot fill a chart would demo an empty tab.
    const bySite = new Map();
    for (const row of seed.ptResults) {
      if (!bySite.has(row.ArtifactId)) bySite.set(row.ArtifactId, new Set());
      bySite.get(row.ArtifactId).add(row.LabCode);
    }
    const plottable = [...bySite.values()].filter((sites) => sites.size >= 3);
    expect(plottable.length).toBeGreaterThanOrEqual(2);
  });

  it('populates every list the three modules read', () => {
    for (const key of ['artifacts', 'rotation', 'ptResults', 'auditors', 'labAudits', 'trainingDocs']) {
      expect({ key, empty: (seed[key] || []).length === 0 }).toEqual({ key, empty: false });
    }
  });
});

describe('the list schema', () => {
  it('has a container for every seeded collection, and nothing spare', () => {
    // A container the app never reads provisions an empty list on the live
    // site; a collection with no container has nowhere to be saved.
    const schemaKeys = new Set(CONTAINERS.map((c) => c.key));
    const seedKeys = new Set(Object.keys(seed));
    expect([...schemaKeys].sort()).toEqual([...seedKeys].sort());
  });

  it('names each container against a module that exists', () => {
    // Against the full table, hidden included: a parked module's list still
    // has to be provisionable, or un-parking it would need a schema change.
    const routes = new Set(allModules.map((m) => m.id));
    for (const container of CONTAINERS) {
      expect({ key: container.key, known: routes.has(container.module) })
        .toEqual({ key: container.key, known: true });
    }
  });

  it('builds list titles from the prefix, rejecting anything unknown', () => {
    expect(listTitle('METCAL', 'labAudits')).toBe('METCALLabAudits');
    expect(listTitle('', 'rotation')).toBe('METCALRotation');
    expect(() => listTitle('METCAL', 'nope')).toThrow(/Unknown container/);
  });
});

describe('round reporting', () => {
  const artifact = { RequiredAccuracy: 0.4, ReferenceValue: 10000.31, Unit: 'Ω' };
  const opening = { Id: 1, MeasurementRole: 'Opening', LabCode: 'PRL', StartDate: '2026-02-16', runs: [10000.30, 10000.32] };
  const p1 = { Id: 2, MeasurementRole: 'Participant', LabCode: 'JFB', StartDate: '2026-03-09', runs: [9999.65, 9999.65] };
  const p2 = { Id: 3, MeasurementRole: 'Participant', LabCode: 'SDP', StartDate: '2026-08-07', runs: [10000.30, 10000.30] };
  const closing = { Id: 4, MeasurementRole: 'Closing', LabCode: 'PRL', StartDate: '2026-08-20', runs: [10000.318, 10000.318] };

  it('is interim while labs are still outstanding', () => {
    const r = ptRound({ artifact, results: [opening, p1], expectedParticipants: 2 });
    expect(r.phase).toBe('Interim');
    expect(r.remaining).toBe(1);
  });

  it('is final only once the closing measurement is in AND every lab reported', () => {
    expect(ptRound({ artifact, results: [opening, p1, p2], expectedParticipants: 2 }).phase).toBe('Interim');
    expect(ptRound({ artifact, results: [opening, p1, closing], expectedParticipants: 2 }).phase).toBe('Interim');
    expect(ptRound({ artifact, results: [opening, p1, p2, closing], expectedParticipants: 2 }).phase).toBe('Final');
  });

  it('scores participants against the opening measurement, not the stored value', () => {
    // The stored ReferenceValue is 10000.31; this opening reads 10000.50, and
    // a lab landing on 10000.50 must score zero rather than being penalised
    // against a number taken at some other time.
    const drifted = { ...opening, runs: [10000.50, 10000.50] };
    const lab = { Id: 9, MeasurementRole: 'Participant', LabCode: 'SDB', StartDate: '2026-04-01', runs: [10000.50, 10000.50] };
    const r = ptRound({ artifact, results: [drifted, lab], expectedParticipants: 1 });
    expect(r.referenceValue).toBeCloseTo(10000.50, 9);
    expect(r.referenceFrom).toBe('opening measurement');
    expect(r.participants[0].z).toBeCloseTo(0, 9);
  });

  it('falls back to the artifact record when the round has not opened', () => {
    const r = ptRound({ artifact, results: [], expectedParticipants: 3 });
    expect(r.phase).toBe('Not started');
    expect(r.referenceValue).toBe(10000.31);
    expect(r.referenceFrom).toBe('artifact record');
  });

  it('reports drift rather than correcting for it', () => {
    const r = ptRound({ artifact, results: [opening, p1, p2, closing], expectedParticipants: 2 });
    expect(r.drift).toBeCloseTo(0.008, 6);
    expect(r.driftExceeded).toBe(false);
    // The participant verdicts are untouched by the drift figure.
    expect(r.participants.map((x) => x.status)).toEqual(['FAIL', 'PASS']);
  });

  it('flags a round whose artifact moved more than sigma_pt', () => {
    const far = { ...closing, runs: [10000.55, 10000.55] };
    const r = ptRound({ artifact, results: [opening, p1, p2, far], expectedParticipants: 2 });
    expect(r.driftExceeded).toBe(true);
  });

  it('separates failures from the ones merely worth watching', () => {
    const watch = { Id: 8, MeasurementRole: 'Participant', LabCode: 'CPB', StartDate: '2026-05-11', runs: [10000.78, 10000.78] };
    const r = ptRound({ artifact, results: [opening, p1, watch], expectedParticipants: 3 });
    expect(r.failures.map((f) => f.LabCode)).toEqual(['JFB']);
    expect(r.watch.map((f) => f.LabCode)).toEqual(['CPB']);
  });

  it('orders participants by when they measured, not by how they were entered', () => {
    const r = ptRound({ artifact, results: [opening, p2, p1], expectedParticipants: 2 });
    expect(r.participants.map((p) => p.LabCode)).toEqual(['JFB', 'SDP']);
  });
});

describe('the seeded round data', () => {
  const roundFor = (artifactId) => {
    const artifact = seed.artifacts.find((a) => a.Id === artifactId);
    const results = seed.ptResults.filter((r) => r.ArtifactId === artifactId);
    const expected = new Set(
      seed.rotation.filter((l) => l.ArtifactId === artifactId && l.Site !== REFERENCE_LAB).map((l) => l.Site),
    ).size;
    return ptRound({ artifact, results, expectedParticipants: expected });
  };

  it('has at least one final report and one interim, so both can be demonstrated', () => {
    const phases = seed.artifacts.map((a) => roundFor(a.Id).phase);
    expect(phases).toContain('Final');
    expect(phases).toContain('Interim');
  });

  it('opens every round before any participant measures', () => {
    for (const artifact of seed.artifacts) {
      const results = seed.ptResults.filter((r) => r.ArtifactId === artifact.Id);
      const opening = results.find((r) => r.MeasurementRole === 'Opening');
      if (!opening) continue;
      for (const p of results.filter((r) => r.MeasurementRole === 'Participant')) {
        expect({ artifact: artifact.Model, lab: p.LabCode, after: p.StartDate > opening.StartDate })
          .toEqual({ artifact: artifact.Model, lab: p.LabCode, after: true });
      }
    }
  });

  it('only lets the reference lab take opening and closing measurements', () => {
    for (const row of seed.ptResults) {
      if (row.MeasurementRole === 'Participant') continue;
      expect({ role: row.MeasurementRole, lab: row.LabCode })
        .toEqual({ role: row.MeasurementRole, lab: REFERENCE_LAB });
    }
  });

  it('gives every result a role, since the reports read it', () => {
    for (const row of seed.ptResults) {
      expect(['Opening', 'Participant', 'Closing']).toContain(row.MeasurementRole);
    }
  });

  it('produces a failure somewhere, so corrective action has something to show', () => {
    const failures = seed.artifacts.flatMap((a) => roundFor(a.Id).failures);
    expect(failures.length).toBeGreaterThan(0);
  });
});

describe('the expanded seed', () => {
  it('references only known sites', () => {
    const known = new Set(SITES);
    for (const row of [...seed.capabilityLoss, ...seed.pmSchedule, ...seed.scopes, ...seed.enrollments]) {
      expect({ site: row.Site, known: known.has(row.Site) }).toEqual({ site: row.Site, known: true });
    }
  });

  it('enrolls people only on courses that exist', () => {
    const codes = new Set(seed.courses.map((c) => c.CourseCode));
    for (const e of seed.enrollments) {
      expect({ course: e.CourseCode, known: codes.has(e.CourseCode) }).toEqual({ course: e.CourseCode, known: true });
    }
  });

  it('sends every course to a schoolhouse that exists', () => {
    const houses = new Set(seed.schoolhouses.map((h) => h.Name));
    for (const c of seed.courses) {
      expect({ course: c.CourseCode, known: houses.has(c.Schoolhouse) }).toEqual({ course: c.CourseCode, known: true });
    }
  });

  it('never marks a seat notified before it was confirmed', () => {
    for (const e of seed.enrollments) {
      if (!e.InstructorNotified) continue;
      expect({ id: e.Id, confirmedFirst: Boolean(e.Confirmed) && e.NotifiedOn >= e.ConfirmedOn })
        .toEqual({ id: e.Id, confirmedFirst: true });
    }
  });

  it('leaves something for each dashboard to surface', () => {
    // A dashboard whose every count is zero demonstrates nothing.
    expect(seed.capabilityLoss.filter((l) => !l.RestoredDate).length).toBeGreaterThan(0);
    expect(seed.labAudits.filter((l) => l.AuditStatus === 'Overdue').length).toBeGreaterThan(0);
    expect(seed.enrollments.filter((e) => e.Confirmed && !e.InstructorNotified).length).toBeGreaterThan(0);
    expect(seed.enrollments.filter((e) => !e.Confirmed).length).toBeGreaterThan(0);
  });

  it('has an overdue PM on both a calendar and an hours basis', () => {
    const hours = seed.pmSchedule.filter((r) => r.Basis === 'Hours' && r.HoursRun >= r.HoursThreshold);
    const calendar = seed.pmSchedule.filter((r) => r.Basis === 'Calendar' && r.NextDue && r.NextDue < '2026-08-26');
    expect(hours.length).toBeGreaterThan(0);
    expect(calendar.length).toBeGreaterThan(0);
  });

  it('carries no Office SafeLinks wrapper, which would leak an address', () => {
    // The links arrived wrapped by Office 365 ATP, and those wrappers embed the
    // sender's email and tenant id in the query string. This repository is
    // public; the bare destination is what belongs here.
    const json = JSON.stringify(seed);
    expect(json).not.toMatch(/safelinks\.protection/i);
    expect(json).not.toMatch(/@us\.navy\.mil/i);
  });
});

describe('the module registry', () => {
  it('hides the parked modules from the launcher but keeps them resolvable', () => {
    const parked = ['crosscheck', 'inservice', 'providers'];
    const visible = new Set(modules.map((m) => m.id));
    const all = new Set(allModules.map((m) => m.id));
    for (const id of parked) {
      expect({ id, listed: visible.has(id), present: all.has(id) })
        .toEqual({ id, listed: false, present: true });
    }
  });

  it('gives every visible module a component and a unique route', () => {
    const routes = modules.map((m) => m.route);
    expect(new Set(routes).size).toBe(routes.length);
    for (const m of modules) expect(typeof m.Component).toBe('object');
  });

  it('puts exactly one dashboard at the head of each category', () => {
    for (const category of ['Quality', 'Training']) {
      const inCat = modules.filter((m) => m.category === category);
      expect(inCat.filter((m) => m.dashboard)).toHaveLength(1);
      expect(inCat[0].dashboard).toBe(true);
    }
  });

  it('spells it program, not programme', () => {
    // British spelling crept in across the modules once; this is cheaper than
    // noticing it again in a demo.
    const text = JSON.stringify(modules.map((m) => [m.title, m.subtitle, m.blurb]));
    expect(text).not.toMatch(/programme/i);
  });
});
