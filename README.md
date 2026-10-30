# UK Wind Forecast & Day-Ahead Trading Dashboard

> An analytics platform and trading decision simulator built for UK electricity utilities procuring wholesale power on the Day-Ahead market (EPEX SPOT / Nord Pool).


---

## Live Deployment & Repository

- **Live Deployed Application**: https://uk-wind-trading-desk-4vzu.onrender.com/
- **Swagger API Documentation**: https://uk-wind-trading-desk-4vzu.onrender.com/docs
- **GitHub Repository**: https://github.com/vikhnesh1/asdafag

---

## 1. Overview & Business Problem

In the UK electricity system, retail energy utilities must balance customer demand with supply. Wind generation offers zero marginal cost power, but its intermittency requires procurement of additional power (thermal plants, peakers, interconnectors) on the wholesale day-ahead market.

### The Day-Ahead Decision Dilemma

- Day-ahead market bids close strictly at **11:00 AM UK time on D-1** (the day prior to delivery).
- Trading desks commit to purchasing power for all 48 half-hour settlement periods of Day D up to **36 hours ahead** based on weather forecast models.
- **Under-forecasting wind**: Leads to over-buying expensive thermal power ("long" position), forcing the utility to spill power at low or negative cashout prices.
- **Over-forecasting wind**: Leads to under-procurement ("short" position), exposing the utility to severe Balancing Mechanism cashout charges (System Buy Price) that can spike to **£500–£2,000+/MWh**.

This dashboard gives trading desks full visibility into:

1. **Latest operational forecasts** versus actual delivery outturn.
2. **Day-Ahead gate closure snapshots** (reconstructing what was visible at 11:00 AM D-1).
3. **Statistical error metrics** (MAE, RMSE, nRMSE, Bias, Max Error) to size reserve margins.

---

## 2. System Architecture

```
[ Browser (React SPA) ]
   ├── Vite + React 18 + React Router
   ├── Ant Design 5 (Light / Dark themes)
   ├── Apache ECharts (interactive time-series, dataZoom, error bands)
   └── TanStack Query v5 (client-side state & caching)
            │
            │ REST API (/api/*) & Static Files
            ▼
[ Backend (FastAPI Web Service) ]
   ├── Python 3.12 + FastAPI + Uvicorn
   ├── SQLAlchemy 2.0 ORM + Pydantic v2 validation
   ├── SQLite Embedded DB (windforecast.db with WAL mode & indexes)
   └── Auto-Seeder (fetches live Elexon BMRS January 2026 data on first boot)
            │
            ▼
[ External: Elexon BMRS Insights API ]
   ├── FUELHH (Half-hourly outturn generation by fuel type: WIND)
   └── WINDFOR (Wind generation forecasts published by National Grid ESO)
```

---

## 3. Data & Metrics Methodology

### Datasets (January 2026 Scope)

- **Actual Outturn (`FUELHH`)**: 1,488 records (31 days × 48 settlement periods). Resolution: 30 minutes.
- **Forecasts (`WINDFOR`)**: 18,104 records published across January 2026 by National Grid ESO. Resolution: Hourly (`:00`), mapped forward to corresponding `:30` half-hour periods.

### Metrics Definitions

- **MAE (Mean Absolute Error)**: $\frac{1}{n}\sum |F_i - A_i|$ (MW) — average volume miss.
- **RMSE (Root Mean Squared Error)**: $\sqrt{\frac{1}{n}\sum (F_i - A_i)^2}$ (MW) — heavily penalizes large forecast outliers.
- **nRMSE (Normalized RMSE)**: $\text{RMSE} / 30,000\text{ MW}$ — normalized against the ~30 GW UK wind fleet.
- **Bias (Mean Error)**: $\frac{1}{n}\sum (F_i - A_i)$ (MW) — indicates systematic over-prediction ($>0$) or under-prediction ($<0$).
- **MAPE is intentionally omitted**: Wind generation drops to near-zero levels during lulls, causing percentage errors ($|F-A|/A$) to explode toward infinity ($>500\%$) and distorting monthly performance.

---

## 4. Quick Start Guide

### Option A: Run with Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/example/wind-forecast-dashboard.git
cd wind-forecast-dashboard

# Start backend, frontend, and automated database seeder
docker-compose up --build
```

- **Frontend**: Open `http://localhost:3001`
- **Backend API & Swagger UI**: Open `http://localhost:8000/docs`

---

### Option B: Local Native Development

#### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run automated seeder (fetches January 2026 data from Elexon)
python3 seed_data.py

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

#### 2. Frontend Setup

