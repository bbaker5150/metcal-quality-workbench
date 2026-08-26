import { describe, it, expect } from 'vitest';
import {
  mean, sampleStdDev, sigmaPt, zScore, evaluationTier, evaluate, environmentCheck,
} from './qaEngine.js';
import seed from './seedData.js';

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
    const names = [
      ...seed.auditors.map((a) => a.AuditorName),
      ...seed.ptResults.map((r) => r.MetrologistName),
    ];
    for (const name of names) {
      expect(name).toMatch(/^(Auditor|Metrologist) /);
    }
  });
});
