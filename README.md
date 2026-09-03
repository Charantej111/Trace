# Trace — AI Product Feedback & Decision Intelligence Platform

> **Transform raw, multi-source customer feedback into defensible product opportunities, institutional decision memory, and roadmap execution.**

Trace is an enterprise-grade Product Decision & Feedback Intelligence system built with **React 19**, **Vite**, **Tailwind CSS v4**, and **TypeScript**. It replaces subjective roadmap debates with an immutable, verifiable chain of customer evidence:

```
Multi-Channel Ingestion (App Stores, CSV, XLSX, JSON, Paste)
                    ↓
Deterministic Normalization & PII Redaction
                    ↓
Sentence-Level Substring Atomization (Intent, Sentiment, Severity)
                    ↓
Vector Embeddings & Semantic Clustering (Cosine Similarity ≥ 0.82)
                    ↓
Problem Clusters & Emerging Issue Velocity Detection
                    ↓
Customer Insights & Corroborating Evidence Graph
                    ↓
5-Factor Explainable Priority Scoring (0–100 Defensible Score)
                    ↓
Institutional Decision Memory (PDR / ADR Evidence Snapshots)
                    ↓
Roadmap Kanban Board with Live 5-Stage Traceability Tracing
```

---

## ⚡ Tech Stack

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool & Bundler**: [Vite 6](https://vite.dev/) with `@vitejs/plugin-react`
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`, dark mode variant support
- **AI Intelligence**: [Google Gemini Flash](https://ai.google.dev/) (`gemini-2.5-flash` / `gemini-1.5-flash`) for theme synthesis and opportunity framing
- **Real-Time Database**: [Supabase](https://supabase.com/) (PostgreSQL 17) with Row-Level Security (RLS) and real-time client
- **Review Scraping**: `google-play-scraper` & `app-store-scraper` for live store feedback extraction
- **Data Visualizations**: [Recharts](https://recharts.org/) (Interactive area charts, frequency bars, emotional distributions)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Portals & Overlays**: React `createPortal` with fixed viewport coordinate tracking

---

## 🌟 Core Modules & Capabilities

### 1. Multi-Source Feedback Ingestion (`/sources`)
- **Live App Store & Google Play Scraper**: Enter any public Apple App Store or Google Play Store URL. Fetches live app metadata, ratings, developer details, and customer reviews directly into the pipeline with zero mock data.
- **Enterprise File Ingestion Wizard**:
  - Delimited CSV (`.csv`) with automatic header detection and mapping.
  - Excel Spreadsheets (`.xlsx`).
  - Structured JSON (`.json`) datasets.
  - Quick Multi-Row Plain Text Paste.
- **Pre-Ingestion Normalization**: Validates records, dedupes by SHA-256 fingerprint, sanitizes PII (emails, phone numbers, SSNs, credit cards), and detects column mappings deterministically.

### 2. Sentence-Level Atomization & Classification (`/feedback` & `/inbox`)
- **Span-Level Feedback Atoms**: Breaks full feedback statements into discrete atomic clauses with exact start/end character offsets.
- **Deterministic Multi-Label Intent Tagging**: `bug_report`, `feature_request`, `complaint`, `praise`, and `question`.
- **Severity & Sentiment Rating**: Categorizes clauses by severity (`critical`, `high`, `medium`, `low`) and sentiment polarity.
- **Verbatim Highlighter**: Click any highlighted clause in the Feedback Explorer to inspect verification status, confidence score, and associated customer segment.

### 3. Problem Intelligence & Emerging Issues (`/insights`)
- **Semantic Clustering**: Clusters related customer feedback atoms using cosine similarity (threshold `0.82`) and centroid calculation.
- **Problem Clusters Tab**: Displays aggregated customer friction points ranked by verified mention counts.
- **Emerging Velocity Spikes**: Flags sudden increases in negative feedback velocity to detect production regressions before they affect NPS.
- **Segment Breakdown**: Visualizes friction impact across customer cohorts (Enterprise, Mid-Market, SMB, Free Tier).

### 4. Explainable 5-Factor Opportunity Scoring (`/opportunities`)
- **Pure Evidence Gate**: Opportunities are synthesized only when backed by real customer feedback and verified evidence atoms. Zero synthetic filler.
- **5-Factor Mathematical Formula**:
  $$\text{Priority Score} = 0.35 \times \text{Frequency} + 0.35 \times \text{Severity} + 0.10 \times \text{Velocity} + 0.10 \times \text{Segment Weight} + 0.10 \times \text{Strategic Fit}$$
- **PDR Decision Workflow**: Accept or reject candidate opportunities with mandatory rationale logging and target release window scheduling.

### 5. Roadmap Kanban with Live Drag-and-Drop (`/roadmap`)
- **4-Stage Kanban Workflow**: `Candidate` ➔ `Planned` ➔ `In Progress` ➔ `Shipped`.
- **Native HTML5 Drag-and-Drop**: Fluid drag handles with visual drop target highlighting and instant repository persistence.
- **Initiative Management**: Fast status dropdown switcher with portal-based layering, and 1-click initiative deletion.
- **5-Stage Traceability Drawer**: Click **"Trace Evidence →"** on any roadmap card to view the entire audit lineage:
  1. **Roadmap Initiative** (Target period, sprint status, P0/P1 priority).
  2. **Product Opportunity** (0–100 explainable score breakdown).
  3. **Customer Insight** (Impact statement, frequency, and sentiment distribution).
  4. **Problem Cluster** (Mention count, velocity trend, affected segments).
  5. **Direct Customer Evidence** (Verbatim quotes, source timestamps, and channel badges).

### 6. Classification & Audit Defensibility Hub (`/audit`)
- **100% Deterministic Audit Statistics**:
  - Feedback Statements Ingested & Verified Atoms.
  - Active Problem Clusters & Synthesized Opportunities.
  - Overall Traceability Score & Defensibility Certification.
- **Executive Audit Summary**: AI-generated structural assessment identifying top customer friction drivers, segment concentrations, and recommendations.
- **Deep-Dive PM Pain Point Matrix**: Tabular breakdown of mention counts, velocity %, target segments, and direct quotes.
- **Customer Emotion Distribution**: Real-time sentiment metrics (Frustration, Confusion, Relief, Delight).

### 7. Institutional Decision Memory (`/decisions`)
- Permanent, immutable log of product decisions (PDRs).
- Freezes a snapshot of customer evidence (mentions, severity, quotes, score) at the exact moment of decision.
- Eliminates relitigating past roadmap decisions when team members or quarters change.

### 8. Strategic Product Context & Objectives (`/settings/context`)
- Configure organizational OKRs, company goals, and strategic priority weights.
- Configure customer segments with custom impact multipliers.
- **Clear Workspace Data**: 1-click irreversible data purge across Supabase, in-memory caches, and local storage to start fresh with real feedback.

---

## 📁 Directory Structure

```
Trace/
├── index.html                   # HTML entry point with modern typography
├── vite.config.ts               # Vite configuration with React & Tailwind CSS v4
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Project dependencies and scripts
├── .env                         # Supabase & Gemini API configuration
├── src/
│   ├── main.tsx                 # React DOM mount
│   ├── App.tsx                  # Router & AppShell layout mapping
│   ├── index.css                # Tailwind CSS v4 tokens, dark mode, surfaces
│   ├── ai/                      # AI integration
│   │   ├── client.ts            # Gemini API client & usage telemetry guard
│   │   ├── gemini.server.ts     # Gemini SDK execution helper
│   │   └── versioning.ts        # Pipeline versioning & prompt hashes
│   ├── components/
│   │   ├── analytics/           # Area charts & telemetry visualizations
│   │   ├── feedback/            # FeedbackDetailDrawer & AtomHighlighter
│   │   ├── ingestion/           # CSV/XLSX/JSON Wizard, App Store Modal, Paste Modal
│   │   ├── layout/              # Sidebar, Header, AppShell
│   │   ├── roadmap/             # TraceabilityDrawer (5-Stage evidence tree)
│   │   └── ui/                  # CustomSelect (Portal-based), Toast stack, Store icons
│   ├── evidence/
│   │   ├── adapters/            # App Store, Google Play, and Generic adapters
│   │   ├── normalization/       # Field detector, validator, fingerprinting, PII redactor
│   │   └── provenance.ts        # Evidence chain tracking
│   ├── intelligence/
│   │   ├── atomization/         # Sentence & clause substring tokenizer
│   │   ├── audit/               # AuditStatisticsCalculator, DetailedAuditAnalyzer, AuditSummarySynthesizer
│   │   ├── classification/      # Intent, severity, and sentiment classifier
│   │   ├── clustering/          # Vector clustering & centroid calculations
│   │   ├── embeddings/          # Embedding generation service
│   │   ├── insights/            # Insight synthesis engine
│   │   └── pain-points/         # Deterministic pain point aggregator
│   ├── lib/
│   │   ├── evidence-utils.ts    # Evidence formatting & verification helpers
│   │   ├── mock-data.ts         # Clean baseline workspace templates (Zero mock data)
│   │   ├── stage-utils.ts       # Pipeline stage human-readable labels
│   │   ├── store.tsx            # Central TraceStoreContext & multi-tier repository sync
│   │   └── supabase.ts          # Supabase client & database sync
│   ├── pages/                   # Application views
│   │   ├── AuditPage.tsx        # Defensibility certification & PM audit hub
│   │   ├── ContextSettingsPage.tsx # Strategic goals & customer segments
│   │   ├── DecisionsPage.tsx    # Institutional Decision Memory (PDR Log)
│   │   ├── FeedbackPage.tsx     # Feedback Explorer & Clause Inspector
│   │   ├── InboxPage.tsx        # Ingestion queue & triage
│   │   ├── InsightsPage.tsx     # Problem clusters & emerging issues
│   │   ├── OpportunitiesPage.tsx# Prioritization matrix & 5-factor scoring
│   │   ├── OverviewPage.tsx     # Executive intelligence dashboard
│   │   ├── RoadmapPage.tsx      # Kanban board with drag-and-drop
│   │   ├── SourcesPage.tsx      # Multi-channel ingestion hub
│   │   └── StrategicContextPage.tsx # Workspace settings & data purge
│   ├── repositories/            # In-memory & Supabase persistence repositories
│   │   ├── decisions-repo.ts    # Opportunities, decisions, and roadmap items
│   │   ├── feedback-repo.ts     # Feedback sources, statements, and atoms
│   │   ├── intelligence-repo.ts # Themes, pain points, and insights
│   │   └── processing-job-repo.ts # Async ingestion job tracking
│   ├── scoring/
│   │   └── explainable-scoring.ts # 5-Factor explainable scoring formula
│   ├── server/
│   │   └── review-service.ts    # Google Play & Apple App Store review fetcher
│   └── types/
│       └── trace.ts             # TypeScript domain models
└── supabase/
    └── migrations/
        └── 20260831_init_trace_schema.sql # PostgreSQL schema & RLS policies
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project (PostgreSQL 17)
- A [Google Gemini API Key](https://aistudio.google.com/)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Charantej111/Trace.git
cd Trace
npm install
```

### 2. Configure Environment Variables

Create or update `.env` in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres

# Google Gemini AI Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_GEMINI_MODEL=gemini-2.5-flash
VITE_GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

### 3. Initialize Supabase Database

Execute the migration file located at `supabase/migrations/20260831_init_trace_schema.sql` in your Supabase SQL Editor:

```bash
npm run migrate:schema
```

This creates the tables (`workspaces`, `product_context`, `customer_segments`, `feedback_sources`, `feedback`, `feedback_atoms`, `themes`, `pain_points`, `insights`, `insight_evidence`, `opportunities`, `product_decisions`, `roadmap_items`, `processing_jobs`) with foreign key constraints, indexes, and Row-Level Security policies.

### 4. Start Development Server

```bash
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

---

## 🔒 Security & Data Hygiene

- **Zero Mock Data Principle**: Trace does not rely on synthetic sample datasets or fallback mock records. All insights, problem clusters, and opportunities are computed deterministically from uploaded customer evidence.
- **PII Redaction**: Email addresses, phone numbers, and identifying tokens are automatically scrubbed upon ingestion.
- **Safe Version Control**: Production bundles (`/dist`) are ignored in `.gitignore` to prevent bundling API keys or compiled artifacts into Git.
- **Row-Level Security**: All Supabase database tables enforce strict workspace-level tenant isolation.

---

## 📄 License

MIT License — free for personal and commercial use.
