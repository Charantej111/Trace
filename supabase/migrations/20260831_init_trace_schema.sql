-- Trace Master Database Schema
-- Version: 2.1 (Universal text IDs for flexible string/UUID keys, vector support, atom constraints)

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- 1. Profiles & Workspaces
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workspaces (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  product_name text,
  product_category text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workspace_members (
  workspace_id text not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- 2. Product Context
create table if not exists product_context (
  workspace_id text primary key references workspaces(id) on delete cascade,
  company_goals jsonb not null default '[]',
  target_segments jsonb not null default '[]',
  strategic_focus_areas jsonb not null default '[]',
  known_constraints jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- 3. Sources & Ingestion
create table if not exists feedback_sources (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  type text not null check (type in ('csv', 'xlsx', 'json', 'paste', 'google_play', 'app_store', 'zendesk', 'intercom', 'sales_call', 'survey', 'api', 'other')),
  name text not null,
  status text not null default 'active',
  configuration jsonb not null default '{}',
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists imports (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  source_id text references feedback_sources(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'completed_with_warnings', 'failed', 'cancelled')),
  file_name text,
  file_type text,
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
create table if not exists customer_segments (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  strategic_weight numeric default 1.0,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  external_id text,
  segment_id text references customer_segments(id) on delete set null,
  display_name text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 5. Raw Feedback & Evidence
create table if not exists feedback (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  source_id text references feedback_sources(id) on delete set null,
  import_id text references imports(id) on delete set null,
  external_id text,
  original_text text not null,
  analysis_text text,
  language text default 'en',
  source_created_at timestamptz,
  imported_at timestamptz not null default now(),
  customer_id text references customers(id) on delete set null,
  customer_name text,
  customer_segment_id text references customer_segments(id) on delete set null,
  customer_segment_name text,
  rating numeric,
  app_version text,
  device_info text,
  source_location jsonb not null default '{}',
  normalized_metadata jsonb not null default '{}',
  raw_payload jsonb not null default '{}',
  fingerprint text not null,
  status text not null default 'valid' check (status in ('pending', 'valid', 'invalid', 'duplicate', 'processed', 'failed')),
  created_at timestamptz not null default now()
);

-- 6. Feedback Atoms
create table if not exists feedback_atoms (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  feedback_id text not null references feedback(id) on delete cascade,
  atom_text text not null,
  source_start integer not null,
  source_end integer not null,
  intent text check (intent in ('bug_report', 'complaint', 'feature_request', 'praise', 'question')),
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  sentiment_score numeric,
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  is_feature_request boolean default false,
  underlying_problem_hint text,
  confidence text not null default 'medium' check (confidence in ('high', 'medium', 'low')),
  embedding vector,
  created_at timestamptz not null default now(),
  constraint unique_atom_span unique (feedback_id, source_start, source_end),
  constraint valid_atom_bounds check (source_start >= 0 and source_end > source_start)
);

-- 7. Themes & Candidate Clusters
create table if not exists themes (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  atom_count integer not null default 0,
  confidence text not null default 'medium',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists theme_atoms (
  theme_id text not null references themes(id) on delete cascade,
  atom_id text not null references feedback_atoms(id) on delete cascade,
  similarity_score numeric,
  created_at timestamptz not null default now(),
  primary key (theme_id, atom_id)
);

-- 8. Pain Points & Emerging Issues
create table if not exists pain_points (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  theme_id text references themes(id) on delete set null,
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

-- 9. Insights & Evidence
create table if not exists insights (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  pain_point_id text references pain_points(id) on delete set null,
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

create table if not exists insight_evidence (
  insight_id text not null references insights(id) on delete cascade,
  atom_id text not null references feedback_atoms(id) on delete cascade,
  feedback_id text not null references feedback(id) on delete cascade,
  evidence_type text not null default 'supporting' check (evidence_type in ('supporting', 'contradicting', 'neutral')),
  quote_text text not null,
  relevance_score numeric,
  created_at timestamptz not null default now(),
  primary key (insight_id, atom_id)
);

-- 10. Opportunities with 6-Factor Scoring
create table if not exists opportunities (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  insight_id text references insights(id) on delete set null,
  title text not null,
  problem_statement text not null,
  opportunity_statement text not null,
  suggested_solution text,
  target_segments jsonb not null default '[]',
  score_frequency numeric default 0,
  score_severity numeric default 0,
  score_trend numeric default 0,
  score_segment_impact numeric default 0,
  score_strategic_relevance numeric default 0,
  score_evidence_quality numeric default 0,
  status text not null default 'suggested' check (status in ('suggested', 'reviewing', 'accepted', 'rejected', 'archived')),
  confidence text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. Product Decision Memory
create table if not exists product_decisions (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  opportunity_id text references opportunities(id) on delete set null,
  title text not null,
  decision text not null check (decision in ('accepted', 'rejected_wont_do', 'deferred', 'workaround_exists')),
  rationale text not null,
  evidence_snapshot jsonb not null default '{}',
  alternative_prioritized_id text references opportunities(id) on delete set null,
  decided_by uuid references auth.users(id),
  decided_at timestamptz not null default now()
);

-- 12. Roadmap Items & Post-Ship Impact
create table if not exists roadmap_items (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  opportunity_id text references opportunities(id) on delete set null,
  decision_id text references product_decisions(id) on delete set null,
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

-- 13. Processing Jobs Hierarchy (3-Level Durable Engine)
create table if not exists processing_jobs (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  import_id text references imports(id) on delete cascade,
  idempotency_key text not null,
  type text not null default 'import' check (type in ('import', 'reprocess', 'incremental')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'partially_failed')),
  total_records integer default 0,
  processed_records integer default 0,
  failed_records integer default 0,
  error text,
  pipeline_version text not null default '1.0.0',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

create table if not exists processing_job_stages (
  id text primary key default gen_random_uuid()::text,
  job_id text not null references processing_jobs(id) on delete cascade,
  stage text not null check (stage in (
    'normalization', 'atomization', 'classification', 'embedding',
    'clustering', 'theme_generation', 'pain_point_generation',
    'insight_generation', 'opportunity_generation'
  )),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'skipped')),
  total_items integer default 0,
  processed_items integer default 0,
  failed_items integer default 0,
  error text,
  attempt integer default 1,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id, stage)
);

create table if not exists processing_job_items (
  id text primary key default gen_random_uuid()::text,
  stage_id text not null references processing_job_stages(id) on delete cascade,
  job_id text not null references processing_jobs(id) on delete cascade,
  entity_type text not null check (entity_type in ('feedback', 'atom', 'cluster', 'pain_point', 'insight')),
  entity_id text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  attempt integer default 1,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (stage_id, entity_type, entity_id)
);

-- 14. AI Run Tracking & Cost Guard
create table if not exists ai_runs (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references workspaces(id) on delete cascade,
  job_id text references processing_jobs(id) on delete set null,
  stage text not null,
  operation text not null,
  provider text not null default 'openai',
  model text not null,
  input_tokens integer default 0,
  output_tokens integer default 0,
  estimated_cost numeric default 0,
  duration_ms integer default 0,
  status text not null default 'success',
  pipeline_version text not null default '1.0.0',
  prompt_version text not null default 'v1',
  error text,
  created_at timestamptz not null default now()
);

-- Indexes for performance & vector search
create index if not exists idx_feedback_workspace on feedback(workspace_id);
create index if not exists idx_feedback_fingerprint on feedback(workspace_id, fingerprint);
create index if not exists idx_atoms_feedback on feedback_atoms(feedback_id);
create index if not exists idx_processing_jobs_workspace on processing_jobs(workspace_id);
create index if not exists idx_processing_job_stages_job on processing_job_stages(job_id);
create index if not exists idx_processing_job_items_stage on processing_job_items(stage_id);

-- RLS Helper
create or replace function is_workspace_member(ws_id text)
returns boolean as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$ language sql security definer;