```bash
# Navigate to frontend (in a separate terminal)
cd frontend

# Install packages
npm install

# Start Vite dev server with proxy to backend
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 5. API Reference

| Endpoint                      | Method | Description                                                            |
| ----------------------------- | ------ | ---------------------------------------------------------------------- |
| `/api/overview`               | `GET`  | Executive KPIs (MWh generation, MAE, RMSE, bias) and monthly sparkline |
| `/api/actuals`                | `GET`  | Filterable half-hourly wind actual outturn time series                 |
| `/api/forecasts`              | `GET`  | Filterable wind forecasts for delivery target periods                  |
| `/api/forecast-vs-actual`     | `GET`  | Paired time series with signed error and error bands                   |
| `/api/accuracy-metrics`       | `GET`  | Statistical evaluation metrics (MAE, RMSE, nRMSE, Bias, Max Error)     |
| `/api/accuracy-metrics/daily` | `GET`  | Day-by-day error metrics for heatmaps and distribution charts          |
| `/api/day-ahead-view`         | `GET`  | Day-Ahead market view using forecasts published prior to 11:00 D-1     |
| `/api/data-export`            | `GET`  | Stream complete January 2026 paired dataset as CSV download            |
| `/docs`                       | `GET`  | Interactive Swagger UI API documentation                               |

---

## 6. Project Structure & Directory Breakdown

```
.
├── Dockerfile                    # Root multi-stage build for unified cloud deployment on Render
├── docker-compose.yml            # Multi-container local orchestration (backend :8000, frontend :3001)
├── backend/
│   ├── config.py                 # Application settings, SQLite path, and CORS origins
│   ├── database.py               # SQLAlchemy 2.0 engine, SessionLocal, and DB init
│   ├── Dockerfile                # Backend container definition
│   ├── main.py                   # FastAPI app instance, CORS middleware, and router mounts
│   ├── models.py                 # SQLAlchemy declarative models (ActualGeneration, WindForecast)
│   ├── requirements.txt          # Python dependencies (FastAPI, SQLAlchemy, Requests, Uvicorn)
│   ├── schemas.py                # Pydantic validation schemas for API responses
│   ├── seed_data.py              # Automated Elexon BMRS API ingest for January 2026 (FUELHH & WINDFOR)
│   ├── routers/
│   │   ├── accuracy.py           # Quantitative error metrics, daily breakdown, and correlation data
│   │   ├── actuals.py            # Half-hourly actual outturn time series endpoints
│   │   ├── comparison.py         # Paired forecast vs actual comparison with signed errors
│   │   ├── day_ahead.py          # Day-Ahead point-in-time view (filtered <= 11:00 UTC D-1)
│   │   ├── export.py             # CSV streaming export of January 2026 dataset
│   │   ├── forecasts.py          # Forecast time series endpoints
│   │   └── overview.py           # Executive KPIs and monthly trend summary
│   └── services/
│       ├── data_service.py       # SQL window functions joining hourly forecasts with half-hourly actuals
│       └── metrics.py            # Vectorized calculation of MAE, RMSE, nRMSE, Bias, and Max Error
├── frontend/
│   ├── Dockerfile                # Frontend Docker container definition
│   ├── index.html                # HTML5 entry point with responsive viewport metadata
│   ├── package.json              # React 18, Ant Design 5, ECharts, and TanStack Query dependencies
│   ├── vite.config.js            # Vite build configuration and local API proxy
│   └── src/
│       ├── main.jsx              # React DOM root render
│       ├── App.jsx               # Client routes, theme provider, and QueryClient setup
│       ├── index.css             # Design tokens, color system, and layout resets
│       ├── api/
│       │   └── client.js         # Centralized Axios HTTP client with unified error handling
│       ├── components/
│       │   ├── Common/           # Reusable UI widgets (ErrorAlert, KpiCard, PageHeader)
│       │   └── Layout/           # AppLayout shell, Header, and Sidebar navigation
│       ├── context/
│       │   └── ThemeContext.jsx  # Dark/Light theme toggle context with local storage persistence
│       ├── hooks/
│       │   └── useTradingData.js # TanStack Query hooks for caching and fetching backend endpoints
│       └── pages/
│           ├── Overview.jsx           # Executive overview with fleet KPIs and generation curve
│           ├── ForecastComparison.jsx # Interactive side-by-side forecast vs actual with error bands
│           ├── AccuracyAnalytics.jsx  # Quantitative evaluation: MAE, RMSE, Bias, and error distribution
│           ├── DayAheadTrading.jsx    # Day-Ahead decision view with point-in-time 11:00 D-1 cutoff
│           └── DataExplorer.jsx       # Tabular data grid with settlement period filtering and CSV export
├── docs/
│   ├── specs.md                  # Detailed business requirements and trading domain context
│   ├── architecture.md           # End-to-end technical architecture and data flow diagrams
│   ├── plan.md                   # Multi-phase execution and milestones roadmap
│   ├── conventions.md            # Coding conventions and production standards
│   └── design-conventions.md     # UI/UX design tokens and component specifications
└── README.md                     # Comprehensive setup guide, architecture, and API reference
```
