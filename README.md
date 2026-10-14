# Jane Rose | AI Benchmark & Statistical Chart Analysis SME Portfolio

[![Live Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://janeferdinant-ai-benchmark.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Janeferdinant/ai-benchmark-portfolio)
[![Evaluation Standard](https://img.shields.io/badge/Statistical_Standard-95%25_Bootstrap_CI-06b6d4?style=for-the-badge)](docs/METHODOLOGY.md)

Production portfolio engineered specifically for the **Subject Matter Expert – Data & Statistical Chart Analysis (AI Benchmark)** role at a global leader in technology, internet, and AI benchmarking standards.

---

## 🎯 Candidate Overview

- **Candidate:** Jane Rose (`Janeferdinant`)
- **Target Role:** Data Analyst / Subject Matter Expert – Data & Statistical Chart Analysis (AI Benchmark)
- **Email:** [janeferdinant@gmail.com](mailto:janeferdinant@gmail.com)
- **Location:** Remote (India / Work from Anywhere)
- **Core Domain:** AI Model Evaluation, Non-parametric Bootstrap Estimation, Hypothesis Testing, Contamination Forensics, Bradley-Terry Elo Tournaments, and Interactive Chart Interpretation.

---

## 📊 Market-Relevant Projects Included

### 1. Multi-Model AI Benchmark Analytics Engine (Frontier Pareto Optimization)
- Evaluates frontier models (Claude 3.5 Sonnet, GPT-4o, DeepSeek-R1, DeepSeek-V3, Llama 3.3 70B, Qwen 2.5 72B) across **MMLU-Pro**, **GSM8K**, **SWE-bench Lite**, and **HumanEval**.
- Identifies **Pareto Optimal Frontiers** across Accuracy vs. Latency (ms), Inference Cost ($/1M tokens), and Parameter scale.
- Computes **95% Bootstrap Confidence Intervals ($B = 10,000$)** and Standard Errors ($SE$) to avoid misinterpreting stochastic sampling noise as model superiority.

### 2. Benchmark Anomaly & Contamination Forensic Suite
- **Test-Set Memorization Detection:** Analyzes $\Delta \text{PPL} = \text{PPL}_{\text{unseen}} - \text{PPL}_{\text{test}}$ against 8-gram verbatim overlap to isolate contaminated models ($Z > 2.5$) that collapse on perturbed operands.
- **Simpson's Paradox Resolution:** Demonstrates how non-uniform subgroup weighting in aggregate macro scores masks severe -12.4% performance regressions in critical reasoning domains (Law & Medicine).

### 3. Bradley-Terry Elo Matrix & LLM-as-a-Judge Calibration
- Models pairwise battle outcomes across 14,500 blind evaluations.
- **Length & Position Bias Mitigation:** Eliminates artificial verbosity inflation (+7.3% unmerited win rate) using length-controlled ridge logistic regression, elevating inter-judge agreement with human experts to Cohen's $\kappa = 0.89$.
- Multi-dimensional capability radar profiling 6 foundational axes (Reasoning, Math, Coding, Instruction Following, Safety, Hallucination Resistance).

### 4. Interactive Statistical Sample Size & Margin of Error Simulator
- Real-time pedagogical laboratory enabling hiring managers to adjust sample size ($N$), observed accuracy delta ($\Delta$), confidence levels ($90\%$, $95\%$, $99\%$), and task difficulty variance ($\sigma$).
- Computes exact margins of error, Z-test statistics, two-tailed p-values, statistical power ($1 - \beta$), and required sample thresholds.

### 5. Dual-Audience Lens ("Executive Summary" vs. "SME Deep Dive")
- Demonstrates the ability to communicate findings to both non-technical business leaders (strategic tradeoffs, ROI, deployment impact) and technical researchers (hypothesis rejection criteria, standard error distributions, degrees of freedom).

---

## 🛠️ Technical Architecture

- **Frontend:** Semantic HTML5, accessible ARIA roles, WCAG AA compliant contrast ratio (>4.5:1).
- **Design System:** Custom CSS design system adhering to `ui-ux-pro-max` guidelines (dark obsidian palette, 8px rhythmic spacing, responsive down to 375px mobile viewports).
- **Visualizations:** Chart.js 4.4.x (interactive tooltips, scatter plots, dual-dataset bar charts, radar charts, Gaussian density curves).
- **Hosting & CI/CD:** Deployed via GitHub and Vercel CDN.

---

## 🔬 Statistical Methodology

Full mathematical definitions and evaluation protocols are detailed in [docs/METHODOLOGY.md](docs/METHODOLOGY.md).

```
Non-Parametric Bootstrap:  B = 10,000 iterations
Significance Threshold:    p < 0.05 (with Bonferroni / Benjamini-Hochberg FDR)
Judge Calibration Target:  Cohen's κ ≥ 0.85
Contamination Metric:      Z-Score > 2.5 on Perplexity Drop & N-Gram Overlap
```

---

## 💻 Local Development

Run locally using any static web server:

```bash
# Using Node.js http-server or npx
npx serve .

# Or using Python
python -m http.server 3000
```

Open `http://localhost:3000` in your web browser.

---

© 2026 Jane Rose. Licensed under the MIT License.
