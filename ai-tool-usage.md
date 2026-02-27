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


frontend prompt 

You are a world-class full-stack developer and data visualisation expert 
specialising in React, D3.js, Three.js, and FastAPI. You are building a 
competition-winning Data Analytics & Prediction Dashboard for a datathon.

Before writing a single line of code, you must first scan and analyse 
all provided files completely. This is mandatory.
PHASE 0 — FILE SCANNING (DO THIS FIRST, BEFORE ANY CODE)
═══════════════════════════════════════════════════════════

All PNG files and Jupyter Notebook files are already present in the 
same folder as this prompt. You have direct access to all of them.

Do the following immediately:

STEP A — Scan every PNG/image file in the folder:
- Open and examine every .png and .jpg file you find
- Identify every chart type visible in each image
- Note exact colors, layouts, axis labels, legends, titles
- Note any special features: confidence bands, threshold lines,
  warning zones, annotations, drift markers
- Note the overall UI style if any mockups are present
- Build a complete numbered list of every chart found

STEP B — Scan every Jupyter Notebook (.ipynb) in the folder:
- Read every code cell and markdown cell completely
- Extract: dataset column names, data types, value ranges, 
  number of rows
- Extract: every model used (name, algorithm, hyperparameters)
- Extract: every metric computed (accuracy, F1, drift score, 
  confidence, etc.) with their exact values
- Extract: all feature names exactly as written in the notebook
- Extract: any thresholds or business rules defined
- Extract: the prediction output format and value range
- Extract: any drift analysis findings and their timeline
- Note every visualisation already created in the notebook
  (each one must be recreated in the dashboard)

STEP C — Output a complete scan summary in this format:

  ══════════════════════════════════════
  SCAN COMPLETE — HERE IS WHAT I FOUND:
  ══════════════════════════════════════

  PNG FILES FOUND:
  - [filename.png]: [chart type] — [description of what it shows]
  - [filename.png]: [chart type] — [description of what it shows]
  ... list every file

  CHARTS TO BUILD (from PNGs):
  1. [Chart name] — [2D type] + [3D counterpart]
  2. [Chart name] — [2D type] + [3D counterpart]
  ... list every chart

  JUPYTER NOTEBOOKS FOUND:
  - [filename.ipynb]: [what analysis it contains]

  DATASET:
  - Rows: [number]
  - Columns: [list all column names]
  - Target variable: [name]
  - Feature names: [list all]

  MODEL:
  - Name: [model name]
  - Algorithm: [algorithm]
  - Accuracy: [exact value from notebook]
  - Other metrics: [list all with values]
  - Drift score: [value if present]

  THRESHOLDS:
  - [metric]: [threshold value]
  ... list all

  VISUALISATIONS IN NOTEBOOK:
  1. [description]
  2. [description]
  ... list all

  QUESTIONS BEFORE I START (if any):
  Q1. [question]
  Q2. [question]
  ... or write "No questions. Ready to build."

  ══════════════════════════════════════

Wait for confirmation before proceeding to Phase 1.
If no questions, state "Starting Phase 1 now." and begin immediately.
═══════════════════════════════════════════
PHASE 1 — TECH STACK
═══════════════════════════════════════════

Frontend:
- React 18 + Vite
- D3.js v7 (all 2D charts)
- Three.js + @react-three/fiber + @react-three/drei (all 3D charts)
- Tailwind CSS (all styling)
- Framer Motion (page transitions + chart animations)
- React Router DOM v6 (routing)
- Axios (API calls)
- Zustand (global state management)
- Google Fonts: Space Grotesk

