# GenXAI Enterprise Adoption Backlog

This backlog translates the enterprise adoption roadmap into epics and actionable stories.

---

## Epic 0 — Baseline Stabilization
**Goal:** Release discipline + security baseline.

### Stories
1. Add CI gating for unit + integration test suites. **Priority:** P0
2. Add dependency + license scanning (Snyk/Bandit). **Priority:** P0
3. Centralize config/secrets (Pydantic Settings + env schema). **Priority:** P1
4. Implement tool execution allow/deny policies. **Priority:** P1
5. Publish release checklist + semantic versioning scheme. **Priority:** P0
6. Expand regression coverage for graph engine + agent runtime (pytest + fixtures). **Priority:** P0
7. Harden input validation for workflow YAML/JSON imports. **Priority:** P1
8. Document supported LLM provider matrix + version pinning. **Priority:** P2

---

## Epic 1 — Distributed Execution & Reliability
**Goal:** Scalable workflow execution.

### Stories
1. Implement worker queue engine (Celery/RQ/Ray). **Priority:** P0
2. Add execution metadata store (Postgres). **Priority:** P0
3. Implement idempotent run IDs + dedupe. **Priority:** P1
4. Add checkpoint/restore across workers. **Priority:** P1
5. Add retry + exponential backoff policy. **Priority:** P0
6. Add workflow cancellation + timeout propagation. **Priority:** P1
7. Add durable dead-letter handling for failed runs. **Priority:** P1
8. Load testing harness for queued workflows. **Priority:** P2

---

## Epic 2 — Connector SDK + Integrations
**Goal:** Close connector ecosystem gap.

### Stories
1. Connector SDK interface + lifecycle (start/stop/health). **Priority:** P0
2. Webhook connector + signature validation. **Priority:** P0
3. Kafka connector + topic mapping. **Priority:** P1
4. SQS connector + DLQ handling. **Priority:** P1
5. DB CDC connector (Postgres logical replication). **Priority:** P1
6. OAuth secret injection pattern. **Priority:** P0
7. Signed connector bundles + versioning. **Priority:** P2
8. Workflow template library (8–10 enterprise templates). **Priority:** P2
9. Connector testing harness + golden payload fixtures. **Priority:** P1
10. Rate limit + backpressure controls per connector. **Priority:** P1

---

## Epic 3 — Governance, Security & Compliance
**Goal:** Enterprise security posture.

### Stories
1. RBAC + policy enforcement for tools/agents. **Priority:** P0
2. Audit log store (immutable append‑only). **Priority:** P0
3. PII detection + redaction middleware. **Priority:** P1
4. Configurable retention + deletion policies. **Priority:** P1
5. Compliance reporting export (SOC2 artifacts). **Priority:** P2
6. Policy bundles + versioned approvals (CLI + API). **Priority:** P1
7. Secrets management integration (AWS/GCP/Vault). **Priority:** P1

---

## Epic 4 — Observability & Ops Tooling
**Goal:** Production monitoring + ops.

### Stories
1. Metrics: latency, cost, throughput. **Priority:** P0
2. OpenTelemetry spans for node/tool/agent. **Priority:** P0
3. Alerting for SLA + cost spikes. **Priority:** P1
4. CLI ops: replay/cancel/inspect. **Priority:** P1
5. Ops dashboards (Grafana templates). **Priority:** P2
6. Execution trace viewer (JSON export + UI hooks). **Priority:** P2

---

## Epic 5 — Enterprise Packaging & Deployment
**Goal:** 1‑day install target.

### Stories
1. Helm charts (K8s reference deployment). **Priority:** P1
2. Hardened Docker images + CIS baseline. **Priority:** P0
3. Cloud deploy guides (AWS/GCP/Azure). **Priority:** P1
4. Enterprise quick‑start playbook + runbook. **Priority:** P0
5. Release artifacts: signed SBOM + provenance (SLSA). **Priority:** P1
6. Sample Terraform modules for minimal deployment. **Priority:** P2