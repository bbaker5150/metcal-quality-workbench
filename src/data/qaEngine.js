// ---------------------------------------------------------------------------
// The QA evaluation engine.
// ---------------------------------------------------------------------------
// This is the part of the program that decides whether a lab passed, so it is
// deliberately pure: numbers in, verdict out, no I/O and no framework. Every
// screen that shows a verdict calls this, so there is exactly one definition
// of PASS in the app.

/** Sample standard deviation (n-1). Returns null for fewer than two runs. */
export function sampleStdDev(runs) {
  const values = runs.filter((r) => Number.isFinite(r));
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const ss = values.reduce((acc, v) => acc + (v - mean) ** 2, 0);
  return Math.sqrt(ss / (values.length - 1));
}

export function mean(runs) {
  const values = runs.filter((r) => Number.isFinite(r));
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * The proficiency standard deviation is half the required accuracy — the
 * accuracy spec is a two-sided tolerance, sigma_pt is its half-width.
 */
export const sigmaPt = (requiredAccuracy) =>
  Number.isFinite(requiredAccuracy) && requiredAccuracy > 0 ? requiredAccuracy / 2 : null;

/** z = |x̄ − X_ref| / sigma_pt */
export function zScore({ average, referenceValue, requiredAccuracy }) {
  const sigma = sigmaPt(requiredAccuracy);
  if (!Number.isFinite(average) || !Number.isFinite(referenceValue) || !sigma) return null;
  return Math.abs(average - referenceValue) / sigma;
}

/** |z| <= 2 PASS · 2 < |z| < 3 EVALUATE · |z| >= 3 FAIL */
export function evaluationTier(z) {
  if (!Number.isFinite(z)) return null;
  if (z <= 2) return 'PASS';
  if (z < 3) return 'EVALUATE';
  return 'FAIL';
}

/**
 * Full evaluation of one PT result.
 *
 * `repeatabilityWarning` is raised when the lab's own scatter exceeds the
 * proficiency sigma. A lab can land dead on the reference value by luck while
 * being unable to repeat itself, and a z-score alone will not say so.
 */
export function evaluate({ runs = [], referenceValue, requiredAccuracy }) {
  const average = mean(runs);
  const stdDev = sampleStdDev(runs);
  const z = zScore({ average, referenceValue, requiredAccuracy });
  const sigma = sigmaPt(requiredAccuracy);
  return {
    average,
    stdDev,
    z,
    sigmaPt: sigma,
    status: evaluationTier(z),
    repeatabilityWarning: Number.isFinite(stdDev) && !!sigma && stdDev > sigma,
    runCount: runs.filter((r) => Number.isFinite(r)).length,
  };
}

/** NA 17-35FR-06 ambient limits for a PT run. */
export const ENVIRONMENT_LIMITS = { tempF: [67, 79], humidityRH: [0, 70] };

export function environmentCheck({ tempF, humidityRH }) {
  const [tMin, tMax] = ENVIRONMENT_LIMITS.tempF;
  const problems = [];
  if (!Number.isFinite(tempF)) problems.push('Lab temperature not recorded.');
  else if (tempF < tMin || tempF > tMax) {
    problems.push(`Lab temperature ${tempF.toFixed(1)} °F is outside ${tMin}–${tMax} °F.`);
  }
  if (Number.isFinite(humidityRH) && humidityRH > ENVIRONMENT_LIMITS.humidityRH[1]) {
    problems.push(`Humidity ${humidityRH.toFixed(0)} %RH exceeds ${ENVIRONMENT_LIMITS.humidityRH[1]} %RH.`);
  }
  return { ok: problems.length === 0, problems };
}
