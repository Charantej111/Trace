# Trace — Product Requirements Document (PRD)

**Document Version:** 2.0  
**Product Name:** Trace  
**Tagline:** Turn fragmented customer voice into evidence-backed product decisions and institutional memory.  
**Scope:** MVP through Production Foundation  

---

## 1. Product Vision

Trace is an AI-powered product intelligence platform designed to bridge the gap between messy, fragmented customer feedback and confident, evidence-backed roadmap decisions. 

Unlike generic AI summarizers that generate ungrounded bullet points, Trace enforces a deterministic chain of custody:
$$\text{Customer Feedback} \xrightarrow{\text{Span Atomization}} \text{Feedback Atoms} \xrightarrow{\text{Candidate Clusters}} \text{Themes \& Pain Points} \xrightarrow{\text{Context Scoring}} \text{Opportunities} \xrightarrow{\text{PM Decisions}} \text{Roadmap} \xrightarrow{\text{Post-Ship Measurement}} \text{Impact}$$

Every insight is grounded in real customer quotes (with exact text span highlights), cross-referenced with **Product Context** (strategic business goals, target segments, and constraints), and verified against **Contradicting Evidence**.

---

## 2. User Personas

### 2.1 Primary Persona: Product Manager (PM)
* **Goal:** Identify high-impact customer problems, validate feature proposals with verifiable customer quotes, defend roadmap priorities against stakeholder bias, and maintain a historical record of rejected/deferred items.
* **Pain Points:** Spends hours reading raw Zendesk/Play Store exports; loses nuance in multi-issue feedback; struggles to distinguish feature requests from real problems; lacks hard evidence to justify trade-offs.

### 2.2 Secondary Persona: Head of Product / VP
* **Goal:** Detect emerging systemic risks (velocity spikes) across versions/cohorts before they impact churn; align customer pain with company strategic priorities; preserve decision rationale across organizational turnover.
* **Pain Points:** High-level dashboards lack evidence drill-down; no visibility into whether shipped features actually solved the original customer complaint.

### 2.3 Secondary Persona: UX / User Researcher
* **Goal:** Mine qualitative customer statements for verbatim quotes, identify divergent user sentiments, and explore topic-specific pain points by customer segment.

---

## 3. Jobs to Be Done (JTBD)

1. **Problem Discovery:** *"When I ingest thousands of feedback records, I want to automatically decompose multi-issue messages into discrete problem atoms, so that I can see the true distribution of customer pain points rather than broad generic topics."*
2. **Emerging Threat Detection:** *"When a new app release causes unexpected regressions, I want the system to flag high-velocity spikes (+500% surge), so that our engineering team can patch critical bugs before they escalate."*
3. **Decision & Trade-off Justification:** *"When prioritizing sprint initiatives, I want to score opportunities based on both customer evidence and company strategic goals, so that I can reject low-leverage requests with documented rationale."*
4. **Impact Verification:** *"When we ship a major feature, I want to automatically track subsequent feedback mentions over time, so that we know if the customer problem was truly resolved."*

---

## 4. Core Product Principles & Boundary Architecture

### 4.1 The Core Truth Rule: Deterministic vs. Generative Intelligence
* **Deterministic Intelligence (PostgreSQL / Math Engine):** Counts, date filters, trend percentages, velocity multipliers, segment distributions, exact keyword matching, opportunity scores, and post-ship delta calculations are **always computed in code/database**. They are never estimated or invented by an LLM.
* **Generative Intelligence (LLM Engine):** Atom decomposition, candidate cluster naming, pain-point description synthesis, quote relevance ranking, and suggested solution framing.

### 4.2 The Anti-Hallucination Gate (No Evidence = No Insight)
Every insight entity in Trace **must have direct relational foreign keys to feedback atom IDs**. If an LLM generates a claim without traceable atom IDs, the insight is quarantined and never rendered to the user.

