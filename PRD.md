# Customer Feedback Product Intelligence Platform
## Complete Product, PRD, Technical Architecture, AI, Data, Security, and Delivery Specification

**Document status:** Master project specification  
**Version:** 1.0  
**Date:** 31 August 2026  
**Scope:** MVP through production-ready foundation  
**Working product description:** An AI-powered product intelligence platform that ingests messy customer feedback from sources such as app reviews, support tickets, sales conversations, surveys, and CSV files; clusters and interprets the feedback; identifies recurring pain points and emerging themes; shows the underlying customer evidence; and converts validated insights into product opportunities and roadmap recommendations.

---

# 1. Executive Summary

Product teams receive customer feedback everywhere: app-store reviews, support tickets, sales calls, surveys, emails, community discussions, and internal notes.

The problem is not that feedback is unavailable. The problem is that it is **fragmented, unstructured, repetitive, difficult to analyze at scale, and disconnected from product decisions**.

A PM may have thousands of customer comments but still be unable to answer with confidence:

- What are customers struggling with most?
- Which problems are increasing?
- Which customer segments are affected?
- Is this a feature request or a deeper problem?
- How often is the problem mentioned?
- Which sources support the conclusion?
- What exact customers said this?
- What should we consider building?
- Why should that item be prioritized over another?

The proposed product solves this by creating a traceable chain:

**Customer feedback → normalized feedback → semantic clusters → themes → pain points → evidence → opportunities → roadmap recommendations**

The defining product principle is:

> **Every important AI-generated insight should be traceable to real customer evidence.**

The product should not simply produce summaries. It should help product teams make **evidence-backed product decisions**.

---

# 2. Product Vision

## Vision

Build a product intelligence system that turns fragmented customer voice into clear, evidence-backed product opportunities.

## One-line value proposition

> **Turn thousands of customer conversations into a prioritized, evidence-backed product roadmap.**

## Product promise

The product should allow a PM to go from:

> "We have thousands of pieces of customer feedback."

to:

> "These are the five most important customer problems, these customer groups are affected, this is the evidence behind them, these problems are changing over time, and these are the product opportunities worth considering."

---

# 3. The Problem

## 3.1 Current state

Customer feedback exists across many systems:

- Google Play reviews
- App Store reviews
- Zendesk tickets
- Intercom conversations
- Sales call transcripts
- Surveys
- CSV exports
- Email
- Slack/community discussions
- CRM notes
- User interviews

Each source has different:

- Formats
- Metadata
- Volumes
- Context
- Terminology
- Duplicates
- Noise
- Quality

A PM often performs the following manually:

1. Export data
2. Read feedback
3. Copy useful comments
4. Tag comments
5. Group similar comments
6. Count themes
7. Identify important problems
8. Search for supporting quotes
9. Compare customer segments
10. Create a presentation
11. Convert findings into roadmap candidates

This workflow is slow and inconsistent.

## 3.2 The deeper problem

The problem is not simply "too much data."

The deeper problem is:

> **The connection between customer voice and product decisions is weak.**

Feedback is collected, but it does not reliably become product intelligence.

---

# 4. Problem Statement

### Primary problem statement

Product teams struggle to synthesize large volumes of fragmented, unstructured customer feedback into trustworthy insights and actionable roadmap decisions.

### Consequences

- Important problems are missed.
- Frequently repeated problems may be mistaken for isolated complaints.
- Loud customers can disproportionately influence decisions.
- Feature requests may be prioritized without understanding the underlying need.
- PMs spend significant time manually analyzing feedback.
- Roadmap decisions become opinion-driven.
- Teams cannot easily show evidence for why a feature was prioritized.
- Trends and emerging issues are difficult to detect.
- Feedback from different sources remains siloed.

---

# 5. Product Goal

The product should reduce the time and effort required to move from raw customer feedback to evidence-backed product decisions.

## Primary outcome

A PM should be able to:

1. Import or connect customer feedback.
2. Let the system normalize and analyze it.
3. Discover recurring themes and pain points.
4. Inspect supporting customer evidence.
5. Understand affected segments and sources.
6. Identify opportunities.
7. Decide whether an opportunity belongs on the roadmap.

---

# 6. What We Are NOT Building

The MVP is not intended to be:

- A full customer support platform
- A CRM
- A replacement for Zendesk
- A replacement for Intercom
- A project management system
- A Jira replacement
- A generic chatbot
- A generic text summarizer
- An autonomous product manager
- An automatic roadmap generator that bypasses PM judgment
- A scraping business whose main value is collecting public reviews

The product's core value is **customer feedback intelligence and evidence-backed product decision support**.

---

# 7. Target Users

## Primary persona: Product Manager

### Goals

- Understand customer problems
- Prioritize opportunities
- Validate assumptions
- Prepare roadmap decisions
- Communicate evidence to stakeholders

### Pain points

- Too much feedback
- Too many disconnected tools
- Manual tagging
- Difficult synthesis
- Lack of evidence
- Time pressure
- Stakeholder opinions overriding customer evidence

### Job to be done

> When I have large amounts of customer feedback, I want to quickly identify recurring customer problems and understand their evidence and impact so I can make better product decisions.

---

## Secondary persona: Head of Product

Needs:

- High-level trends
- Strategic themes
- Segment differences
- Emerging risks
- Roadmap justification

---

## Secondary persona: Founder / Product-led founder

Needs:

- Fast understanding of customer pain
- Minimal analysis work
- Clear opportunities
- Evidence for product bets

---

## Secondary persona: UX Researcher / Customer Researcher

Needs:

- Theme discovery
- Evidence exploration
- Quote retrieval
- Segment analysis
- Research synthesis

---

# 8. Core User Journey

```text
SIGN UP
   ↓
CREATE WORKSPACE
   ↓
ADD PRODUCT CONTEXT
   ↓
CONNECT / UPLOAD FEEDBACK
   ↓
MAP SOURCE FIELDS
   ↓
IMPORT
   ↓
NORMALIZE
   ↓
DEDUPLICATE
   ↓
ANALYZE
   ↓
EMBED
   ↓
CLUSTER
   ↓
NAME THEMES
   ↓
IDENTIFY PAIN POINTS
   ↓
SHOW EVIDENCE
   ↓
IDENTIFY OPPORTUNITIES
   ↓
PM REVIEWS
   ↓
ADD TO ROADMAP
   ↓
TRACK DECISION
   ↓
INGEST NEW FEEDBACK
   ↓
REASSESS
```

---

# 9. Product Principles

## Principle 1: Evidence first

Every important insight must be traceable to source feedback.

## Principle 2: AI recommends, PM decides

AI should accelerate product thinking, not replace product ownership.

## Principle 3: Preserve original customer voice

Never overwrite original feedback.

Store original and normalized versions separately.

## Principle 4: Deterministic calculations

Counts, dates, percentages, trend calculations, permissions, and relationships should be calculated by the application/database, not invented by an LLM.

## Principle 5: Human-readable AI

AI output should be understandable without technical knowledge.

## Principle 6: Source-aware

The system should know whether feedback came from an app review, ticket, sales call, survey, or other source.