Backend:
- FastAPI (Python)
- Uvicorn
- CORS middleware (allow http://localhost:5173)
- Pydantic v2 (data validation)
- pandas + numpy (data processing from notebook logic)
- scikit-learn (if model inference needed)
- All data sourced from the Jupyter Notebook analysis
- Hardcoded/processed mock data mirroring actual notebook datasets

═══════════════════════════════════════════
PHASE 2 — PROJECT STRUCTURE
═══════════════════════════════════════════

Create this exact folder structure:

my-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── 2d/
│   │   │   │   │   ├── LineChart.jsx
│   │   │   │   │   ├── BarChart.jsx
│   │   │   │   │   ├── ScatterPlot.jsx
│   │   │   │   │   ├── HeatMap.jsx
│   │   │   │   │   ├── AreaChart.jsx
│   │   │   │   │   └── [ANY ADDITIONAL CHARTS FROM PNG SCANS]
│   │   │   │   └── 3d/
│   │   │   │       ├── ScatterPlot3D.jsx
│   │   │   │       ├── BarChart3D.jsx
│   │   │   │       ├── SurfacePlot3D.jsx
│   │   │   │       ├── ParticleCloud3D.jsx
│   │   │   │       └── [ANY ADDITIONAL 3D CHARTS FROM PNG SCANS]
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── DashboardLayout.jsx
│   │   │   └── ui/
│   │   │       ├── StatCard.jsx
│   │   │       ├── ChartCard.jsx
│   │   │       └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Chart3DView.jsx
│   │   │   └── Prediction.jsx
│   │   ├── store/
│   │   │   └── useDataStore.js
│   │   ├── hooks/
│   │   │   └── useFetchData.js
│   │   ├── api/
│   │   │   └── index.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── backend/
    ├── main.py
    ├── routers/
    │   ├── analytics.py
    │   └── prediction.py
    ├── models/
    │   └── schemas.py
    └── data/
        └── mock_data.py

NOTE: After scanning PNGs and notebooks, if additional chart types 
are found that are not listed above, create new component files for 
them and add them to the structure. Tell me every new file you add.

═══════════════════════════════════════════
PHASE 3 — BACKEND (FastAPI)
═══════════════════════════════════════════

mock_data.py rules:
- All data must come from what was found in the Jupyter Notebooks
- Use the EXACT same column names, feature names, and value ranges 
  found in the notebooks
- Use the EXACT same model metrics (accuracy, precision, recall, F1, 
  drift scores) found in the notebooks
- If the notebook shows accuracy of 91.3%, use 91.3% not a random number
- If the notebook has 8 features, create data for those exact 8 features
- The data must tell the same story as the notebook analysis
- Drift narrative: reflect the actual drift pattern found in notebook
  (if notebook shows drift, replicate that timeline accurately)

Endpoints — Analytics:
GET /api/analytics/timeseries
  Returns: { lines: [{ name, color, data: [{ x, y }] }] }
  Data: from notebook time series analysis

GET /api/analytics/barchart  
  Returns: { categories: [], groups: [{ name, color, values: [] }] }
  Data: from notebook categorical analysis

GET /api/analytics/scatter
  Returns: { points: [{ x, y, z, cluster, label, ...features }] }
  Data: from notebook clustering or feature analysis
  Include ALL feature columns from notebook as extra fields

GET /api/analytics/heatmap
  Returns: { rows: [], cols: [], matrix: [[]] }
  Data: correlation matrix or confusion matrix from notebook

GET /api/analytics/stats
  Returns: { 
    totalDataPoints, modelAccuracy, driftScore, confidence,
    trends: { accuracy: "up/down", drift: "up/down" }
  }
  Data: real metrics from notebook

GET /api/analytics/[any additional endpoints needed for PNG charts]

Endpoints — Drift & Prediction:
GET /api/drift/history
  Returns: { days: [{ date, accuracy, driftScore, threshold }] }
  60 days of history matching notebook findings

GET /api/drift/prediction
  Returns: { 
    days: [{ date, predictedAccuracy, upperBound, lowerBound }]
  }
  30 days of prediction with confidence intervals

GET /api/drift/features
  Returns: { features: [{ name, driftScore, importance, status }] }
  Use EXACT feature names from notebook

GET /api/drift/alerts
  Returns: { alerts: [{ id, severity, message, timestamp, feature }] }
  Alerts must reference actual features and metrics from notebook

GET /api/drift/current
  Returns: { 
    driftScore, status, modelName, modelVersion, 
    lastTrained, accuracy, totalPredictions 
  }
  All values from notebook

═══════════════════════════════════════════
PHASE 4 — DESIGN SYSTEM
═══════════════════════════════════════════

IMPORTANT: If the PNG files show a specific color scheme or design,
use that as the PRIMARY reference. If no design is shown in PNGs,
use this default system:

Colors:
- Background: #0f172a
- Card bg: rgba(15, 23, 42, 0.6)
- Accent cyan: #06b6d4
- Accent purple: #8b5cf6
- Success green: #10b981
- Warning amber: #f59e0b
- Danger red: #ef4444
- Text primary: #f1f5f9
- Text secondary: #94a3b8
- Border: rgba(148, 163, 184, 0.1)

Glassmorphism card style (apply to ALL cards):
  background: rgba(15, 23, 42, 0.6)
  border: 1px solid rgba(148, 163, 184, 0.15)
  backdrop-filter: blur(12px)
  border-radius: 16px
  box-shadow: 0 4px 24px rgba(0,0,0,0.3)

Font: Space Grotesk (import from Google Fonts in index.html)

Micro-interactions:
- Every card: scale(1.02) on hover with 200ms ease transition
- Every button: brightness(1.2) on hover + box-shadow glow
- Every chart: smooth D3 transitions on data update (600ms ease)
- Every 3D object: scale spring animation on hover

═══════════════════════════════════════════
PHASE 5 — CHART IMPLEMENTATION RULES
═══════════════════════════════════════════

CRITICAL RULE FOR ALL CHARTS:
The 2D charts must match the PNG designs EXACTLY.
The 3D charts must be the immersive 3D version of the same data.
The same dataset powers both 2D and 3D views.

──────────────────────────────────────────
2D CHARTS (D3.js) — General Rules:
──────────────────────────────────────────

Every D3 chart component must:
- Use useRef for the SVG container (never useState for D3 internals)
- Use useEffect for D3 rendering, with cleanup on unmount
- Use ResizeObserver for responsive resizing (redraw on container resize)
- Use useMemo for all scale computations
- Use useCallback for all event handlers
- Accept data as props (data, width, height, options)
- Emit smooth transitions (600ms) when props.data changes
- Have a complete tooltip (div positioned absolutely, 
  styled with glassmorphism, shows on mousemove, hides on mouseleave)
- Have proper axis labels matching column names from notebook
- Animate on first load

LineChart.jsx:
- Recreate exactly as shown in PNG (if PNG exists for this chart)
- Multi-line support with D3 curveMonotoneX
- Stroke-dasharray animation drawing lines on load
- Historical lines solid, predicted lines dashed
- Confidence interval as shaded area with opacity 0.15
- Crosshair tooltip following mouse: vertical + horizontal lines
  with dots on each line at intersection
- Legend clickable to toggle lines on/off
- Threshold/warning zones as colored rect backgrounds if in notebook
- Zoom + pan with D3 zoom (double-click to reset)

BarChart.jsx:
- Recreate exactly as shown in PNG (if PNG exists for this chart)
- Grouped or stacked based on what PNG shows
- Bars animate from height 0 upward on load (800ms)
- Color per group matching PNG or design system
- Value labels on top of bars (appear after bar animation completes)
- Hover: bar brightens + tooltip + slight scale up
- D3 transition on data update (bars smoothly resize)

ScatterPlot.jsx:
- Recreate exactly as shown in PNG (if PNG exists for this chart)
- Dots colored by cluster/category
- Dot radius = third variable (if 3 variables in data)
- D3 brush: drag to select region, selected dots highlighted,
  unselected dots fade to opacity 0.2
- D3 zoom + pan
- Hover tooltip with ALL data fields from notebook
- Animated entrance: dots scale from 0 to full size staggered

HeatMap.jsx:
- Recreate exactly as shown in PNG (if PNG exists for this chart)
- Could be correlation matrix, confusion matrix, or calendar heatmap
  (determine from notebook and PNG)
- D3 scaleSequential color scale
- Color legend bar on right side
- Hover: cell brightens + tooltip with row name, col name, value
- Cell values shown as text inside each cell (if cells are large enough)
- Animate: cells fade in row by row with stagger delay

AreaChart.jsx:
- Recreate exactly as shown in PNG (if PNG exists for this chart)
- Stacked or overlapping based on PNG
- SVG linearGradient fill (top: full color, bottom: transparent)
- Hover: vertical line snaps to nearest data point + tooltip
- Smooth path transition on data update

[ADDITIONAL CHARTS FROM PNG SCAN]:
- After scanning PNGs, if you find chart types not listed above
  (e.g. radar chart, box plot, violin plot, pie/donut, funnel, etc.)
  build each one as its own component matching the PNG exactly
- Name the file clearly: RadarChart.jsx, BoxPlot.jsx, etc.

──────────────────────────────────────────
3D CHARTS (Three.js) — General Rules:
──────────────────────────────────────────

Every 3D chart must:
- Use @react-three/fiber Canvas component
- Use @react-three/drei OrbitControls, Text, Grid, Stars
- Accept same data as its 2D counterpart (same props shape)
- Have axis lines built with CylinderGeometry
- Have floating axis labels with drei Text
- Have a star field background using drei Stars component
- Dispose all geometries and materials in useEffect cleanup
- Use useFrame for animations
- Use @react-three/drei useSpring or react-spring for entrance animations

ScatterPlot3D.jsx:
- Same data as ScatterPlot.jsx but in 3D space
- Each point = SphereGeometry radius 0.12
- MeshStandardMaterial metalness 0.3 roughness 0.2
- Color by cluster matching 2D colors
- Raycasting for hover detection:
  Hovered sphere → scale 2x with spring + emissive glow + pointLight
- Click sphere → side drawer slides in (React portal) showing all 
  data fields for that point from notebook
- Entrance: all spheres start at origin, spring to their positions 
  with staggered delay (i * 15ms)
- Three axis cylinders + Text labels for X Y Z

BarChart3D.jsx:
- Same data as BarChart.jsx but in 3D
- BoxGeometry for each bar, width 0.7, depth 0.7
- Height mapped from data value using linear scale
- MeshStandardMaterial with emissiveIntensity 0.2
- Bars animate rising from Y=0 with spring stagger
- drei Grid on floor XZ plane
- drei Text labels below each bar on X axis
- Value label floating above each bar using drei Text
- Hover: emissiveIntensity → 0.6 + slight Y scale bounce

SurfacePlot3D.jsx:
- 20x20 PlaneGeometry rotated flat
- Each vertex displaced by Z value from data (prediction surface)
- vertexColors: build Float32Array of RGB values per vertex,
  mapped from value using purple→red gradient
- Wireframe toggle: button outside Canvas, state controls 
  material.wireframe
- useFrame: gentle breathing animation (vertices oscillate ±0.05)
- Represents model confidence or prediction probability surface

ParticleCloud3D.jsx:
- 2000+ particles using Points + BufferGeometry
- BufferAttribute for positions + colors
- Custom ShaderMaterial:
  vertexShader: gl_PointSize based on distance
  fragmentShader: circular points with soft edge glow
- Particles colored by distance from center (cyan center → purple edge)
- useFrame: entire cloud rotates slowly on Y axis (0.002 rad/frame)
- Hover cloud: speed increases to 0.008 for 2 seconds then returns

[ADDITIONAL 3D CHARTS FROM PNG SCAN]:
- For every additional 2D chart found in PNGs, build its 3D counterpart
- Each 3D chart must represent the same dataset as its 2D version
- Name convention: [ChartType]3D.jsx

──────────────────────────────────────────
2D → 3D TRANSITION
──────────────────────────────────────────

Every ChartCard has a "View in 3D 🔮" button top-right.
On click:
1. Framer Motion: current chart card scales to 1.1 + opacity 0 (300ms)
2. Full page Framer Motion exit: scale(0.95) + opacity 0 (400ms)
3. Navigate to /3d-view with chart type stored in Zustand
4. 3D page Framer Motion enter: scale(1.05→1) + opacity(0→1) (500ms)
5. 3D chart animates in (spheres/bars spring up etc.)

Back button on 3D page:
1. Reverse the transition
2. Navigate back to Dashboard
3. Dashboard Framer Motion enter from left side

═══════════════════════════════════════════
PHASE 6 — PAGES
═══════════════════════════════════════════

──────────────────────────────────────────
Dashboard.jsx (Page 1 — Main 2D Overview)
──────────────────────────────────────────

Layout (CSS Grid):
Row 1: 4 StatCards (equal width)
Row 2: LineChart (65%) | AreaChart (35%)
Row 3: BarChart (45%) | ScatterPlot (55%)
Row 4: HeatMap (full width)
Row 5+: Any additional charts found in PNGs

StatCards — 4 cards:
Card 1: Total Data Points (from notebook dataset size)
Card 2: Model Accuracy % (from notebook metrics)
Card 3: Drift Score (from notebook drift analysis)
Card 4: Prediction Confidence % (from notebook)

Each StatCard:
- Animated count-up number on load (2 second duration)
- Trend arrow: up (green) or down (red) with % change
- Small sparkline (5-point mini line chart using D3) showing 
  recent trend
- Icon relevant to the metric
- Subtle gradient overlay matching accent color
- Pulse animation on the icon

──────────────────────────────────────────
Chart3DView.jsx (Page 2 — 3D Immersive)
──────────────────────────────────────────

- Full viewport black canvas
- Top bar (floating, glassmorphism): 
  Left: Back button | Center: Chart name | Right: Chart type tabs
- Chart type tabs: one tab per 3D chart type
  (Scatter 3D | Bars 3D | Surface | Particles | [others from PNGs])
- Clicking tab swaps the 3D scene with Framer Motion crossfade
- OrbitControls active on all scenes
- Starfield always present as background
- Performance: only ONE scene renders at a time, others are unmounted

──────────────────────────────────────────
Prediction.jsx (Page 3 — Model Drift)
──────────────────────────────────────────

This is the most important page. Make it dramatic.

Header section:
- Full width gradient banner: dark navy to deep purple
- Title: "Model Drift Analysis & Prediction"
  Animated gradient text (cyan → purple → cyan loop)
- Subtitle showing model name + version from notebook
- Three quick stat badges: Current Accuracy | Drift Score | Status

Main layout:
Left column (65%):
  1. DriftTimeline (D3) — full width of column, tall
  2. FeatureImportance3D (Three.js) — full width of column

Right column (35%):
  1. DriftGauge (D3) — centered at top
  2. AlertPanel — scrollable list below gauge

DriftTimeline.jsx (D3):
- Historical data: solid cyan line (60 days from notebook)
- Predicted data: dashed purple line (30 days)
- Confidence band: shaded area around predicted line
- Warning zone: horizontal red band rect when accuracy < threshold
  (use exact threshold from notebook if defined)
- "TODAY" vertical dashed white line at day 60
- Animation sequence:
  1. Axes draw in (500ms)
  2. Historical line draws left to right (1500ms)
  3. Warning zones fade in (300ms)
  4. Today marker appears with a label drop animation (300ms)
  5. Predicted line draws left to right (1000ms)
  6. Confidence band fades in (500ms)
- Hover tooltip: date + actual accuracy + drift score + 
  predicted value (if in prediction zone)
- Annotations: small text labels at notable drift events
  (e.g. "Feature X shifted here" if notebook shows this)

DriftGauge.jsx (D3):
- D3 arc semicircle (180 degrees)
- Three zones with exact thresholds from notebook:
  Green: SAFE zone
  Yellow: WARNING zone  
  Red: CRITICAL zone
- Thin needle with drop shadow sweeping to current value
  with spring animation (overshoot slightly then settle)
- Bold large number in center (exact drift score from notebook)
- Status pill badge below: SAFE (green) / WARNING (amber) / 
  CRITICAL (red) with matching glow
- Outer ring decoration with tick marks every 10 units

FeatureImportance3D.jsx (Three.js):
- USE EXACT FEATURE NAMES from Jupyter Notebook
- 3D bars one per feature, arranged in arc or straight line
- Color: green → yellow → red based on drift importance
- Feature name labels: drei Text floating above each bar
- Drift score labels: drei Text at top of each bar
- Scene auto-rotates slowly (useFrame, 0.003 rad/frame)
- Click anywhere on canvas: toggle rotation pause/resume
- Bars animate up on mount with staggered spring
- Ambient + directional + colored point lights

PredictionConfidenceSurface.jsx (Three.js):
- 20x20 grid using PlaneGeometry
- Z values from model confidence data (from notebook)
- vertexColors: purple (high confidence) → orange → red (low confidence)
- Wireframe toggle button
- Gentle wave animation using useFrame (sin wave over time)
- Camera positioned at 45 degree angle to show surface well
- Grid helper on floor for reference

AlertPanel.jsx:
- Glassmorphism panel with custom scrollbar
- Alert card per item with:
  - Left colored border (green/amber/red by severity)
  - Severity badge pill
  - Feature name that triggered alert (from notebook features)
  - Metric value that triggered alert
  - Timestamp
  - Short description
- Critical alerts: pulse animation on border glow
- Alerts slide in from right with staggered framer motion delay
- "Clear All" button at top right of panel
- Alert count badge on panel header

═══════════════════════════════════════════
PHASE 7 — LAYOUT COMPONENTS
═══════════════════════════════════════════

Navbar.jsx:
- Height: 64px, position: fixed top
- Left: SVG logo (animated data waveform) + "DataSphere" gradient text
- Center: navigation links 
  Dashboard | 3D View | Predictions
  Active: cyan underline + subtle glow text-shadow
  Hover: color transition 300ms
- Right:
  - "Updated: [timestamp]" in muted text
  - Refresh button: circular arrow, spins 360° while loading
  - Status indicator: pulsing green dot + "LIVE" badge

Sidebar.jsx:
- Width: 280px collapsed to 60px
- Toggle arrow button on right edge
- Sections:
  1. Dataset Selector dropdown (Dataset A / B / C for now)
  2. Date Range (visual only, hardcoded range for now)
  3. Model Info card:
     - Model name (from notebook)
     - Algorithm (from notebook)
     - Version number
     - "Deployed" status badge
     - Last trained: X days ago
     - Performance: animated progress bar at accuracy %
  4. Quick stats: 3 small numbers with labels

DashboardLayout.jsx:
- Wraps all pages
- Renders Navbar + Sidebar + children
- Main content: margin-left matching sidebar width
  (animates when sidebar collapses)
- Background: #0f172a with subtle dot grid pattern overlay

═══════════════════════════════════════════
PHASE 8 — STATE & DATA FLOW
═══════════════════════════════════════════

useDataStore.js (Zustand):
{
  // Data
  analyticsData: {
    timeseries: null,
    barchart: null,
    scatter: null,
    heatmap: null,
    stats: null,
    [any additional from PNGs]: null
  },
  driftData: {
    history: null,
    prediction: null,
    features: null,
    alerts: null,
    current: null
  },
  
  // UI State
  selectedChart: null,        // which chart → 3D view
  sidebarCollapsed: false,
  activeAlerts: [],
  lastUpdated: null,
  isLoading: false,
  errors: {},
  
  // Actions
  fetchAllAnalytics(),        // Promise.all all analytics endpoints
  fetchAllDrift(),            // Promise.all all drift endpoints
  fetchAll(),                 // calls both above
  setSelectedChart(type),
  toggleSidebar(),
  clearAlert(id),
  clearAllAlerts()
}

useFetchData.js (custom hook):
- Params: (url, options = { interval: 0, immediate: true })
- Returns: { data, loading, error, refetch }
- Auto-refresh if interval > 0 (setInterval)
- Cleans up interval on unmount
- Cancels in-flight requests on unmount using AbortController

api/index.js:
- All Axios calls centralised here
- Base URL: http://localhost:8000
- Request/response interceptors for error handling
- Functions:
  fetchTimeseries(), fetchBarchart(), fetchScatter(),
  fetchHeatmap(), fetchStats(),
  fetchDriftHistory(), fetchDriftPrediction(),
  fetchDriftFeatures(), fetchDriftAlerts(), fetchDriftCurrent()
  [plus any additional endpoints from PNG/notebook scan]

═══════════════════════════════════════════
PHASE 9 — PERFORMANCE & CODE QUALITY
═══════════════════════════════════════════

React optimisations:
- React.lazy + Suspense on Chart3DView and Prediction pages
- React.memo on ALL chart components
- useMemo on ALL D3 scale computations and data transformations
- useCallback on ALL D3 event handlers and Three.js callbacks
- Avoid re-renders: only update Zustand slices, not full store

D3 optimisations:
- NEVER use React state inside D3 render logic
- Use useRef for all SVG DOM references
- useEffect dependency array must be precise
- D3 update pattern: enter/update/exit properly implemented

Three.js optimisations:
- useEffect cleanup: geometry.dispose(), material.dispose()
- Only render active scene (unmount inactive 3D components)
- Use instanced mesh for particle systems (InstancedMesh)
- Limit useFrame computations (skip frames if possible)

Code quality:
- JSDoc comments on every component and function
- PropTypes or TypeScript-style prop documentation in comments
- Consistent naming: PascalCase components, camelCase functions
- No inline styles (all Tailwind classes or CSS modules)
- Error boundaries around all Three.js canvas components

═══════════════════════════════════════════
PHASE 10 — BUILD ORDER (FOLLOW EXACTLY)
═══════════════════════════════════════════

Execute in this exact sequence:

STEP 1:  Scan all files (PNGs + Notebooks). Output summary.
STEP 2:  Ask clarifying questions if any. Wait for answers.
STEP 3:  backend/data/mock_data.py (data from notebook)
STEP 4:  backend/models/schemas.py (Pydantic models)
STEP 5:  backend/routers/analytics.py
STEP 6:  backend/routers/prediction.py
STEP 7:  backend/main.py
STEP 8:  frontend/index.html (Google Fonts + meta tags)
STEP 9:  frontend/vite.config.js
STEP 10: frontend/tailwind.config.js
STEP 11: frontend/src/index.css (global styles + custom scrollbar)
STEP 12: frontend/src/main.jsx
STEP 13: frontend/src/api/index.js
STEP 14: frontend/src/store/useDataStore.js
STEP 15: frontend/src/hooks/useFetchData.js
STEP 16: frontend/src/components/ui/LoadingSpinner.jsx
STEP 17: frontend/src/components/ui/StatCard.jsx
STEP 18: frontend/src/components/ui/ChartCard.jsx
STEP 19: frontend/src/components/layout/Navbar.jsx
STEP 20: frontend/src/components/layout/Sidebar.jsx
STEP 21: frontend/src/components/layout/DashboardLayout.jsx
STEP 22: All 2D D3 chart components (one by one, fully complete)
STEP 23: All 3D Three.js chart components (one by one, fully complete)
STEP 24: frontend/src/pages/Dashboard.jsx
STEP 25: frontend/src/pages/Chart3DView.jsx
STEP 26: frontend/src/pages/Prediction.jsx
STEP 27: frontend/src/App.jsx
STEP 28: README.md

After STEP 28, output:
──────────────────────────────────
SETUP COMMANDS:

Backend:
  cd backend
  pip install fastapi uvicorn pydantic pandas numpy scikit-learn
  uvicorn main:app --reload --port 8000

Frontend:
  cd frontend
  npm install
  npm run dev

Open: http://localhost:5173
──────────────────────────────────

═══════════════════════════════════════════
PHASE 11 — CRITICAL INSTRUCTIONS FOR YOU
═══════════════════════════════════════════

1. NEVER truncate any file. Write every file completely.
   If a component is 300 lines, write all 300 lines.

2. NEVER use placeholder comments like:
   "// add chart logic here"
   "// TODO: implement this"
   "// rest of the code..."
   Write the actual complete working code every time.

3. ALWAYS label files clearly:
   === FILE: frontend/src/components/charts/2d/LineChart.jsx ===

4. After completing each file, announce the next file:
   "Next: [filename]"

5. If your response is getting long and you are near the end,
   COMPLETE the current file before stopping.
   Then say: "PAUSED. Type 'continue' to proceed to next file."

6. The PNG designs are LAW. If a PNG shows a chart, 
   your D3/Three.js implementation must match it visually.
   Colors, layout, labels, annotations — all must match.

7. The Jupyter Notebook data is LAW. 
   All metrics, feature names, column names, thresholds, 
   model names — must come from the notebook.
   Do not invent values that contradict the notebook.

8. When you have questions, ask ALL of them at once in Phase 0.
   Do not ask questions mid-build.

9. This is for a datathon competition. Judges will evaluate:
   - Visual quality and design polish
   - Accuracy of data representation
   - Interactivity and user experience
   - Technical implementation quality
   Build accordingly. Make it exceptional.

10. If the PNG files show anything you have not seen before
    (unusual chart types, custom visualisations, special features),
    describe what you see and propose how to implement it 
    before writing any code for that component.


    