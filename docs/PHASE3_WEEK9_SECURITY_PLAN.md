# Phase 3 Week 9: Security & Guardrails Implementation Plan

**Date**: January 30, 2026  
**Status**: Planning  
**Priority**: 🔥 HIGH  
**Goal**: Add enterprise-grade security and guardrails

---

## Overview

Week 9 focuses on implementing comprehensive security features including authentication, authorization, rate limiting, PII protection, and cost control to make GenXAI production-ready and enterprise-safe.

---

## 1. API Key Management

### File: `genxai/security/auth.py`

**Features to Implement**:
```python
class APIKeyManager:
    """Manage API keys for GenXAI services."""
    
    def generate_key(self, user_id: str, name: str) -> str:
        """Generate new API key."""
        
    def validate_key(self, api_key: str) -> bool:
        """Validate API key."""
        
    def revoke_key(self, api_key: str) -> bool:
        """Revoke API key."""
        
    def list_keys(self, user_id: str) -> List[APIKey]:
        """List all keys for user."""
        
    def rotate_key(self, api_key: str) -> str:
        """Rotate API key."""
```

**Storage Options**:
- SQLite for development
- PostgreSQL for production
- Redis for caching

**Key Format**: `genxai_<environment>_<random_32_chars>`

---

## 2. Role-Based Access Control (RBAC)

### File: `genxai/security/rbac.py`

**Roles**:
```python
class Role(Enum):
    ADMIN = "admin"          # Full access
    DEVELOPER = "developer"  # Create/modify workflows
    OPERATOR = "operator"    # Execute workflows
    VIEWER = "viewer"        # Read-only access
```

**Permissions**:
```python
class Permission(Enum):
    # Agent permissions
    AGENT_CREATE = "agent:create"
    AGENT_READ = "agent:read"
    AGENT_UPDATE = "agent:update"
    AGENT_DELETE = "agent:delete"
    AGENT_EXECUTE = "agent:execute"
    
    # Workflow permissions
    WORKFLOW_CREATE = "workflow:create"
    WORKFLOW_READ = "workflow:read"
    WORKFLOW_UPDATE = "workflow:update"
    WORKFLOW_DELETE = "workflow:delete"
    WORKFLOW_EXECUTE = "workflow:execute"
    
    # Tool permissions
    TOOL_CREATE = "tool:create"
    TOOL_READ = "tool:read"
    TOOL_UPDATE = "tool:update"
    TOOL_DELETE = "tool:delete"
    TOOL_EXECUTE = "tool:execute"
    
    # Memory permissions
    MEMORY_READ = "memory:read"
    MEMORY_WRITE = "memory:write"
    MEMORY_DELETE = "memory:delete"
```

**Role-Permission Mapping**:
```python
ROLE_PERMISSIONS = {
    Role.ADMIN: [Permission.ALL],
    Role.DEVELOPER: [
        Permission.AGENT_CREATE, Permission.AGENT_READ, 
        Permission.AGENT_UPDATE, Permission.AGENT_EXECUTE,
        Permission.WORKFLOW_CREATE, Permission.WORKFLOW_READ,
        Permission.WORKFLOW_UPDATE, Permission.WORKFLOW_EXECUTE,
        Permission.TOOL_READ, Permission.TOOL_EXECUTE,
        Permission.MEMORY_READ, Permission.MEMORY_WRITE,
    ],
    Role.OPERATOR: [
        Permission.AGENT_READ, Permission.AGENT_EXECUTE,
        Permission.WORKFLOW_READ, Permission.WORKFLOW_EXECUTE,
        Permission.TOOL_READ, Permission.TOOL_EXECUTE,
        Permission.MEMORY_READ,
    ],
    Role.VIEWER: [
        Permission.AGENT_READ,
        Permission.WORKFLOW_READ,
        Permission.TOOL_READ,
        Permission.MEMORY_READ,
    ],
}
```

