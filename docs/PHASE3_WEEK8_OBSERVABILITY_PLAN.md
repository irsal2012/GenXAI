# Phase 3 Week 8: Observability Implementation Plan

**Date**: January 30, 2026  
**Status**: Planning  
**Priority**: 🔥 HIGH  
**Goal**: Add enterprise-grade observability with metrics, tracing, and logging

---

## Overview

Week 8 focuses on implementing comprehensive observability for GenXAI, enabling production monitoring, debugging, and performance analysis through Prometheus metrics, OpenTelemetry tracing, and structured logging.

---

## 1. Prometheus Metrics

### Agent Execution Metrics

**File**: `genxai/observability/metrics.py`

**Metrics to Implement**:
```python
# Counter metrics
agent_executions_total = Counter(
    'genxai_agent_executions_total',
    'Total number of agent executions',
    ['agent_id', 'status']
)

agent_errors_total = Counter(
    'genxai_agent_errors_total',
    'Total number of agent errors',
    ['agent_id', 'error_type']
)

# Histogram metrics
agent_execution_duration_seconds = Histogram(
    'genxai_agent_execution_duration_seconds',
    'Agent execution duration in seconds',
    ['agent_id'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
)

# Gauge metrics
agent_active_executions = Gauge(
    'genxai_agent_active_executions',
    'Number of currently active agent executions',
    ['agent_id']
)
```

### Tool Usage Metrics

**Metrics to Implement**:
```python
tool_calls_total = Counter(
    'genxai_tool_calls_total',
    'Total number of tool calls',
    ['tool_name', 'status']
)

tool_execution_duration_seconds = Histogram(
    'genxai_tool_execution_duration_seconds',
    'Tool execution duration in seconds',
    ['tool_name'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0, 10.0]
)

tool_errors_total = Counter(
    'genxai_tool_errors_total',
    'Total number of tool errors',
    ['tool_name', 'error_type']
)
```

### LLM Token Usage and Cost Metrics

**Metrics to Implement**:
```python
llm_requests_total = Counter(
    'genxai_llm_requests_total',
    'Total number of LLM requests',
    ['provider', 'model', 'status']
)

llm_tokens_total = Counter(
    'genxai_llm_tokens_total',
    'Total number of tokens used',
    ['provider', 'model', 'token_type']  # prompt, completion, total
)

llm_cost_total = Counter(
    'genxai_llm_cost_total',
    'Total estimated cost in USD',
    ['provider', 'model']
)

llm_request_duration_seconds = Histogram(
    'genxai_llm_request_duration_seconds',
    'LLM request duration in seconds',
    ['provider', 'model'],
    buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
)
```

### Memory Operation Metrics

**Metrics to Implement**:
```python
memory_operations_total = Counter(
    'genxai_memory_operations_total',
    'Total number of memory operations',
    ['operation_type', 'memory_type', 'status']  # store, retrieve, search
)

memory_operation_duration_seconds = Histogram(
    'genxai_memory_operation_duration_seconds',
    'Memory operation duration in seconds',
    ['operation_type', 'memory_type'],
    buckets=[0.001, 0.01, 0.05, 0.1, 0.5, 1.0]
)

memory_size_bytes = Gauge(
    'genxai_memory_size_bytes',
    'Current memory size in bytes',
    ['agent_id', 'memory_type']
)
```

### Graph Execution Metrics

**Metrics to Implement**:
```python
workflow_executions_total = Counter(
    'genxai_workflow_executions_total',
    'Total number of workflow executions',
    ['workflow_id', 'status']
)

workflow_execution_duration_seconds = Histogram(
    'genxai_workflow_execution_duration_seconds',
    'Workflow execution duration in seconds',
    ['workflow_id'],
    buckets=[1.0, 5.0, 10.0, 30.0, 60.0, 300.0, 600.0]
)

workflow_node_executions_total = Counter(
    'genxai_workflow_node_executions_total',
    'Total number of workflow node executions',
    ['workflow_id', 'node_id', 'status']
)
```

---

## 2. OpenTelemetry Tracing

### Distributed Tracing Setup

**File**: `genxai/observability/tracing.py`

**Components**:
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger import JaegerExporter
from opentelemetry.instrumentation.requests import RequestsInstrumentor

# Initialize tracer
tracer_provider = TracerProvider()
trace.set_tracer_provider(tracer_provider)

# Configure exporter (Jaeger)
jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)

# Add span processor
tracer_provider.add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

# Get tracer
tracer = trace.get_tracer(__name__)
```

### Span Creation for Operations

**Agent Execution Spans**:
```python
@tracer.start_as_current_span("agent.execute")
async def execute(self, task: str, **kwargs):
    span = trace.get_current_span()
    span.set_attribute("agent.id", self.agent.id)
    span.set_attribute("agent.role", self.agent.config.role)
    span.set_attribute("task", task)
    
    try:
        result = await self._execute_internal(task, **kwargs)
        span.set_attribute("status", "success")
        return result
    except Exception as e:
        span.set_attribute("status", "error")
        span.set_attribute("error.type", type(e).__name__)
        span.set_attribute("error.message", str(e))
        raise
