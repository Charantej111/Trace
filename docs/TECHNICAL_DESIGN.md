# Trace — Technical Design Document (TDD)

**System:** Customer Feedback Product Intelligence Platform (Trace)  
**Version:** 1.0  
**Status:** Architecture Blueprint  

---

## 1. System Architecture Overview

```text
                                  CLIENT LAYER
                   Next.js 14+ App Router (TypeScript + Tailwind CSS)
     ┌───────────────────────────────────┼───────────────────────────────────┐
     │                                   │                                   │
 Inbox / Feedback                Insights / Evidence             Opportunities / Roadmap
     │                                   │                                   │
     └───────────────────────────────────┼───────────────────────────────────┘
                                         ↓
                                 APPLICATION LAYER
                      Next.js Server Actions & Route Handlers
     ┌───────────────────────────────────┼───────────────────────────────────┐
     │                                   │                                   │
 Ingestion Engine               Deterministic Engine                 AI Pipeline Engine
 (CSV / Stream / Parser)        (Trends / Scores / Velocity)        (Atomizer / Classifier)
     │                                   │                                   │
     └───────────────────────────────────┼───────────────────────────────────┘
                                         ↓
                                 DATA & AI LAYER
        ┌────────────────────────────────┴────────────────────────────────┐
        ↓                                                                 ↓
Supabase PostgreSQL + pgvector                                      OpenAI API
(RLS Multi-Tenancy, Vectors, FTS)                       (Structured JSON & Embeddings)
```

---

## 2. Deterministic vs. Generative Boundary Architecture

```text
┌──────────────────────────────────────────────────┐
│             DETERMINISTIC ENGINE                 │
│         (PostgreSQL Queries & Code Math)         │
├──────────────────────────────────────────────────┤
│ • Ingestion Count & Duplicate Rate               │
│ • Period-over-Period Trend % (vs prior 30 days)  │
│ • Velocity Multiplier (Emerging Spikes)          │
│ • Segment Distribution %                         │
│ • 6-Factor Opportunity Score Calculation         │
│ • Multi-Tenant Row-Level Security Policies       │
│ • Post-Ship Complaint Delta Tracking             │
└──────────────────────────────────────────────────┘
                         ↕
┌──────────────────────────────────────────────────┐
│              GENERATIVE ENGINE                   │
│          (OpenAI Structured Outputs)             │
├──────────────────────────────────────────────────┤
│ • Text Normalization & PII Masking               │
│ • Message Span-Level Atomization                 │
│ • Intent, Sentiment & Severity Tagging           │
│ • Topic vs Problem Disambiguation                │
│ • Theme & Pain Point Naming                      │
│ • Opportunity Solution Synthesis                 │
│ • Supporting vs Contradicting Quote Ranking      │
└──────────────────────────────────────────────────┘
```

---

## 3. Database Schema (PostgreSQL + pgvector)