## Principle 7: Multi-tenant security

One workspace must never access another workspace's customer data.

## Principle 8: Build the intelligence core before integrations

CSV should prove the product before dozens of connectors are built.

---

# 10. MVP Definition

## MVP input

Primary:

- CSV upload

Optional first integrations:

- Google Play reviews
- App Store reviews

## MVP processing

- Import
- Validation
- Normalization
- Deduplication
- Language detection
- Sentiment classification
- Intent classification
- Embeddings
- Semantic similarity
- Clustering
- Theme naming
- Pain-point extraction
- Evidence selection
- Trend calculations
- Opportunity generation

## MVP output

- Feedback explorer
- Insights
- Pain points
- Evidence explorer
- Customer quotes
- Segment analysis
- Source analysis
- Opportunity recommendations
- Roadmap
- Basic product analytics

## Post-MVP

- Zendesk
- Intercom
- Sales-call integrations
- Slack/community
- Survey integrations
- AI copilot
- Automatic recurring sync
- Advanced prioritization
- Team collaboration
- Enterprise SSO
- Advanced governance

---

# 11. Product Information Architecture

```text
Workspace
│
├── Overview
│
├── Feedback
│   ├── All Feedback
│   ├── Filters
│   └── Feedback Detail
│
├── Insights
│   ├── Themes
│   ├── Pain Points
│   ├── Requests
│   ├── Trends
│   └── Insight Detail
│
├── Evidence
│   ├── Search
│   ├── Filters
│   └── Evidence Detail
│
├── Opportunities
│   ├── Suggested
│   └── Accepted
│
├── Roadmap
│   ├── Board
│   ├── List
│   └── Roadmap Detail
│
├── Sources
│   ├── Connected Sources
│   ├── Imports
│   └── Sync History
│
└── Settings
    ├── Workspace
    ├── Members
    ├── Integrations
    ├── AI / Data
    └── Security
```

---

# 12. Core Screens

## 12.1 Authentication

Requirements:

- Sign up
- Sign in
- Sign out
- Password reset
- Email verification
- OAuth as optional
- Session persistence
- Protected routes

---

## 12.2 Onboarding

Steps:

1. Create workspace
2. Product name
3. Product category
4. Customer type
5. Select initial source
6. Upload/connect data
7. Process data
8. Show first insights

The onboarding should demonstrate value quickly.

---

## 12.3 Overview Dashboard

Must answer:

> "What are customers telling us right now?"

Components:

- Feedback analyzed
- Number of themes
- Number of pain points
- Negative sentiment percentage
- Top pain points
- Emerging issues
- Trending themes
- Top customer segments
- Recent evidence
- Roadmap opportunities

---

## 12.4 Feedback Explorer

Requirements:

- Search
- Filter
- Sort
- Pagination/infinite loading
- Source filter
- Sentiment filter
- Segment filter
- Date filter
- Theme filter
- Rating filter where applicable
- Open feedback detail

---

## 12.5 Feedback Detail

Show:

- Original text
- Source
- Source ID
- Date
- Rating if available
- Customer segment
- Language
- AI classifications
- Related theme
- Related pain point
- Related opportunity
- Similar feedback

Never hide the original text.

---

## 12.6 Insights

Show:

- Themes
- Mention counts
- Trend
- Sentiment distribution
- Severity
- Affected segments
- Sources
- Confidence
- Representative quotes

---

## 12.7 Insight Detail

Example:

### Checkout experience

**428 mentions**

**High priority**

**+32% vs previous period**

Show:

- What is happening
- Why it matters
- Who is affected
- Source distribution
- Sentiment
- Trend
- Supporting quotes
- All evidence
- Related feedback
- Suggested opportunity
- Confidence
- AI reasoning summary

---

## 12.8 Evidence Explorer

Think of this as "search engine for customer voice."

Requirements:

- Full-text search
- Semantic search
- Combined search
- Filters
- Quote extraction
- Source context
- Link back to insight
- Link back to original feedback

---

## 12.9 Opportunity Detail

Show:

- Problem
- Evidence
- Opportunity statement
- Suggested solution
- Affected customers
- Evidence count
- Impact
- Confidence
- Risks
- Related themes
- Add to roadmap action

---

## 12.10 Roadmap

Statuses:

```text
Idea
Candidate
Planned
In Progress
Shipped
Archived
```

Every roadmap item should retain links to:

- Opportunities
- Insights
- Feedback
- Evidence

---

# 13. Feedback Data Sources

## Source strategy

Use **official APIs or authorized connectors where available**.

Do not make HTML scraping the default architecture.

### Priority

| Source | MVP | Integration method |
|---|---:|---|
| CSV | Yes | Upload |
| Google Play | Yes / early P1 | Google Play Developer API |
| App Store | Yes / early P1 | App Store Connect API |
| Zendesk | P1 | Official API |
| Intercom | P1 | Official API |
| Sales transcripts | P1 | File/API |
| Surveys | P1 | CSV/API |
| Slack | P2 | Official API |
| CRM | P2 | Official API |

Google's Android Publisher API exposes review resources and supports listing and retrieving reviews for an application. The review resource includes review ID, user comment content, star rating, language, device information, timestamps, and developer responses. citeturn1search4turn1search7

Apple's App Store Connect API provides customer review resources, including listing reviews for an app or app version, filtering by territory/rating, sorting, and reading individual review details. citeturn0search0

Zendesk provides ticket and ticket-comment APIs. Comments can be public or private, so the connector must explicitly distinguish customer-facing content from internal notes. citeturn0search10turn0search2

Intercom provides a Conversations API for retrieving and working with customer conversations. citeturn0search4turn0search11

---

# 14. Data Acquisition Strategy

## Phase 1: Development data

Use:

1. Synthetic data
2. Public/licensed datasets
3. Authorized exports
4. API-accessible review data

## Phase 2: Product demo

Use a controlled dataset containing approximately:

- 2,000 to 5,000 feedback items

Example:

```text
Google Play       2,000
App Store         1,000
Support CSV       1,000
Sales transcripts   500
-----------------------
Total             4,500
```

The exact volume is not a hard requirement. The objective is enough diversity to demonstrate clustering and evidence retrieval.

## Phase 3: Real customer data

Connect customer-owned systems using OAuth/API credentials.

---

# 15. Scraping and Legal/Data Policy

## API first

If an official API exists, use it.

Do not make scraping the default just because HTML is visible.

## Public review data

Public does not automatically mean unrestricted commercial use.

Before using public review data in a commercial product:

- Review the source terms.
- Review API terms.
- Review licensing.
- Respect rate limits.
- Preserve attribution requirements where applicable.
- Avoid collecting unnecessary personal information.
- Do not bypass authentication or access controls.
- Do not circumvent anti-bot protections.

## Private data

Support tickets, sales conversations, emails, and Slack data require explicit authorization.

The product should:

- Use OAuth where appropriate.
- Store tokens securely.
- Minimize personal data.
- Provide deletion.
- Provide workspace-level isolation.
- Support data retention policies.
- Redact unnecessary PII before model processing where practical.

