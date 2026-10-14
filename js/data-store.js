/**
 * AI Benchmark Data Store & Statistical Analysis Engine
 * Candidate: Jane Rose (Janeferdinant)
 * Supports browser environment and Node.js testing.
 */

const DataStore = {
  benchmarks: null,
  contamination: null,
  pairwiseElo: null,

  async init(basePath = '') {
    try {
      const bRes = await fetch(`${basePath}data/benchmarks.json`);
      this.benchmarks = await bRes.json();

      const cRes = await fetch(`${basePath}data/contamination_audit.json`);
      this.contamination = await cRes.json();

      const eRes = await fetch(`${basePath}data/pairwise_elo.json`);
      this.pairwiseElo = await eRes.json();

      return true;
    } catch (err) {
      console.warn('DataStore fetch failed, attempting static fallback or Node context:', err.message);
      return false;
    }
  },

  /**
   * Calculate Pareto Frontier points given xKey (minimize or maximize) and yKey (maximize)
   * In AI benchmarking:
   *  - Accuracy (Score) is MAXIMIZED
   *  - Latency is MINIMIZED
   *  - Cost is MINIMIZED
   *  - Params is MINIMIZED
   */
  calculateParetoFrontier(models, xMetric, yMetric = 'score') {
    if (!models || models.length === 0) return [];

    // Filter out invalid items
    const valid = models.filter(m => typeof m[xMetric] === 'number' && typeof m[yMetric] === 'number');

    // Sorting by xMetric ascending (cheaper / faster first)
    const sorted = [...valid].sort((a, b) => a[xMetric] - b[xMetric]);

    const paretoPoints = [];
    let maxSoFar = -Infinity;

    for (const model of sorted) {
      if (model[yMetric] > maxSoFar) {
        paretoPoints.push(model);
        maxSoFar = model[yMetric];
      }
    }

    return paretoPoints;
  },

  /**
   * Statistical Sample Size and Margin of Error Simulator
   * @param {number} n - Sample size (prompts evaluated)
   * @param {number} delta - Observed accuracy delta (%)
   * @param {number} confidenceLevel - 90, 95, or 99
   * @param {number} stdDev - Estimated standard deviation
   */
  simulateSampleSize(n, delta, confidenceLevel = 95, stdDev = 0.45) {
    const zMap = { 90: 1.645, 95: 1.960, 99: 2.576 };
    const z = zMap[confidenceLevel] || 1.960;

    // For paired benchmark evaluations, standard error of the accuracy delta (%):
    // SE = (stdDev / sqrt(N)) * 100 where stdDev is in proportion (e.g. 0.25 - 0.45)
    // For paired comparisons, standard error of difference SE_diff = (stdDev * 100) / sqrt(n)
    // When stdDev is ~0.35 (paired item variance), at N=1000, SE ≈ 1.1%
    const effectiveSd = Math.min(0.40, Math.max(0.15, stdDev * 0.7)); // paired variance reduction
    const se = (effectiveSd / Math.sqrt(n)) * 100;
    const moe = z * se; // Margin of error in percentage points

    // Z-test statistic = delta / SE
    const zStat = delta / se;

    // Approximate 2-tailed p-value from Z-score using error function approximation
    const pValue = this.approximatePValue(zStat);

    // Statistical power (approximate for two-sided alpha=0.05)
    const power = this.approximatePower(delta, se, z);

    // Minimum N required to detect this delta with alpha=0.05 and power=80%
    const minN = Math.ceil(Math.pow((1.96 + 0.84) * (effectiveSd * 100) / delta, 2));

    const alpha = (100 - confidenceLevel) / 100;
    const isSignificant = pValue < alpha;

    return {
      n,
      delta,
      confidenceLevel,
      se: parseFloat(se.toFixed(3)),
      moe: parseFloat(moe.toFixed(2)),
      zStat: parseFloat(zStat.toFixed(2)),
      pValue: parseFloat(pValue.toFixed(5)),
      power: parseFloat((power * 100).toFixed(1)),
      minN: minN > 0 ? minN : 100,
      isSignificant
    };
  },

  approximatePValue(z) {
    const absZ = Math.abs(z);
    // Standard normal tail area approximation
    const t = 1 / (1 + 0.2316419 * absZ);
    const d = 0.3989423 * Math.exp(-0.5 * absZ * absZ);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return Math.max(0.00001, prob * 2);
  },

  approximatePower(delta, se, zCrit) {
    const zEffect = delta / se;
    const zScore = zEffect - zCrit;
    // Cumulative normal distribution CDF approx
    return 1 / (1 + Math.exp(-1.7 * zScore));
  },

  /**
   * Generate normal distribution curve points for visualization
   */
  generateDistributionPoints(mean = 0, se = 1, numPoints = 50) {
    const points = [];
    const min = mean - 4 * se;
    const max = mean + 4 * se;
    const step = (max - min) / numPoints;

    for (let x = min; x <= max; x += step) {
      const y = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / se, 2));
      points.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(4)) });
    }
    return points;
  }
};

// Export for Node.js test environment if applicable
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataStore;
}