```

**Tool Execution Spans**:
```python
@tracer.start_as_current_span("tool.execute")
async def execute_tool(self, tool_name: str, **kwargs):
    span = trace.get_current_span()
    span.set_attribute("tool.name", tool_name)
    span.set_attribute("tool.parameters", str(kwargs))
    
    # Execute tool
    result = await tool.execute(**kwargs)
    
    span.set_attribute("tool.result_size", len(str(result)))
    return result
```

**LLM Request Spans**:
```python
@tracer.start_as_current_span("llm.generate")
async def generate(self, prompt: str, **kwargs):
    span = trace.get_current_span()
    span.set_attribute("llm.provider", self.provider_name)
    span.set_attribute("llm.model", self.model)
    span.set_attribute("llm.prompt_length", len(prompt))
    
    response = await self._generate_internal(prompt, **kwargs)
    
    span.set_attribute("llm.completion_length", len(response.content))
    span.set_attribute("llm.tokens.total", response.usage["total_tokens"])
    span.set_attribute("llm.tokens.prompt", response.usage["prompt_tokens"])
    span.set_attribute("llm.tokens.completion", response.usage["completion_tokens"])
    
    return response
```

### Trace Context Propagation

**Workflow Execution**:
```python
@tracer.start_as_current_span("workflow.execute")
async def execute_workflow(self, workflow_id: str):
    span = trace.get_current_span()
    span.set_attribute("workflow.id", workflow_id)
    
    # Propagate context to child spans
    for node in workflow.nodes:
        with tracer.start_as_current_span(f"node.{node.id}") as node_span:
            node_span.set_attribute("node.id", node.id)
            node_span.set_attribute("node.type", node.type)
            await node.execute()
```

---

## 3. Structured Logging

### Logging Configuration

**File**: `genxai/observability/logging.py`

**Setup**:
```python
import logging
import json
from datetime import datetime
from typing import Any, Dict

