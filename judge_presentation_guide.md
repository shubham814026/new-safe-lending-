# Judge Presentation Guide (Data → Charts → Pandas)

This guide is for speaking confidently in front of judges even if you are new to the project.

---

## 1) Problem in One Line

We show that Lending Club loan **grades (A–G)** looked stable as labels, but the **actual risk behind those labels drifted over time**.

---

## 2) Data First (What You Loaded)

## 2.1 Dataset Scale
- Total records loaded: **2,260,668 loans**
- Time span in raw data: **2007–2018**
- Closed loans (usable for true outcome analysis): **~1.3M**

## 2.2 Source Files (column-wise split dataset)
- `loan_core.csv`
- `borrower_profile.csv`
- `credit_history.csv`
- `account_balances.csv`
- `account_activity.csv`
- `extra_unassigned.csv`

## 2.3 Important Note About Joining
- The nominal key `id` is present but treated as unusable in your notebook/backend flow.
- The project uses **positional concatenation** (`pd.concat(..., axis=1)`) after dropping duplicate `id` columns.
- This assumes all files are row-aligned (same row order for the same loan).

## 2.4 Target Variable Construction
You convert multi-class `loan_status` into binary risk:
- `is_default = 1` for: Charged Off / Default / policy Charged Off
- `is_default = 0` for: Fully Paid / policy Fully Paid
- Other statuses (Current, Late, Grace) are set to NaN for default-outcome analysis

This avoids label noise from unresolved loans.

---

## 3) Statistical Cleaning Logic (Why It Matters)

## 3.1 Maturity Bias Control
Recent years have many unresolved loans, so default rates are artificially low/high depending on lifecycle.

You compute per-year closure rate:

