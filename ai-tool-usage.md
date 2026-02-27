# AI Tool Usage Report

> **Datathon 2026 — Transparency Document for Judges**  
> Project: Lending Club — Hidden Risk in "Safe" Grades

---

## Purpose of This Document

This document provides full transparency on **how, where, and why** AI coding assistants were used during this datathon project. We believe responsible AI use accelerates engineering throughput while keeping analytical thinking firmly in human hands.

---

## AI Tool Used

| Attribute | Detail |
|-----------|--------|
| **Tool** | GitHub Copilot (VS Code extension) |
| **Model** | Claude (Anthropic) via Copilot Chat |
| **Mode** | Interactive chat — iterative prompting, review, and refinement |
| **IDE** | Visual Studio Code |

---

## What AI Did vs. What We Did

### Human-Driven (Domain & Analysis)

| Area | Human Contribution |
|------|-------------------|
| **Problem Framing** | Identified that Lending Club's grade system was the central analytical angle — "same label, different risk" |
| **Hypothesis Formation** | Formulated the 5 key findings (grade drift, geographic spread, verification paradox, DTI drift, temporal decay) |
| **Notebook Analysis** | Built the original `TheLending.ipynb` Jupyter notebook with all ML logic, EDA, and statistical analysis |
| **Data Interpretation** | Evaluated model outputs, caught an inaccuracy in temporal decay default rates, and directed the fix |
| **Stat Validation** | Cross-checked every key number (e.g., Grade G 33%→54%, NE 27% vs DC 13%, AUC 0.849→0.655) against notebook outputs |
| **Architectural Decisions** | Chose the tech stack (FastAPI + React + D3 + Three.js), defined endpoint structure, selected chart types for each finding |
| **Quality Review** | Reviewed every generated file, tested endpoints manually, caught data shape mismatches and directed corrections |

### AI-Assisted (Engineering & Implementation)

| Area | AI Contribution |
|------|----------------|
| **Scaffolding** | Generated initial project structure (backend + frontend boilerplate) |
| **Data Pipeline** | Translated notebook's pandas logic into a production-ready loader (`lending_loader.py`) with caching |
| **API Layer** | Generated FastAPI routers and endpoint handlers based on human-specified data contracts |
| **Chart Components** | Produced D3.js chart components from human-provided specifications (axis labels, data shapes, color schemes) |
| **Frontend Pages** | Built React page layouts integrating chart components with Zustand state management |
| **Styling** | Applied Tailwind CSS with glassmorphism theme (navy background, cyan/purple accents) |
| **Bug Fixes** | Assisted in debugging port conflicts, indentation errors, data shape mismatches, and React Router warnings |
| **Documentation** | Generated this document and the solution.md judges' document from human-provided outlines and key stats |

---

## Detailed AI Usage Log

### Phase 1 — Project Scaffolding

**Prompt intent:** "Create a complete Data Analytics & Prediction Dashboard (FastAPI backend + React/Vite/D3/Three.js frontend)"

**AI output:**
- `backend/main.py` — FastAPI app with CORS and lifespan
- `backend/run.py` — Uvicorn launcher
- `backend/requirements.txt` — Dependency list
- `frontend/` — Vite + React + Tailwind boilerplate
- `frontend/vite.config.js` — Dev server with proxy to backend

**Human review:** Approved structure, adjusted port from 8000 → 8001 due to conflict.

---

### Phase 2 — Data Integration

**Prompt intent:** "Integrate all analysis from TheLending.ipynb into the dashboard using the 6 real CSVs"

**AI output (backend/data/):**

| File | Purpose | Lines |
|------|---------|:-----:|
| `lending_loader.py` | Loads & merges 6 CSVs, creates binary default flag, filters for maturity | ~120 |
| `analytics_processor.py` | 9 compute functions for dashboard charts | ~280 |
| `ml_processor.py` | RF training, temporal decay, feature importance, ROC, confusion matrix | ~250 |

**Human review:**
- Verified merge logic matched notebook's positional concat approach
- Confirmed 21 application-only features (no post-origination leakage)
- Caught that temporal decay included years 2007–2008 (pre-training, tiny samples) — directed removal to match notebook's `range(2009, 2016)`
- Caught that default rates were sourced from maturity-filtered subset instead of full closed dataset — directed the fix

---

### Phase 3 — Frontend Charts

**Prompt intent:** "Create D3.js charts for each of the 9 analytics and 5 ML endpoints"

**AI output (frontend/src/components/charts/lending/):**

| Component | Chart Type | D3 Features Used |
|-----------|-----------|-----------------|
| `GradeDriftChart.jsx` | Multi-line | `d3.line()`, `d3.scaleOrdinal()`, legend, tooltips |
| `RateAlignmentChart.jsx` | Scatter + trend | `d3.scaleLinear()`, regression line, tooltips |
| `ProfileDriftChart.jsx` | Dual-metric line | Prop-driven metric switch (DTI / delinquency) |
| `GeographicChart.jsx` | Horizontal bar | Color-coded risk categories, sorted by rate |
| `VerificationChart.jsx` | Grouped bar | Paradox highlight annotation |
| `DriftScoreChart.jsx` | Area | `d3.area()`, grade spread over time |
| `LoanVolumeChart.jsx` | Dual-axis | Count bars + amount line overlay |
| `LoanStatusChart.jsx` | Bar + labels | Percentage annotations, sorted by count |
| `FeatureImportanceChart.jsx` | Horizontal bar | Top 15 features, gradient fill |
| `RocCurveChart.jsx` | Line + fill | AUC area shading, diagonal reference, badge |
| `ConfusionMatrixChart.jsx` | Heatmap | Animated cells, proportional coloring |
| `TemporalDecayChart.jsx` | Dual-axis | AUC line + default rate bars, train/test coloring |