---

# 16. Canonical Feedback Model

All source data must be converted into a common internal representation.

```typescript
type Feedback = {
  id: string
  workspaceId: string
  sourceId: string
  externalId: string
  originalText: string
  normalizedText: string | null
  language: string | null
  sourceType: FeedbackSourceType
  sourceCreatedAt: string | null
  importedAt: string
  customerId: string | null
  customerSegmentId: string | null
  rating: number | null
  metadata: Record<string, unknown>
}
```

The key rule:

> Every connector produces the same canonical feedback structure.

---

# 17. Database Architecture

Recommended:

**PostgreSQL through Supabase**

Use:

- PostgreSQL
- Supabase Auth
- Supabase Storage
- pgvector
- Row Level Security

Supabase documents pgvector as a PostgreSQL extension for storing embeddings and performing vector similarity search. citeturn1search0

Supabase Auth provides authentication and authorization and integrates with Postgres Row Level Security. citeturn1search1turn1search3

Supabase recommends enabling RLS on exposed tables and writing policies for the required operations. citeturn1search2

---

# 18. Database Entity Model

```text
auth.users
    │
    ↓
profiles
    │
    ↓
workspace_members
    │
    ↓
workspaces
    │
    ├── feedback_sources
    │       │
    │       └── imports
    │
    ├── customers
    │
    ├── customer_segments
    │
    ├── feedback
    │       │
    │       └── feedback_embeddings
    │
    ├── themes
    │       │
    │       └── theme_feedback
    │
    ├── pain_points
    │       │
    │       └── pain_point_feedback
    │
    ├── insights
    │       │
    │       └── insight_evidence
    │
    ├── opportunities
    │       │
    │       └── opportunity_evidence
    │
    └── roadmap_items
            │
            └── roadmap_item_opportunities
```

---

# 19. Core Database Schema

## profiles

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## workspaces

```sql
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
```

## workspace_members

```sql
create table workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
```

Allowed roles:

```text
owner
admin
member
viewer
```

---

# 20. Sources

```sql
create table feedback_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  type text not null,
  name text not null,
  status text not null default 'active',
  external_account_id text,
  credentials_ref text,
  configuration jsonb not null default '{}',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Source types:

```text
csv
google_play
app_store
zendesk
intercom
sales_transcript
survey
slack
other
```

Never store raw third-party access tokens directly in ordinary application tables.

Use a secure secret-management mechanism.

---

# 21. Import Jobs

```sql
create table imports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source_id uuid references feedback_sources(id) on delete set null,
  status text not null default 'pending',
  file_path text,
  total_rows integer default 0,
  accepted_rows integer default 0,
  rejected_rows integer default 0,
  duplicate_rows integer default 0,
  error_summary jsonb not null default '{}',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
```

Statuses:

```text
pending
processing
completed
failed
cancelled
```

---

# 22. Customers

Do not over-collect customer identity.

```sql
create table customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  external_id text,
  segment_id uuid,
  display_name text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

For sensitive environments, store only pseudonymous identifiers.

---

# 23. Customer Segments

```sql
create table customer_segments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);
```

Examples:

```text
Consumer
SMB
Mid-market
Enterprise
New customer
Returning customer
Power user
```

---

# 24. Feedback

