# AI Benchmark Data Analyst Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premier, highly market-relevant portfolio web application for Jane Rose tailored specifically to the "Subject Matter Expert – Data & Statistical Chart Analysis (AI Benchmark)" role, showcase 4 market-relevant benchmark evaluation projects with interactive charts, statistical methodology breakdowns, and deploy the project to GitHub and Vercel using credentials stored in Windows Credential Manager.

**Architecture:** A modern, zero-bloat web application featuring a cohesive dark glassmorphism design system, Chart.js interactive visualizations (Pareto frontiers, 95% bootstrap confidence intervals, contamination anomaly scatterplots, and Elo win-rate heatmaps), dataset inspection tools, and executive vs. technical translation modes.

**Tech Stack:** HTML5 (semantic, accessible), Vanilla CSS (custom design tokens, dark mode, responsive layout), JavaScript (ES6+ modular logic, Chart.js 4.x via CDN), Git, GitHub API / Git CLI, Vercel REST API / CLI.

**Spec:** Tailored to the job description:
1. Evaluate & interpret statistical data and visual representations for AI performance benchmarks (MMLU-Pro, GSM8K, HumanEval, SWE-bench, MT-Bench).
2. Analyze trends, anomalies, correlations, and Pareto tradeoffs (Accuracy vs. Latency/Cost).
3. Validate data integrity, statistical significance, bootstrap confidence intervals, and test contamination.
4. Bridge the gap between technical metrics and non-technical stakeholder decision-making.
5. Deployed to GitHub repository (`Janeferdinant/ai-benchmark-portfolio`) and live on Vercel (`janeferdinant-6962`).

## Global Constraints
- Target platform: Modern web browsers (desktop and mobile responsive down to 375px).
- Styling: Custom vanilla CSS design system following `ui-ux-pro-max` guidelines (minimum 4.5:1 contrast, 4/8px spacing grid, accessible controls, vector SVGs, no emojis as UI control icons).
- Credentials: Read GitHub token and Vercel token securely from Windows Credential Manager via PowerShell.
- Verification: Every task must be verified with executable tests or browser/API validation before committing.

## Review Focus
1. Chart rendering reliability when switching between tabs or filters without canvas memory leaks.
2. Statistical accuracy of formulas (95% bootstrap confidence intervals, p-values, z-scores, Elo calculations).
3. Mobile responsiveness and viewport clearance for chart controls and benchmark matrices.
4. Accessibility: proper `aria` attributes, semantic HTML tags, keyboard navigability.
5. Deployment integrity: GitHub repo successfully pushed; Vercel deployment returns HTTP 200 and a live production URL.

---

### Task 1: Setup Project Structure & Design Tokens
**Files:**
- Create: `index.html`
- Create: `css/styles.css`
- Create: `docs/METHODOLOGY.md`

- [ ] **Step 1: Create project scaffolding and semantic HTML shell**
  Set up HTML5 structure, metadata for SEO/social sharing, typography (Inter + JetBrains Mono), container hierarchy, navigation bar, hero section, project showcases, statistical playground, and modal dialogs.
- [ ] **Step 2: Implement CSS design system tokens and responsive styles**
  Define color tokens (obsidian background `#0a0d14`, card `#121826`, border `#1e293b`, cyan accent `#06b6d4`, indigo `#6366f1`, emerald `#10b981`, amber `#f59e0b`, crimson `#ef4444`), typography scales, 8px grid system, glassmorphism card surfaces, and accessible focus outlines.
- [ ] **Step 3: Verify base layout and typography in local browser/test server**
  Verify HTML syntax and CSS compilation without errors.

---

### Task 2: Core Data Engine & AI Benchmark Datasets
**Files:**
- Create: `data/benchmarks.json`
- Create: `data/contamination_audit.json`
- Create: `data/pairwise_elo.json`
- Create: `js/data-store.js`

- [ ] **Step 1: Curate realistic, market-relevant AI benchmarking datasets**
  Include frontier models (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, DeepSeek-R1, Llama 3.3 70B, Qwen 2.5 72B) across benchmarks (MMLU-Pro, GSM8K, MATH, HumanEval, SWE-bench, Arena Elo, TTFT, cost/1M tokens, 95% CI bands, contamination scores, and anomaly tags).
