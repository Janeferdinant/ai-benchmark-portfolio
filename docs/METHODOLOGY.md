# AI Benchmark & Statistical Evaluation Methodology

**Author:** Jane Rose (Janeferdinant)  
**Role Target:** Subject Matter Expert – Data & Statistical Chart Analysis (AI Benchmark)  
**Version:** 1.0.0 (Audited Standards)

---

## 1. Executive Summary & Objective

In modern AI benchmarking, raw point estimates (e.g., "Model A achieved 84.2% on MMLU-Pro vs. Model B's 83.1%") are frequently misreported without statistical confidence intervals, standard errors, or contamination audits. 

This methodology outlines the statistical and analytical protocols required to:
1. Distinguish true model improvements from stochastic benchmark sampling noise.
2. Uncover and mitigate Simpson's Paradox across disaggregated domain sub-tasks.
3. Detect pre-training test-set contamination and memorization via perplexity shift and n-gram overlap.
4. Calibrate LLM-as-a-Judge evaluation pipelines to eliminate verbosity (length) and position biases.

---

## 2. Statistical Protocols

### 2.1 Non-Parametric Bootstrap Confidence Intervals (95% CI)
For any benchmark dataset $\mathcal{D} = \{x_1, x_2, \dots, x_N\}$ with binary or continuous scoring outcomes:
- We draw $B = 10,000$ empirical bootstrap samples with replacement: $\mathcal{D}^{*b}$.
- The metric estimator $\hat{\theta}^{*b}$ is calculated for each bootstrap sample.
- The 95% Confidence Interval is determined using the percentile method:
  $$[\hat{\theta}_{0.025}^*, \hat{\theta}_{0.975}^*]$$
- Standard Error (SE) is estimated as the sample standard deviation of the bootstrap distribution:
  $$\widehat{\text{SE}}(\hat{\theta}) = \sqrt{\frac{1}{B-1}\sum_{b=1}^{B}(\hat{\theta}^{*b} - \bar{\theta}^*)^2}$$

### 2.2 Hypothesis Testing & Significance Criteria
When comparing Challenger Model ($C$) against Baseline Model ($B$):
- Null Hypothesis: $H_0: \mu_C - \mu_B \le 0$
- Alternative Hypothesis: $H_1: \mu_C - \mu_B > 0$
- Paired Wilcoxon Signed-Rank Test or Welch's t-test applied depending on normality diagnostics (Shapiro-Wilk test).
- To control the Family-Wise Error Rate (FWER) across multi-task evaluations, Bonferroni and Benjamini-Hochberg False Discovery Rate (FDR) corrections are systematically enforced.

---

## 3. Data Integrity & Contamination Forensics

### 3.1 Perplexity Discrepancy ($\Delta \text{PPL}$)
To detect whether benchmark questions were exposed in the training corpus:
$$\Delta \text{PPL} = \text{PPL}(\text{Canonical Benchmark}) - \text{PPL}(\text{Semantically Equivalent Adversarial Paraphrase})$$
- An anomalously low perplexity on the canonical benchmark relative to the paraphrased version indicates item memorization rather than generalized reasoning capability.

### 3.2 Simpson's Paradox Auditing
- When aggregate macro-accuracy increases, we execute subgroup stratification by domain (e.g., Mathematics, Coding, Medical, Legal).
- If individual sub-domain slopes contradict the global macro slope, stratified re-weighting is performed to prevent skewed production deployments.

---

## 4. Evaluator Calibration (Bradley-Terry & Inter-Rater Reliability)

### 4.1 Bradley-Terry Pairwise Preference Modeling
In blind head-to-head tournament comparisons:
$$P(\text{Model } i \succ \text{Model } j) = \frac{e^{\lambda_i}}{e^{\lambda_i} + e^{\lambda_j}}$$
where $\lambda$ represents the latent Elo ability parameter estimated via Maximum Likelihood Estimation (MLE).

### 4.2 De-Biasing Evaluator Judgments
1. **Position Bias:** Each pair is evaluated in both permutations $(A, B)$ and $(B, A)$. Inconsistent results are recorded as ties or flagged for human review.
2. **Length Bias:** Win log-odds are regressed against response token length differential ($\Delta L = L_A - L_B$) to remove length preference artifacts.
3. **Inter-Judge Agreement:** Inter-rater reliability is measured against human gold-standard labels using Cohen's Kappa ($\kappa$) and Gwet's AC1:
   $$\kappa = \frac{p_o - p_e}{1 - p_e}$$
   Threshold for automated judge validation: $\kappa \ge 0.85$.
