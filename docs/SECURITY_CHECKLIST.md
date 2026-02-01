# GenXAI Security Checklist

Use this checklist before releasing new versions.

## Authentication & Authorization

- [ ] API key authentication enabled
- [ ] RBAC roles defined and enforced
- [ ] OAuth/JWT configurations tested

## Input/Output Guardrails

- [ ] Input validation for workflow payloads
- [ ] Output filtering for sensitive data
- [ ] PII detection enabled (if applicable)

## Rate Limiting & Cost Controls

- [ ] Rate limits configured
- [ ] Cost control policies set (max tokens/cost)

## Dependencies & Vulnerabilities

- [ ] Run `pip-audit` or `safety` for vulnerabilities
- [ ] Check supply chain integrity (pin versions)

## Runtime Security

- [ ] Secure secrets in env vars (no hardcoded secrets)
- [ ] TLS enabled for API endpoints
- [ ] Logging redacts sensitive fields

## Release Gate

- [ ] Security scan results reviewed
- [ ] Pen-test results (if applicable)
- [ ] Incident response plan updated
