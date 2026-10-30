# Product Specifications

> **Project**: Wind Forecast Dashboard
> **Version**: 1.0.0
> **Last Updated**: 2026-10-30

---

## 1. Problem Domain

A UK energy utility needs to purchase electricity from the wholesale day-ahead market to serve consumers. The trading team must determine how much additional power to procure (e.g., from thermal plants) beyond what renewable sources (wind) generate. Since wind generation is weather-dependent and day-ahead purchasing decisions are made **one day before delivery**, the team relies on wind generation **forecasts**.

### Core Needs

| # | Need | Description |
|---|---|---|
| N1 | **Forecast Visibility** | Clearly see the latest renewable generation forecasts available at decision time |
| N2 | **Forecast Accuracy** | Quantitatively evaluate forecast accuracy to factor error into purchasing decisions |

---

## 2. User Persona

| Attribute | Detail |
|---|---|
| **Role** | Day-Ahead Power Trader / Energy Procurement Analyst |
| **Organization** | UK Energy Utility |
| **Key Task** | Purchase required power from the UK day-ahead market |
| **Decision Frequency** | Daily — bids submitted before 11:00 UK time D-1 |
| **Pain Points** | Uncertainty in wind forecasts leading to over/under-procurement; imbalance charges |
| **Technical Comfort** | Moderate — comfortable with dashboards, charts, and metrics |

---

## 3. Data Sources

### 3.1 Actual Wind Generation (FUELHH)

| Property | Value |
|---|---|
| **Source** | Elexon BMRS |
| **Endpoint** | `https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream` |
| **Filter** | `fuelType=WIND` |
| **Resolution** | 30-minute settlement periods |
| **Key Fields** | `startTime` (ISO 8601), `generation` (MW) |
| **Scope** | January 2026 (2026-01-01T00:00Z to 2026-01-31T23:30Z) |
| **Expected Records** | ~1,488 (31 days × 48 half-hours) |

### 3.2 Wind Generation Forecasts (WINDFOR)

| Property | Value |
|---|---|
| **Source** | Elexon BMRS |
| **Endpoint** | `https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream` |
| **Resolution** | 30-minute settlement periods |
| **Key Fields** | `startTime` (ISO 8601), `publishTime` (ISO 8601), `generation` (MW) |
| **Scope** | January 2026 |
| **Note** | Multiple forecasts may exist per `startTime` (different `publishTime` values) |

### 3.3 Data Constraints

- **No other data sources** — only Elexon FUELHH and WINDFOR
- **National level** — aggregated UK wind, not individual farm data
- **January 2026 only** — no other months

---

## 4. Functional Requirements

### FR-01: Dashboard Overview

| ID | Requirement |
|---|---|
| FR-01.1 | Display total wind generation for the selected period (MW) |
| FR-01.2 | Display average MAE, RMSE across the period |
| FR-01.3 | Display forecast bias direction (over/under-prediction) |
| FR-01.4 | Show a summary time-series sparkline for the full month |
| FR-01.5 | Show data coverage stats (date range, total periods) |

### FR-02: Forecast vs Actual Chart

| ID | Requirement |
|---|---|
| FR-02.1 | Overlay line chart: forecast generation vs actual generation |
| FR-02.2 | X-axis: time (half-hourly); Y-axis: generation (MW) |
| FR-02.3 | Shaded error band between forecast and actual lines |
| FR-02.4 | Interactive data zoom slider for date range selection |
| FR-02.5 | Tooltips showing forecast, actual, and error at each point |
| FR-02.6 | Forecast line uses the **latest forecast** published before each `startTime` |

### FR-03: Forecast Accuracy Analytics

