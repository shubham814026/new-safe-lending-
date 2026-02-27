# Lending Club — Hidden Risk in "Safe" Grades

> **Team Solution Document** | Datathon 2026  
> Interactive dashboard: `http://localhost:5173`

---

## Executive Summary

We analysed **2.26 million Lending Club loans** (2007–2015) and discovered that the platform's letter-grade system — the single most visible signal borrowers and investors rely on — **silently degraded over time**. A Grade G loan in 2015 defaulted at **54 %**, nearly double its 2011 rate, yet the label stayed the same. Our Random Forest model, trained only on application-time features, confirms this: AUC drops **19.4 percentage points** just one year after the training window, proving the grades stopped keeping pace with real borrower risk.

---

## 1 · Grade Drift — Same Label, Different Risk

| Grade | Default Rate 2008 | Default Rate 2015 | Change |
|:-----:|:------------------:|:------------------:|:------:|
| **A** | 6 % | 6 % | — |
| **G** | 33 % (2011) | **54 %** | **+21 pp** |

- Grade A remained stable at ≈ 6 % — the safest tier held.
- Grade G drifted from 33 % to 54 %, meaning **more than half** of G-rated loans issued in 2015 eventually defaulted.
- Mid-tier grades (C–E) shifted too, but less dramatically.

**Implication →** An investor buying Grade G paper in 2015 accepted roughly **2× the risk** of someone buying Grade G in 2011, with no change in the grade label or pricing framework.

---

## 2 · Geographic Risk — 14 pp Spread Hiding Inside One Grade

Focusing on **Grade C** (the largest single grade by volume):

| Metric | Value |
|--------|-------|
| Highest default state | **NE — 27 %** |
| Lowest default state | **DC — 13 %** |
| Spread | **14 percentage points** |

A Grade C loan in Nebraska was **twice as likely** to default as the same grade in Washington DC. The grading model assigned the same letter to fundamentally different risk pools depending on geography.

**Implication →** State-level economic conditions introduced hidden concentration risk that the grade system never captured.

---

## 3 · The Verification Paradox — Verified Borrowers Default *More*

Grade C breakdown by verification status:

| Verification Status | Default Rate | Loans |
|:-------------------:|:------------:|:-----:|
| Not Verified | **18.3 %** | 59 339 |
| Source Verified | **21.6 %** | 85 737 |
| Verified | **20.7 %** | 79 480 |

Verified and Source Verified borrowers default **2–3 pp more** than unverified ones.

**Why?** Verification is not random — Lending Club triggered it for applicants whose stated income looked suspicious. The act of verification itself is a **risk signal**, not a risk mitigator. The grade system did not account for this selection bias, so "Verified + Grade C" was actually riskier than "Not Verified + Grade C."

---

## 4 · Borrower Profile Drift — DTI Inside Grade A

| Year | Median DTI (Grade A) |
|:----:|:--------------------:|
| 2007 | **3.6** |
| 2015 | **15.8** |

Grade A borrowers in 2015 carried **4.4× the debt-to-income ratio** of their 2007 counterparts, yet still received the top grade. The platform relaxed its underwriting standards while keeping the label constant.

**Implication →** Grade A in 2015 was not the same product as Grade A in 2007. Investors relying on historical grade-level default rates for pricing were systematically underestimating risk.

---

## 5 · Model Temporal Decay — Proof the World Moved

We trained a Random Forest (200 trees, max depth 12, balanced class weights) on **application-only features** from 2009–2011 — no post-origination data leakage — then tested on each subsequent year:

| Year | AUC | Default Rate | Status |
|:----:|:---:|:------------:|:------:|
| 2009 | 0.816 | 13.7 % | ✅ Train |
| 2010 | **0.849** | 14.0 % | ✅ Train |
| 2011 | 0.834 | 15.2 % | ✅ Train |
| **2012** | **0.655** | 16.2 % | ⚠️ Degraded |
| 2013 | 0.652 | 15.6 % | ⚠️ Degraded |
| 2014 | 0.660 | 18.5 % | ⚠️ Degraded |
| 2015 | 0.665 | 20.2 % | ⚠️ Degraded |

- **In-period AUC (2010): 0.849** — the model discriminates well on data it was trained on.
- **Out-of-time AUC (2012): 0.655** — a **19.4 pp drop in a single year**.
- Default rate climbs from 14 % → 20 % while the model's ability to rank borrowers collapses.

**Implication →** Any static scoring model — including Lending Club's own grade system — was stale within 12 months. Continuous retraining or adaptive risk frameworks are not optional.

---

## 6 · Overall Findings Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   GRADE LABELS STAYED CONSTANT                                      │
│   ─────────────────────────────                                     │
│   But the DEFAULT RISK they represented did not.                    │
│                                                                     │
│   ● Grade G default rate doubled (33% → 54%)                       │
│   ● Grade A DTI quadrupled (3.6 → 15.8)                            │
│   ● Same grade, 14pp spread across states                          │
│   ● Verification = risk signal, not protection                     │
│   ● Static ML model decays 19pp AUC in 1 year                     │
│                                                                     │
│   CONCLUSION: The grading system was a depreciating asset.          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7 · Technical Approach

| Component | Detail |
|-----------|--------|
| **Data** | 6 CSVs → 2,260,668 rows × 144 columns |
| **Closed Loans** | 1,306,387 (fully resolved: Paid / Defaulted) |
| **Analysis Set** | 825,575 (maturity-filtered: ≥ 80 % closure rate, ≥ 500 loans/year) |
| **ML Model** | `RandomForestClassifier(n_estimators=200, max_depth=12, class_weight='balanced')` |
| **Features** | 21 application-time only (no post-origination leakage) |
| **AUC (full test)** | 0.716 (all years pooled) |
| **AUC (in-period)** | 0.849 (2009–2011 train/test) |
| **Backend** | FastAPI + pandas + scikit-learn, data cached in memory at startup |
| **Frontend** | React 18 + D3.js v7 + Three.js, Vite 5, Tailwind CSS |
| **Visualisations** | 9 interactive D3 charts (Dashboard) + 5 ML charts (Prediction) + 3D view |

### Data Pipeline

```
6 CSVs (1.2 GB)
    → concat by position
    → drop duplicate columns  
    → parse issue_d → issue_year
    → binary is_default flag (Charged Off / Default = 1, Fully Paid = 0)
    → maturity filter (≥80% closure, ≥500 loans/year)
    → analysis-ready DataFrame (825K rows)
```

### Why Application-Only Features?

Using post-origination fields (balance, payment history, recoveries) would give higher AUC but **leaks future information** — you can't know at origination time how many payments will be missed. Our model uses only data available at the moment a loan is listed: income, DTI, FICO range, delinquency history, loan amount, grade, purpose, etc.

---

## 8 · Recommendations

1. **Dynamic Grade Recalibration** — Grades should be re-benchmarked annually against realised default rates, not set once at origination.
2. **Geographic Risk Overlay** — State-level economic indicators (unemployment, housing prices) should modulate the base grade, especially for concentrated portfolios.
3. **Verification as a Feature, Not a Fix** — Treat the *act* of being flagged for verification as an input to the risk model, not as external assurance.
4. **Mandatory Model Retraining Cadence** — Any scoring model deployed for more than 12 months without retraining on fresh outcomes is operating blind.
5. **Drift Monitoring Dashboard** — Deploy real-time grade-spread and AUC-decay monitoring (as demonstrated in our dashboard) to detect model staleness before it materialises as investor losses.

---

*Built for the Datathon 2026 competition. All analysis reproducible via the included Jupyter notebook and full-stack dashboard.*