### 4.3 Span-Level Atomization (Quote Veracity)
When a raw message contains multiple issues, Trace preserves the exact character slice (`source_start`, `source_end`, `source_text`). In the UI, the PM can click any atom to highlight the exact phrase within the original verbatim review.

### 4.4 Product Context Layer (Evidence + Strategy)
Customer evidence alone does not dictate the roadmap. Trace combines **Customer Voice** with the organization's **Product Context** (Strategic Goals, Focus Segments, Technical Constraints) to produce explainable priority scores.

---

## 5. Information Architecture & 7 Core Modules

```text
Trace Workspace
│
├── 1. Inbox (Ingestion status, active processing jobs, new unreviewed items)
│
├── 2. Feedback (Full feedback explorer, text-span atom viewer, multi-facet filtering)
│
├── 3. Insights (Top Pain Points, Emerging Issues, Trends, Segment Matrix, Divergent Signals)
│
├── 4. Opportunities (AI-suggested product opportunities, explainable 6-factor score, PM review)
│
├── 5. Roadmap (Kanban & List views, status lifecycle, post-ship impact measurement)
│
├── 6. Decisions (Institutional memory log: accepted, rejected, deferred with evidence snapshots)
│
└── 7. Sources (CSV uploader, column mapping presets, sync history, integration credentials)
```

---

## 6. Detailed Screen-by-Screen Specifications

---

### Module 1: Inbox (`/inbox`)
* **Purpose:** Triage newly ingested customer feedback batches and monitor AI background processing pipelines.
* **Key Components:**
  1. **Processing Pipeline Monitor:** Progress bar for active jobs (Parsing → Normalization → PII Redaction → Atomization → Embedding → Clustering).
  2. **Batch Summary Card:** Total records ingested, atoms extracted, duplicate rate, PII redacted count.
  3. **High-Urgency Alert Banner:** Immediate alerts for high-severity or critical atoms detected in the latest batch.
* **States:**
  * *Empty State:* "No pending imports. Upload a CSV or connect a source to begin."
  * *Processing State:* Animated step-by-step pipeline status with real-time atom count counter.
  * *Error State:* Breakdown of malformed/rejected rows with download option.

---

### Module 2: Feedback Explorer (`/feedback`)
* **Purpose:** Search and inspect every individual customer voice statement with span-level atom highlights.
* **Key Components:**
  1. **Faceted Filter Bar:** Filter by Source (CSV, Play Store, Zendesk), Sentiment (Positive, Neutral, Negative), Severity (Low, Medium, High, Critical), Intent (Bug, Complaint, Feature Request, Praise), Customer Segment (Enterprise, SMB, Consumer), Date Range, and Star Rating (1-5).
  2. **Hybrid Search Input:** Combines PostgreSQL full-text keyword search and pgvector semantic cosine similarity.
  3. **Feedback Data Table:** Displays Source badge, Date, Customer/Segment, Snippet, Atom tags, and Sentiment indicator.
  4. **Feedback Detail Drawer:**
     * Full original verbatim text with interactive colored highlights corresponding to extracted atoms.
     * Metadata inspector (Device, App Version, Source ID, Customer Info).
     * Atom Cards: List of discrete extracted atoms with intent, sentiment, and linked pain points.
* **User Actions:** Click row to open detail drawer; click atom badge to view related atoms across the workspace; export filtered results to CSV.

---

### Module 3: Insights Engine (`/insights`)
* **Sub-views:**
  * **Top Pain Points (`/insights/pain-points`):** Ranked by scale & cumulative customer impact.
  * **Emerging Issues (`/insights/emerging`):** High-velocity spikes (e.g. +1,050% week-over-week) filtered by novelty, app version, or cohort.
  * **Divergent Signals (`/insights/divergent`):** Polarizing features displaying both Supporting (Negative) and Contradicting (Positive/Praise) evidence side-by-side.
  * **Segment Analysis (`/insights/segments`):** Heatmap of pain points mapped across customer tiers (Enterprise vs. SMB vs. Consumer).