```sql
create table feedback (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source_id uuid references feedback_sources(id) on delete set null,
  external_id text,
  original_text text not null,
  normalized_text text,
  language text,
  source_created_at timestamptz,
  imported_at timestamptz not null default now(),
  customer_id uuid references customers(id) on delete set null,
  customer_segment_id uuid references customer_segments(id) on delete set null,
  rating numeric,
  metadata jsonb not null default '{}',
  fingerprint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Create a uniqueness strategy around:

```text
workspace_id + source_id + external_id
```

where the source provides a stable external ID.

---

# 25. Feedback AI Analysis

Keep AI outputs separate from raw feedback.

```sql
create table feedback_analysis (
  feedback_id uuid primary key references feedback(id) on delete cascade,
  sentiment text,
  sentiment_score numeric,
  intent text,
  severity text,
  topics jsonb not null default '[]',
  entities jsonb not null default '[]',
  ai_confidence numeric,
  model_name text,
  analysis_version text,
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

This allows you to re-run analysis with a newer model without destroying the original feedback.

---

# 26. Embeddings

```sql
create table feedback_embeddings (
  feedback_id uuid primary key references feedback(id) on delete cascade,
  embedding vector(<MODEL_DIMENSION>),
  embedding_model text not null,
  embedding_version text not null,
  created_at timestamptz not null default now()
);
```

The exact vector dimension must match the embedding model selected for production.

Do not hardcode a model dimension before selecting and testing the embedding model.

---

# 27. Themes

```sql
create table themes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  feedback_count integer not null default 0,
  confidence numeric,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

# 28. Theme Membership

```sql
create table theme_feedback (
  theme_id uuid not null references themes(id) on delete cascade,
  feedback_id uuid not null references feedback(id) on delete cascade,
  similarity_score numeric,
  assignment_method text,
  created_at timestamptz not null default now(),
  primary key (theme_id, feedback_id)
);
```

---

# 29. Pain Points

```sql
create table pain_points (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text not null,
  severity text,
  frequency integer not null default 0,
  trend_percentage numeric,
  confidence numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

# 30. Insights

An insight is the product-facing synthesis.

```sql
create table insights (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  summary text not null,
  insight_type text not null,
  severity text,
  frequency integer not null default 0,
  trend_percentage numeric,
  confidence numeric,
  generated_by text,
  generation_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Insight types:

```text
pain_point
feature_request
trend
risk
opportunity
positive_signal
```

---

# 31. Evidence

```sql
create table insight_evidence (
  insight_id uuid not null references insights(id) on delete cascade,
  feedback_id uuid not null references feedback(id) on delete cascade,
  evidence_role text,
  relevance_score numeric,
  quote_text text,
  created_at timestamptz not null default now(),
  primary key (insight_id, feedback_id)
);
```

This table is extremely important.

It creates the traceability chain:

```text
Insight
   ↓
Evidence
   ↓
Original Feedback
```

---

# 32. Opportunities

```sql
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  problem_statement text not null,
  opportunity_statement text not null,
  suggested_solution text,
  customer_impact text,
  priority_suggestion text,
  confidence numeric,
  status text not null default 'suggested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Statuses:

```text
suggested
reviewing
accepted
rejected
archived
```

---

# 33. Opportunity Evidence

```sql
create table opportunity_insights (
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  insight_id uuid not null references insights(id) on delete cascade,
  primary key (opportunity_id, insight_id)
);
```

---

# 34. Roadmap Items

```sql
create table roadmap_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'idea',
  priority text,
  impact text,
  confidence numeric,
  target_period text,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Statuses:

```text
idea
candidate
planned
in_progress
shipped
archived
```

---

# 35. Roadmap Relationships

```sql
create table roadmap_item_opportunities (
  roadmap_item_id uuid not null references roadmap_items(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  primary key (roadmap_item_id, opportunity_id)
);
```

The final chain is:

```text
Roadmap Item
    ↓
Opportunity
    ↓
Insight
    ↓
Evidence
    ↓
Customer Feedback
```

This should be visible in the UI.

---

# 36. AI Architecture

The AI pipeline should not be one giant prompt.

Use multiple controlled stages.

```text
RAW FEEDBACK
     ↓
Validation
     ↓
Normalization
     ↓
PII Redaction
     ↓
Deduplication
     ↓
Language Detection
     ↓
Classification
     ↓
Embedding
     ↓
Clustering
     ↓
Cluster Naming
     ↓
Pain Point Synthesis
     ↓
Trend Analysis
     ↓
Evidence Selection
     ↓
Opportunity Generation
     ↓
Roadmap Suggestion
```

---

# 37. Stage 1: Normalization

Tasks:

- Strip unnecessary HTML
- Normalize whitespace
- Preserve punctuation
- Detect language
- Normalize encoding
- Preserve original text
- Remove obvious system artifacts
- Preserve source metadata

Never modify the original source record.

---

# 38. Stage 2: Deduplication

There are two types.

## Exact duplicates

Use a deterministic fingerprint.

Example:

```text
hash(normalized_text + source + external_id)
```

## Near duplicates

Use:

- Text similarity
- Embedding similarity

Do not automatically delete near duplicates.

Instead mark them as:

```text
duplicate_of
similar_to
```

because repeated identical complaints may itself be evidence of frequency.

---

# 39. Stage 3: PII Redaction

Detect and redact:

- Phone numbers
- Email addresses
- Payment information
- Full names when unnecessary
- Addresses
- Order numbers if unnecessary
- Account IDs
- Other sensitive identifiers

Example:

```text
Before:
"Hi John, my order 98273 hasn't arrived.
Call me at 9876543210."

After:
"Hi [NAME], my order [ORDER_ID] hasn't arrived.
Call me at [PHONE]."
```

Keep the raw source secured separately if business requirements require retention.

---

# 40. Stage 4: Classification

Each feedback item can receive:

```text
sentiment
intent
severity
topic
feature_request
bug_report
question
complaint
praise
pricing
usability
performance
reliability
```

Use structured JSON outputs.

Example:

```json
{
  "sentiment": "negative",
  "intent": "complaint",
  "severity": "high",
  "topics": ["upload", "reliability"],
  "confidence": 0.91
}
```

The application should validate the output against a schema.

---

# 41. Stage 5: Embeddings

Convert normalized feedback into vectors.

Use embeddings for:

- Similarity
- Retrieval
- Clustering
- Evidence search
- AI copilot

Store:

- Vector
- Model
- Version
- Timestamp

This makes reprocessing possible.

---

# 42. Stage 6: Clustering

Conceptually:

```text
5,000 feedback items
        ↓
5,000 embeddings
        ↓
Semantic grouping
        ↓
Candidate clusters
```

Possible clustering approaches:

- HDBSCAN
- K-means
- Hierarchical clustering
- Density-based methods
- Hybrid semantic + rule-based grouping

For MVP, test several approaches against a human-labelled evaluation set.

Do not choose an algorithm solely because it is popular.

---

# 43. Stage 7: Cluster Naming

The LLM can inspect representative examples from a cluster and produce:

```text
Name:
Checkout complexity

Description:
Customers report difficulty completing checkout
because the flow contains too many steps and
repeated information requests.
```

The LLM should not invent the cluster membership.

Membership comes from your algorithm.

---

# 44. Stage 8: Pain Point Detection

A theme is not automatically a pain point.

Example:

```text
Theme:
Dark mode requests

Possible underlying problem:
Poor readability in low-light conditions.
```

The system should distinguish:

**Request**

> "Please add dark mode."

from:

**Problem**

> "The interface is difficult to use at night."

This is an important product intelligence capability.

---

# 45. Stage 9: Trends

Trend calculations should be deterministic.

Example:

```text
Current period:
428 mentions

Previous period:
324 mentions

Change:
+32.1%
```

Do not ask the LLM to calculate this.

Use database/application logic.

---

# 46. Stage 10: Evidence Selection

For every insight, select representative evidence.

Evidence should ideally cover:

- Different customers
- Different sources
- Different segments
- Different dates

Avoid showing 10 almost-identical quotes.

The goal is representative evidence, not maximum quote count.

---

# 47. Stage 11: Opportunity Generation

The AI can generate:

```text
Problem
Opportunity
Potential solution
Expected impact
Affected users
Risks
```

Example:

```text
Problem:
Customers struggle to complete checkout.

Opportunity:
Reduce checkout friction.

Potential solution:
Reduce the flow from four steps to two
and persist customer information.

Evidence:
428 feedback items.

Confidence:
High.
```

The PM must be able to edit this.

---

# 48. Stage 12: Roadmap Recommendation

The AI may recommend:

```text
Priority: P1
```

But the system must show why.

Recommended scoring inputs:

```text
Frequency
Severity
Trend
Customer impact
Strategic relevance
Confidence
Revenue/customer importance
Effort estimate if known
```

The MVP should not pretend the AI can accurately calculate engineering effort unless engineering data is provided.

---

# 49. Suggested Prioritization Model

A possible initial score:

```text
Opportunity Score =
Frequency Weight
+ Severity Weight
+ Trend Weight
+ Segment Impact Weight
+ Strategic Weight
```

Normalize each input to a 0-100 scale.

Do not hide the formula.

Show:

```text
Priority score: 82

Frequency       92
Severity        85
Trend           71
Segment impact  90
Strategy        68
```

This makes prioritization explainable.

---

# 50. LLM Responsibilities vs Application Responsibilities

## LLM should handle

- Language understanding
- Classification
- Summarization
- Theme naming
- Pain-point interpretation
- Quote selection assistance
- Opportunity drafting
- Natural-language answers

## Application should handle

- Counting
- Dates
- Trend calculations
- Permissions
- Workspace isolation
- Database relationships
- Source IDs
- Deduplication fingerprints
- Ranking calculations
- Audit logs
- Billing
- Usage limits

This separation is a core architecture rule.

---

# 51. AI Evaluation Framework

AI quality must be measurable.

Create a human-labelled benchmark.

Example:

```text
100-500 feedback items
```

Human labels:

```text
Theme
Sentiment
Intent
Severity
Pain point
```

Evaluate:

## Classification

- Accuracy
- Precision
- Recall
- F1 where appropriate

## Clustering

Evaluate:

- Semantic coherence
- Cluster purity
- Human usefulness
- Over-clustering
- Under-clustering

## Insights

Human reviewers rate:

- Correctness
- Usefulness
- Evidence support
- Clarity

## Recommendations

Rate:

- Relevance
- Actionability
- Evidence grounding
- PM usefulness

---

# 52. AI Quality Gates

Do not launch a model/pipeline version unless:

1. It passes schema validation.
2. It does not fabricate evidence.
3. Every evidence link resolves to real feedback.
4. Counts match database counts.
5. Trend calculations are deterministic.
6. Human reviewers consider major themes useful.
7. Sensitive data handling passes security review.

---

# 53. RAG / AI Copilot Architecture

The AI copilot should use retrieval.

```text
USER QUESTION
      ↓
Intent understanding
      ↓
Query generation
      ↓
Keyword + vector retrieval
      ↓
Relevant feedback
      ↓
Relevant insights
      ↓
Relevant roadmap items
      ↓
LLM synthesis
      ↓
Answer + evidence links
```

Example:

> What are enterprise customers struggling with?

Retrieve:

```text
enterprise feedback
+
segment metadata
+
themes
+
pain points
```

Then generate the answer.

The answer should include links to evidence.

---

# 54. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Recharts

Next.js is a React framework intended for full-stack web applications and provides the App Router for modern application development. citeturn0search3

## Backend

- Next.js server-side code
- Route handlers / server actions
- Supabase client
- Background task system

## Database

- Supabase PostgreSQL
- pgvector
- PostgreSQL full-text search

## Authentication

- Supabase Auth

Supabase Auth supports password, magic link, OTP, social login, and SSO options. citeturn1search1

## AI

- OpenAI API
- Embedding model
- Structured model outputs

## Background processing

Recommended:

- Trigger.dev initially

Trigger.dev is designed for long-running AI/background jobs and provides queuing, retries, monitoring, and real-time task status. citeturn1search8turn1search5

## File storage

- Supabase Storage

## Analytics

- PostHog

## Deployment

- Vercel
- Supabase
- Trigger.dev Cloud

---

# 55. Required APIs and Services

## Required for MVP

1. Supabase
2. OpenAI API
3. Vercel
4. GitHub

## Recommended

5. Trigger.dev
6. PostHog

## Early integrations

7. Google Play Developer API
8. App Store Connect API

## P1 integrations

9. Zendesk API
10. Intercom API

---

# 56. Environment Variables

Example:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=

TRIGGER_SECRET_KEY=
TRIGGER_ACCESS_TOKEN=

POSTHOG_KEY=
POSTHOG_HOST=

GOOGLE_PLAY_SERVICE_ACCOUNT=
APPLE_PRIVATE_KEY=
APPLE_ISSUER_ID=
APPLE_KEY_ID=

ZENDESK_CLIENT_ID=
ZENDESK_CLIENT_SECRET=

INTERCOM_CLIENT_ID=
INTERCOM_CLIENT_SECRET=
```

Secrets must never be exposed to browser code.

---

# 57. API Architecture

Internal API areas:

```text
/api/auth/*
/api/workspaces/*
/api/sources/*
/api/imports/*
/api/feedback/*
/api/insights/*
/api/evidence/*
/api/opportunities/*
/api/roadmap/*
/api/search/*
/api/copilot/*
```

External connector services:

```text
/connectors/google-play
/connectors/app-store
/connectors/zendesk
/connectors/intercom
```

Background jobs:

```text
process-import
normalize-feedback
redact-pii
generate-embeddings
cluster-feedback
generate-insights
select-evidence
generate-opportunities
sync-source
```

---

# 58. Folder Structure

Recommended:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── overview/
│   │   ├── feedback/
│   │   ├── insights/
│   │   ├── evidence/
│   │   ├── opportunities/
│   │   ├── roadmap/
│   │   ├── sources/
│   │   └── settings/
│   │
│   └── api/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── feedback/
│   ├── insights/
│   ├── evidence/
│   └── roadmap/
│
├── lib/
│   ├── supabase/
│   ├── ai/
│   ├── embeddings/
│   ├── search/
│   ├── permissions/
│   └── analytics/
│
├── connectors/
│   ├── google-play/
│   ├── app-store/
│   ├── zendesk/
│   └── intercom/
│
├── jobs/
│   ├── imports/
│   ├── ai/
│   └── sync/
│
├── types/
│
└── utils/
```

---

# 59. Security Architecture

## Authentication

Supabase Auth.

## Authorization

Workspace-based RLS.

Every data table should have:

```text
workspace_id
```

Policies should verify that the current user belongs to the workspace.

## Secrets

Never expose:

- OpenAI API keys
- Supabase service role key
- OAuth client secrets
- Connector access tokens
- Private signing keys

## RLS

Enable RLS on every exposed table.

Supabase explicitly recommends enabling RLS for exposed tables and testing allow/deny behavior for database operations. citeturn1search2

---

# 60. Workspace Isolation

A user may belong to multiple workspaces.

Example:

```text
User A
 ├── Company X
 └── Company Y
```

The user must never accidentally query:

```text
Company X feedback
```

while operating inside:

```text
Company Y
```

Every query must carry workspace authorization.

Do not rely only on frontend filters.

The database must enforce it.

---

# 61. Data Retention

MVP should define:

- Default retention period
- Delete workspace
- Delete source
- Delete import
- Delete feedback
- Delete customer data
- Revoke connector access

Deletion must propagate to:

- Feedback
- Embeddings
- AI analysis
- Evidence links
- Derived insights where necessary

---

# 62. Observability

Track:

### Application

- Errors
- API latency
- Import failures
- Background job failures

### AI

- Model name
- Model version
- Prompt version
- Tokens
- Cost
- Latency
- Failed structured outputs
- Retry count

### Data

- Imported rows
- Rejected rows
- Duplicate rows
- Processed rows
- Failed analysis rows

---

# 63. AI Cost Control

Do not call the LLM unnecessarily.

For example:

```text
5,000 feedback items
```

Do not send the entire dataset to an LLM every time.

Use:

```text
Embeddings
+
Deterministic filtering
+
Clustering
+
Representative samples
```

Then use the LLM for synthesis.

Cache AI results.

Store:

```text
model
prompt_version
input_hash
output
created_at
```

If input hasn't changed, don't regenerate unnecessarily.

---

# 64. Import Pipeline

```text
USER UPLOADS CSV
       ↓
Storage
       ↓
Create import record
       ↓
Parse file
       ↓
Validate columns
       ↓
Preview
       ↓
Confirm
       ↓
Insert feedback
       ↓
Deduplicate
       ↓
Queue AI processing
       ↓
Progress updates
       ↓
Complete
```

---

# 65. CSV Requirements

Required:

```text
feedback
```

Recommended:

```text
date
source
customer_id
segment
rating
```

Unknown columns should be stored in:

```text
metadata jsonb
```

Example:

```csv
feedback,date,source,segment,rating
"App keeps crashing",2026-08-20,play_store,consumer,2
"Need bulk export",2026-08-21,support,enterprise,
```

---

# 66. Connector Architecture

Each connector should implement a common interface.

Conceptually:

```typescript
interface FeedbackConnector {
  authenticate(): Promise<void>
  validate(): Promise<void>
  fetchPage(cursor?: string): Promise<FeedbackPage>
  normalize(raw: unknown): NormalizedFeedback[]
  getCursor(page: FeedbackPage): string | null
}
```

This means Google Play, App Store, Zendesk, and Intercom all feed the same pipeline.

---

# 67. Google Play Connector

Use the official Google Play Developer API where access requirements are satisfied.

The API supports listing and retrieving reviews for an application. citeturn1search4turn1search7

Map:

```text
reviewId
userComment.text
userComment.starRating
userComment.language
userComment.lastModified
userComment.appVersionName
deviceMetadata
developerComment
```

Do not treat developer responses as customer feedback.

---

# 68. App Store Connector

Use App Store Connect API.

Map:

```text
review ID
rating
title
body
territory
created date
app version
developer response
```

Apple's API supports app-level and app-version review retrieval and filtering/sorting options. citeturn0search0

---

# 69. Zendesk Connector

Retrieve:

- Ticket metadata
- Ticket comments
- Customer/requester metadata where permitted

Important:

Zendesk comments can be public or private. The connector must not accidentally treat internal notes as customer voice. citeturn0search2

Recommended extraction:

```text
Customer comment → feedback
Agent response → context
Internal note → excluded by default
```

---

# 70. Intercom Connector

Retrieve:

- Conversation
- Customer messages
- Relevant conversation metadata

Intercom's API provides conversation resources and operations for listing and reading conversations. citeturn0search4turn0search11

Separate:

```text
Customer message
Admin message
Bot message
Internal note
```

Only appropriate customer content should enter the feedback intelligence pipeline.

---

# 71. Sales Call Processing

MVP:

```text
Upload transcript
       ↓
Parse
       ↓
Speaker identification
       ↓
Customer statements
       ↓
Feedback extraction
       ↓
AI pipeline
```

Later:

```text
Gong
Zoom
Meet
Salesforce
HubSpot
```

Only add integrations after proving that transcript analysis produces useful product insights.

---

# 72. UI/UX Direction

The product should feel:

- Professional
- Analytical
- Calm
- Trustworthy
- Fast
- Evidence-driven

Avoid:

- Excessive gradients
- "Magic AI" animations everywhere
- Overly futuristic visuals
- Huge empty cards
- Excessive charts
- Decorative AI effects

Design inspiration can come from:

- Linear
- Notion
- Modern analytics products
- Research tools

---

# 73. Light Mode

Recommended:

- Warm white background
- White cards
- Dark charcoal text
- Neutral borders
- One restrained brand accent
- Red/orange only for warnings and severity
- Clear information hierarchy

---

# 74. Dark Mode

Do not simply invert light mode.

Use:

- Deep neutral background
- Elevated surfaces
- Subtle borders
- High-contrast text
- Muted secondary text
- Carefully controlled accent colors

Both modes should preserve the same information hierarchy.

---

# 75. Product Metrics

## North-star metric

A strong candidate:

> **Evidence-backed product decisions created per active workspace**

Supporting metrics:

### Activation

- Workspace created
- First feedback imported
- First analysis completed
- First insight viewed
- First evidence opened

### Engagement

- Feedback searched
- Insights viewed
- Evidence inspected
- Opportunities created
- Roadmap items created

### Value

- Insight-to-opportunity conversion
- Opportunity-to-roadmap conversion
- Evidence views per roadmap item
- Time from import to first useful insight

### AI quality

- Evidence support rate
- Human insight rating
- Recommendation usefulness
- Hallucination rate

---

# 76. Success Criteria for MVP

MVP should be considered successful if a PM can:

1. Upload a dataset without technical help.
2. Process at least several thousand records reliably.
3. See meaningful clusters.
4. Understand why clusters exist.
5. Inspect actual customer evidence.
6. Search feedback semantically.
7. Identify major pain points.
8. Generate opportunities.
9. Add an opportunity to the roadmap.
10. Trace the roadmap item back to customer evidence.

---

# 77. MVP Acceptance Test

Given:

```text
2,000 customer feedback records
```

The system must:

### Import

- Accept CSV
- Validate required fields
- Report malformed rows
- Store source metadata

### Processing

- Normalize
- Deduplicate appropriately
- Analyze
- Embed
- Cluster

### Insights

Produce:

- Themes
- Pain points
- Counts
- Trends
- Sentiment
- Representative evidence

### Evidence

Every major insight must have:

- At least one real feedback record
- Original source
- Original text
- Source/date metadata

### Roadmap

The PM must be able to:

- Create opportunity
- Edit opportunity
- Add to roadmap
- Open roadmap item
- Trace back to evidence

---

# 78. Development Phases

## Phase 0: Product discovery

Duration target:

**1-2 weeks**

Deliverables:

- Problem statement
- Personas
- JTBD
- Competitive analysis
- MVP scope
- Success metrics
- Product principles

Do not code heavily yet.

---

## Phase 1: UX and architecture

Duration target:

**1-2 weeks**

Deliverables:

- User flows
- Information architecture
- Wireframes
- Design system
- Database schema
- Technical architecture
- AI pipeline design

---

## Phase 2: Data foundation

Duration target:

**1-2 weeks**

Build:

- Next.js project
- Supabase
- Auth
- Workspace
- RLS
- Database migrations
- Storage
- Basic dashboard shell

---

## Phase 3: CSV ingestion

Duration target:

**1-2 weeks**

Build:

- Upload
- Preview
- Column mapping
- Validation
- Import jobs
- Import history
- Feedback explorer

---

## Phase 4: AI pipeline

Duration target:

**2-4 weeks**

Build:

- Normalization
- PII redaction
- Deduplication
- Classification
- Embeddings
- Clustering
- Theme generation
- Pain-point extraction

---

## Phase 5: Evidence and insights

Duration target:

**1-2 weeks**

Build:

- Insights
- Insight detail
- Evidence explorer
- Search
- Filters
- Quotes
- Traceability

---

## Phase 6: Opportunities and roadmap

Duration target:

**1-2 weeks**

Build:

- Opportunity generation
- Opportunity review
- Roadmap
- Roadmap detail
- Insight/evidence links

---

## Phase 7: Evaluation

Duration target:

**1-2 weeks**

Build:

- Evaluation dataset
- Human labels
- AI quality metrics
- Regression tests
- Prompt/model versioning

---

## Phase 8: First integrations

Duration target:

**2-4 weeks per integration family**

Start with:

1. Google Play
2. App Store

Then:

3. Zendesk
4. Intercom

---

## Phase 9: AI Copilot

Build only after:

- Search is reliable
- Evidence is reliable
- Insights are reliable

---

# 79. Development Order

The safest order is:

```text
1. Product definition
2. UX
3. Database
4. Auth/RLS
5. CSV
6. Feedback explorer
7. AI processing
8. Embeddings
9. Clustering
10. Insights
11. Evidence
12. Opportunities
13. Roadmap
14. Evaluation
15. Integrations
16. Copilot
```

Do not reverse this order by building the chatbot first.

---

# 80. Team / Resource Requirements

## Minimum solo/small-team setup

### Product

1 Product Manager / founder

Responsibilities:

- Problem definition
- User research
- Prioritization
- Acceptance criteria

### Frontend/full-stack

1 strong TypeScript/Next.js developer

### AI/backend

Can initially be the same developer if experienced.

Responsibilities:

- Data pipeline
- Embeddings
- LLM integration
- Clustering
- Evaluation

### Design

Part-time product designer is highly useful.

### QA

Initially shared between product and engineering.

---

# 81. Skills Required

Before building, learn:

## Product

- User research
- JTBD
- Problem statements
- Prioritization
- Roadmapping
- Product metrics

## Frontend

- React
- Next.js
- TypeScript
- Tailwind
- Forms
- Data fetching
- State management

## Backend

- REST APIs
- Authentication
- Authorization
- PostgreSQL
- SQL
- Background jobs
- Webhooks

## AI

- LLM APIs
- Structured output
- Embeddings
- Vector search
- Semantic similarity
- Clustering
- RAG
- Prompt evaluation
- AI cost management

## Data

- CSV processing
- Data normalization
- Deduplication
- Metadata
- ETL concepts

## Security

- OAuth
- Secrets
- RLS
- PII
- Data retention
- Multi-tenancy

---

# 82. Required External Accounts / Resources

Before implementation:

- GitHub
- Vercel
- Supabase
- OpenAI API
- Trigger.dev
- PostHog

For integrations:

- Google Cloud project / Android Publisher API access
- Apple App Store Connect API credentials
- Zendesk developer/API access
- Intercom developer/API access

Also prepare:

- Test dataset
- Evaluation dataset
- Human-labelled benchmark
- Product demo dataset

---

# 83. Recommended Initial Repository

```text
customer-feedback-intelligence/
│
├── app/
├── components/
├── lib/
├── connectors/
├── jobs/
├── types/
├── supabase/
│   ├── migrations/
│   └── seed/
│
├── evaluation/
│   ├── datasets/
│   ├── labels/
│   └── reports/
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── AI_PIPELINE.md
│   ├── DATA_MODEL.md
│   └── SECURITY.md
│
├── tests/
│
├── .env.example
├── package.json
└── README.md
```

---

# 84. Git Strategy

Use feature branches.

Example:

```text
main
develop
feature/auth
feature/workspaces
feature/csv-import
feature/feedback-analysis
feature/embeddings
feature/clustering
feature/insights
feature/evidence
feature/roadmap
feature/google-play
```

Commit frequently.

Example:

```text
feat: add workspace model
feat: add csv importer
feat: add feedback normalization
feat: add embedding pipeline
feat: add insight evidence links
```

---

# 85. Testing Strategy

## Unit tests

Test:

- Normalization
- Fingerprints
- Deduplication
- Trend calculations
- Priority calculations
- Permissions

## Integration tests

Test:

- CSV → database
- Database → AI pipeline
- AI → insight
- Insight → evidence
- Opportunity → roadmap

## Security tests

Test:

- User cannot access another workspace
- Viewer cannot modify data
- Anonymous user cannot access private data
- Service keys never reach client
- Deleted data cannot be retrieved

## AI tests

Test:

- Structured output
- Evidence grounding
- Classification
- Cluster quality
- Regression

---

# 86. Critical Failure Modes

## Failure 1: AI creates meaningless clusters

Solution:

- Benchmark clustering
- Human review
- Merge/split tools
- Minimum cluster size
- Confidence threshold

## Failure 2: AI hallucinates evidence

Solution:

- Evidence IDs must come from database retrieval
- Never allow the model to invent source IDs
- Validate every cited record

## Failure 3: Duplicate feedback distorts frequency

Solution:

- Exact duplicate detection
- Near-duplicate detection
- Preserve repeated events where repetition is meaningful
- Distinguish duplicate ingestion from legitimate repeated complaints

## Failure 4: Feature requests dominate everything

Solution:

Separate:

```text
Request
Problem
Pain point
Opportunity
```

## Failure 5: AI recommends too many things

Solution:

Rank and limit recommendations.

## Failure 6: Product becomes a generic chatbot

Solution:

Make the evidence and decision workflow primary.

## Failure 7: Integrations consume all engineering time

Solution:

CSV-first architecture.

---

# 87. Data Quality Rules

Every feedback record should have:

- Valid workspace
- Source
- Original text
- Import timestamp
- Stable identifier where available

Optional:

- Date
- Customer
- Segment
- Rating
- Language

Reject or quarantine:

- Empty feedback
- Corrupted records
- Unsupported encoding
- Oversized fields
- Malformed source data

---

# 88. AI Versioning

Every generated artifact should know:

```text
model_name
model_version
prompt_version
pipeline_version
analysis_version
created_at
```

Example:

```text
model: <selected-production-model>
prompt_version: insight-v3
pipeline_version: 1.4.0
```

This allows you to compare models later.

---

# 89. Human Override

Users should be able to:

- Rename theme
- Merge themes
- Split themes
- Reclassify feedback
- Reject an insight
- Edit opportunity
- Change roadmap priority
- Remove evidence
- Add their own evidence

AI should not make the system irreversible.

---

# 90. Admin / Operations

Later, create an internal admin area for:

- Workspace count
- Processing jobs
- AI cost
- Failed imports
- Failed integrations
- Model errors
- Usage
- System health

This is not required for the first demo but becomes important before production scale.

---

# 91. Billing Architecture

Not required for the first MVP, but plan for usage.

Potential billing metric:

```text
Feedback records analyzed
```

Possible tiers:

```text
Free
1,000 feedback/month

Pro
25,000 feedback/month

Team
100,000 feedback/month

Enterprise
Custom
```

Avoid implementing billing before product value is proven.

---

# 92. Performance Requirements

MVP targets:

- Dashboard initial load: reasonable interactive response
- Feedback search: sub-second target for normal datasets
- CSV preview: fast for typical files
- Background AI processing: asynchronous
- No browser blocking during large imports

For large datasets:

```text
Upload
↓
Background job
↓
Progress
↓
Completion notification
```

Never process thousands of records synchronously in the browser.

---

# 93. Scalability Strategy

Start:

```text
Next.js
Supabase
Trigger.dev
OpenAI
```

Later, if scale requires:

```text
Dedicated workers
Queue infrastructure
Read replicas
Specialized vector infrastructure
Dedicated data warehouse
```

Do not prematurely build the second architecture.

---

# 94. Product Differentiation

Potential competitors and adjacent categories include:

- Productboard
- Dovetail
- Canny
- Enterpret
- Chisel
- UserVoice
- Zendesk analytics
- Intercom analytics

The product should differentiate around:

> **Evidence-backed AI synthesis that directly connects customer feedback to roadmap opportunities.**

The product should not compete solely on:

> "We summarize feedback with AI."

---

# 95. Strong Differentiator

A powerful UI pattern:

```text
ROADMAP ITEM
     ↓
WHY ARE WE BUILDING THIS?
     ↓
Opportunity
     ↓
428 customer mentions
     ↓
7 themes
     ↓
3 customer segments
     ↓
5 representative quotes
     ↓
Original feedback
```

This can become the product's strongest trust mechanism.

---

# 96. Example End-to-End Scenario

Input:

```text
"I can't upload PDFs."

"PDF upload keeps failing."

"Uploading invoices doesn't work."

"Why does the app reject my PDF?"

"Please fix document uploads."
```

AI groups them:

```text
Theme:
Document Upload
```

Then:

```text
Pain Point:
Customers frequently cannot upload documents.
```

Then:

```text
Evidence:
241 mentions
```

Then:

```text
Trend:
+27%
```

Then:

```text
Affected:
Enterprise 54%
SMB 32%
Consumer 14%
```

Then:

```text
Opportunity:
Improve document upload reliability.
```

Then PM:

```text
[ Add to roadmap ]
```

Final:

```text
Roadmap:
Improve document upload reliability

Evidence:
241 customer reports
```

This is the product in one example.

---

# 97. MVP Definition of Done

The MVP is not done when:

> "The dashboard looks good."

It is done when:

### Product

- PM understands the workflow
- Core problem is addressed

### Data

- Feedback imports reliably

### AI

- Themes are meaningful
- Evidence is grounded
- Recommendations are useful

### UX

- PM can discover insights without training
- Evidence is easy to inspect
- Roadmap flow is simple

### Security

- Workspace isolation works
- RLS works
- Secrets are protected

### Reliability

- Failed jobs recover
- Imports are repeatable
- AI processing is observable

### Product value

A real PM can take a dataset and produce a useful product decision faster than manual analysis.

---

# 98. Recommended Build Sequence for the Actual Project

## Sprint 1

```text
Project setup
Next.js
TypeScript
Supabase
Auth
Workspace
RLS
```

## Sprint 2

```text
CSV upload
Storage
Import jobs
Feedback database
Feedback explorer
```

## Sprint 3

```text
Normalization
Deduplication
Classification
Embeddings
```

## Sprint 4

```text
Clustering
Themes
Pain points
```

## Sprint 5

```text
Insights
Evidence
Search
Filters
```

## Sprint 6

```text
Opportunities
Roadmap
Traceability
```

## Sprint 7

```text
Evaluation
AI quality
Security
Performance
```

## Sprint 8

```text
Google Play
App Store
```

Then beta testing.

---

# 99. What You Should Learn Before Coding

Do not try to master everything.

Learn in this order:

### Week 1

Product:

- Problem statement
- Personas
- JTBD
- User journey
- MVP
- Prioritization

### Week 2

Technical foundation:

- Next.js
- TypeScript
- PostgreSQL
- Supabase
- RLS

### Week 3

AI:

- LLM APIs
- Structured outputs
- Embeddings
- Vector search
- Clustering
- RAG

### Week 4

Data:

- ETL
- CSV
- APIs
- OAuth
- Webhooks
- Background jobs

Then start building.

---

# 100. First Milestone

Your first real milestone should be:

> **"A PM can upload 2,000-5,000 messy feedback records and receive useful, evidence-backed customer insights in the application."**

Not:

> "We connected ten APIs."

Not:

> "We built an AI chatbot."

Not:

> "We built a beautiful dashboard."

If this milestone works, the rest of the product has a foundation.

---

# 101. Final Product Architecture

```text
                         CUSTOMER SOURCES
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
      App Reviews          Support             Sales
          │                Tickets            Calls
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ↓
                         CONNECTOR LAYER
                               │
                               ↓
                       INGESTION PIPELINE
                               │
                ┌──────────────┼──────────────┐
                ↓              ↓              ↓
           Validation     Normalization    PII
                                           Redaction
                └──────────────┬──────────────┘
                               ↓
                         FEEDBACK STORE
                               │
                     ┌─────────┴─────────┐
                     ↓                   ↓
                 PostgreSQL          pgvector
                     │                   │
                     ↓                   ↓
                Metadata             Embeddings
                     │                   │
                     └─────────┬─────────┘
                               ↓
                          AI PIPELINE
                               │
        ┌──────────────────────┼─────────────────────┐
        ↓                      ↓                     ↓
   Classification          Clustering             Trends
        │                      │                     │
        └──────────────────────┼─────────────────────┘
                               ↓
                         AI INTELLIGENCE
                               │
                    ┌──────────┼──────────┐
                    ↓          ↓          ↓
                  Themes    Pain Points  Signals
                    │          │          │
                    └──────────┼──────────┘
                               ↓
                         EVIDENCE LAYER
                               │
                      Real customer quotes
                               │
                               ↓
                         OPPORTUNITIES
                               │
                               ↓
                       PM REVIEW / EDIT
                               │
                               ↓
                           ROADMAP
                               │
                               ↓
                       PRODUCT DECISION
                               │
                               ↓
                       NEW CUSTOMER DATA
                               │
                               └──────────────→ LOOP
```

---

# 102. The Most Important Product Rule

If you remember only one thing from this entire document, remember this:

> **The product is not an AI summarizer.**

The product is:

> **A system that helps a product team move from fragmented customer voice to evidence-backed product decisions.**

The AI is the engine.

The evidence is the trust layer.

The roadmap is the action layer.

The PM remains the decision-maker.

---

# 103. Recommended Next Deliverables

Before implementation begins, create these separate project documents:

```text
01_PRODUCT_VISION.md
02_PERSONAS_AND_JTBD.md
03_MVP_SCOPE.md
04_PRD_FEEDBACK_INGESTION.md
05_PRD_AI_INTELLIGENCE.md
06_PRD_INSIGHTS_EVIDENCE.md
07_PRD_OPPORTUNITIES.md
08_PRD_ROADMAP.md
09_PRD_AI_COPILOT.md
10_AI_EVALUATION.md
11_USER_FLOWS.md
12_INFORMATION_ARCHITECTURE.md
13_DATABASE_SCHEMA.md
14_TECHNICAL_ARCHITECTURE.md
15_SECURITY_AND_PRIVACY.md
16_API_SPECIFICATION.md
17_CONNECTOR_SPECIFICATION.md
18_TEST_PLAN.md
19_MVP_DEVELOPMENT_PLAN.md
20_LAUNCH_CHECKLIST.md
```

The current master document should be treated as the source of truth for those documents.

---

# 104. Official Technical References

The architecture above is aligned with the current official documentation for the major services:

- Next.js documentation: full-stack React application framework and App Router. citeturn0search3
- Supabase Auth: authentication, authorization, JWTs, and integration with RLS. citeturn1search1turn1search3
- Supabase RLS: database-level authorization and workspace isolation patterns. citeturn1search2
- Supabase pgvector: vector storage and similarity search in Postgres. citeturn1search0
- Google Play Developer API: application reviews and review listing. citeturn1search4turn1search7
- Apple App Store Connect API: customer review retrieval. citeturn0search0
- Zendesk API: tickets and ticket comments. citeturn0search10turn0search2
- Intercom API: conversations. citeturn0search4turn0search11
- Trigger.dev: background and long-running AI jobs. citeturn1search8

---

# 105. Final Recommendation

Build the product in this order:

**Product problem → user workflow → data model → CSV ingestion → AI intelligence → evidence → opportunities → roadmap → evaluation → integrations → copilot.**

Do not start with scraping.

Do not start with the chatbot.

Do not start with ten integrations.

Do not let the LLM own business logic.

Start with the smallest version that proves:

> **Given messy customer feedback, can we reliably surface useful problems, prove them with real customer evidence, and help a PM make a better roadmap decision?**

If the answer is yes, you have the foundation of a real product.