- [ ] **Step 2: Implement data manipulation and statistical utility functions**
  Implement bootstrap CI computation, z-score anomaly calculation, Pareto frontier filter, and Pearson correlation coefficients in `js/data-store.js`.
- [ ] **Step 3: Verify data calculations with unit test script**
  Run Node.js test script to verify statistical calculations (mean, standard deviation, bootstrap intervals, Pareto optimality).

---

### Task 3: Interactive Visualizations & Chart Modules
**Files:**
- Create: `js/charts.js`
- Create: `js/app.js`

- [ ] **Step 1: Implement Chart 1 - Pareto Frontier & Tradeoff Analysis (Accuracy vs. Latency/Cost)**
  Scatter & line frontier chart with interactive toggles (MMLU-Pro vs. Latency ms, GSM8K vs. Cost, SWE-bench vs. Throughput) with confidence interval ellipses.
- [ ] **Step 2: Implement Chart 2 - Contamination & Anomaly Detection Matrix**
  Perplexity delta vs. n-gram memorization scatter plot highlighting flagged contaminated benchmarks and Simpson's Paradox domain divergence.
- [ ] **Step 3: Implement Chart 3 - Bradley-Terry Elo Win-Rate Matrix & Head-to-Head Heatmap**
  Pairwise battle matrix with win-rate percentages and statistical error margins.
- [ ] **Step 4: Implement Chart 4 - Domain Radar & Multi-Dimensional Competency Profile**
  Radar chart comparing model families across 6 dimensions: Reasoning, Coding, Math, Instruction Following, Hallucination Resistance, and Safety Calibration.
- [ ] **Step 5: Implement Audience Mode Toggle (Executive Summary vs. Statistical SME Deep Dive)**
  Toggle view allowing stakeholders to switch between high-level executive insights and granular statistical significance metrics (p-values, degrees of freedom, bootstrap iterations).

---

### Task 4: Interactive Statistical Playground & Case Studies
**Files:**
- Modify: `index.html`
- Modify: `js/app.js`

- [ ] **Step 1: Add interactive "Sample Size & Confidence Interval Calculator" widget**
  Allows recruiters and hiring managers to simulate benchmark sample sizes (N=100 to N=10,000) and observe standard error shrinkage and p-value shifts in real time.
- [ ] **Step 2: Add 3 in-depth case study writeups with methodology documentation**
  - Case Study 1: Resolving Simpson's Paradox in Aggregate Benchmark Scoring.
  - Case Study 2: Detecting Test-Set Contamination in Open-Weight Mathematical Models.
  - Case Study 3: Mitigating Length & Formatting Bias in LLM-as-a-Judge Evaluation Pipelines.
- [ ] **Step 3: Verify interactions, animations, and chart transitions**
  Run verification test in headless browser subagent / local server.

---

### Task 5: Testing, Accessibility & Cross-Browser Verification
**Files:**
- Test: `test/test-runner.js`
- Test with browser subagent / automated headless verification.

- [ ] **Step 1: Run comprehensive JavaScript and data validation tests**
  Ensure all metrics, formulas, and chart handlers function without exceptions.
- [ ] **Step 2: Verify responsive design, contrast, and visual presentation**
  Capture screenshots across desktop and mobile viewports; confirm flawless rendering.

---

### Task 6: GitHub Repository Initialization & Push
**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Git commit & push to remote `https://github.com/Janeferdinant/ai-benchmark-portfolio.git`

- [ ] **Step 1: Initialize Git repo and commit all files**
- [ ] **Step 2: Use Windows Credential Manager GitHub token to create remote repo via GitHub API and push**
- [ ] **Step 3: Verify repo is live on GitHub**

---

### Task 7: Vercel Deployment & Live Verification
**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Configure `vercel.json` for optimal static caching and security headers**
- [ ] **Step 2: Deploy to Vercel using token retrieved from Windows Credential Manager**
- [ ] **Step 3: Verify live URL returns HTTP 200 with complete rendered page and working charts**
