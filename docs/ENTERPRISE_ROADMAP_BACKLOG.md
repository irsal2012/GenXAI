# GenXAI Enterprise Adoption Backlog

This backlog translates the enterprise adoption roadmap into epics and actionable stories.

---

## Epic 0 — Baseline Stabilization
**Goal:** Release discipline + security baseline.

### Stories
1. Add CI gating for unit + integration test suites.
2. Add dependency + license scanning (Snyk/Bandit).
3. Centralize config/secrets (Pydantic Settings + env schema).
4. Implement tool execution allow/deny policies.
5. Publish release checklist + semantic versioning scheme.

---

## Epic 1 — Distributed Execution & Reliability
**Goal:** Scalable workflow execution.

### Stories
1. Implement worker queue engine (Celery/RQ/Ray).
2. Add execution metadata store (Postgres).
3. Implement idempotent run IDs + dedupe.
4. Add checkpoint/restore across workers.
5. Add retry + exponential backoff policy.

---

## Epic 2 — Connector SDK + Integrations
**Goal:** Close connector ecosystem gap.

### Stories
1. Connector SDK interface + lifecycle (start/stop/health).
2. Webhook connector + signature validation.
3. Kafka connector + topic mapping.
4. SQS connector + DLQ handling.
5. DB CDC connector (Postgres logical replication).
6. OAuth secret injection pattern.
7. Signed connector bundles + versioning.
8. Workflow template library (8–10 enterprise templates).

---

## Epic 3 — Governance, Security & Compliance
**Goal:** Enterprise security posture.

### Stories
1. RBAC + policy enforcement for tools/agents.
2. Audit log store (immutable append‑only).
3. PII detection + redaction middleware.
4. Configurable retention + deletion policies.
5. Compliance reporting export (SOC2 artifacts).

---

## Epic 4 — Observability & Ops Tooling
**Goal:** Production monitoring + ops.

### Stories
1. Metrics: latency, cost, throughput.
2. OpenTelemetry spans for node/tool/agent.
3. Alerting for SLA + cost spikes.
4. CLI ops: replay/cancel/inspect.
5. Ops dashboards (Grafana templates).

---

## Epic 5 — Enterprise Packaging & Deployment
**Goal:** 1‑day install target.

### Stories
1. Helm charts (K8s reference deployment).
2. Hardened Docker images + CIS baseline.
3. Cloud deploy guides (AWS/GCP/Azure).
4. Enterprise quick‑start playbook + runbook.