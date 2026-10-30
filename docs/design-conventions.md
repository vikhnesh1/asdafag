# Design Conventions

> **Project**: Wind Forecast Dashboard
> **Purpose**: Visual design system, component patterns, and UI/UX rules for consistency

---

## 1. Design Philosophy

| Principle | Application |
|---|---|
| **Data-first** | Charts and metrics are the hero — minimize chrome, maximize data density |
| **Domain-authentic** | Look like a professional energy trading dashboard, not a consumer app |
| **Glanceable** | A trader should grasp the key message within 3 seconds of viewing any page |
| **Consistent** | Same color always means the same thing across every view |
| **Accessible** | WCAG AA contrast minimums; never rely on color alone |

---

## 2. Color System

### 2.1 Semantic Color Mapping

Colors are **meaning-locked** — the same color represents the same concept everywhere:

| Semantic Role | Variable | Dark Value | Light Value | Usage |
|---|---|---|---|---|
| **Forecast** | `--color-forecast` | `#3b82f6` (electric blue) | `#2563eb` | Forecast lines, forecast bars, forecast badges |
| **Actual** | `--color-actual` | `#10b981` (emerald green) | `#059669` | Actual generation lines, actual badges |
| **Error / Gap** | `--color-error` | `#f59e0b` (amber) | `#d97706` | Error bands, error metrics, warning indicators |
| **Danger** | `--color-danger` | `#ef4444` (red) | `#dc2626` | Max error, critical alerts, negative bias |
| **Success** | `--color-success` | `#22c55e` (green) | `#16a34a` | Good accuracy, positive indicators |
| **Info** | `--color-info` | `#6366f1` (indigo) | `#4f46e5` | General info, secondary data |

> **Rule**: Never use `--color-forecast` (blue) for anything other than forecast data. Never use `--color-actual` (green) for anything other than actual data. This semantic lock ensures users build reliable mental models.

### 2.2 Surface Colors

| Token | Dark Theme | Light Theme | Usage |
|---|---|---|---|
| `--bg-primary` | `#0f1117` | `#f8fafc` | Page background |
| `--bg-secondary` | `#1a1d27` | `#f1f5f9` | Sidebar, subtle sections |
| `--bg-card` | `#222639` | `#ffffff` | Card surfaces |
| `--bg-card-hover` | `#2a2f45` | `#f0f4ff` | Card hover state |
| `--bg-input` | `#1e2235` | `#ffffff` | Input backgrounds |
| `--border-subtle` | `#2d3348` | `#e2e8f0` | Card borders, dividers |
| `--border-active` | `#3b82f6` | `#2563eb` | Active state borders |

### 2.3 Text Colors

| Token | Dark Theme | Light Theme | Usage |
|---|---|---|---|
| `--text-primary` | `#f1f5f9` | `#0f172a` | Headings, primary text |
| `--text-secondary` | `#94a3b8` | `#64748b` | Labels, secondary info |
| `--text-muted` | `#64748b` | `#94a3b8` | Timestamps, footnotes |
| `--text-inverse` | `#0f172a` | `#f1f5f9` | Text on colored backgrounds |

### 2.4 CSS Custom Properties Implementation

