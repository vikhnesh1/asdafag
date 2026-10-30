# Code Conventions

> **Project**: Wind Forecast Dashboard
> **Purpose**: Enforce consistency across all code — backend (Python) and frontend (React/JS)

---

## 1. General Rules

| Rule | Convention |
|---|---|
| **Language** | English for all code, comments, docs, and commit messages |
| **Line length** | 100 characters max (Python), 100 characters max (JS/JSX) |
| **Trailing whitespace** | None — configure editor to strip on save |
| **Final newline** | All files end with a single newline |
| **Encoding** | UTF-8 everywhere |
| **Indentation** | 4 spaces (Python), 2 spaces (JS/JSX/CSS/JSON/YAML) |

---

## 2. File & Folder Naming

### Backend (Python)

| Type | Convention | Example |
|---|---|---|
| **Directories** | `snake_case` | `routers/`, `services/` |
| **Python files** | `snake_case.py` | `data_service.py`, `seed_data.py` |
| **Test files** | `test_<module>.py` | `test_metrics.py` |

### Frontend (React/JS)

| Type | Convention | Example |
|---|---|---|
| **Directories** | `PascalCase` for components, `camelCase` for utilities | `Charts/`, `hooks/`, `api/` |
| **React components** | `PascalCase.jsx` | `Sidebar.jsx`, `KPICard.jsx` |
| **Hooks** | `use<Name>.js` | `useWindData.js` |
| **Utilities/services** | `camelCase.js` | `client.js` |
| **CSS files** | `camelCase.css` or match component name | `variables.css`, `Sidebar.css` |
| **Page components** | `PascalCase.jsx` (in `pages/` dir) | `Dashboard.jsx` |

### Shared

| Type | Convention | Example |
|---|---|---|
| **Config files** | lowercase with dots/dashes | `docker-compose.yml`, `vite.config.js` |
| **Documentation** | `kebab-case.md` | `task-list.md`, `design-conventions.md` |
| **Environment files** | `.env`, `.env.example` | — |

---

## 3. Python Conventions (Backend)

### 3.1 Naming

| Type | Convention | Example |
|---|---|---|
| **Variables** | `snake_case` | `start_time`, `forecast_data` |
| **Functions** | `snake_case` | `get_actuals()`, `compute_mae()` |
| **Classes** | `PascalCase` | `WindActual`, `WindForecast` |
| **Constants** | `UPPER_SNAKE_CASE` | `DATABASE_PATH`, `GATE_CLOSURE_HOUR` |
| **Private** | `_leading_underscore` | `_parse_timestamp()` |
| **Pydantic models** | `PascalCase` + descriptive suffix | `ActualResponse`, `MetricsResponse` |
| **Router variables** | `snake_case` matching endpoint | `router = APIRouter()` |
| **Modules** | `snake_case` | `data_service`, `seed_data` |

### 3.2 Import Ordering

```python
# 1. Standard library
import os
from datetime import datetime

# 2. Third-party packages
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
import httpx

# 3. Local imports
from database import get_db
from models import WindActual
from schemas import ActualResponse
```

### 3.3 Function Signatures

```python
# Use type hints everywhere
async def get_actuals(
    start: str | None = Query(None, description="Start date ISO 8601"),
    end: str | None = Query(None, description="End date ISO 8601"),
    db: AsyncSession = Depends(get_db),
) -> list[ActualResponse]:
    """Fetch actual wind generation for the given date range."""
    ...
```

### 3.4 Docstrings

```python
def compute_mae(forecasts: list[float], actuals: list[float]) -> float:
    """Compute Mean Absolute Error between forecast and actual values.

    Args:
        forecasts: Predicted generation values in MW.
        actuals: Observed generation values in MW.

    Returns:
        MAE in MW.

    Raises:
        ValueError: If input lists have different lengths or are empty.
    """
```

### 3.5 Error Handling

```python
# Use FastAPI HTTPException for API errors
from fastapi import HTTPException

if not data:
    raise HTTPException(status_code=404, detail="No data found for the given date range")

# Use specific exceptions, never bare except
try:
    response = await client.get(url)
    response.raise_for_status()
except httpx.HTTPStatusError as e:
    logger.error(f"Elexon API error: {e.response.status_code}")
    raise
```

### 3.6 SQLAlchemy Models

```python
# Always define __tablename__ explicitly
# Always add __repr__ for debugging
class WindActual(Base):
    __tablename__ = "wind_actuals"

    id: Mapped[int] = mapped_column(primary_key=True)
    start_time: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    generation: Mapped[float] = mapped_column(Float, nullable=False)

    def __repr__(self) -> str:
        return f"<WindActual(start_time={self.start_time}, generation={self.generation})>"
```

---

## 4. JavaScript / React Conventions (Frontend)

### 4.1 Naming

| Type | Convention | Example |
|---|---|---|
| **Variables** | `camelCase` | `startTime`, `forecastData` |
| **Functions** | `camelCase` | `fetchActuals()`, `formatDate()` |
| **React components** | `PascalCase` | `KPICard`, `Sidebar` |
| **Custom hooks** | `useCamelCase` | `useWindData`, `useTheme` |
| **Constants** | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `STALE_TIME` |
| **Props** | `camelCase` | `startDate`, `onDateChange` |
| **Event handlers** | `handle<Event>` (internal), `on<Event>` (prop) | `handleClick`, `onChange` |
| **Booleans** | `is/has/should` prefix | `isLoading`, `hasError`, `shouldCollapse` |
| **CSS classes** | `kebab-case` | `sidebar-collapsed`, `kpi-card` |
| **CSS variables** | `--kebab-case` | `--bg-primary`, `--accent-wind` |

### 4.2 Component Structure