class StructuredLogger:
    """Structured JSON logger with context."""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.context = {}
    
    def add_context(self, **kwargs):
        """Add context to all log messages."""
        self.context.update(kwargs)
    
    def _format_message(self, level: str, message: str, **kwargs) -> str:
        """Format log message as JSON."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "message": message,
            "context": self.context,
            **kwargs
        }
        return json.dumps(log_entry)
    
    def info(self, message: str, **kwargs):
        self.logger.info(self._format_message("INFO", message, **kwargs))
    
    def warning(self, message: str, **kwargs):
        self.logger.warning(self._format_message("WARNING", message, **kwargs))
    
    def error(self, message: str, **kwargs):
        self.logger.error(self._format_message("ERROR", message, **kwargs))
    
    def debug(self, message: str, **kwargs):
        self.logger.debug(self._format_message("DEBUG", message, **kwargs))
```

### Log Levels and Filtering

**Configuration**:
```python
# Development
logging.basicConfig(level=logging.DEBUG)

# Production
logging.basicConfig(level=logging.INFO)

# Sensitive data filtering
class SensitiveDataFilter(logging.Filter):
    """Filter sensitive data from logs."""
    
    SENSITIVE_PATTERNS = [
        r'api[_-]?key',
        r'password',
        r'token',
        r'secret',
    ]
    
    def filter(self, record):
        # Redact sensitive data
        message = record.getMessage()
        for pattern in self.SENSITIVE_PATTERNS:
            message = re.sub(
                f'{pattern}["\']?\\s*[:=]\\s*["\']?([^"\'\\s]+)',
                f'{pattern}=***REDACTED***',
                message,
                flags=re.IGNORECASE
            )
        record.msg = message
        return True
```

### Contextual Logging

**Agent Execution**:
```python
logger = StructuredLogger("genxai.agent")
logger.add_context(agent_id=self.agent.id, agent_role=self.agent.config.role)

logger.info("Starting agent execution", task=task)
logger.debug("Building prompt", prompt_length=len(prompt))
logger.info("Agent execution completed", 
    duration=duration,
    tokens_used=tokens,
    status="success"
)
```

---

## 4. Grafana Dashboard Templates

### Dashboard Configuration

**File**: `genxai/observability/dashboards/genxai_overview.json`

**Panels**:
1. **Agent Execution Rate** - agent_executions_total rate
2. **Agent Success Rate** - success / total ratio
3. **Agent Execution Duration** - p50, p95, p99
4. **Active Agents** - agent_active_executions
5. **Tool Usage** - tool_calls_total by tool_name
6. **LLM Token Usage** - llm_tokens_total over time
7. **LLM Cost** - llm_cost_total cumulative
8. **Memory Operations** - memory_operations_total rate
9. **Workflow Execution** - workflow_executions_total
10. **Error Rate** - agent_errors_total + tool_errors_total

### Alert Rules

**File**: `genxai/observability/alerts/genxai_alerts.yml`

**Alerts**:
```yaml
groups:
  - name: genxai_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(genxai_agent_errors_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High agent error rate"
          
      - alert: SlowAgentExecution
        expr: histogram_quantile(0.95, genxai_agent_execution_duration_seconds) > 30
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Agent execution is slow"
          
      - alert: HighLLMCost
        expr: rate(genxai_llm_cost_total[1h]) > 10
        for: 1h
        labels:
          severity: critical
        annotations:
          summary: "LLM costs are high"
```

---

## 5. Implementation Tasks

### Day 1-2: Metrics Implementation
- [ ] Create `genxai/observability/metrics.py`
- [ ] Implement Prometheus metrics
- [ ] Add metrics to AgentRuntime
- [ ] Add metrics to tool execution
- [ ] Add metrics to LLM providers
- [ ] Add metrics to memory operations
- [ ] Add metrics to workflow execution
- [ ] Create metrics endpoint `/metrics`

### Day 3-4: Tracing Implementation
- [ ] Create `genxai/observability/tracing.py`
- [ ] Set up OpenTelemetry
- [ ] Add spans to agent execution
- [ ] Add spans to tool execution
- [ ] Add spans to LLM requests
- [ ] Add spans to memory operations
- [ ] Implement trace context propagation
- [ ] Configure Jaeger exporter

### Day 5-6: Logging Implementation
- [ ] Create `genxai/observability/logging.py`
- [ ] Implement structured logger
- [ ] Add contextual logging
- [ ] Implement sensitive data filtering
- [ ] Add log levels configuration
- [ ] Integrate with existing code
- [ ] Test log output

### Day 7: Dashboards and Documentation
- [ ] Create Grafana dashboard templates
- [ ] Create alert rules
- [ ] Write observability documentation
- [ ] Create setup guide
- [ ] Test complete observability stack

---

## 6. Integration Points

### AgentRuntime Integration
```python
from genxai.observability.metrics import agent_executions_total, agent_execution_duration_seconds
from genxai.observability.tracing import tracer
from genxai.observability.logging import StructuredLogger

class AgentRuntime:
    def __init__(self, agent, llm_provider):
        self.agent = agent
        self.llm_provider = llm_provider
        self.logger = StructuredLogger("genxai.agent")
        self.logger.add_context(agent_id=agent.id)
    
    @tracer.start_as_current_span("agent.execute")
    async def execute(self, task: str, **kwargs):
        # Increment active executions
        agent_active_executions.labels(agent_id=self.agent.id).inc()
        
        # Start timer
        with agent_execution_duration_seconds.labels(agent_id=self.agent.id).time():
            self.logger.info("Starting execution", task=task)
            
            try:
                result = await self._execute_internal(task, **kwargs)
                
                # Record success
                agent_executions_total.labels(
                    agent_id=self.agent.id,
                    status="success"
                ).inc()
                
                self.logger.info("Execution completed", status="success")
                return result
                
            except Exception as e:
                # Record error
                agent_executions_total.labels(
                    agent_id=self.agent.id,
                    status="error"
                ).inc()
                
                agent_errors_total.labels(
                    agent_id=self.agent.id,
                    error_type=type(e).__name__
                ).inc()
                
                self.logger.error("Execution failed", 
                    error_type=type(e).__name__,
                    error_message=str(e)
                )
                raise
                
            finally:
                # Decrement active executions
                agent_active_executions.labels(agent_id=self.agent.id).dec()
```

---

## 7. Testing

### Metrics Testing
```python
def test_agent_execution_metrics():
    """Test that metrics are recorded correctly."""
    # Execute agent
    await runtime.execute("test task")
    
    # Check metrics
    assert agent_executions_total._value.get() > 0
    assert agent_execution_duration_seconds._sum.get() > 0
```

### Tracing Testing
```python
def test_agent_execution_tracing():
    """Test that spans are created correctly."""
    with tracer.start_as_current_span("test") as span:
        await runtime.execute("test task")
        
    # Check span attributes
    assert span.attributes["agent.id"] == "test_agent"
    assert span.attributes["status"] == "success"
```

---

## 8. Deliverables

1. **Metrics System** - Prometheus metrics for all operations
2. **Tracing System** - OpenTelemetry distributed tracing
3. **Logging System** - Structured JSON logging
4. **Grafana Dashboards** - Pre-built monitoring dashboards
5. **Alert Rules** - Production-ready alerts
6. **Documentation** - Complete observability guide
7. **Tests** - Unit tests for observability components

---

## 9. Success Criteria

- [ ] All metrics implemented and tested
- [ ] Distributed tracing working end-to-end
- [ ] Structured logging in place
- [ ] Grafana dashboards created
- [ ] Alert rules configured
- [ ] Documentation complete
- [ ] Zero performance impact (< 1% overhead)

---

**Status**: Ready to implement  
**Priority**: 🔥 HIGH  
**Estimated Effort**: 7 days