```css
/* theme/variables.css */

[data-theme="dark"] {
  --bg-primary: #0f1117;
  --bg-secondary: #1a1d27;
  --bg-card: #222639;
  --bg-card-hover: #2a2f45;
  --border-subtle: #2d3348;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  --color-forecast: #3b82f6;
  --color-actual: #10b981;
  --color-error: #f59e0b;
  --color-danger: #ef4444;
  --color-success: #22c55e;

  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.4);
}

[data-theme="light"] {
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --bg-card: #ffffff;
  --bg-card-hover: #f0f4ff;
  --border-subtle: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;

  --color-forecast: #2563eb;
  --color-actual: #059669;
  --color-error: #d97706;
  --color-danger: #dc2626;
  --color-success: #16a34a;

  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

---

## 3. Typography

### 3.1 Font Stack

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

Load Inter from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| `--text-xs` | `12px` | 400 | Timestamps, footnotes, axis labels |
| `--text-sm` | `14px` | 400 | Secondary text, table cells |
| `--text-base` | `16px` | 400 | Body text, descriptions |
| `--text-lg` | `18px` | 500 | Card titles, section labels |
| `--text-xl` | `24px` | 600 | Page titles |
| `--text-2xl` | `30px` | 700 | KPI values (large stat numbers) |
| `--text-3xl` | `36px` | 700 | Hero metrics (dashboard overview) |

### 3.3 Rules

- **KPI/metric values** always use `--font-mono` for tabular number alignment
- **Never** use more than 3 font weights on a single page
- **Minimum** font size: `12px` (for accessibility)

---

## 4. Spacing System

Use an **8px base grid**:

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | Tight gaps (icon-to-text) |
| `--space-2` | `8px` | Compact padding |
| `--space-3` | `12px` | Inner card padding (compact) |
| `--space-4` | `16px` | Standard padding, gaps between cards |
| `--space-5` | `20px` | Section padding |
| `--space-6` | `24px` | Card padding (comfortable) |
| `--space-8` | `32px` | Large section spacing |
| `--space-10` | `40px` | Page-level padding |

---

## 5. Component Patterns

### 5.1 KPI Cards

```
┌─────────────────────────────┐
│  🔵  Total Generation       │
│                             │
│  152,340 MW                 │
│  ▲ Jan 2026                 │
└─────────────────────────────┘
```

| Property | Value |
|---|---|
| Border radius | `12px` |
| Background | `var(--bg-card)` |
| Border | `1px solid var(--border-subtle)` |
| Padding | `var(--space-6)` |
| Shadow | `var(--shadow-card)` |
| Hover | Background → `var(--bg-card-hover)`, shadow → `var(--shadow-hover)` |
| Transition | `all 0.2s ease` |
| Icon | Colored circle matching the metric's semantic color |
| Value font | `var(--font-mono)`, `var(--text-2xl)`, `700` weight |
| Label font | `var(--text-sm)`, `var(--text-secondary)` |

### 5.2 Metric Cards (Accuracy Page)

```
┌───────────────────┐
│  MAE              │
│  245.3 MW         │
│  ━━━━━━━━━━━      │  ← Contextual bar showing relative magnitude
│  Avg error        │
└───────────────────┘
```

Same card styling as KPI cards, but with:
- A contextual color bar at the bottom showing metric severity
- Green (good) → Amber (moderate) → Red (poor) gradient

### 5.3 Charts (ECharts)

| Property | Convention |
|---|---|
| **Background** | Transparent (inherits from card) |
| **Grid padding** | `top: 40, right: 40, bottom: 60, left: 60` |
| **Forecast line** | `var(--color-forecast)`, solid, `2px` width |
| **Actual line** | `var(--color-actual)`, solid, `2px` width |
| **Error band** | `var(--color-error)` at `0.15` opacity |
| **Tooltip** | Dark background (`#1a1d27`), white text, shows all series |
| **Legend** | Top-right, horizontal, with colored circles |
| **Data zoom** | Bottom slider, `height: 30px`, subtle styling |
| **Axis labels** | `var(--text-secondary)`, `12px` |
| **Grid lines** | Dashed, `var(--border-subtle)` at `0.5` opacity |
| **Animation** | `duration: 800ms`, `easing: cubicOut` |

### 5.4 Data Tables

| Property | Convention |
|---|---|
| **Ant Design theme** | Match app dark/light theme via ConfigProvider |
| **Header** | Sticky, bold, `var(--bg-secondary)` background |
| **Row hover** | `var(--bg-card-hover)` |
| **Striped rows** | Not used (too busy with dark theme) |
| **Border** | Subtle horizontal lines only (`var(--border-subtle)`) |
| **Pagination** | Bottom-right, show page size selector |
| **Sort indicators** | Ant Design defaults |
| **Number columns** | Right-aligned, `var(--font-mono)` |
| **Date columns** | Left-aligned, formatted as `DD MMM, HH:mm` |

### 5.5 Sidebar

| Property | Convention |
|---|---|
| **Width (expanded)** | `240px` |
| **Width (collapsed)** | `64px` |
| **Background** | `var(--bg-secondary)` |
| **Border** | Right border `1px solid var(--border-subtle)` |
| **Active item** | `var(--color-forecast)` background at `0.1` opacity + left border accent |
| **Hover item** | `var(--bg-card-hover)` |
| **Icons** | 20px, centered in collapsed mode |
| **Collapse trigger** | Bottom of sidebar, subtle chevron icon |
| **Transition** | `width 0.3s ease` |

---

## 6. Chart-Specific Color Rules

### 6.1 Forecast vs Actual Chart

```
Forecast line:  --color-forecast (#3b82f6)  solid
Actual line:    --color-actual   (#10b981)   solid
Error band:     --color-error    (#f59e0b)   0.15 opacity fill between lines
```

### 6.2 Error Histogram

```
Bars:           --color-error    (#f59e0b)   0.8 opacity
Bar borders:    --color-error    (#f59e0b)   1.0 opacity
```

### 6.3 Scatter Plot

```
Points:         --color-info     (#6366f1)   0.6 opacity, 6px radius
Diagonal:       --color-actual   (#10b981)   dashed, 1px
```

### 6.4 Heatmap