| ID | Requirement |
|---|---|
| FR-03.1 | Compute and display: MAE, RMSE, nRMSE, Bias (Mean Error), Max Absolute Error |
| FR-03.2 | Error distribution histogram (frequency of error magnitudes) |
| FR-03.3 | Scatter plot: forecast (x) vs actual (y), with diagonal reference line |
| FR-03.4 | Daily accuracy heatmap: color-coded MAE/RMSE per day |
| FR-03.5 | **MAPE must NOT be included** (blows up when actual ≈ 0, common for wind) |

### FR-04: Day-Ahead Decision View

| ID | Requirement |
|---|---|
| FR-04.1 | Date picker to select a delivery day in January 2026 |
| FR-04.2 | Show the forecast that was published **before 11:00 UK time on D-1** |
| FR-04.3 | Compare the D-1 forecast against what actually happened |
| FR-04.4 | Display per-period error for the selected day |
| FR-04.5 | Gate closure time: 11:00 UK time (fixed) |

### FR-05: Data Table

| ID | Requirement |
|---|---|
| FR-05.1 | Sortable, filterable table of all paired forecast/actual data |
| FR-05.2 | Columns: Date, Time, Forecast (MW), Actual (MW), Error (MW) |
| FR-05.3 | CSV export button |
| FR-05.4 | Pagination for browsing |

### FR-06: Theme Toggle

| ID | Requirement |
|---|---|
| FR-06.1 | Dark and light theme support |
| FR-06.2 | User preference persisted in `localStorage` |
| FR-06.3 | Toggle accessible from the sidebar/header |

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | **Performance** | Dashboard loads in < 2 seconds on initial visit |
| NFR-02 | **Docker** | Full app starts with `docker-compose up` — zero manual setup |
| NFR-03 | **Auto-seeding** | Database auto-populates on first startup if empty |
| NFR-04 | **Deployment** | Deployed and accessible on Render.com (single service) |
| NFR-05 | **Responsive** | Usable on desktop (1280px+); sidebar collapses for smaller screens |
| NFR-06 | **API Docs** | Auto-generated Swagger UI at `/docs` |
| NFR-07 | **README** | Documents architecture, setup, and live URL |

---

## 6. Forecast Matching Logic

### Primary (Forecast vs Actual Chart, Accuracy Metrics)

For each `startTime`:
1. Query all forecasts where `forecast.startTime == actual.startTime`
2. Select the forecast with the **maximum `publishTime`** that is still **< `startTime`**
3. Pair this forecast with the actual for comparison

### Day-Ahead (Decision View)

For each `startTime` on a given delivery day D:
1. Gate closure = `D-1 at 11:00 UK time`
2. Select the forecast with the **maximum `publishTime`** that is **≤ gate closure**
3. If no forecast exists before gate closure, mark as "No forecast available"

---

## 7. Accuracy Metrics Definitions

| Metric | Formula | Unit |
|---|---|---|
| **MAE** | `(1/n) × Σ|Fᵢ - Aᵢ|` | MW |
| **RMSE** | `√((1/n) × Σ(Fᵢ - Aᵢ)²)` | MW |
| **nRMSE** | `RMSE / C` where C = installed wind capacity | Dimensionless (0-1) |
| **Bias** | `(1/n) × Σ(Fᵢ - Aᵢ)` | MW |
| **Max Abs Error** | `max(|Fᵢ - Aᵢ|)` | MW |

Where: `F` = forecast, `A` = actual, `n` = number of periods, `C` = installed capacity

---

## 8. Acceptance Criteria

- [ ] Dashboard loads with real January 2026 data from Elexon
- [ ] Forecast vs Actual chart shows correct overlay with data zoom
- [ ] All 5 accuracy metrics are computed correctly
- [ ] MAPE is **not** present anywhere in the application
- [ ] Day-Ahead view shows only forecasts published before 11:00 D-1
- [ ] Data table supports sorting, filtering, and CSV export
- [ ] Dark/light theme toggle works and persists preference
- [ ] `docker-compose up` starts the entire app with no manual steps
- [ ] Application is accessible via a live Render.com URL
- [ ] README documents setup, architecture, and live URL
