# GenXAI API Reference

Complete API documentation for GenXAI framework.

## Core Components

### Agent Runtime

```python
from genxai.core.agent import AgentRuntime

# Create agent runtime
runtime = AgentRuntime(
    agent_id="my_agent",
    llm_provider="openai",
    model="gpt-4",
    tools=["web_scraper", "calculator"]
)

# Execute task
result = await runtime.execute("Analyze this data")
```

### LLM Providers

```python
from genxai.llm import create_llm

# OpenAI
llm = create_llm("openai", model="gpt-4", api_key="sk-...")

# Anthropic
llm = create_llm("anthropic", model="claude-3-opus", api_key="sk-ant-...")

# Google
llm = create_llm("google", model="gemini-pro", api_key="...")

# Cohere
llm = create_llm("cohere", model="command", api_key="...")

# Generate response
response = await llm.generate("Hello, world!")
```

### Memory System

```python
from genxai.core.memory import MemoryManager

# Create memory manager
memory = MemoryManager()

# Short-term memory
memory.short_term.store("key", "value")
value = memory.short_term.retrieve("key")

# Long-term memory
memory.long_term.store("knowledge", {"fact": "data"})

# Semantic memory
memory.semantic.store_embedding("text", embedding)
results = memory.semantic.search("query", top_k=5)

# Working memory
memory.working.add_context("Current task context")
```

### Graph Execution

```python
from genxai.core.graph import GraphEngine, Node, Edge

# Create graph
engine = GraphEngine()

# Add nodes
node1 = Node(id="agent1", type="agent", config={...})
node2 = Node(id="agent2", type="agent", config={...})

engine.add_node(node1)
engine.add_node(node2)

# Add edges
edge = Edge(source="agent1", target="agent2", condition="success")
engine.add_edge(edge)

# Execute graph
result = await engine.execute(initial_state={...})
```

## Tools

### Built-in Tools

```python
from genxai.tools import get_tool

# Web scraper
scraper = get_tool("web_scraper")
result = await scraper.execute(url="https://example.com")

# API caller
api = get_tool("api_caller")
result = await api.execute(
    url="https://api.example.com",
    method="POST",
    data={...}
)

# File operations
file_writer = get_tool("file_writer")
await file_writer.execute(path="output.txt", content="data")
```

### Custom Tools

```python
from genxai.tools import Tool

class MyTool(Tool):
    name = "my_tool"
    description = "My custom tool"
    
    async def execute(self, **kwargs):
        # Tool logic
        return {"result": "success"}

# Register tool
from genxai.tools import register_tool
register_tool(MyTool())
```

## Security

### Authentication

```python
from genxai.security import get_api_key_manager

# Create API key
manager = get_api_key_manager()
key = manager.create_key(user_id="user123", name="My Key")

# Validate key
is_valid = manager.validate_key(key)

# Decorator
from genxai.security import require_api_key

@require_api_key
async def protected_endpoint():
    return {"data": "protected"}
```

### RBAC

```python
from genxai.security import get_rbac_manager, require_permission

# Check permission
rbac = get_rbac_manager()
has_perm = rbac.check_permission("user123", "agents:create")

# Decorator
@require_permission("workflows:execute")
async def execute_workflow():
    return {"status": "running"}
```

### Rate Limiting

```python
from genxai.security import rate_limit

@rate_limit(tier="pro", cost=1)
async def api_endpoint(user_id: str):
    return {"data": "response"}
```

### PII Protection

```python
from genxai.security import get_pii_redactor

redactor = get_pii_redactor()

# Redact PII
text = "My email is john@example.com"
redacted = redactor.redact(text)  # "My email is ***REDACTED***"

# Mask PII
masked = redactor.mask(text)  # "My email is j***@example.com"
```

## Performance

### Caching

```python
from genxai.performance import cached

@cached("llm_response", ttl=3600)
async def get_llm_response(prompt: str):
    return await llm.generate(prompt)
```

### Connection Pooling

```python
from genxai.performance import get_db_pool, get_http_pool

# Database
async with get_db_pool().connection() as conn:
    result = await conn.fetch("SELECT * FROM agents")

# HTTP
http_pool = await get_http_pool()
response = await http_pool.get("https://api.example.com")
```

## Observability

### Metrics

```python
from genxai.observability import get_metrics_collector

metrics = get_metrics_collector()

# Counter
metrics.increment_counter("requests_total", labels={"endpoint": "/api"})

# Gauge
metrics.set_gauge("active_agents", 5)

# Histogram
metrics.observe_histogram("request_duration", 0.5)
```

### Tracing

```python
from genxai.observability import get_tracer

tracer = get_tracer()

# Create span
with tracer.start_span("agent_execution") as span:
    span.set_attribute("agent_id", "agent123")
    result = await agent.execute()
```

### Logging

```python
from genxai.observability import get_logger

logger = get_logger(__name__)

logger.info("Agent started", extra={"agent_id": "agent123"})
logger.error("Execution failed", exc_info=True)
```

## Configuration

### Environment Variables

```bash
# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
COHERE_API_KEY=...

# Database
POSTGRES_URL=postgresql://localhost/genxai
REDIS_URL=redis://localhost:6379

# Security
GENXAI_JWT_SECRET=your-secret-key
RATE_LIMIT_STORAGE=redis

# Performance
CACHE_BACKEND=redis

# Observability
JAEGER_ENDPOINT=http://localhost:14268/api/traces
PROMETHEUS_PORT=9090
```

## Error Handling

```python
from genxai.core.exceptions import (
    AgentExecutionError,
    ToolExecutionError,
    LLMError,
    MemoryError
)

try:
    result = await agent.execute()
except AgentExecutionError as e:
    logger.error(f"Agent failed: {e}")
except ToolExecutionError as e:
    logger.error(f"Tool failed: {e}")
```

## Best Practices

1. **Always use async/await** for I/O operations
2. **Enable caching** for expensive operations
3. **Use connection pooling** for databases and HTTP
4. **Implement proper error handling**
5. **Add observability** (metrics, tracing, logging)
6. **Secure your endpoints** with authentication and rate limiting
7. **Validate and sanitize** all inputs
8. **Use type hints** for better IDE support
9. **Write tests** for custom tools and agents
10. **Monitor resource usage** in production
