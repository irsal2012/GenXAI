---
marp: true
title: GenXAI Competitive Matrix (Non‑Studio)
theme: default
paginate: true
---

# GenXAI Competitive Matrix (Non‑Studio)

**Audience:** Product/Engineering leadership

**Scope:** Core framework only (excludes Studio UI)

---

# Executive Summary

- GenXAI core is **feature‑complete** for agent workflows and tool orchestration.
- Competitive vs **CrewAI/AutoGen** on orchestration depth and tooling.
- Lags **n8n** on connectors, triggers, and enterprise automation UX.
- Key gaps: workflow triggers, distributed execution, ecosystem scale.

---

# Competitive Set

- **GenXAI (Core)** — agent runtime + graph engine + tooling
- **CrewAI** — agent collaboration patterns + growing ecosystem
- **AutoGen** — multi‑agent research depth + extensibility
- **BeeAI** — lightweight agentic automation
- **n8n** — mature workflow automation + connectors

---

# Feature Matrix (Highlights)

- **GenXAI**: multi‑LLM, graph execution, memory, observability, security
- **CrewAI**: strong agent collaboration, templates
- **AutoGen**: deep multi‑agent patterns
- **BeeAI**: lean automation patterns
- **n8n**: best‑in‑class automation UX + connector ecosystem

---

# Scored Rubric (1–5)

Scale: 1 = missing · 3 = partial · 5 = best‑in‑class

**Top Strengths (GenXAI):** provider breadth, graph flexibility, memory tooling

---

# Weighted Totals (Base Weights)

| Framework | Score (0–100) |
|---|---:|
| GenXAI (Core) | 72.0 |
| CrewAI | 61.8 |
| AutoGen | 75.2 |
| BeeAI | 48.0 |
| n8n | 85.0 |

---

# Scenario A — Enterprise‑First

**Emphasis:** observability, governance, enterprise readiness

| Framework | Score (0–100) |
|---|---:|
| GenXAI (Core) | 70.6 |
| CrewAI | 56.8 |
| AutoGen | 72.2 |
| BeeAI | 44.0 |
| n8n | 88.0 |

---

# Scenario B — Developer‑First

**Emphasis:** agent depth, graph flexibility, provider breadth

| Framework | Score (0–100) |
|---|---:|
| GenXAI (Core) | 75.0 |
| CrewAI | 63.2 |
| AutoGen | 76.8 |
| BeeAI | 50.4 |
| n8n | 78.4 |

---

# Heat‑Map Summary (Visual)

🟩 Strong · 🟨 Partial · 🟥 Gap

- GenXAI: 🟩 provider breadth, 🟩 graph flexibility, 🟩 memory
- n8n: 🟩 connectors + UX + enterprise
- AutoGen: 🟩 orchestration depth, 🟨 production scaffolding

---

# Key Gaps to Close

1. **Trigger & Connector SDK** (webhooks, schedules, DB listeners)
2. **Distributed Execution** (worker queues)
3. **Ecosystem/Marketplace** for templates and tool packs
4. **Integration Testing** for vector stores + persistence

---

# Recommended Next Milestones

- Build **trigger + connector SDK**
- Ship **worker/queue execution layer**
- Expand **vector store coverage + CI benchmarks**
- Launch **template marketplace**

---

# Q&A

What weighting scenario should be prioritized for the roadmap?