**Decorator for Permission Checks**:
```python
def require_permission(permission: Permission):
    """Decorator to check permissions."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user.has_permission(permission):
                raise PermissionDenied(f"Missing permission: {permission}")
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

---

## 3. JWT Token Support

### File: `genxai/security/jwt.py`

**Token Structure**:
```python
{
    "sub": "user_id",
    "role": "developer",
    "permissions": ["agent:create", "workflow:execute"],
    "exp": 1234567890,
    "iat": 1234567890,
    "iss": "genxai"
}
```

**Implementation**:
```python
class JWTManager:
    """Manage JWT tokens."""
    
    def create_token(
        self, 
        user_id: str, 
        role: Role,
        expires_in: int = 3600
    ) -> str:
        """Create JWT token."""
        
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token."""
        
    def refresh_token(self, token: str) -> str:
        """Refresh JWT token."""
```

---

## 4. OAuth 2.0 Integration

### File: `genxai/security/oauth.py`

**Supported Providers**:
- Google
- GitHub
- Microsoft
- Custom OAuth providers

**Implementation**:
```python
class OAuthProvider:
    """OAuth 2.0 provider integration."""
    
    def get_authorization_url(self) -> str:
        """Get OAuth authorization URL."""
        
    def exchange_code(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for tokens."""
        
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information."""
```

---

## 5. Input Validation

### File: `genxai/security/validation.py`

**Pydantic Models for All Inputs**:
```python
class AgentExecutionRequest(BaseModel):
    """Validate agent execution request."""
    task: str = Field(..., min_length=1, max_length=10000)
    agent_id: str = Field(..., pattern=r'^[a-zA-Z0-9_-]+$')
    context: Optional[Dict[str, Any]] = None
    timeout: int = Field(default=300, ge=1, le=3600)
    
    @validator('task')
    def validate_task(cls, v):
        # Check for SQL injection patterns
        if re.search(r'(DROP|DELETE|INSERT|UPDATE)\s+', v, re.IGNORECASE):
            raise ValueError("Potential SQL injection detected")
        return v
```

**SQL Injection Prevention**:
```python
def sanitize_sql(query: str) -> str:
    """Sanitize SQL query."""
    # Use parameterized queries
    # Escape special characters
    # Validate against whitelist
```

**XSS Prevention**:
```python
def sanitize_html(text: str) -> str:
    """Sanitize HTML to prevent XSS."""
    import bleach
    return bleach.clean(text, tags=[], attributes={}, strip=True)
```

**Command Injection Prevention**:
```python
def sanitize_command(cmd: str) -> str:
    """Sanitize shell command."""
    # Whitelist allowed commands
    # Escape shell metacharacters
    # Use subprocess with shell=False
```

---

## 6. Rate Limiting

### File: `genxai/security/rate_limit.py`

**Token Bucket Algorithm**:
```python
class RateLimiter:
    """Rate limiter using token bucket algorithm."""
    
    def __init__(
        self,
        rate: int,  # tokens per second
        capacity: int,  # bucket capacity
        storage: str = "redis"
    ):
        self.rate = rate
        self.capacity = capacity
        self.storage = storage
    
    async def check_rate_limit(
        self, 
        key: str,  # user_id or api_key
        cost: int = 1
    ) -> bool:
        """Check if request is within rate limit."""
        
    async def get_remaining(self, key: str) -> int:
        """Get remaining tokens."""
```

**Rate Limit Tiers**:
```python
RATE_LIMITS = {
    "free": {
        "requests_per_minute": 10,
        "requests_per_hour": 100,
        "requests_per_day": 1000,
    },
    "pro": {
        "requests_per_minute": 60,
        "requests_per_hour": 1000,
        "requests_per_day": 10000,
    },
    "enterprise": {
        "requests_per_minute": 300,
        "requests_per_hour": 10000,
        "requests_per_day": 100000,
    },
}
```

**Decorator**:
```python
def rate_limit(
    rate: int = 10,
    per: str = "minute",
    key_func: Callable = lambda: get_current_user().id
):
    """Decorator for rate limiting."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            key = key_func()
            limiter = get_rate_limiter()
            
            if not await limiter.check_rate_limit(key):
                raise RateLimitExceeded("Rate limit exceeded")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

---

## 7. PII Detection & Redaction

### File: `genxai/security/pii.py`

**PII Patterns**:
```python
PII_PATTERNS = {
    "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    "phone": r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
    "ssn": r'\b\d{3}-\d{2}-\d{4}\b',
    "credit_card": r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
    "ip_address": r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b',
    "api_key": r'\b[A-Za-z0-9]{32,}\b',
}
```

**Detection**:
```python
class PIIDetector:
    """Detect PII in text."""
    
    def detect(self, text: str) -> List[PIIMatch]:
        """Detect all PII in text."""
        
    def detect_type(self, text: str, pii_type: str) -> List[PIIMatch]:
        """Detect specific PII type."""
        
    def has_pii(self, text: str) -> bool:
        """Check if text contains PII."""
```

**Redaction**:
```python
class PIIRedactor:
    """Redact PII from text."""
    
    def redact(
        self, 
        text: str,
        replacement: str = "***REDACTED***"
    ) -> str:
        """Redact all PII."""
        
    def mask(self, text: str) -> str:
        """Mask PII (show last 4 digits)."""
        # email@example.com -> e***@example.com
        # 555-123-4567 -> ***-***-4567
```

