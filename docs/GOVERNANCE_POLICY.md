# Governance Policy Engine

GenXAI includes a resource‑level ACL policy engine layered on top of RBAC.

## How it works
- RBAC provides coarse permissions (`tool:execute`, `agent:read`, etc.)
- Policy engine enforces **resource‑specific** ACLs (e.g. tool `tool:csv_processor`)

## Example

```python
from genxai.security.policy_engine import get_policy_engine, AccessRule
from genxai.security.rbac import Permission, User, Role, set_current_user

policy = get_policy_engine()
policy.add_rule(
    "tool:calculator",
    AccessRule(permissions={Permission.TOOL_EXECUTE}, allowed_users={"alice"})
)

policy.add_rule(
    "agent:finance_agent",
    AccessRule(permissions={Permission.AGENT_EXECUTE}, allowed_users={"alice"})
)

policy.add_rule(
    "memory:shared_plan",
    AccessRule(permissions={Permission.MEMORY_READ, Permission.MEMORY_WRITE}, allowed_users={"alice"})
)

set_current_user(User(user_id="alice", role=Role.DEVELOPER))
# Tool execution will be allowed only for alice.
```