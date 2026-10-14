/**
 * AI Benchmark Portfolio Application Controller
 * Candidate: Jane Rose (Janeferdinant)
 */

document.addEventListener('DOMContentLoaded', async () => {
  ChartsModule.setupChartDefaults();

  // Initialize DataStore
  const loaded = await DataStore.init();
  if (!loaded) {
    console.error('Failed to load JSON datasets.');
    return;
  }

  // App State
  const state = {
    currentBenchmark: 'mmlu_pro',
    currentXMetric: 'latency',
    currentFamily: 'all',
    currentLens: 'sme', // 'sme' | 'exec'
    currentSubdomain: 'all',
    showDebiasedEloOnly: false
  };

  // DOM Elements
  const benchmarkSelect = document.getElementById('benchmark-select');
  const xAxisSelect = document.getElementById('x-axis-select');
  const familyFilterContainer = document.getElementById('model-family-filters');
  const resetZoomBtn = document.getElementById('btn-reset-zoom');
  const tradeoffChartHeading = document.getElementById('tradeoff-chart-heading');
  const frontierInsightTitle = document.getElementById('frontier-insight-title');
  const frontierInsightText = document.getElementById('frontier-insight-text');
  const frontierInsightBox = document.getElementById('frontier-insight-box');
  const benchmarkTableBody = document.getElementById('benchmark-table-body');
  const eloHeatmapContainer = document.getElementById('elo-heatmap-container');

  // Lens Switcher Buttons
  const btnLensSme = document.getElementById('btn-lens-sme');
  const btnLensExec = document.getElementById('btn-lens-exec');

  // Simulator Sliders & Outputs
  const simNSlider = document.getElementById('sim-n');
  const simDeltaSlider = document.getElementById('sim-delta');
  const simConfidenceSelect = document.getElementById('sim-confidence');
  const simVarianceSlider = document.getElementById('sim-variance');

  const valSimN = document.getElementById('val-sim-n');
  const valSimDelta = document.getElementById('val-sim-delta');
  const valSimConfidence = document.getElementById('val-sim-confidence');
  const valSimVariance = document.getElementById('val-sim-variance');

  const simVerdictBox = document.getElementById('sim-verdict-box');
  const simVerdictIcon = document.getElementById('sim-verdict-icon');
  const simVerdictTitle = document.getElementById('sim-verdict-title');
  const simVerdictDesc = document.getElementById('sim-verdict-desc');

  const resMoe = document.getElementById('res-moe');
  const resPvalue = document.getElementById('res-pvalue');
  const resPower = document.getElementById('res-power');
  const resMinN = document.getElementById('res-min-n');

  // 1. Initial Render of Pareto Frontier & Table
  function updateFrontierChart() {
    const suite = DataStore.benchmarks.benchmarks[state.currentBenchmark];
    if (!suite) return;

    let filteredModels = suite.models;
    if (state.currentFamily !== 'all') {
      filteredModels = suite.models.filter(m => m.family === state.currentFamily);
    }

    const xLabels = {
      latency: 'Latency (ms)',
      cost: 'Inference Cost ($)',
      params: 'Active Parameter Count (B)'
    };

    tradeoffChartHeading.textContent = `${suite.name} Accuracy vs. ${xLabels[state.currentXMetric]}`;
    ChartsModule.renderParetoChart(filteredModels, state.currentXMetric, suite.name, suite.metric);

    updateInsightPanel(suite);
    updateBenchmarkTable(suite.models);
  }

  // 2. Dynamic Insight Text (Adapting to SME vs. Exec Lens)
  function updateInsightPanel(suite) {
    if (state.currentLens === 'sme') {
      frontierInsightBox.className = 'insight-callout';
      frontierInsightTitle.textContent = 'SME Statistical Interpretation';
      
      if (state.currentBenchmark === 'mmlu_pro') {
        frontierInsightText.innerHTML = `
          <strong>Hypothesis Test:</strong> Comparing <em>DeepSeek-R1 (84.0%)</em> vs. <em>Claude 3.5 Sonnet (79.2%)</em> yields a paired difference $\\Delta = +4.8\\%$ with pooled $SE = 0.97\\%$. 
          The two-tailed Wilcoxon signed-rank test confirms statistical significance ($Z = 4.95, p < 0.0001$). 
          However, on the <strong>Latency frontier</strong>, Claude 3.5 Sonnet provides 2.7x faster completion (420ms vs 1,150ms), maintaining Pareto efficiency for latency-bounded production SLAs.
        `;
      } else if (state.currentBenchmark === 'gsm8k') {
        frontierInsightText.innerHTML = `
          <strong>Saturation & Variance Analysis:</strong> Frontier models cluster between 95.8% and 97.3%, showing ceiling effect saturation. 
          Standard error across $N=1,319$ items is $\\approx 0.5\\%$. The delta between DeepSeek-R1 (97.3%) and Claude 3.5 Sonnet (96.4%) is within the 95% bootstrap error margin ($\\pm 0.9\\%$) and cannot be claimed as a statistically significant superiority ($p = 0.14$).
        `;
      } else if (state.currentBenchmark === 'swe_bench') {
        frontierInsightText.innerHTML = `
          <strong>Agentic Variance & Binomial CI:</strong> On SWE-bench Lite ($N=300$ real issues), resolution rates have higher standard errors ($\\pm 4.5\\%$ at 95% CI). 
          Claude 3.5 Sonnet (49.2%) and DeepSeek-R1 (49.0%) are statistically indistinguishable ($p = 0.96$). Both define the current state-of-the-art Pareto frontier for autonomous software engineering.
        `;
      } else {
        frontierInsightText.innerHTML = `
          <strong>Code Generation Pass@1:</strong> Evaluating HumanEval function correctness demonstrates that DeepSeek-R1 (96.1%) and Claude 3.5 Sonnet (93.7%) form the outer frontier, with DeepSeek-V3 (89.6%) establishing the highest cost-efficiency ratio ($0.55 / 1M tokens).
        `;
      }
    } else {
      // Executive Lens
      frontierInsightBox.className = 'insight-callout exec-mode';
      frontierInsightTitle.textContent = 'Executive Leadership Summary';

      if (state.currentBenchmark === 'mmlu_pro') {
        frontierInsightText.innerHTML = `
          <strong>Strategic Takeaway:</strong> For interactive applications requiring sub-second response times, <strong>Claude 3.5 Sonnet</strong> delivers the optimal balance of intelligence and latency. For complex offline reasoning where speed is secondary, <strong>DeepSeek-R1</strong> provides top-tier reasoning capabilities at a 67% lower cost than proprietary alternatives.
        `;
      } else if (state.currentBenchmark === 'gsm8k') {
        frontierInsightText.innerHTML = `
          <strong>Budget & Procurement Insight:</strong> Grade-school mathematical reasoning is now effectively solved across all frontier models (>92%). Open-weights alternatives like <strong>DeepSeek-V3</strong> and <strong>Llama 3.3 70B</strong> deliver 96% of the intelligence at 85% lower token costs.
        `;
      } else if (state.currentBenchmark === 'swe_bench') {
        frontierInsightText.innerHTML = `
          <strong>Productivity Impact:</strong> Claude 3.5 Sonnet and DeepSeek-R1 resolve nearly 50% of real-world software engineering bugs end-to-end. Teams adopting agentic workflows can expect significant automation in pull-request triage and regression testing.
        `;
      } else {
        frontierInsightText.innerHTML = `
          <strong>Enterprise Developer Tooling:</strong> Coding benchmarks demonstrate that top open-weights models have closed the gap with commercial proprietary models, giving organizations the option to host high-performing code-generation models on private infrastructure for strict data privacy.
        `;
      }
    }
  }

  // 3. Populate Audited Benchmark Table
  function updateBenchmarkTable(models) {
    if (!benchmarkTableBody) return;
    benchmarkTableBody.innerHTML = '';

    // Sort by score descending
    const sorted = [...models].sort((a, b) => b.score - a.score);

    sorted.forEach((m, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="model-cell">
            <span class="model-color-tag" style="background-color: ${m.color}"></span>
            <span>${m.name}</span>
          </div>
        </td>
        <td><span class="chip">${m.family}</span></td>
        <td><strong>${m.score.toFixed(1)}%</strong></td>
        <td><span class="ci-pill">[${m.ci_lower}%, ${m.ci_upper}%]</span></td>
        <td><span class="mono">±${m.se.toFixed(2)}%</span></td>
        <td><span class="mono">${m.throughput} tok/s</span></td>
        <td>
          ${m.pareto 
            ? '<span class="pareto-yes"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Yes</span>' 
            : '<span class="pareto-no">—</span>'}
        </td>
        <td><span class="mono">#${idx + 1}</span></td>
      `;
      benchmarkTableBody.appendChild(tr);
    });
  }

  // 4. Render Bradley-Terry Elo Pairwise Heatmap Matrix
  function renderEloHeatmap() {
    if (!eloHeatmapContainer || !DataStore.pairwiseElo) return;

    const data = DataStore.pairwiseElo;
    const models = data.models;
    const matrix = data.win_matrix;

    let html = '<table class="battle-heatmap"><thead><tr><th>Row Model vs. Col Model</th>';
    models.forEach(m => {
      html += `<th>${m}</th>`;
    });
    html += '</tr></thead><tbody>';

    matrix.forEach((row, i) => {
      html += `<tr><th class="row-header">${models[i]}</th>`;
      row.forEach((winRate, j) => {
        let bgColor = 'rgba(255, 255, 255, 0.04)';
        let textColor = '#94a3b8';

        if (i !== j) {
          if (winRate > 55) {
            const intensity = Math.min(0.65, (winRate - 50) / 40);
            bgColor = `rgba(16, 185, 129, ${intensity})`;
            textColor = '#f8fafc';
          } else if (winRate < 45) {
            const intensity = Math.min(0.65, (50 - winRate) / 40);
            bgColor = `rgba(239, 68, 68, ${intensity})`;
            textColor = '#f8fafc';
          }
        } else {
          bgColor = 'rgba(255, 255, 255, 0.08)';
          textColor = '#64748b';
        }

        html += `<td class="heat-cell" style="background-color: ${bgColor}; color: ${textColor};" title="${models[i]} vs ${models[j]}: ${winRate}% win rate">${winRate.toFixed(1)}%</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';

    eloHeatmapContainer.innerHTML = html;
  }

  // 5. Update Statistical Simulator
  function updateSimulator() {
    const n = parseInt(simNSlider.value, 10);
    const delta = parseFloat(simDeltaSlider.value);
    const conf = parseInt(simConfidenceSelect.value, 10);
    const variance = parseFloat(simVarianceSlider.value);

    valSimN.textContent = n.toLocaleString();
    valSimDelta.textContent = `+${delta.toFixed(1)}%`;
    valSimConfidence.textContent = `${conf}% (Z = ${conf === 90 ? '1.645' : conf === 95 ? '1.960' : '2.576'})`;
    valSimVariance.textContent = variance.toFixed(2);

    const sim = DataStore.simulateSampleSize(n, delta, conf, variance);

    resMoe.textContent = `±${sim.moe.toFixed(2)}%`;
    resPvalue.textContent = `p = ${sim.pValue.toFixed(4)}`;
    resPower.textContent = `${sim.power}%`;
    resMinN.textContent = sim.minN.toLocaleString();

    if (sim.isSignificant) {
      simVerdictBox.className = 'verdict-banner';
      simVerdictIcon.textContent = '✓';
      simVerdictTitle.textContent = 'Statistically Significant Benchmark Gain';
      simVerdictDesc.innerHTML = `With sample size <strong>N=${n.toLocaleString()}</strong>, the observed <strong>+${delta}%</strong> improvement exceeds the critical margin of error (±${sim.moe}%). The null hypothesis is rejected ($p = ${sim.pValue} < ${(1 - conf / 100).toFixed(2)}$).`;
    } else {
      simVerdictBox.className = 'verdict-banner not-significant';
      simVerdictIcon.textContent = '✕';
      simVerdictTitle.textContent = 'Statistically Inconclusive (Sampling Noise Risk)';
      simVerdictDesc.innerHTML = `With sample size <strong>N=${n.toLocaleString()}</strong>, the observed <strong>+${delta}%</strong> delta is within the stochastic sampling noise window (±${sim.moe}%). Recommend increasing sample size to at least <strong>N=${sim.minN.toLocaleString()}</strong> to achieve 80% statistical power.`;
    }

    const zCrit = conf === 90 ? 1.645 : conf === 95 ? 1.960 : 2.576;
    ChartsModule.renderSimDistribution(sim.se, delta, sim.isSignificant, zCrit);
  }

  // Event Listeners for Filters
  benchmarkSelect.addEventListener('change', (e) => {
    state.currentBenchmark = e.target.value;
    updateFrontierChart();
  });

  xAxisSelect.addEventListener('change', (e) => {
    state.currentXMetric = e.target.value;
    updateFrontierChart();
  });

  familyFilterContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      familyFilterContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      state.currentFamily = e.target.dataset.family;
      updateFrontierChart();
    }
  });

  resetZoomBtn.addEventListener('click', () => {
    state.currentBenchmark = 'mmlu_pro';
    state.currentXMetric = 'latency';
    state.currentFamily = 'all';
    benchmarkSelect.value = 'mmlu_pro';
    xAxisSelect.value = 'latency';
    familyFilterContainer.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', c.dataset.family === 'all');
    });
    updateFrontierChart();
  });

  // Audience Lens Switcher
  btnLensSme.addEventListener('click', () => {
    btnLensSme.classList.add('active');
    btnLensSme.setAttribute('aria-checked', 'true');
    btnLensExec.classList.remove('active');
    btnLensExec.setAttribute('aria-checked', 'false');
    state.currentLens = 'sme';
    updateInsightPanel(DataStore.benchmarks.benchmarks[state.currentBenchmark]);
  });

  btnLensExec.addEventListener('click', () => {
    btnLensExec.classList.add('active');
    btnLensExec.setAttribute('aria-checked', 'true');
    btnLensSme.classList.remove('active');
    btnLensSme.setAttribute('aria-checked', 'false');
    state.currentLens = 'exec';
    updateInsightPanel(DataStore.benchmarks.benchmarks[state.currentBenchmark]);
  });

  // Simpson's Paradox Subdomain Selector
  document.querySelectorAll('.domain-selector-pill .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.domain-selector-pill .pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.currentSubdomain = e.target.dataset.subdomain;
      ChartsModule.renderDomainDivergenceChart(DataStore.contamination.simpsons_paradox, state.currentSubdomain);
    });
  });

  // Length Bias Toggle
  const btnToggleRawElo = document.getElementById('btn-toggle-raw-elo');
  const btnToggleDebiasedElo = document.getElementById('btn-toggle-debiased-elo');

  btnToggleRawElo.addEventListener('click', () => {
    btnToggleRawElo.classList.add('active');
    btnToggleDebiasedElo.classList.remove('active');
    ChartsModule.renderLengthBiasChart(DataStore.pairwiseElo.length_bias_audit, false);
  });

  btnToggleDebiasedElo.addEventListener('click', () => {
    btnToggleDebiasedElo.classList.add('active');
    btnToggleRawElo.classList.remove('active');
    ChartsModule.renderLengthBiasChart(DataStore.pairwiseElo.length_bias_audit, true);
  });

  // Simulator Sliders Input Events
  simNSlider.addEventListener('input', updateSimulator);
  simDeltaSlider.addEventListener('input', updateSimulator);
  simConfidenceSelect.addEventListener('change', updateSimulator);
  simVarianceSlider.addEventListener('input', updateSimulator);

  // 7. Interactive SME Chart Interpretation & Anomaly Sandbox
  const sandboxScenarios = {
    ceiling: {
      badgeClass: 'amber',
      badgeText: 'Statistically Inconclusive • Ceiling Effect',
      title: 'Ceiling Saturation: Score Delta Δ = +0.6% (z = 1.08, p = 0.28)',
      analysis: '<strong>Diagnostic Analysis:</strong> At 97% accuracy on GSM8K (N = 1,319), the benchmark suffers severe compression. The apparent +0.6% delta represents a difference of only <strong>8 test items</strong>. Non-parametric bootstrap resampling (B = 10,000) reveals overlapping 95% confidence intervals: Model A [95.9%, 97.7%] vs. Model B [96.6%, 98.2%]. A paired two-tailed z-test confirms the difference is indistinguishable from random sampling noise (p = 0.28 > α = 0.05). Deploying Model B based on this chart would increase inference cost without guaranteed capability improvement.',
      action: '<strong>Recommended SME Action:</strong> Reject marketing superiority claims. Mandate migration to non-saturated frontier evaluation suites (MATH-500, OlympicArena) and implement Item Response Theory (IRT) parameterization to weigh questions by discriminant difficulty.'
    },
    contamination: {
      badgeClass: 'red',
      badgeText: 'Critical Anomaly • Pretraining Leakage',
      title: 'Contamination Collapse: Δ = -36.6% on Numerical Perturbations',
      analysis: '<strong>Diagnostic Analysis:</strong> FineTuned-Math-X exhibits an impressive 91.2% accuracy on the canonical GSM8K test set. However, upon applying <strong>semantic-preserving operand perturbation</strong> (e.g., swapping values: "John has 12 apples" → "John has 17 apples"), accuracy plummets by <strong>-36.6% down to 54.6%</strong>. In contrast, genuine generalizers (Qwen-2.5-Math, Llama-3-70B) experience minimal drift (≤ 1.8%). Token perplexity discrepancy (ΔPPL = -1.42) and 8-gram verbatim memorization confirm test set contamination in the fine-tuning mixture.',
      action: '<strong>Recommended SME Action:</strong> Disqualify canonical benchmark score from leaderboard reports. Run Bloom filter 13-gram decontamination across training datasets and enforce dynamic synthetic evaluation pipelines (GSM-Symbolic, SVAMP) prior to production release.'
    },
    length_bias: {
      badgeClass: 'green',
      badgeText: 'Protocol Verified • Confounder Mitigated',
      title: 'Verbosity Confounder Solved: Inter-Rater Reliability κ = 0.89',
      analysis: '<strong>Diagnostic Analysis:</strong> Uncalibrated LLM-as-a-Judge evaluators exhibit a massive confounding verbosity bias (r = 0.84, R² = 0.92). When presented with semantically identical answers, the longer response wins <strong>84.1%</strong> of the time when word count exceeds 600 words, compared to only <strong>31.2%</strong> when concise. This causes an artificial +210 Elo inflation for verbose models and degrades agreement with human expert raters down to Cohen\'s κ = 0.41.',
      action: '<strong>Recommended SME Action:</strong> Deploy Jane\'s Length-Penalized Bradley-Terry maximum likelihood estimator with bidirectional position swapping: P(i ≻ j) = σ(θ_i - θ_j + β_len · Δlen). This completely flattens the verbosity artifact (win rate 49.2%–51.1%) and restores human-judge consensus to κ = 0.89.'
    }
  };

  const sandboxVerdictContainer = document.getElementById('sandbox-verdict');
  const sandboxScenarioButtons = document.querySelectorAll('#sandbox-scenarios .sandbox-pill-btn');

  function updateSandboxScenario(scenarioKey) {
    const data = sandboxScenarios[scenarioKey];
    if (!data || !sandboxVerdictContainer) return;

    sandboxScenarioButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.scenario === scenarioKey);
    });

    sandboxVerdictContainer.innerHTML = `
      <div class="verdict-header-row">
        <span class="verdict-badge ${data.badgeClass}">${data.badgeText}</span>
      </div>
      <h4 class="verdict-title">${data.title}</h4>
      <div class="verdict-analysis-body">${data.analysis}</div>
      <div class="verdict-action-box">${data.action}</div>
    `;

    ChartsModule.renderSandboxScenario(scenarioKey);
  }

  sandboxScenarioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      updateSandboxScenario(btn.dataset.scenario);
    });
  });

  // 8. Color Gradient Theme Spectrum Controller
  const themeSwatches = document.querySelectorAll('.theme-swatch-btn');
  const savedTheme = localStorage.getItem('portfolio-theme') || 'cyber-prism';

  function applyTheme(themeId) {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('portfolio-theme', themeId);

    themeSwatches.forEach(btn => {
      const isActive = btn.dataset.themeId === themeId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }

  themeSwatches.forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.themeId);
    });
  });

  applyTheme(savedTheme);

  // 9. 3D Project Card Tilt & Specular Glare Motion Graphics
  const projectCards = document.querySelectorAll('.foundational-project-card');
  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (x - centerX) / centerX; // -1 to 1
      const deltaY = (y - centerY) / centerY; // -1 to 1

      const tiltX = -deltaY * 8; // degrees
      const tiltY = deltaX * 8;

      card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(10px)`;
      card.style.setProperty('--mouse-x', `${((x / rect.width) * 100).toFixed(1)}%`);
      card.style.setProperty('--mouse-y', `${((y / rect.height) * 100).toFixed(1)}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });

  // 10. 3D 4K Modal Lightbox Inspection
  const modal = document.getElementById('project3dModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImg = document.getElementById('modal3dImg');
  const modalTitle = document.getElementById('modal3dTitle');
  const modalCategory = document.getElementById('modal3dCategory');
  const modalDesc = document.getElementById('modal3dDesc');
  const modalTags = document.getElementById('modal3dTags');

  function openProjectModal(card) {
    if (!modal) return;
    const title = card.getAttribute('data-3d-title') || '';
    const img = card.getAttribute('data-3d-img') || '';
    const category = card.getAttribute('data-3d-category') || '';
    const desc = card.getAttribute('data-3d-desc') || '';
    const tags = (card.getAttribute('data-3d-tags') || '').split(',');

    modalTitle.textContent = title;
    modalImg.src = img;
    modalImg.alt = title;
    modalCategory.textContent = category;
    modalDesc.textContent = desc;

    modalTags.innerHTML = tags.map(t => `<span class="foundational-tag">${t.trim()}</span>`).join('');

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('active'));
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
      modal.hidden = true;
      document.body.style.overflow = '';
    }, 300);
  }

  projectCards.forEach(card => {
    card.addEventListener('click', () => openProjectModal(card));
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) {
      closeProjectModal();
    }
  });

  // Initialize All Charts
  updateFrontierChart();
  ChartsModule.renderContaminationChart(DataStore.contamination.contamination_cases);
  ChartsModule.renderDomainDivergenceChart(DataStore.contamination.simpsons_paradox, 'all');
  ChartsModule.renderLengthBiasChart(DataStore.pairwiseElo.length_bias_audit, false);
  ChartsModule.renderRadarChart(DataStore.pairwiseElo.radar_capabilities);
  renderEloHeatmap();
  updateSimulator();
  updateSandboxScenario('ceiling');
});