**Audit Logging**:
```python
class PIIAuditLogger:
    """Log PII access for compliance."""
    
    def log_access(
        self,
        user_id: str,
        pii_type: str,
        action: str,
        context: Dict[str, Any]
    ):
        """Log PII access."""
```

---

## 8. Cost Control

### File: `genxai/security/cost_control.py`

**Token Usage Tracking**:
```python
class TokenUsageTracker:
    """Track LLM token usage."""
    
    def record_usage(
        self,
        user_id: str,
        provider: str,
        model: str,
        prompt_tokens: int,
        completion_tokens: int,
        cost: float
    ):
        """Record token usage."""
        
    def get_usage(
        self,
        user_id: str,
        period: str = "day"
    ) -> Dict[str, Any]:
        """Get usage statistics."""
```

**Budget Limits**:
```python
class BudgetManager:
    """Manage user budgets."""
    
    def set_budget(
        self,
        user_id: str,
        amount: float,
        period: str = "month"
    ):
        """Set budget limit."""
        
    def check_budget(self, user_id: str) -> bool:
        """Check if user is within budget."""
        
    def get_remaining(self, user_id: str) -> float:
        """Get remaining budget."""
```

**Cost Estimation**:
```python
class CostEstimator:
    """Estimate costs before execution."""
    
    # Token costs per 1K tokens (as of 2026)
    COSTS = {
        "openai": {
            "gpt-4": {"prompt": 0.03, "completion": 0.06},
            "gpt-3.5-turbo": {"prompt": 0.0015, "completion": 0.002},
        },
        "anthropic": {
            "claude-3-opus": {"prompt": 0.015, "completion": 0.075},
            "claude-3-sonnet": {"prompt": 0.003, "completion": 0.015},
        },
    }
    
    def estimate_cost(
        self,
        provider: str,
        model: str,
        prompt_tokens: int,
        estimated_completion_tokens: int
    ) -> float:
        """Estimate execution cost."""
```

**Alerts**:
```python
class CostAlertManager:
    """Send alerts when costs exceed thresholds."""
    
    def set_alert(
        self,
        user_id: str,
        threshold: float,
        notification_method: str = "email"
    ):
        """Set cost alert."""
        
    def check_and_notify(self, user_id: str, current_cost: float):
        """Check threshold and send notification."""
```

---

## 9. Implementation Tasks

### Day 1-2: Authentication & Authorization
- [ ] Implement APIKeyManager
- [ ] Implement JWTManager
- [ ] Implement RBAC system
- [ ] Add permission decorators
- [ ] Test authentication flow

### Day 3-4: Input Validation & Rate Limiting
- [ ] Create Pydantic models for all inputs
- [ ] Implement SQL injection prevention
- [ ] Implement XSS prevention
- [ ] Implement command injection prevention
- [ ] Implement rate limiter with Redis
- [ ] Add rate limit decorators
- [ ] Test rate limiting

### Day 5-6: PII Protection & Cost Control
- [ ] Implement PII detector
- [ ] Implement PII redactor
- [ ] Add PII audit logging
- [ ] Implement token usage tracker
- [ ] Implement budget manager
- [ ] Implement cost estimator
- [ ] Add cost alerts
- [ ] Test PII detection and cost tracking

### Day 7: Integration & Testing
- [ ] Integrate security into AgentRuntime
- [ ] Integrate security into API endpoints
- [ ] Write security tests
- [ ] Perform security audit
- [ ] Document security features

---

## 10. Integration Example

```python
from genxai.security.auth import require_api_key
from genxai.security.rbac import require_permission, Permission
from genxai.security.rate_limit import rate_limit
from genxai.security.pii import PIIRedactor
from genxai.security.cost_control import check_budget

@require_api_key
@require_permission(Permission.AGENT_EXECUTE)
@rate_limit(rate=10, per="minute")
@check_budget
async def execute_agent(request: AgentExecutionRequest):
    """Execute agent with security checks."""
    
    # Redact PII from input
    redactor = PIIRedactor()
    safe_task = redactor.redact(request.task)
    
    # Execute agent
    result = await agent_runtime.execute(safe_task)
    
    # Redact PII from output
    safe_output = redactor.redact(result["output"])
    
    return {"output": safe_output}
```

---

## 11. Success Criteria

- [ ] All API endpoints protected with authentication
- [ ] RBAC implemented with 4 roles
- [ ] Rate limiting working with Redis
- [ ] PII detection accuracy > 95%
- [ ] Cost tracking accurate within 1%
- [ ] All security tests passing
- [ ] Security documentation complete

---

**Status**: Ready to implement  
**Priority**: 🔥 HIGH  
**Estimated Effort**: 7 days
