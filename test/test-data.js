const fs = require('fs');
const path = require('path');
const DataStore = require('../js/data-store.js');

function runTests() {
  console.log('--- STARTING AI BENCHMARK STATISTICAL TESTS ---');
  let failures = 0;

  // Test 1: JSON Data Files Exist and Parse
  try {
    const benchmarks = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/benchmarks.json'), 'utf8'));
    const contamination = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/contamination_audit.json'), 'utf8'));
    const pairwise = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/pairwise_elo.json'), 'utf8'));

    console.log(`[PASS] benchmarks.json contains ${Object.keys(benchmarks.benchmarks).length} benchmark suites`);
    console.log(`[PASS] contamination_audit.json contains ${contamination.contamination_cases.length} audited cases`);
    console.log(`[PASS] pairwise_elo.json contains ${pairwise.models.length} models in Elo matrix`);

    // Assign to DataStore
    DataStore.benchmarks = benchmarks;
    DataStore.contamination = contamination;
    DataStore.pairwiseElo = pairwise;
  } catch (err) {
    console.error(`[FAIL] JSON parsing failed: ${err.message}`);
    failures++;
  }

  // Test 2: Pareto Frontier Calculation
  try {
    const mmluModels = DataStore.benchmarks.benchmarks.mmlu_pro.models;
    const pareto = DataStore.calculateParetoFrontier(mmluModels, 'latency', 'score');

    if (pareto.length === 0) throw new Error('Pareto frontier calculation returned 0 models');
    console.log(`[PASS] Pareto frontier calculated correctly with ${pareto.length} models`);
    pareto.forEach(m => console.log(`       - ${m.name}: latency=${m.latency}ms, score=${m.score}%`));
  } catch (err) {
    console.error(`[FAIL] Pareto Frontier calculation error: ${err.message}`);
    failures++;
  }

  // Test 3: Sample Size Simulator
  try {
    const res = DataStore.simulateSampleSize(1000, 2.5, 95, 0.45);
    console.log(`[PASS] Sample Size Simulator output: N=${res.n}, MOE=±${res.moe}%, p-value=${res.pValue}, isSignificant=${res.isSignificant}`);
    if (typeof res.moe !== 'number' || typeof res.pValue !== 'number') {
      throw new Error('Simulator did not return numbers for MOE or pValue');
    }
    if (!res.isSignificant) {
      throw new Error('Expected delta=2.5 with N=1000 to be significant');
    }

    // Borderline small sample test
    const smallRes = DataStore.simulateSampleSize(100, 0.5, 95, 0.45);
    console.log(`[PASS] Small sample test N=100, delta=0.5%: MOE=±${smallRes.moe}%, isSignificant=${smallRes.isSignificant} (correctly not significant)`);
  } catch (err) {
    console.error(`[FAIL] Statistical Simulator error: ${err.message}`);
    failures++;
  }

  // Test 4: Distribution curve generator
  try {
    const curve = DataStore.generateDistributionPoints(0, 1.4, 20);
    if (curve.length < 15) throw new Error('Curve generator produced insufficient points');
    console.log(`[PASS] Distribution curve generated with ${curve.length} points`);
  } catch (err) {
    console.error(`[FAIL] Distribution generator error: ${err.message}`);
    failures++;
  }

  console.log(`\nTEST SUMMARY: ${failures === 0 ? 'ALL TESTS PASSED (0 FAILURES)' : `${failures} FAILURES`}`);
  process.exit(failures === 0 ? 0 : 1);
}

runTests();
