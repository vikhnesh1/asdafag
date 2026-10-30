# System Architecture

> **Project**: Wind Forecast Dashboard
> **Version**: 1.0.0

---

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph "Browser"
        SPA["React SPA<br/>Vite + Ant Design + ECharts"]
    end

    subgraph "Render.com — Single Web Service"
        FASTAPI["FastAPI Application"]
        STATIC["Static File Server<br/>(serves React build)"]
        SQLITE[("SQLite<br/>windforecast.db")]
    end

    subgraph "External"
        ELEXON["Elexon BMRS API"]
    end

    SPA -->|"GET /api/*"| FASTAPI
    SPA -->|"GET /*"| STATIC
    FASTAPI -->|"Read/Write"| SQLITE
    ELEXON -->|"One-time seed<br/>(startup)"| FASTAPI
```

### Design Principles

| Principle | Application |
|---|---|
| **Single Responsibility** | Each backend router handles one resource; each React component does one thing |
| **Separation of Concerns** | Business logic in `services/`, data access in `database.py`, API layer in `routers/` |
| **Convention over Configuration** | Standardized file naming, folder structure, and API patterns |
| **Same-Origin Serving** | FastAPI serves both API and React build — no CORS needed |
| **Fail-Fast Seeding** | App checks for DB on startup; seeds automatically if missing |

---

## 2. Backend Architecture

### 2.1 Layer Diagram

```mermaid
graph TD
    subgraph "API Layer (routers/)"
        R1["overview.py"]
        R2["actuals.py"]
        R3["forecasts.py"]
        R4["comparison.py"]
        R5["accuracy.py"]
        R6["day_ahead.py"]
        R7["export.py"]
    end

    subgraph "Service Layer (services/)"
        S1["data_service.py"]
        S2["metrics.py"]
    end

    subgraph "Data Layer"
        DB["database.py<br/>(SQLAlchemy engine)"]
        M["models.py<br/>(ORM models)"]
        SC["schemas.py<br/>(Pydantic schemas)"]
    end

    subgraph "Infrastructure"
        CONF["config.py<br/>(Settings)"]
        SEED["seed_data.py<br/>(Elexon ingestion)"]
    end

    R1 & R2 & R3 & R4 & R5 & R6 & R7 --> S1
    R5 --> S2
    S1 & S2 --> DB
    DB --> M
    R1 & R2 & R3 & R4 & R5 & R6 & R7 --> SC
    SEED --> DB
    CONF --> DB
```

### 2.2 Request Flow

```
Client Request
  → FastAPI Router (validation, path params)
    → Service Layer (business logic, query building)
      → SQLAlchemy (DB query execution)
        → SQLite (data retrieval)
      ← Raw data
    ← Processed data / computed metrics
  ← Pydantic Response (JSON serialization)
```

### 2.3 API Endpoints

| Method | Path | Router File | Service | Description |
|---|---|---|---|---|
| `GET` | `/api/overview` | `overview.py` | `data_service` | Dashboard KPIs |
| `GET` | `/api/actuals` | `actuals.py` | `data_service` | Actual wind generation |
| `GET` | `/api/forecasts` | `forecasts.py` | `data_service` | Latest forecast per period |
| `GET` | `/api/forecast-vs-actual` | `comparison.py` | `data_service` | Paired data with error |
| `GET` | `/api/accuracy-metrics` | `accuracy.py` | `metrics` | MAE, RMSE, nRMSE, Bias |
| `GET` | `/api/day-ahead-view` | `day_ahead.py` | `data_service` | D-1 forecast snapshot |
| `GET` | `/api/data-export` | `export.py` | `data_service` | CSV download |
| `GET` | `/docs` | (auto) | — | Swagger UI |

### 2.4 Database Schema

```mermaid
erDiagram
    WIND_ACTUALS {
        INTEGER id PK "AUTOINCREMENT"
        TEXT start_time UK "ISO 8601"
        REAL generation "MW"
    }

    WIND_FORECASTS {
        INTEGER id PK "AUTOINCREMENT"
        TEXT start_time "ISO 8601"
        TEXT publish_time "ISO 8601"
        REAL generation "MW"
    }

    WIND_FORECASTS }o--|| WIND_ACTUALS : "matched by start_time"
```

**Indexes**:
- `idx_actuals_start_time` on `wind_actuals(start_time)`
- `idx_forecasts_start_time` on `wind_forecasts(start_time)`
- `idx_forecasts_publish_time` on `wind_forecasts(publish_time)`
- `UNIQUE(start_time, publish_time)` on `wind_forecasts`

### 2.5 Data Seeding Flow

```mermaid
sequenceDiagram
    participant App as FastAPI Startup
    participant Seed as seed_data.py
    participant DB as SQLite
    participant API as Elexon BMRS API

    App->>DB: Check if tables exist & have data
    alt DB is empty or missing
        App->>Seed: Trigger seeding
        Seed->>API: GET /datasets/FUELHH/stream?fuelType=WIND&from=2026-01-01&to=2026-01-31
        API-->>Seed: Stream of actual generation records
        Seed->>DB: INSERT into wind_actuals
        Seed->>API: GET /datasets/WINDFOR/stream?from=2026-01-01&to=2026-01-31
        API-->>Seed: Stream of forecast records
        Seed->>DB: INSERT into wind_forecasts
        Seed-->>App: Seeding complete
    else DB has data
        App-->>App: Skip seeding, start serving
    end
