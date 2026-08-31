# Trace — AI Product Feedback & Decision Intelligence Platform

> **Transform raw, fragmented customer feedback into grounded product decisions and post-ship telemetry loops.**

Trace is a modern, high-performance Product Decision & Intelligence system built with **React 19**, **Vite**, **Tailwind CSS v4**, and **TypeScript**. It bridges the gap between raw customer sentiment and engineering execution by establishing an immutable chain of evidence:

```
Customer Feedback Statements
         ↓
  Span-Level Feedback Atoms (Intent, Severity, Sentiment)
         ↓
  Problem Intelligence & Evidence Graph (Supporting vs. Counter Evidence)
         ↓
  Explainable AI-Scored Opportunities (6-Factor Weighted Priority Matrix)
         ↓
  Institutional Decision Memory (PDR / ADR with Snapshot Evidence)
         ↓
  Product Roadmap & Post-Ship Telemetry Loops (Complaint Drop %)
```

---

## ⚡ Tech Stack

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool & Bundler**: [Vite 6](https://vite.dev/) with `@vitejs/plugin-react`
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`, dark mode variant support
- **Data Visualizations**: [Recharts 3](https://recharts.org/) (8-Week Struggle Telemetry Area Charts & Sparklines)
- **Micro-Interactions**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **File Parsing**: [PapaParse](https://www.papaparse.com/) (CSV Ingestion & Auto-Atomizer)
- **Database Schema**: PostgreSQL / [Supabase](https://supabase.com/) with Row-Level Security (RLS) & Vector embeddings

---

## 🌟 Key Features

### 1. Executive Intelligence Dashboard (`/`)
- **4 Real-Time KPI Cards**: Track Ingested Statements, Extracted Atoms, Velocity Anomalies, and Preserved Decisions with SVG sparklines.
- **Emerging Anomaly Spike Alert**: Real-time velocity surge alerts (e.g., Android 15 startup crash regression).
- **Weekly Struggle Telemetry**: 8-week multi-series interactive area charts segmented by problem cluster.
- **Trace AI Synthesis**: Executive summaries of root cause vectors and high-risk customer segments.

### 2. Ingestion Queue & Inbox (`/inbox`)
- Triage newly arrived statements across channels.
- Filter by `All`, `Critical`, `Unreviewed`, and `Spikes`.
- Visual badges for extracted clause intents and severity levels.

### 3. Feedback Explorer & Span-Level Atom Highlighter (`/feedback`)
- **Interactive Span Extraction**: Tokenizes sentences into exact character-offset atoms (`bug_report`, `feature_request`, `complaint`, `praise`).
- **Clause Deep-Dive Inspector**: Click any highlighted clause to view intent, sentiment score, severity, confidence, and inferred struggle hints.
- **Quote Clipboard**: 1-click customer verbatim quote copying for PM specs.
- Multi-dimensional filter toolbar (Source, Customer Segment, Sentiment, Severity).

### 4. Problem Intelligence & Evidence Graph (`/insights`)
- Synthesizes feedback atoms into distinct problem clusters.
- **Evidence Comparison Graph**: Side-by-side verification of supporting quotes vs. contradicting / divergent customer signals.

### 5. Prioritization Matrix & Opportunity Scoring (`/opportunities`)
- **6-Factor Explainable Scoring Formula**:
  - Frequency & Volume (20%)
  - Severity & Churn Risk (20%)
  - Trend Velocity Surge (15%)
  - Segment Strategic Weight (15%)
  - Strategic Context Alignment (15%)
  - Evidence Quote Quality (15%)
- **PDR Decision Modal**: PMs record rationale before committing initiatives; accepted opportunities automatically sync to the Roadmap.
- **Custom Opportunity Framing**: Create initiatives linked to customer struggle statements.

### 6. Institutional Decision Memory (`/decisions`)
- Audit log preserving why an initiative was Accepted, Won't Do, or Deferred.
- Point-in-time snapshot of evidence (mention counts, severity, quote context) frozen at the exact time of decision.

### 7. Roadmap & Post-Ship Telemetry (`/roadmap`)
- Kanban stages: `Candidate`, `Planned`, `In Progress`, and `Shipped`.
- **Post-Ship Telemetry**: Monitors complaint drops (e.g., `-44.2%` complaint reduction) after features ship.

### 8. Ingestion Channels & CSV Wizard (`/sources`)
- Connectors for Google Play, Apple App Store, Zendesk, Intercom, and Gong Sales Transcripts.
- Multi-step CSV ingestion wizard with automatic column header mapping and clause atomization.

### 9. Strategic Product Context Configuration (`/settings/context`)
- Configure active company OKRs, customer segment multiplier weights, and known architectural constraints that influence opportunity scores.

---

## 📁 Project Structure

```
Trace/
├── index.html                   # HTML entry point with modern typography
├── vite.config.ts               # Vite configuration with React & Tailwind CSS v4
├── tsconfig.json                # TypeScript compiler configuration
├── package.json                 # Project dependencies and npm scripts
├── src/
│   ├── main.tsx                 # React application entry point
│   ├── App.tsx                  # Root component with React Router mapping
│   ├── index.css                # Tailwind CSS v4 design tokens & atom badges
│   ├── pages/                   # Application route pages
│   │   ├── OverviewPage.tsx     # Executive Dashboard
│   │   ├── InboxPage.tsx        # Ingestion Queue & Triage
│   │   ├── FeedbackPage.tsx     # Feedback Explorer & Atom Highlighter
│   │   ├── InsightsPage.tsx     # Problem Intelligence & Evidence Graph
│   │   ├── OpportunitiesPage.tsx# Explainable Prioritization Matrix
│   │   ├── DecisionsPage.tsx    # Institutional Decision Memory (PDR)
│   │   ├── RoadmapPage.tsx      # Kanban & Post-Ship Telemetry
│   │   ├── SourcesPage.tsx      # CSV Wizard & Ingestion Connectors
│   │   └── ContextSettingsPage.tsx # Strategic Context Configuration
│   ├── components/
│   │   ├── layout/              # AppShell, Sidebar, Header
│   │   ├── analytics/           # Recharts TelemetryChart
│   │   ├── feedback/            # Span-level AtomHighlighter
│   │   └── ui/                  # Toast notification stack, CommandPalette (⌘K)
│   ├── lib/
│   │   ├── store.tsx            # Central state machine & localStorage persistence
│   │   ├── theme-context.tsx    # Light / Dark mode theme provider
│   │   ├── mock-data.ts         # High-fidelity baseline demonstration dataset
│   │   └── server/
│   │       ├── repository.ts    # In-memory domain repository & mutations
│   │       └── db-seed.ts       # Timeseries & seed records
│   └── types/
│       └── trace.ts             # TypeScript domain models & interfaces
└── supabase/
    └── migrations/
        └── 20260831_init_trace_schema.sql # PostgreSQL schema & RLS policies
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/your-repo/trace.git
cd Trace
npm install
```

2. Start the local development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build

To run type checking and bundle the application for production:
```bash
npm run build
```

To preview the production bundle locally:
```bash
npm run preview
```

---

## ⌨️ Shortcuts & Navigation

| Shortcut | Action |
|---|---|
| <kbd>⌘</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open global Command Palette across feedback, problems, and opportunities |
| <kbd>ESC</kbd> | Dismiss active modal or Command Palette |
| Header Sun / Moon Button | Toggle between Light and Dark mode |
| Header Reset Button | Restore workspace data to factory demonstration baseline |

---

## 🗄️ Database Schemas (Supabase / Postgres)

The platform is designed to connect directly with PostgreSQL / Supabase. Migration scripts are located in:
- [`supabase/migrations/20260831_init_trace_schema.sql`](supabase/migrations/20260831_init_trace_schema.sql)

Includes schemas for `workspaces`, `product_context`, `feedback_sources`, `feedback`, `feedback_atoms`, `themes`, `pain_points`, `insights`, `insight_evidence`, `opportunities`, `product_decisions`, and `roadmap_items`.
