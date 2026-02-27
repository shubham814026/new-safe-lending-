# DataSphere — Analytics & Prediction Dashboard

> A competition-grade, full-stack analytics dashboard featuring real-time 2D/3D data visualisations, model-drift prediction, and a glassmorphism UI.

![Stack](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/Vite_5-646CFF?style=flat&logo=vite&logoColor=white)
![Stack](https://img.shields.io/badge/D3.js_v7-F9A03C?style=flat&logo=d3.js&logoColor=black)
![Stack](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js)
![Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Stack](https://img.shields.io/badge/TailwindCSS_3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## Features

| Page | Highlights |
|------|-----------|
| **Dashboard** | 4 animated stat cards, Line chart, Area chart, Bar chart, Scatter plot, Heat map — all D3.js with hover tooltips, animations & ResizeObserver |
| **3D View** | Interactive Three.js scene — 3D Scatter, 3D Bars, Surface Plot, Particle Cloud with orbit controls & star background |
| **Predictions** *(hero page)* | Drift timeline (historical + forecast + confidence interval), semicircular gauge, feature-importance 3D bars, severity-coded alert panel |

### Tech Highlights

- **Glassmorphism** design with `backdrop-filter: blur()` cards
- **Framer Motion** page transitions & staggered mounts
- **Zustand** lightweight state management
- **React.lazy** code-splitting for 3D & Prediction pages
- **D3.js v7** — direct SVG rendering with React refs
- **Three.js / @react-three/fiber + drei** — declarative 3D
- **FastAPI** backend generating realistic mock data

---

## Project Structure

```
my-dashboard/
├── backend/
│   ├── data/
│   │   └── mock_data.py          # 10 generator functions
│   ├── models/
│   │   └── schemas.py            # Pydantic response models
│   ├── routers/
│   │   ├── analytics.py          # /api/analytics/* (5 endpoints)
│   │   └── prediction.py         # /api/drift/*     (5 endpoints)
│   ├── main.py                   # FastAPI app + CORS
│   ├── run.py                    # Uvicorn launcher
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/index.js          # Axios client + endpoint helpers
│   │   ├── store/useDataStore.js # Zustand store
│   │   ├── hooks/useFetchData.js # Custom data-fetching hook
│   │   ├── components/
│   │   │   ├── ui/               # StatCard, ChartCard, LoadingSpinner
│   │   │   ├── layout/           # Navbar, Sidebar, DashboardLayout
│   │   │   └── charts/
│   │   │       ├── 2d/           # LineChart, BarChart, ScatterPlot, HeatMap, AreaChart
│   │   │       ├── 3d/           # ScatterPlot3D, BarChart3D, SurfacePlot3D, ParticleCloud3D, FeatureImportance3D
│   │   │       ├── DriftTimeline.jsx
│   │   │       ├── DriftGauge.jsx
│   │   │       └── AlertPanel.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Chart3DView.jsx
│   │   │   └── Prediction.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── Readme.md
```

---

## Quick Start

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| **Python** | 3.9+ |
| **Node.js** | 18+ |
| **npm** | 9+ |

### 1. Clone & navigate

```bash
cd my-dashboard
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
```

The API will start on **http://localhost:8000**.  
Docs at **http://localhost:8000/docs** (Swagger UI).

### 3. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be served on **http://localhost:5173**.

### 4. Open the dashboard

Navigate to **http://localhost:5173** in any modern browser.

---

## API Endpoints

### Analytics (`/api/analytics/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/analytics/timeseries` | 12-month multi-line time-series |
| GET | `/api/analytics/barchart` | Grouped bar chart data |
| GET | `/api/analytics/scatter` | 4-cluster scatter points |
| GET | `/api/analytics/heatmap` | 12 × 8 correlation matrix |
| GET | `/api/analytics/stats` | 4 summary statistics |

### Model Drift (`/api/drift/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/drift/history` | 60-day historical drift |
| GET | `/api/drift/prediction` | 30-day drift forecast + confidence |
| GET | `/api/drift/features` | Per-feature importance & drift |
| GET | `/api/drift/alerts` | Severity-coded alert feed |
| GET | `/api/drift/current` | Current drift score + status |

---

## Design System

| Token | Value |
|-------|-------|
| Background | `#0f172a` (slate-900) |
| Card BG | `rgba(15,23,42,0.6)` + 12 px blur |
| Primary Cyan | `#06b6d4` |
| Primary Purple | `#8b5cf6` |
| Accent Green | `#10b981` |
| Accent Red | `#ef4444` |
| Font | **Space Grotesk** (Google Fonts) |

---

## Scripts

### Backend

```bash
python run.py          # Start FastAPI with hot-reload
```

### Frontend

```bash
npm run dev            # Vite dev server (HMR)
npm run build          # Production build → dist/
npm run preview        # Preview production build
```

---

## Customisation

- **Swap mock data for real data** — Replace generator functions in `backend/data/mock_data.py` with database/API calls; the Pydantic schemas ensure contracts stay intact.
- **Add new charts** — Create a component in `components/charts/2d/` or `3d/`, import it from the relevant page, and wrap it in a `<ChartCard>`.
- **Theming** — Edit `tailwind.config.js` → `extend.colors` and `index.css` root styles.

---

## License

MIT — built for learning & competition use.