```sql
-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- 1. Profiles & Workspaces
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  product_name text,
  product_category text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- 2. Product Context Configuration
create table product_context (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  company_goals jsonb not null default '[]',
  target_segments jsonb not null default '[]',
  strategic_focus_areas jsonb not null default '[]',
  known_constraints jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- 3. Feedback Sources & Ingestion Batches
create table feedback_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  type text not null check (type in ('csv', 'google_play', 'app_store', 'zendesk', 'intercom', 'sales_call', 'survey', 'other')),
  name text not null,
  status text not null default 'active',
  configuration jsonb not null default '{}',
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create table imports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source_id uuid references feedback_sources(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  file_name text,
  total_rows integer default 0,
  accepted_rows integer default 0,
  rejected_rows integer default 0,
  duplicate_rows integer default 0,
  atoms_extracted integer default 0,
  error_summary jsonb not null default '{}',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 4. Customer Metadata & Segments
create table customer_segments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null, -- 'Enterprise', 'SMB', 'Consumer'
  description text,
  strategic_weight numeric default 1.0,
  created_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  external_id text,
  segment_id uuid references customer_segments(id) on delete set null,
  display_name text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 5. Raw Feedback (Immutable Source of Record)
create table feedback (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source_id uuid references feedback_sources(id) on delete set null,
  import_id uuid references imports(id) on delete set null,
  external_id text,
  original_text text not null,
  normalized_text text,
  language text default 'en',
  source_created_at timestamptz,
  imported_at timestamptz not null default now(),
  customer_id uuid references customers(id) on delete set null,
  customer_segment_id uuid references customer_segments(id) on delete set null,
  rating numeric,
  app_version text,
  device_info text,
  metadata jsonb not null default '{}',
  fingerprint text not null, -- hash(normalized_text + source_id + external_id)
  created_at timestamptz not null default now()
);

-- 6. Feedback Atoms (Decomposed Message Clauses)
create table feedback_atoms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  feedback_id uuid not null references feedback(id) on delete cascade,
  atom_text text not null,
  source_start integer not null, -- Character offset start in original_text
  source_end integer not null,   -- Character offset end in original_text
  intent text check (intent in ('bug_report', 'complaint', 'feature_request', 'praise', 'question')),
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  sentiment_score numeric,
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  is_feature_request boolean default false,
  underlying_problem_hint text,
  confidence text not null default 'medium' check (confidence in ('high', 'medium', 'low')),
  embedding vector(1536),
  created_at timestamptz not null default now()
);

-- 7. Themes & Candidate Clusters
create table themes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  atom_count integer not null default 0,
  confidence text not null default 'medium',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table theme_atoms (
  theme_id uuid not null references themes(id) on delete cascade,
  atom_id uuid not null references feedback_atoms(id) on delete cascade,
  similarity_score numeric,
  created_at timestamptz not null default now(),
  primary key (theme_id, atom_id)
);

-- 8. Pain Points & Emerging Issues
create table pain_points (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  theme_id uuid references themes(id) on delete set null,
  title text not null,
  description text not null,
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  frequency integer not null default 0,
  trend_percentage numeric default 0,
  is_emerging boolean default false,
  velocity_multiplier numeric default 1.0,
  confidence text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. Insights & Evidence (Supporting + Contradicting)
create table insights (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  pain_point_id uuid references pain_points(id) on delete set null,
  title text not null,
  summary text not null,
  insight_type text not null check (insight_type in ('pain_point', 'feature_request', 'trend', 'emerging_issue', 'divergent_signal')),
  affected_segments jsonb not null default '[]',
  frequency integer not null default 0,
  trend_percentage numeric default 0,
  confidence text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table insight_evidence (
  insight_id uuid not null references insights(id) on delete cascade,
  atom_id uuid not null references feedback_atoms(id) on delete cascade,
  feedback_id uuid not null references feedback(id) on delete cascade,
  evidence_type text not null default 'supporting' check (evidence_type in ('supporting', 'contradicting', 'neutral')),
  quote_text text not null,
  relevance_score numeric,
  created_at timestamptz not null default now(),
  primary key (insight_id, atom_id)
);

-- 10. Opportunities with 6-Factor Scoring
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  insight_id uuid references insights(id) on delete set null,
  title text not null,
  problem_statement text not null,
  opportunity_statement text not null,
  suggested_solution text,
  target_segments jsonb not null default '[]',
  
  -- Score Weights (0-100)
  score_frequency numeric default 0,
  score_severity numeric default 0,
  score_trend numeric default 0,
  score_segment_impact numeric default 0,
  score_strategic_relevance numeric default 0,
  score_evidence_quality numeric default 0,
  overall_priority_score numeric generated always as (
    (score_frequency * 0.20) +
    (score_severity * 0.20) +
    (score_trend * 0.15) +
    (score_segment_impact * 0.15) +
    (score_strategic_relevance * 0.15) +
    (score_evidence_quality * 0.15)
  ) stored,
  
  status text not null default 'suggested' check (status in ('suggested', 'reviewing', 'accepted', 'rejected', 'archived')),
  confidence text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. Product Decision Memory
create table product_decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete set null,
  title text not null,
  decision text not null check (decision in ('accepted', 'rejected_wont_do', 'deferred', 'workaround_exists')),
  rationale text not null,
  evidence_snapshot jsonb not null default '{}',
  alternative_prioritized_id uuid references opportunities(id) on delete set null,
  decided_by uuid references auth.users(id),
  decided_at timestamptz not null default now()
);

-- 12. Roadmap Items & Post-Ship Impact
create table roadmap_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete set null,
  decision_id uuid references product_decisions(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'idea' check (status in ('idea', 'candidate', 'planned', 'in_progress', 'shipped', 'archived')),
  target_period text,
  shipped_at timestamptz,
  baseline_complaint_frequency integer,
  post_ship_complaint_frequency integer,
  impact_percentage_change numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## 4. Row-Level Security (RLS) Multi-Tenant Policies

```sql
-- Helper function to check membership
create or replace function is_workspace_member(ws_id uuid)
returns boolean as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$ language sql security definer;