```
Low error:      --color-success  (#22c55e)   green spectrum
Medium error:   --color-error    (#f59e0b)   amber spectrum
High error:     --color-danger   (#ef4444)   red spectrum
```

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| **Desktop XL** | `≥ 1440px` | Full layout, 4-column KPI grid |
| **Desktop** | `≥ 1024px` | Full layout, sidebar expanded by default |
| **Tablet** | `≥ 768px` | Sidebar collapsed by default, 2-column KPI grid |
| **Mobile** | `< 768px` | Sidebar hidden (hamburger), 1-column, horizontal scroll tables |

> **Primary target**: Desktop (1280px+). This is a trading dashboard — optimized for desktop monitors. Mobile is functional but not the priority.

---

## 8. Animation & Transitions

| Element | Property | Duration | Easing |
|---|---|---|---|
| **Card hover** | `background`, `box-shadow` | `200ms` | `ease` |
| **Sidebar collapse** | `width` | `300ms` | `ease` |
| **Theme toggle** | `background`, `color`, `border` | `200ms` | `ease` |
| **Chart animations** | Initial render | `800ms` | `cubicOut` |
| **Page transitions** | None — instant navigation | — | — |
| **Loading states** | Skeleton pulse | `1.5s` | `ease-in-out` |
| **Tooltip appear** | `opacity` | `150ms` | `ease` |

> **Rule**: No animation should exceed `800ms`. Keep transitions subtle — this is a professional tool, not a marketing site.

---

## 9. Loading & Empty States

### Loading

```
┌─────────────────────────────┐
│  ████████████ ░░░░░░░░░░░░  │  ← Skeleton pulse
│  ████████ ░░░░░░░░░░░░░░░░  │
│  ████████████████ ░░░░░░░░  │
└─────────────────────────────┘
```

Use Ant Design's `Skeleton` component. Show skeleton shapes that match the expected content layout.

### Empty State

```
┌─────────────────────────────┐
│                             │
│        📊 No Data           │
│  No records found for the   │
│  selected date range.       │
│                             │
└─────────────────────────────┘
```

Use Ant Design's `Empty` component. Always provide a clear message about **why** it's empty and **what to do** (e.g., "Try adjusting the date range").

### Error State

```
┌─────────────────────────────┐
│                             │
│  ⚠️  Failed to load data    │
│  Could not reach the server │
│  [Retry]                    │
│                             │
└─────────────────────────────┘
```

Always include a retry action. Use `--color-danger` for the icon.

---

## 10. Iconography

| Icon Context | Icon (Ant Design / Lucide) | Usage |
|---|---|---|
| Dashboard | `DashboardOutlined` | Sidebar nav |
| Forecast chart | `LineChartOutlined` | Sidebar nav |
| Accuracy | `AimOutlined` | Sidebar nav |
| Day-ahead | `CalendarOutlined` | Sidebar nav |
| Data table | `TableOutlined` | Sidebar nav |
| Theme toggle | `SunOutlined` / `MoonOutlined` | Header |
| Collapse sidebar | `MenuFoldOutlined` / `MenuUnfoldOutlined` | Sidebar bottom |
| Export CSV | `DownloadOutlined` | Data table |
| Wind/generation | `ThunderboltOutlined` | KPI card |
| Error/accuracy | `WarningOutlined` | Metric card |

Use **Ant Design icons** consistently. Do not mix icon libraries.

---

## 11. Number Formatting

| Type | Format | Example |
|---|---|---|
| **MW values** | Comma-separated, 1 decimal | `12,345.6 MW` |
| **Error metrics (MAE, RMSE)** | 1 decimal | `245.3 MW` |
| **nRMSE** | 3 decimals (or as percentage) | `0.023` or `2.3%` |
| **Bias** | Signed, 1 decimal | `+12.4 MW` or `-12.4 MW` |
| **Percentages** | 1 decimal | `5.2%` |
| **Counts** | Comma-separated integer | `1,488 periods` |
| **Dates (display)** | `DD MMM YYYY` | `15 Jan 2026` |
| **Times (display)** | `HH:mm` (24-hour) | `14:30` |
| **DateTime (display)** | `DD MMM, HH:mm` | `15 Jan, 14:30` |

> **Rule**: Always use `Intl.NumberFormat('en-GB')` for consistent formatting. Never hand-format numbers with string concatenation.

---

## 12. Accessibility Minimums

| Requirement | Standard | Implementation |
|---|---|---|
| **Color contrast** | WCAG AA (4.5:1 for text) | Verify all text against backgrounds |
| **Focus indicators** | Visible focus ring on all interactive elements | `outline: 2px solid var(--color-forecast)` |
| **Aria labels** | All interactive elements | Sidebar items, theme toggle, export button |
| **Chart alternatives** | Data table exists as alternative to every chart | Data Explorer page |
| **Keyboard navigation** | Tab through sidebar, interact with date picker | Ant Design provides this |
| **Screen reader** | `aria-label` on icon-only buttons | Collapsed sidebar icons |
