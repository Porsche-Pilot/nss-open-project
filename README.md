# 📊 Impact Measurement Dashboard — Vidya Setu Foundation

> **NSS Open Projects 2026 — Challenge 5.1: Impact Measurement Dashboard for a Partner NGO**

An interactive, real-time impact measurement dashboard that converts raw NGO field data into actionable KPIs — cost-per-impact, programme progress, demographic reach, and trends — with a non-technical user interface.

## 🎯 Problem Statement

Indian NGOs predominantly measure activity (events held, beneficiaries reached) rather than outcomes (lives changed, behaviours shifted). This dashboard bridges the gap between field data and decision-relevant KPIs.

## 📋 Deliverables

| # | Deliverable | Location |
|---|------------|----------|
| 1 | **Live Dashboard** | `src/` — React + Vite web app |
| 2 | **Data Dictionary** | [`DATA_DICTIONARY.md`](./DATA_DICTIONARY.md) |
| 3 | **User Guide** | [`USER_GUIDE.md`](./USER_GUIDE.md) |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Generate synthetic dataset (optional — data already included)
python generate_data.py

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## 🏗️ Architecture

```
ngo-impact-dashboard/
├── src/
│   ├── components/
│   │   ├── ExecutiveSummary.jsx   # Hero KPIs + overview charts
│   │   ├── KPITreeView.jsx       # Activity → Output → Outcome → Impact
│   │   ├── ProgrammeProgress.jsx # Target vs actual tracking
│   │   ├── DemographicReach.jsx  # Gender, age, category, district analysis
│   │   ├── CostAnalysis.jsx      # Cost-per-impact & funding breakdown
│   │   ├── TrendAnalysis.jsx     # Time-series with multiple views
│   │   ├── DataQuality.jsx       # Data quality scoring & worker scorecard
│   │   └── dataUtils.js          # Data loading, filtering, formatting
│   ├── data/                     # Generated JSON datasets
│   ├── App.jsx                   # Main layout + routing
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Design system
├── generate_data.py              # Synthetic data generator
├── DATA_DICTIONARY.md            # Field-level documentation
├── USER_GUIDE.md                 # Non-technical user guide
└── README.md
```

## 📊 Dashboard Views

1. **Executive Summary** — The "Monday Number" composite impact score, 4 hero KPI cards, monthly trends
2. **KPI Tree** — Visual Activity → Output → Outcome → Impact ladder
3. **Programme Progress** — Target vs actual progress bars for all 4 programmes
4. **Demographic Reach** — Gender, age, caste category breakdowns + district performance table
5. **Cost-per-Impact** — Programme efficiency, funding source analysis, cost trends
6. **Trend Analysis** — Tabbed time-series: sessions, cumulative, by-programme, by-region
7. **Data Quality** — Quality scoring, issue types, field worker scorecard

## 🔧 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Vite |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Custom CSS (dark theme, glassmorphism) |
| Data | Python-generated synthetic JSON |

## 📐 KPI Framework

Based on **Theory of Change** / **Logical Framework**:

```
Activity → Output → Outcome → Impact
```

| Level | Example KPIs |
|-------|-------------|
| **Activity** | Sessions held, hours invested, districts covered |
| **Output** | Participants trained, sessions completed |
| **Outcome** | Reading/Math score improvement, retention rate |
| **Impact** | Cost-per-outcome, improvement rate, lives changed |

## 🎨 Design

- Dark mode with glassmorphism effects
- Responsive design (desktop + tablet)
- Animated transitions and hover effects
- Custom colour palette: deep ocean + warm accents
- Google Fonts: Inter + JetBrains Mono

## 📝 NGO Profile (Synthetic)

**Vidya Setu Foundation** — Education NGO operating across 10 rural districts in 5 Indian states, running after-school tutoring, digital literacy, teacher training, and parent engagement programmes.

---

*Built for NSS Open Projects 2026 — Challenge 5.1*