* **Deep-Dive Insight Screen (`/insights/[id]`):**
  * **Summary Header:** Title, Frequency count, Deterministic Trend % (vs. prior 30d), Severity badge, Confidence indicator (`High`, `Medium`, `Low`).
  * **Strategic Problem Statement:** Clear distinction between the surface feature request and the underlying customer struggle.
  * **Evidence Tabs:**
    * *Supporting Evidence:* Verbatim quotes with customer metadata and direct link to source feedback.
    * *Contradicting Evidence:* Counter-opinions or praise quotes showing nuance.
  * **Affected Segment Breakdown:** Visual bar chart showing distribution of impacted tiers.
  * **Action Bar:** `Generate Opportunity`, `Link to Existing Opportunity`, `Dismiss / Won't Address`.

---

### Module 4: Opportunities (`/opportunities`)
* **Purpose:** Convert validated insights and customer problems into concrete, prioritized product opportunities.
* **Key Components:**
  1. **Opportunity Card List:** Categorized by status (`Suggested`, `Under Review`, `Accepted`, `Rejected`, `Deferred`).
  2. **Explainable Priority Score Matrix (0-100):**
     $$\text{Priority Score} = 0.20 \times \text{Frequency} + 0.20 \times \text{Severity} + 0.15 \times \text{Trend} + 0.15 \times \text{Segment Impact} + 0.15 \times \text{Strategic Alignment} + 0.15 \times \text{Evidence Quality}$$
  3. **Opportunity Detail View:**
     * **Problem Statement:** Synthesized description of the customer friction.
     * **Opportunity Statement:** Strategic framing of the product value.
     * **Suggested Solutions:** AI-generated potential solutions (fully editable by the PM).
     * **Strategic Context Alignment:** Matches opportunity against configured company goals (e.g. "Enterprise Retention Q3").
     * **Linked Evidence Badge:** Clickable evidence counter (e.g. "428 verified atoms from 3 sources").
* **User Actions:**
  * `Accept & Send to Roadmap`: Moves opportunity to active roadmap candidate.
  * `Reject / Won't Do`: Opens Decision Modal to record rationale and capture evidence snapshot into **Decisions Memory**.
  * `Edit Opportunity`: Customize title, solution scope, and strategic weight.

---

### Module 5: Interactive Roadmap & Impact Tracker (`/roadmap`)
* **Purpose:** Manage product execution stages and verify post-ship resolution of customer problems.
* **Key Components:**
  1. **Kanban Board:** Columns for `Idea`, `Candidate`, `Planned`, `In Progress`, `Shipped`, `Archived`.
  2. **Traceability Drawer ("Why Are We Building This?"):**
     * Visual hierarchy chain: `Roadmap Item → Opportunity → Insights → Supporting Quotes → Original Raw Feedback`.
  3. **Post-Ship Impact Tracker (Shipped Items):**
     * Baseline complaint frequency before shipping vs. current 30-day post-ship mention frequency.
     * Delta badge: $\Delta\% \text{ complaint volume}$ (e.g. $\downarrow 74\%$ reduction in upload crash tickets).
* **User Actions:** Drag-and-drop cards across columns; click card to open Traceability Drawer; set target release periods (e.g., `Q4 2026`).

---

### Module 6: Product Decision Memory (`/decisions`)
* **Purpose:** Institutional knowledge archive answering *"Why did we build this?"* and *"Why did we reject that?"*
* **Key Components:**
  1. **Decision Timeline / Log:** Searchable catalog of all formal PM decisions with timestamps, decider name, decision type (`Accepted`, `Rejected Won't Do`, `Deferred`, `Workaround Exists`).
  2. **Decision Record Detail:**
     * Documented PM Rationale text.
     * **Frozen Evidence Snapshot:** Historical JSON snapshot of exactly what customer volume, severity, and quotes existed at the moment the decision was made.
     * Alternative initiative that was prioritized instead (if applicable).