**Human review:** Verified data bindings, axis labels, and visual accuracy against notebook plots.

---

### Phase 4 — Pages & State Management

**AI output:**

| File | What It Does |
|------|-------------|
| `frontend/src/api/index.js` | 16 API functions with 120s timeout |
| `frontend/src/store/useDataStore.js` | Zustand store: 9 analytics + 6 prediction fields, two batch-fetch actions |
| `frontend/src/pages/Dashboard.jsx` | Hero section, 4 stat cards, 9 charts in responsive grid |
| `frontend/src/pages/Prediction.jsx` | Model summary badges, ROC, confusion matrix, feature importance, temporal decay, classification report |
| `frontend/src/pages/Chart3DView.jsx` | Three.js scene: rotating feature cylinders + grade-default spheres |

**Human review:** Tested all pages in browser, verified data flows end-to-end, confirmed responsive layout.

---

### Phase 5 — Debugging & Data Shape Fixes

Multiple rounds of human-identified issues, AI-assisted fixes:

| Issue Identified By | Issue | AI Fix |
|---------------------|-------|--------|
| Human (terminal logs) | Port 8000 occupied by zombie process | Switched to port 8001, updated vite proxy |
| Human (browser console) | React Router v7 deprecation warnings | Added future flags to `<BrowserRouter>` |
| Human (API testing) | Verification endpoint returned wrong shape | Restructured to `{rows: [{status, default_rate, count}]}` |
| Human (API testing) | Drift score endpoint shape mismatch | Restructured to `{rows: [{year, spread, rate_A, rate_G}]}` |
| Human (API testing) | Loan status missing percentages | Added `pct` field to each row |
| Human (API testing) | Feature importance nested incorrectly | Changed to `{features: [{name, importance}]}` |
| Human (chart inspection) | Temporal decay showed 2007–2008 with ~0 samples | Removed pre-training years, matched notebook range |
| Human (chart inspection) | Default rates too low (maturity filter bias) | Switched to full closed dataset for rate computation |

**Key observation:** Every data accuracy issue was **caught by the human** through manual testing and domain knowledge. AI was used to implement the fixes efficiently, but the analytical judgment was human.

---

## Lines of Code Generated

| Layer | Files | Approx. Lines | AI-Generated % |
|-------|:-----:|:-------------:|:--------------:|
| Backend (Python) | 8 | ~750 | ~85% |
| Frontend (JSX/JS) | 18 | ~2,200 | ~90% |
| Config & Docs | 5 | ~350 | ~70% |
| **Total** | **31** | **~3,300** | **~85%** |

> **Note:** "AI-Generated" means the initial code was produced by AI. All code was human-reviewed, and approximately 15–20% was subsequently modified by human direction after review.

---

## What AI Could NOT Do

1. **Formulate the analytical narrative** — The "Hidden Risk in Safe Grades" angle, the 5 key findings, and the causal reasoning (e.g., verification as selection bias) were entirely human-generated from exploring the notebook.

2. **Validate statistical accuracy** — AI produced numbers from code, but the human verified them against the original notebook and caught discrepancies (temporal decay years, default rate source).

3. **Make architectural trade-offs** — The decision to use application-only features (avoiding data leakage), the maturity filter logic, and the choice to train on 2009–2011 were all domain decisions from the notebook analysis.

4. **Judge visual effectiveness** — Which chart type to use for each finding, what color-coding communicates risk, and how to layout the dashboard for narrative flow were human decisions.

5. **Write the analytical interpretation** — Every "Implication →" paragraph in the solution document reflects human reasoning about what the data means for investors and the lending platform.

---

## Ethical Considerations

| Principle | How We Applied It |
|-----------|------------------|
| **Transparency** | This document exists. We do not claim the code was hand-written. |
| **Verification** | Every AI output was tested against real data. No "hallucinated" statistics are in the final product. |
| **No Data Fabrication** | All 2.26M rows come from the actual Lending Club dataset. No synthetic data was generated. |
| **Intellectual Honesty** | The analytical insights predate the AI-assisted dashboard — they were developed in the Jupyter notebook first. |
| **Reproducibility** | The entire pipeline (CSV → backend → API → charts) is deterministic and reproducible. |

---

## Summary

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   HUMAN CONTRIBUTION                                           │
│   ──────────────────                                           │
│   • Problem framing & hypothesis                               │
│   • All statistical analysis (Jupyter notebook)                │
│   • Data accuracy validation & bug identification              │
│   • Architectural & design decisions                           │
│   • Analytical interpretation of findings                      │
│                                                                │
│   AI CONTRIBUTION                                              │
│   ───────────────                                              │
│   • Code generation from human specifications                  │
│   • Boilerplate & scaffolding acceleration                     │
│   • Bug fix implementation (after human identification)        │
│   • Documentation drafting from human-provided outlines        │
│                                                                │
│   RESULT                                                       │
│   ──────                                                       │
│   ~3,300 lines of production code                              │
│   31 files across backend + frontend                           │
│   16 API endpoints, 12 interactive charts, 1 3D scene          │
│   Built in a single session — AI was the accelerator,          │
│   human domain expertise was the engine.                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

*This transparency document is submitted alongside our solution.md and interactive dashboard as part of our Datathon 2026 entry.*