-- Enable RLS across all tables
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table product_context enable row level security;
alter table feedback_sources enable row level security;
alter table imports enable row level security;
alter table customer_segments enable row level security;
alter table customers enable row level security;
alter table feedback enable row level security;
alter table feedback_atoms enable row level security;
alter table themes enable row level security;
alter table theme_atoms enable row level security;
alter table pain_points enable row level security;
alter table insights enable row level security;
alter table insight_evidence enable row level security;
alter table opportunities enable row level security;
alter table product_decisions enable row level security;
alter table roadmap_items enable row level security;

-- Workspace Isolation Policy Template
create policy "Workspace member read" on feedback for select using (is_workspace_member(workspace_id));
create policy "Workspace member insert" on feedback for insert with check (is_workspace_member(workspace_id));
create policy "Workspace member update" on feedback for update using (is_workspace_member(workspace_id));
create policy "Workspace member delete" on feedback for delete using (is_workspace_member(workspace_id));
-- (Applied systematically to all workspace-scoped tables)
```

---

## 5. Ingestion & AI Pipeline Contract

### 5.1 Atomization JSON Schema Contract

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FeedbackAtomizationResponse",
  "type": "object",
  "properties": {
    "atoms": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "atom_text": { "type": "string" },
          "source_start": { "type": "integer" },
          "source_end": { "type": "integer" },
          "intent": { "type": "string", "enum": ["bug_report", "complaint", "feature_request", "praise", "question"] },
          "sentiment": { "type": "string", "enum": ["positive", "neutral", "negative"] },
          "sentiment_score": { "type": "number", "minimum": -1.0, "maximum": 1.0 },
          "severity": { "type": "string", "enum": ["low", "medium", "high", "critical"] },
          "is_feature_request": { "type": "boolean" },
          "underlying_problem_hint": { "type": "string" },
          "confidence": { "type": "string", "enum": ["high", "medium", "low"] }
        },
        "required": ["atom_text", "source_start", "source_end", "intent", "sentiment", "severity", "is_feature_request", "confidence"]
      }
    }
  },
  "required": ["atoms"]
}
```

---

## 6. Frontend Module Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── inbox/
│   │   │   └── page.tsx
│   │   ├── feedback/
│   │   │   └── page.tsx
│   │   ├── insights/
│   │   │   ├── page.tsx
│   │   │   ├── pain-points/page.tsx
│   │   │   ├── emerging/page.tsx
│   │   │   ├── divergent/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── opportunities/
│   │   │   └── page.tsx
│   │   ├── roadmap/
│   │   │   └── page.tsx
│   │   ├── decisions/
│   │   │   └── page.tsx
│   │   ├── sources/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       ├── context/page.tsx
│   │       └── workspace/page.tsx
│   └── api/
│       ├── imports/
│       │   ├── upload/route.ts
│       │   └── process/route.ts
│       ├── pipeline/
│       │   ├── atomize/route.ts
│       │   ├── cluster/route.ts
│       │   └── synthesize/route.ts
│       └── search/route.ts
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── feedback/
│   │   ├── atom-highlighter.tsx
│   │   ├── feedback-table.tsx
│   │   └── feedback-drawer.tsx
│   ├── insights/
│   │   ├── evidence-card.tsx
│   │   ├── emerging-badge.tsx
│   │   └── divergent-viewer.tsx
│   ├── opportunities/
│   │   ├── score-breakdown-modal.tsx
│   │   └── opportunity-card.tsx
│   ├── roadmap/
│   │   ├── kanban-board.tsx
│   │   └── traceability-drawer.tsx
│   └── decisions/
│       ├── decision-timeline.tsx
│       └── snapshot-modal.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── analytics/
│   │   ├── trends.ts
│   │   ├── velocity.ts
│   │   └── scorer.ts
│   └── ai/
│       ├── pii.ts
│       ├── atomizer.ts
│       ├── embeddings.ts
│       ├── clusterer.ts
│       └── synthesizer.ts
└── types/
    ├── database.ts
    └── trace.ts
```