* **User Actions:** Search decision history by keyword/topic; export decision brief for executive stakeholders.

---

### Module 7: Sources & Ingestion Manager (`/sources`)
* **Purpose:** Manage feedback data inputs, CSV uploads, field mapping presets, and sync schedules.
* **Key Components:**
  1. **Source Cards:** CSV Upload (Active), Google Play Developer API (V1.1), App Store Connect (V1.1), Zendesk (V1.2), Intercom (V1.2).
  2. **CSV Upload Modal & Wizard:**
     * Step 1: Drag & drop CSV / Excel file.
     * Step 2: Auto-detect & map columns (`Feedback Text` [Required], `Date`, `Source ID`, `Rating`, `Segment`, `Customer Identifier`, `App Version`, `Custom Metadata`).
     * Step 3: Ingestion preview (first 5 rows) and validation check.
     * Step 4: One-click sample dataset loader (Instant demo mode with 1,000+ realistic multi-source records).

---

## 7. Product Context Configuration (`/settings/context`)

Trace incorporates organizational goals into opportunity prioritization:
* **Company Objectives:** e.g., "Reduce Enterprise Onboarding Churn", "Improve Mobile App Store Rating to 4.5".
* **Target Segments:** Prioritize Enterprise (Weight: 1.5x) vs Consumer (Weight: 0.8x).
* **Strategic Focus Areas:** Key functional modules currently in focus (e.g. "Checkout", "Document Management").
* **Known Technical Constraints:** e.g. "Legacy API deprecation in Q4".

---

## 8. Data Ingestion & AI Pipeline Contracts

```text
RAW CSV ROW
    ↓ [Validation]
FEEDBACK RECORD (Immutable)
    ↓ [PII Masking: regex + LLM]
NORMALIZED TEXT
    ↓ [Atomization Prompt: structured JSON]
ARRAY OF ATOMS [ { source_start, source_end, source_text, intent, sentiment, severity, is_request, problem_hint } ]
    ↓ [Embedding: text-embedding-3-small (1536d)]
VECTOR EMBEDDINGS STORED IN pgvector
    ↓ [Cosine grouping + DBSCAN / k-means]
CANDIDATE CLUSTERS
    ↓ [Validation against Product Context]
THEMES & PAIN POINTS
    ↓ [Velocity & Novelty Multipliers]
TOP PROBLEMS & EMERGING ISSUES
    ↓ [Evidence Verification Gate (Relational ID validation)]
VALIDATED INSIGHTS (Supporting + Contradicting)
```

---

## 9. Security, Multi-Tenancy & Row-Level Security (RLS)

* **Multi-Tenant Isolation:** Every table includes `workspace_id uuid references workspaces(id)`.
* **Postgres RLS Policies:** Strict enforcement on all database queries ensuring users can only read/mutate records within their assigned `workspace_members` association.
* **PII Compliance:** Automated redaction of email addresses, phone numbers, credit card strings, street addresses, and social security numbers prior to embedding generation or third-party LLM processing.
* **Secret Protection:** API keys and third-party credentials stored server-side only in encrypted environment vaults.

---

## 10. Definition of Done (DoD) for MVP

The MVP is complete when:
1. A PM can upload a 1,000+ row messy customer CSV dataset without engineering assistance.
2. Multi-issue feedback rows are cleanly split into discrete `feedback_atoms` with accurate character span highlights.
3. Themes and Pain Points are extracted with zero hallucinated counts (verified against database counts).
4. Sudden spikes are surfaced in **Emerging Issues** with velocity metrics.
5. Insights render both **Supporting** and **Contradicting** customer evidence quotes.
6. The PM can accept an opportunity into the **Roadmap** or reject it with rationale into **Decision Memory**.
7. The complete traceability chain (`Roadmap → Opportunity → Insight → Evidence → Original Feedback`) is fully interactive in the UI.
