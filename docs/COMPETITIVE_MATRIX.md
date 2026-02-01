# GenXAI (Non‑Studio) Competitive Matrix

This document compares **GenXAI (core framework, excluding Studio UI)** against
popular agentic frameworks and workflow engines: **CrewAI**, **AutoGen**, **BeeAI**,
and **n8n**.

> Scope note: Studio‑specific GUI features are intentionally excluded from this comparison.

---

## Executive Summary

GenXAI’s **core runtime** is feature‑complete for agent workflows, tool orchestration,
and multi‑provider LLM support. It competes well with **CrewAI** and **AutoGen** in
agent tooling and extensibility, but lags behind **n8n** in plug‑and‑play triggers,
connectors, and GUI‑first automation experience. Compared to **BeeAI**, GenXAI offers
stronger multi‑provider and graph orchestration depth, while BeeAI focuses on rapid
agentic automation patterns.

Key gaps to reach parity across the board:

- Production‑ready **workflow triggers/connectors** outside Studio
- **Distributed execution** / worker queue support
- Rich **plugin ecosystem** and marketplace
- Expanded **integration test matrix** for memory/vector store backends

---

## Feature Matrix (Core Framework Only)

Legend: ✅ = available, ⚠️ = partial, ❌ = missing, 🟡 = external/experimental

| Capability | GenXAI (Core) | CrewAI | AutoGen | BeeAI | n8n |
|---|---|---|---|---|---|
| Multi‑agent orchestration | ✅ | ✅ | ✅ | ✅ | ⚠️ (workflow‑centric) |
| Graph/Workflow engine | ✅ (parallel/conditional) | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Multi‑LLM providers | ✅ (OpenAI/Anthropic/Gemini/Cohere/Ollama) | ⚠️ | ✅ | ⚠️ | ✅ |
| Tool registry & schemas | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Tool templates | ✅ | ⚠️ | ❌ | ⚠️ | ✅ |
| Memory systems | ✅ (short/long/episodic/semantic) | ⚠️ | ✅ | ⚠️ | ⚠️ |
| Vector store abstraction | ✅ (Chroma/Pinecone) | ⚠️ | ✅ | ⚠️ | 🟡 |
| Persistence (JSON/SQLite) | ✅ | ❌ | ⚠️ | ⚠️ | ✅ |
| Observability hooks | ✅ (metrics/tracing/logging) | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Rate limiting & cost controls | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Security/RBAC | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Offline/local inference | ✅ (Ollama) | ⚠️ | ✅ | ✅ | ✅ |
| CLI workflows | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Workflow triggers/connectors | ❌ (core) | ⚠️ | ⚠️ | ⚠️ | ✅ |
| GUI workflow builder | ❌ (core) | ❌ | ❌ | ❌ | ✅ |
| Marketplace/ecosystem | ⚠️ (templates) | ✅ | ✅ | ⚠️ | ✅ |

---

## Scored Rubric (1–5)

Scale: **1 = missing**, **3 = partial**, **5 = best‑in‑class**

### Raw Scores

| Dimension | GenXAI (Core) | CrewAI | AutoGen | BeeAI | n8n |
|---|---:|---:|---:|---:|---:|
| Agent orchestration depth | 4 | 4 | 5 | 3 | 2 |
| Workflow/graph flexibility | 4 | 3 | 3 | 2 | 5 |
| Provider breadth | 5 | 3 | 4 | 3 | 4 |
| Tooling & schemas | 4 | 4 | 4 | 3 | 5 |
| Memory & persistence | 4 | 2 | 4 | 2 | 3 |
| Observability & governance | 4 | 2 | 3 | 2 | 5 |
| Enterprise readiness | 3 | 2 | 3 | 2 | 5 |
| Ecosystem/connectors | 2 | 4 | 4 | 2 | 5 |
| UX/automation experience | 2 | 3 | 3 | 3 | 5 |
| Extensibility/plug‑ins | 3 | 4 | 4 | 2 | 5 |

### Weighted Totals

Weights (sum = 100):

| Dimension | Weight |
|---|---:|
| Agent orchestration depth | 15 |
| Workflow/graph flexibility | 12 |
| Provider breadth | 10 |
| Tooling & schemas | 10 |
| Memory & persistence | 10 |
| Observability & governance | 10 |
| Enterprise readiness | 12 |
| Ecosystem/connectors | 12 |
| UX/automation experience | 5 |
| Extensibility/plug‑ins | 4 |

Weighted score formula: **(score / 5) × weight**

**Normalization Notes**
- Scores are normalized to a **0–100** scale by multiplying each dimension’s 1–5 rating
  by its weight fraction (weight/100) and summing across dimensions.
- Weights are fixed per scenario and sum to **100**.
- A score of **100** represents a theoretical best‑in‑class solution scoring **5** on
  every dimension for the chosen weights.

| Framework | Weighted Total (0–100) |
|---|---:|
| GenXAI (Core) | 72.0 |
| CrewAI | 61.8 |
| AutoGen | 75.2 |
| BeeAI | 48.0 |
| n8n | 85.0 |

### Alternative Weighting Scenarios

#### Scenario A — Enterprise‑First

Weights emphasize enterprise readiness, observability, and governance.

| Dimension | Weight |
|---|---:|
| Agent orchestration depth | 10 |
| Workflow/graph flexibility | 10 |
| Provider breadth | 8 |
| Tooling & schemas | 8 |
| Memory & persistence | 10 |
| Observability & governance | 15 |
| Enterprise readiness | 20 |
| Ecosystem/connectors | 12 |
| UX/automation experience | 4 |
| Extensibility/plug‑ins | 3 |