```

---

## 3. Frontend Architecture

### 3.1 Component Tree

```mermaid
graph TD
    APP["App.jsx<br/>(Router + ThemeProvider)"]

    APP --> LAYOUT["Layout<br/>(Sidebar + Header + Content)"]

    LAYOUT --> DASH["Dashboard Page"]
    LAYOUT --> COMP["ForecastComparison Page"]
    LAYOUT --> ACC["AccuracyAnalytics Page"]
    LAYOUT --> DAV["DayAheadView Page"]
    LAYOUT --> DATA["DataExplorer Page"]

    DASH --> KPI["KPICard ×4"]
    DASH --> SPARK["Sparkline Chart"]

    COMP --> FVA["ForecastVsActualChart"]

    ACC --> MC["MetricCard ×5"]
    ACC --> HIST["ErrorHistogram"]
    ACC --> SCATTER["ScatterPlot"]
    ACC --> HEAT["DailyHeatmap"]

    DAV --> DP["DatePicker"]
    DAV --> FVA2["ForecastVsActualChart"]
    DAV --> MC2["MetricCard ×5"]

    DATA --> TBL["WindDataTable"]
    DATA --> EXP["CSV Export Button"]
```

### 3.2 State Management

```mermaid
graph LR
    subgraph "Server State (TanStack Query)"
        QC["QueryClient<br/>(cache, stale time)"]
        Q1["useActuals()"]
        Q2["useForecasts()"]
        Q3["useForecastVsActual()"]
        Q4["useAccuracyMetrics()"]
        Q5["useDayAheadView()"]
        Q6["useOverview()"]
    end

    subgraph "Client State (React Context)"
        TC["ThemeContext<br/>(dark/light)"]
        SC["SidebarContext<br/>(expanded/collapsed)"]
    end

    Q1 & Q2 & Q3 & Q4 & Q5 & Q6 --> QC
    QC -->|"Cached responses"| COMPONENTS["React Components"]
    TC & SC --> COMPONENTS
```

**Why TanStack Query?**
- Automatic caching (January 2026 data never changes → `staleTime: Infinity`)
- Built-in loading / error states
- Deduplication of concurrent requests
- Zero boilerplate compared to manual `useEffect` + `useState`

### 3.3 Routing

| Path | Page Component | Description |
|---|---|---|
| `/` | `Dashboard` | Overview with KPIs and sparkline |
| `/forecast-comparison` | `ForecastComparison` | Overlay chart with data zoom |
| `/accuracy` | `AccuracyAnalytics` | Metrics, histogram, scatter, heatmap |
| `/day-ahead` | `DayAheadView` | D-1 decision simulation |
| `/data` | `DataExplorer` | Table + CSV export |

---

## 4. Docker Architecture

### 4.1 Local Development

```mermaid
graph LR
    subgraph "docker-compose"
        FE["frontend<br/>Node 20 Alpine<br/>Vite dev server<br/>:3000"]
        BE["backend<br/>Python 3.12 Slim<br/>Uvicorn + FastAPI<br/>:8000"]
        VOL[("sqlite-data<br/>volume")]
    end

    FE -->|"Proxy /api → :8000"| BE
    BE --> VOL
```

**Two containers only** — no database container needed (SQLite is embedded).

### 4.2 Production (Render.com)

```mermaid
graph LR
    subgraph "Render Web Service"
        FAST["FastAPI<br/>uvicorn"]
        STATIC["Static Mount<br/>React build /dist"]
        DISK[("Persistent Disk<br/>SQLite DB")]
    end

    BROWSER["Browser"] -->|"/*"| STATIC
    BROWSER -->|"/api/*"| FAST
    FAST --> DISK
```

Single service serves everything. React build is created during the Render build step and mounted as static files.

---

## 5. Data Flow Summary

```mermaid
flowchart LR
    A["Elexon BMRS API"] -->|"One-time seed"| B["seed_data.py"]
    B --> C[("SQLite DB")]
    C --> D["FastAPI Services"]
    D --> E["REST API Endpoints"]
    E --> F["TanStack Query"]
    F --> G["React Components"]
    G --> H["ECharts / Ant Design"]
    H --> I["User's Browser"]
```

---

## 6. Security Considerations

| Concern | Mitigation |
|---|---|
| Elexon API | Public API, no auth required — fetched once at startup |
| SQL Injection | SQLAlchemy ORM parameterizes all queries |
| XSS | React auto-escapes JSX output |
| CORS | Not needed — same-origin serving |
| Data Sensitivity | Public energy data only — no PII |
| Rate Limiting | One-time fetch — no ongoing API calls |