\[
\text{pct\_closed}(y) = \frac{\#\{\text{loans with known } is\_default \text{ in year } y\}}{\#\{\text{all loans in year } y\}}
\]

Then keep only years with:
- **pct_closed ≥ 80%**
- enough volume (>=500 loans/year)

This forms `df_analysis`, the trustworthy panel for drift analysis.

## 3.2 Core Statistics Used Throughout
- Default rate:  \(\hat{p} = \frac{\sum is\_default}{n}\)
- Median (DTI, interest): robust to outliers
- Grade spread score (separation): max grade default − min grade default each year
- AUC: probability model ranks a random defaulter above a non-defaulter

---

## 4) Dashboard Charts (What Each One Proves)

## 4.1 Stat Cards
- **Total Closed Loans**: sample size credibility
- **Default Rate**: overall risk level
- **Median Interest Rate**: market pricing baseline
- **Median Income**: borrower profile baseline

## 4.2 Grade Drift (Line Chart)
- Grouping: `issue_year × grade`
- Metric: mean `is_default` (converted to %)
- Filter: keep grade-year cells with enough support (`n_loans >= 200`)

Interpretation: same grade should map to similar risk over time. If Grade G line rises steeply while label stays “G”, grading calibration is drifting.

## 4.3 Rate vs Default Alignment (Scatter + Trendline)
- X-axis: median interest rate by grade-year
- Y-axis: actual default rate by grade-year
- Statistical check: regression trendline in chart

Interpretation: if points shift upward faster than rates adjust, pricing is underreacting to risk.

## 4.4 Profile Drift (DTI + Delinquency)
- DTI chart: median `dti` by year and grade
- Delinquency chart: percentage with `delinq_2yrs > 0`

Interpretation: even inside the same grade, borrower risk profile can worsen over time.

## 4.5 Geographic Risk (Grade C by State)
- Subset: grade C only
- Metric by state: default mean + loan count
- Reliability filter: `n_loans >= 100`
- Category logic:
  - danger: state rate > 1.3 × overall Grade C rate
  - warning: > 1.1 × overall
  - safe: < 0.9 × overall

Interpretation: same grade but different states imply hidden concentration risk.

## 4.6 Verification Paradox
- Grouping: `grade × verification_status`
- Metric: default rate (%) with support threshold

Interpretation: “Verified” does not automatically mean safer; verification can be triggered for suspicious profiles (selection effect).

## 4.7 Drift Score (Grade Separation)
- For each year:

\[
\text{spread}(y) = \max_g \hat{p}_{g,y} - \min_g \hat{p}_{g,y}
\]

- Also displayed: Grade A and Grade G rates for context.

Interpretation: changing spread indicates calibration/separation instability over time.

## 4.8 Loan Volume Over Time
- Count of loans and total funded amount by year

Interpretation: business growth context; helps explain exposure expansion.

## 4.9 Loan Status Distribution
- `value_counts` of status with percentages

Interpretation: lifecycle composition and why unresolved statuses must be treated carefully.

---

## 5) Prediction Page (ML Statistics You Should Explain)

## 5.1 Model Setup
- Model: `RandomForestClassifier`
- Typical params: `n_estimators=200`, `max_depth=12`, `class_weight='balanced'`
- Features: application-time fields only (to avoid leakage)
- Missing values: `SimpleImputer(strategy='median')`
- Categorical encoding: `LabelEncoder`
- Split: stratified train/test

## 5.2 ROC Curve + AUC
- ROC plots TPR vs FPR across thresholds
- AUC close to 1 is strong ranking power; 0.5 is random

Judge-friendly line: “AUC tells us how well the model separates good vs bad borrowers independent of one fixed threshold.”

## 5.3 Confusion Matrix
Matrix shape:
- TN, FP
- FN, TP

From this, discuss tradeoff:
- false positives = rejecting good borrowers
- false negatives = missing risky borrowers

## 5.4 Classification Report
- Precision, Recall, F1, Support per class
- Accuracy shown but emphasize class metrics due imbalance risk

## 5.5 Temporal Decay (Most Important ML Insight)
- Train on early period (2009–2011)
- Test year-by-year (2009–2015)
- Observe AUC decay over future years

Interpretation: concept drift — relationship between features and default changes with time, so static model degrades.

---

## 6) Pandas Workflow (Explain Like a Data Scientist)

Use this as your “technical method” narrative:

1. **Load** each CSV with `pd.read_csv(..., low_memory=False)`
2. **Concatenate** column-split tables into one master frame
3. **Drop duplicate columns** after concat
4. **Parse dates**: `issue_d -> issue_year`
5. **Engineer target**: binary `is_default`
6. **Create closed-loan subset** with known outcomes
7. **Check maturity** per year and filter incomplete years
8. **Compute grouped stats** using `groupby + agg`
9. **Build chart payloads** as JSON-ready lists/dicts for FastAPI
10. **Train ML pipeline** with imputation + encoding + RF + metrics

Common Pandas patterns used in your code:
- `groupby(['issue_year','grade'])['is_default'].agg(...)`
- `value_counts()` for distribution charts
- `median()` for robust central tendency
- `pd.to_numeric(..., errors='coerce')` for cleaning rates
- Boolean filtering for sample-quality control (`n_loans` thresholds)

---

## 7) 90-Second Judge Script (Memorize This)

“We analyzed 2.26 million Lending Club loans and converted loan outcomes into a clean binary default target. To avoid biased conclusions, we filtered for mature years where outcomes are mostly resolved. Then we evaluated risk behavior by grade, year, geography, and verification type using grouped default-rate statistics.

The key finding is grade drift: the same letter grade does not represent constant risk over time. Our charts show widening instability in some segments, including geographic and borrower-profile shifts. On the ML side, a Random Forest trained on early years performs well in-period but degrades sharply out-of-time, proving temporal drift.

So the business message is: static grading and static models are not enough. Risk systems must be recalibrated and retrained continuously with drift monitoring.”

---

## 8) Judge Q&A Quick Answers

- **Why only closed loans?** Because unresolved loans do not yet reveal true default outcomes.
- **Why median for DTI/rate?** More robust than mean under heavy tails/outliers.
- **Why AUC, not only accuracy?** AUC is threshold-independent and better under class imbalance.
- **What is your biggest risk control?** Maturity filtering and out-of-time validation.
- **What is the business action?** Annual (or faster) model recalibration + drift monitoring dashboard.