```jsx
// 1. Imports (React, libraries, components, hooks, styles)
import { useState, useCallback } from 'react';
import { Card, Statistic } from 'antd';
import { useOverview } from '../hooks/useWindData';
import './KPICard.css';

// 2. Constants (if any)
const DEFAULT_PRECISION = 1;

// 3. Component (named export preferred)
export function KPICard({ title, value, unit, icon, precision = DEFAULT_PRECISION }) {
  // a. Hooks (top of component)
  const [isHovered, setIsHovered] = useState(false);

  // b. Derived state / computations
  const formattedValue = value?.toFixed(precision) ?? '—';

  // c. Event handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);

  // d. Render
  return (
    <Card
      className="kpi-card"
      onMouseEnter={handleMouseEnter}
    >
      <Statistic title={title} value={formattedValue} suffix={unit} prefix={icon} />
    </Card>
  );
}
```

### 4.3 Import Ordering

```jsx
// 1. React
import { useState, useEffect, useCallback } from 'react';

// 2. Third-party libraries
import { Card, Table, DatePicker } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useQuery } from '@tanstack/react-query';

// 3. Local components
import { KPICard } from '../components/Cards/KPICard';
import { Sidebar } from '../components/Layout/Sidebar';

// 4. Local hooks / utilities
import { useWindData } from '../hooks/useWindData';
import { apiClient } from '../api/client';

// 5. Styles
import './Dashboard.css';
```

### 4.4 Props

```jsx
// Destructure props in function signature
// Use default values for optional props
export function MetricCard({ title, value, unit = 'MW', color = 'blue', loading = false }) {
  ...
}

// For complex prop shapes, document with JSDoc
/**
 * @param {Object} props
 * @param {string} props.title - Metric display name
 * @param {number} props.value - Metric value
 * @param {'MW' | '%' | ''} props.unit - Unit of measurement
 */
```

### 4.5 TanStack Query Hooks

```javascript
// hooks/useWindData.js
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

// One hook per endpoint, named descriptively
export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: () => apiClient.get('/api/overview'),
    staleTime: Infinity,  // January 2026 data never changes
  });
}

export function useActuals(start, end) {
  return useQuery({
    queryKey: ['actuals', start, end],
    queryFn: () => apiClient.get('/api/actuals', { params: { start, end } }),
    staleTime: Infinity,
    enabled: !!start && !!end,  // Don't fetch without params
  });
}
```

---

## 5. API Conventions

### 5.1 URL Patterns

| Pattern | Convention | Example |
|---|---|---|
| **Base path** | `/api/` prefix for all endpoints | `/api/overview` |
| **Resource names** | `kebab-case`, plural for collections | `/api/actuals`, `/api/forecasts` |
| **Compound resources** | Hyphenated | `/api/forecast-vs-actual`, `/api/day-ahead-view` |
| **Query params** | `camelCase` | `?startDate=&endDate=` |
| **Actions** | Verb in path only for non-CRUD | `/api/data-export` |

### 5.2 Response Format

```json
// Successful list response
{
  "data": [...],
  "count": 1488
}

// Successful single-object response
{
  "totalGeneration": 152340.5,
  "mae": 245.3,
  "rmse": 312.7,
  "nrmse": 0.023,
  "bias": -12.4,
  "maxAbsoluteError": 1205.6,
  "periodCount": 1488,
  "dateRange": {
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-01-31T23:30:00Z"
  }
}

// Error response
{
  "detail": "No data found for the given date range"
}
```

### 5.3 Date/Time Format

| Context | Format | Example |
|---|---|---|
| API query params | ISO 8601 date | `2026-01-15` |
| API response fields | ISO 8601 datetime with Z | `2026-01-15T14:30:00Z` |
| SQLite storage | ISO 8601 string | `2026-01-15T14:30:00+00:00` |
| Frontend display | Localized | `15 Jan 2026, 14:30` |

---

## 6. Git Conventions

### 6.1 Commit Messages

```
<type>(<scope>): <subject>

<body>
```

**Types**: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`
**Scopes**: `backend`, `frontend`, `docker`, `docs`, `seed`

**Examples**:
```
feat(backend): add accuracy metrics endpoint
fix(frontend): correct date timezone in forecast chart
docs: add architecture diagram to README
chore(docker): update Python base image to 3.12
refactor(backend): extract forecast matching into data_service
```

### 6.2 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `feat/<description>` | Feature branches |
| `fix/<description>` | Bug fix branches |

### 6.3 `.gitignore` Essentials

```gitignore
# Python
__pycache__/
*.pyc
.venv/

# Node
node_modules/
dist/

# SQLite
*.db

# IDE
.vscode/
.idea/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db
```

---

## 7. Docker Conventions

| Rule | Convention |
|---|---|
| **Base images** | Use slim/alpine variants (`python:3.12-slim`, `node:20-alpine`) |
| **Multi-stage builds** | Use for production frontend image (build + serve stages) |
| **Service names** | `lowercase` in `docker-compose.yml` (`backend`, `frontend`) |
| **Environment variables** | `UPPER_SNAKE_CASE` |
| **Volumes** | Named volumes for persistent data (`sqlite-data`) |
| **Port mapping** | Backend `:8000`, Frontend `:3000` |
| **Health checks** | Add for backend (`/api/overview` returns 200) |

---

## 8. Code Quality Checklist

Before committing any code, verify:

- [ ] No hardcoded values — use constants or config
- [ ] No `console.log` left in production code (use proper logging)
- [ ] No `print()` in Python — use `logging` module
- [ ] All functions have type hints (Python) or JSDoc (JS)
- [ ] No unused imports
- [ ] No commented-out code
- [ ] Meaningful variable names (no `x`, `temp`, `data2`)
- [ ] Error states handled (loading, error, empty in React; HTTPException in FastAPI)