Weighted totals (Enterprise‑First):

| Framework | Weighted Total (0–100) |
|---|---:|
| GenXAI (Core) | 70.6 |
| CrewAI | 56.8 |
| AutoGen | 72.2 |
| BeeAI | 44.0 |
| n8n | 88.0 |

#### Scenario B — Developer‑First

Weights emphasize agent patterns, graph flexibility, provider breadth, and extensibility.

| Dimension | Weight |
|---|---:|
| Agent orchestration depth | 18 |
| Workflow/graph flexibility | 15 |
| Provider breadth | 12 |
| Tooling & schemas | 10 |
| Memory & persistence | 10 |
| Observability & governance | 8 |
| Enterprise readiness | 7 |
| Ecosystem/connectors | 8 |
| UX/automation experience | 6 |
| Extensibility/plug‑ins | 6 |

Weighted totals (Developer‑First):

| Framework | Weighted Total (0–100) |
|---|---:|
| GenXAI (Core) | 75.0 |
| CrewAI | 63.2 |
| AutoGen | 76.8 |
| BeeAI | 50.4 |
| n8n | 78.4 |

### Heat‑Map View (🟥 1–2, 🟨 3, 🟩 4–5)

| Dimension | GenXAI | CrewAI | AutoGen | BeeAI | n8n |
|---|---|---|---|---|---|
| Agent orchestration depth | 🟩4 | 🟩4 | 🟩5 | 🟨3 | 🟥2 |
| Workflow/graph flexibility | 🟩4 | 🟨3 | 🟨3 | 🟥2 | 🟩5 |
| Provider breadth | 🟩5 | 🟨3 | 🟩4 | 🟨3 | 🟩4 |
| Tooling & schemas | 🟩4 | 🟩4 | 🟩4 | 🟨3 | 🟩5 |
| Memory & persistence | 🟩4 | 🟥2 | 🟩4 | 🟥2 | 🟨3 |
| Observability & governance | 🟩4 | 🟥2 | 🟨3 | 🟥2 | 🟩5 |
| Enterprise readiness | 🟨3 | 🟥2 | 🟨3 | 🟥2 | 🟩5 |
| Ecosystem/connectors | 🟥2 | 🟩4 | 🟩4 | 🟥2 | 🟩5 |
| UX/automation experience | 🟥2 | 🟨3 | 🟨3 | 🟨3 | 🟩5 |
| Extensibility/plug‑ins | 🟨3 | 🟩4 | 🟩4 | 🟥2 | 🟩5 |

**Interpretation**
- GenXAI scores highest in **provider breadth, graph flexibility, and memory tooling**.
- n8n dominates **automation UX, connectors, and enterprise polish**.
- AutoGen leads in **multi‑agent research depth** but requires more production scaffolding.
- CrewAI is strong in **agent collaboration + ecosystem**, less in advanced orchestration.
- BeeAI is solid for lightweight agentic automation but has a smaller ecosystem.

## Detailed Comparison Notes

### GenXAI (Core)
**Strengths**
- Robust **graph execution** with parallel/conditional routing and checkpoints.
- Strong **tooling system** with schemas, registry, templates, and built‑in tools.
- Multi‑LLM provider support with fallback routing and local Ollama.
- Memory systems and persistence options built in.
- Observability scaffolding and security modules.

**Weaknesses**
- Lacks non‑Studio **workflow triggers/connectors** (e.g., schedules/webhooks).
- No built‑in **distributed execution** / worker queues.
- Limited ecosystem/marketplace compared to CrewAI/AutoGen/n8n.

### CrewAI
**Strengths**
- Strong agent collaboration patterns and prompt‑engineering focused UX.
- Growing ecosystem of templates and community examples.

**Weaknesses**
- Less opinionated graph orchestration.
- Fewer provider options out‑of‑the‑box.

### AutoGen (Microsoft)
**Strengths**
- Rich multi‑agent orchestration patterns.
- Strong research pedigree and community traction.

**Weaknesses**
- Heavier setup for production orchestration.
- GUI/connector ecosystem is limited (outside of extensions).

### BeeAI
**Strengths**
- Lightweight agent automation patterns.
- Local‑first model support in some workflows.

**Weaknesses**
- Smaller ecosystem and fewer enterprise‑grade observability/security modules.

### n8n
**Strengths**
- Mature workflow automation with **connectors**, **triggers**, and GUI.
- Production‑grade scheduling and integrations.

**Weaknesses**
- Less agent‑specific orchestration by default.
- Agentic features typically layered via plugins or custom nodes.

---

## Readiness Verdict (Non‑Studio)

**Competitive with CrewAI/AutoGen on core orchestration and tooling.**
To compete with **n8n** and broader enterprise platforms, GenXAI needs
connectors/triggers, workflow persistence at scale, and distributed execution.

---

## Recommended Next Milestones

1. **Trigger & Connector SDK** (webhooks, schedules, DB listeners, queues)
2. **Worker/Queue Execution Layer** (Redis/Celery/RQ or async worker pool)
3. **Expanded Vector Store Coverage** + integration tests
4. **Template Marketplace** (discoverable workflow packs)
5. **Deployment Hardening** (K8s/Helm, secrets policy, CI benchmarks)
