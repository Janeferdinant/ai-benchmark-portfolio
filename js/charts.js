/**
 * AI Benchmark Interactive Visualization Suite (Chart.js 4.x)
 * Candidate: Jane Rose (Janeferdinant)
 */

const ChartsModule = {
  paretoChartInstance: null,
  contaminationChartInstance: null,
  domainChartInstance: null,
  lengthBiasChartInstance: null,
  radarChartInstance: null,
  simDistributionChartInstance: null,
  sandboxChartInstance: null,

  // Global Chart.js dark theme defaults
  setupChartDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
    Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.tooltip.backgroundColor = '#131b2e';
    Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
    Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
    Chart.defaults.plugins.tooltip.borderColor = '#1e2942';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
  },

  /**
   * Render Chart 1: Pareto Frontier & Tradeoff Analysis
   */
  renderParetoChart(models, xMetric, benchmarkName, metricLabel) {
    const canvas = document.getElementById('paretoChart');
    if (!canvas) return;

    if (this.paretoChartInstance) {
      this.paretoChartInstance.destroy();
    }

    const xLabels = {
      latency: 'Median Latency (ms / 1k output tokens)',
      cost: 'Inference Cost ($ / 1M Blended Tokens)',
      params: 'Active Parameter Count (Billions)'
    };

    // Calculate Pareto frontier points
    const paretoPoints = DataStore.calculateParetoFrontier(models, xMetric, 'score');
    const paretoLineData = paretoPoints.map(p => ({ x: p[xMetric], y: p.score }));

    // Scatter points for all models
    const scatterData = models.map(m => ({
      x: m[xMetric],
      y: m.score,
      modelData: m
    }));

    const ctx = canvas.getContext('2d');
    this.paretoChartInstance = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Pareto Optimal Frontier',
            data: paretoLineData,
            type: 'line',
            borderColor: '#10b981',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            order: 2
          },
          {
            label: 'Evaluated Models',
            data: scatterData,
            backgroundColor: models.map(m => m.color || '#06b6d4'),
            borderColor: models.map(m => m.pareto ? '#10b981' : '#1e2942'),
            borderWidth: models.map(m => m.pareto ? 2 : 1),
            pointRadius: 8,
            pointHoverRadius: 11,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              usePointStyle: true,
              boxWidth: 8
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.datasetIndex === 0) {
                  return `Pareto Frontier: ${context.parsed.y}% @ ${context.parsed.x}`;
                }
                const m = context.raw.modelData;
                return [
                  `Model: ${m.name} (${m.family})`,
                  `Score: ${m.score}% (95% CI: [${m.ci_lower}%, ${m.ci_upper}%])`,
                  `${xLabels[xMetric]}: ${m[xMetric]}`,
                  `Pareto Efficient: ${m.pareto ? 'Yes ★' : 'No'}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xLabels[xMetric] || xMetric,
              color: '#94a3b8',
              font: { weight: '600' }
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            title: {
              display: true,
              text: `${benchmarkName} - ${metricLabel}`,
              color: '#94a3b8',
              font: { weight: '600' }
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  },

  /**
   * Render Chart 2: Contamination & Anomaly Scatter
   */
  renderContaminationChart(cases) {
    const canvas = document.getElementById('contaminationChart');
    if (!canvas || !cases) return;

    if (this.contaminationChartInstance) {
      this.contaminationChartInstance.destroy();
    }

    const cleanCases = cases.filter(c => c.status === 'Clean');
    const contaminatedCases = cases.filter(c => c.status === 'Contaminated');

    const ctx = canvas.getContext('2d');
    this.contaminationChartInstance = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Clean Generalizing Models',
            data: cleanCases.map(c => ({ x: c.ngram_overlap_pct, y: c.delta_ppl, caseData: c })),
            backgroundColor: '#06b6d4',
            borderColor: '#38bdf8',
            borderWidth: 1,
            pointRadius: 7
          },
          {
            label: 'Anomalous / Contaminated',
            data: contaminatedCases.map(c => ({ x: c.ngram_overlap_pct, y: c.delta_ppl, caseData: c })),
            backgroundColor: '#ef4444',
            borderColor: '#f87171',
            borderWidth: 2,
            pointRadius: 9
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const c = context.raw.caseData;
                return [
                  `Model: ${c.model}`,
                  `Status: ${c.status} (Z-Score: ${c.z_score})`,
                  `N-Gram Overlap: ${c.ngram_overlap_pct}%`,
                  `Δ PPL (Perplexity Drop): ${c.delta_ppl}`,
                  `Reported GSM8K: ${c.reported_gsm8k}% → Perturbed: ${c.perturbed_gsm8k}%`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: '8-Gram Test Set Overlap (%)', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            title: { display: true, text: 'Δ Perplexity (Unseen - Canonical Test)', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  },

  /**
   * Render Chart 3: Simpson's Paradox Subdomain Divergence
   */
  renderDomainDivergenceChart(data, selectedDomain = 'all') {
    const canvas = document.getElementById('domainDivergenceChart');
    if (!canvas || !data) return;

    if (this.domainChartInstance) {
      this.domainChartInstance.destroy();
    }

    let labels = data.domains;
    let alphaScores = data.model_alpha.scores;
    let betaScores = data.model_beta.scores;

    if (selectedDomain === 'law') {
      labels = ['Overall Macro', 'Law & Jurisprudence'];
      alphaScores = [data.model_alpha.scores[0], data.model_alpha.scores[1]];
      betaScores = [data.model_beta.scores[0], data.model_beta.scores[1]];
    } else if (selectedDomain === 'medicine') {
      labels = ['Overall Macro', 'Clinical Medicine'];
      alphaScores = [data.model_alpha.scores[0], data.model_alpha.scores[2]];
      betaScores = [data.model_beta.scores[0], data.model_beta.scores[2]];
    } else if (selectedDomain === 'math') {
      labels = ['Overall Macro', 'Abstract Math'];
      alphaScores = [data.model_alpha.scores[0], data.model_alpha.scores[3]];
      betaScores = [data.model_beta.scores[0], data.model_beta.scores[3]];
    }

    const ctx = canvas.getContext('2d');
    this.domainChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Model Alpha (Balanced)',
            data: alphaScores,
            backgroundColor: 'rgba(6, 182, 212, 0.75)',
            borderColor: '#06b6d4',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Model Beta (Uncalibrated Challenger)',
            data: betaScores,
            backgroundColor: 'rgba(245, 158, 11, 0.75)',
            borderColor: '#f59e0b',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              afterBody: (context) => {
                if (context[0].label === 'Law & Jurisprudence') {
                  return 'Difference: Model Alpha leads by +12.4%';
                } else if (context[0].label === 'Clinical Medicine') {
                  return 'Difference: Model Alpha leads by +6.8%';
                }
                return '';
              }
            }
          }
        },
        scales: {
          y: {
            min: 50,
            max: 100,
            title: { display: true, text: 'Evaluated Accuracy (%)', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  },

  /**
   * Render Chart 4: Length Bias Mitigation Line Chart
   */
  renderLengthBiasChart(biasData, showDebiasedOnly = false) {
    const canvas = document.getElementById('lengthBiasChart');
    if (!canvas || !biasData) return;

    if (this.lengthBiasChartInstance) {
      this.lengthBiasChartInstance.destroy();
    }

    const datasets = [
      {
        label: 'Human Gold Standard (Length-Neutral)',
        data: biasData.human_gold_standard,
        borderColor: '#10b981',
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 4,
        tension: 0.1
      }
    ];

    if (!showDebiasedOnly) {
      datasets.unshift({
        label: 'Raw LLM-as-a-Judge Win Rate (Severe Bias)',
        data: biasData.raw_judge_win_rate,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 5,
        tension: 0.2
      });
    }

    datasets.push({
      label: 'Debiased Judge (Length-Adjusted Ridge)',
      data: biasData.debiased_win_rate,
      borderColor: '#06b6d4',
      borderWidth: 2,
      pointRadius: 5,
      tension: 0.2
    });

    const ctx = canvas.getContext('2d');
    this.lengthBiasChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: biasData.token_diff_bins,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: {
            min: 30,
            max: 75,
            title: { display: true, text: 'Pairwise Win Rate (%)', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            title: { display: true, text: 'Token Length Differential (Model A - Model B)', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  },

  /**
   * Render Chart 5: Capability Radar Chart
   */
  renderRadarChart(radarData) {
    const canvas = document.getElementById('radarChart');
    if (!canvas || !radarData) return;

    if (this.radarChartInstance) {
      this.radarChartInstance.destroy();
    }

    const datasets = radarData.models.map(m => ({
      label: m.name,
      data: m.scores,
      borderColor: m.color,
      backgroundColor: m.fill,
      borderWidth: 2,
      pointRadius: 4
    }));

    const ctx = canvas.getContext('2d');
    this.radarChartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: radarData.dimensions,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          r: {
            min: 70,
            max: 100,
            ticks: {
              stepSize: 10,
              color: '#64748b',
              backdropColor: 'transparent'
            },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
              color: '#f8fafc',
              font: { weight: '600', size: 12 }
            }
          }
        }
      }
    });
  },

  /**
   * Render Chart 6: Statistical Null Distribution & Critical Threshold
   */
  renderSimDistribution(se, delta, isSignificant, zCrit = 1.96) {
    const canvas = document.getElementById('simDistributionChart');
    if (!canvas) return;

    if (this.simDistributionChartInstance) {
      this.simDistributionChartInstance.destroy();
    }

    const points = DataStore.generateDistributionPoints(0, se, 40);
    const criticalThreshold = zCrit * se;

    const ctx = canvas.getContext('2d');
    this.simDistributionChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: points.map(p => p.x),
        datasets: [
          {
            label: 'Null Hypothesis Distribution H0: μ=0',
            data: points.map(p => p.y),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: () => 'Null Distribution (Sampling Noise)',
              label: (ctx) => `Delta: ${ctx.label}% (Density: ${ctx.raw})`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: `Accuracy Delta % (Observed: ${delta}%, Critical MOE: ±${criticalThreshold.toFixed(2)}%)`, color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            display: false
          }
        }
      }
    });
  },

  /**
   * Render Chart 7: Interactive SME Diagnostic Sandbox
   */
  renderSandboxScenario(scenarioKey) {
    const canvas = document.getElementById('sandboxChart');
    if (!canvas) return;

    if (this.sandboxChartInstance) {
      this.sandboxChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');

    if (scenarioKey === 'ceiling') {
      this.sandboxChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Model A (Baseline)', 'Model B (Competitor)', 'Model A (CoT Variant)', 'Human Baseline'],
          datasets: [
            {
              label: 'Reported Accuracy (%)',
              data: [96.8, 97.4, 97.1, 95.0],
              backgroundColor: ['#06b6d4', '#f59e0b', '#3b82f6', '#10b981'],
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#1e2942'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const cis = {
                    0: '95% CI: [95.9%, 97.7%] (SE: ±0.46%)',
                    1: '95% CI: [96.6%, 98.2%] (SE: ±0.41%)',
                    2: '95% CI: [96.2%, 98.0%] (SE: ±0.44%)',
                    3: 'Standardized Human Benchmark'
                  };
                  return [`Score: ${ctx.raw}%`, cis[ctx.dataIndex] || ''];
                }
              }
            }
          },
          scales: {
            y: {
              min: 90,
              max: 100,
              title: { display: true, text: 'GSM8K Test Accuracy (%)', color: '#94a3b8' },
              grid: { color: 'rgba(255, 255, 255, 0.06)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    } else if (scenarioKey === 'contamination') {
      this.sandboxChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Llama-3-70B', 'FineTuned-Math-X', 'DeepSeek-Math-7B', 'Qwen-2.5-Math'],
          datasets: [
            {
              label: 'Canonical Benchmark (Clean)',
              data: [82.5, 91.2, 84.1, 88.0],
              backgroundColor: '#3b82f6',
              borderRadius: 4
            },
            {
              label: 'Operand Perturbed (GSM-Symbolic)',
              data: [80.9, 54.6, 81.5, 86.2],
              backgroundColor: '#ef4444',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { boxWidth: 10, color: '#94a3b8' }
            },
            tooltip: {
              callbacks: {
                afterBody: (items) => {
                  const idx = items[0].dataIndex;
                  const drops = ['-1.6% (Robust)', '-36.6% (CONTAMINATION COLLAPSE)', '-2.6% (Robust)', '-1.8% (Robust)'];
                  return `\nGeneralization Drift: ${drops[idx]}`;
                }
              }
            }
          },
          scales: {
            y: {
              min: 40,
              max: 100,
              title: { display: true, text: 'Mathematical Accuracy (%)', color: '#94a3b8' },
              grid: { color: 'rgba(255, 255, 255, 0.06)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    } else if (scenarioKey === 'length_bias') {
      this.sandboxChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['< 150 words', '150 - 300 words', '300 - 450 words', '450 - 600 words', '> 600 words'],
          datasets: [
            {
              label: 'Raw LLM-as-a-Judge Win Rate (%)',
              data: [31.2, 42.5, 54.8, 68.4, 84.1],
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              fill: true,
              tension: 0.35,
              pointRadius: 5,
              pointBackgroundColor: '#ef4444',
              borderWidth: 2
            },
            {
              label: "Debiased Bradley-Terry Win Rate (%)",
              data: [49.2, 50.4, 49.8, 51.1, 50.2],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.35,
              pointRadius: 5,
              pointBackgroundColor: '#10b981',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { boxWidth: 10, color: '#94a3b8' }
            },
            tooltip: {
              callbacks: {
                title: (items) => `Answer Length: ${items[0].label}`,
                afterBody: () => '\nEvaluation on semantically identical response pairs'
              }
            }
          },
          scales: {
            y: {
              min: 20,
              max: 100,
              title: { display: true, text: 'Evaluator Win Rate (%)', color: '#94a3b8' },
              grid: { color: 'rgba(255, 255, 255, 0.06)' }
            },
            x: {
              title: { display: true, text: 'Model Output Length Range', color: '#94a3b8' },
              grid: { color: 'rgba(255, 255, 255, 0.04)' }
            }
          }
        }
      });
    }
  }
};
