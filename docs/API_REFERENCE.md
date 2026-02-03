# GenXAI API Reference

Complete API documentation for the core GenXAI framework (non-Studio runtime).

> **Note:** This reference matches the current code in `genxai/`.
> For Studio workflow execution, see `docs/WORKFLOW_EXECUTION.md`.

---

## Core Agents

### AgentConfig + AgentType

```python
from genxai.core.agent.base import AgentConfig, AgentType

config = AgentConfig(
    role="Research Analyst",
    goal="Summarize research papers",
    llm_model="gpt-4",
    llm_temperature=0.4,
    agent_type=AgentType.DELIBERATIVE,
    tools=["web_scraper", "calculator"],
    enable_memory=True,
)
```

### AgentFactory

```python
from genxai.core.agent import AgentFactory

agent = AgentFactory.create_agent(
    id="researcher",
    role="Research Analyst",
    goal="Summarize research papers",
    llm_model="gpt-4",
    llm_temperature=0.4,
    tools=["web_scraper", "calculator"],
)
```

### AgentRuntime

```python
import os
from genxai.core.agent.runtime import AgentRuntime

runtime = AgentRuntime(agent=agent, api_key=os.getenv("OPENAI_API_KEY"))
result = await runtime.execute(
    task="Summarize this PDF and extract the key findings."
)
```

**Key Methods**

- `execute(task, context=None, timeout=None)`
- `batch_execute(tasks, context=None)`
- `stream_execute(task, context=None)`
- `set_tools(tools: Dict[str, Tool])`
- `set_memory(memory: MemorySystem)`
- `set_llm_provider(provider: LLMProvider)`

### AgentRegistry

```python
from genxai.core.agent.registry import AgentRegistry

AgentRegistry.register(agent)
AgentRegistry.get("researcher")
AgentRegistry.list_all()
```

---

## LLM Providers

### LLMProviderFactory

```python
from genxai.llm.factory import LLMProviderFactory

provider = LLMProviderFactory.create_provider(
    model="gpt-4",
    api_key="sk-...",
    temperature=0.4,
    max_tokens=1200,
)
```

**Provider utilities**

- `supports_model(model: str) -> bool`
- `list_available_providers() -> list[str]`
- `list_providers() -> list[str]`
- `create_routed_provider(primary_model, fallback_models=None, **kwargs)`

---

## Memory System

```python
from pathlib import Path
from genxai.core.memory.manager import MemorySystem

memory = MemorySystem(
    agent_id="researcher",
    persistence_enabled=True,
    persistence_path=Path(".genxai/memory"),
)

await memory.add_to_short_term({"task": "summary"})
context = await memory.get_short_term_context()
```

**Key Methods**

- `add_to_short_term(content, metadata=None)`
- `get_short_term_context(max_tokens=4000)`
- `add_to_long_term(memory, ttl=None)`
- `search_long_term(query, limit=10)`
- `store_episode(task, actions, outcome, duration, success, metadata=None)`
- `store_fact(subject, predicate, object, confidence=1.0, source=None)`
- `store_procedure(name, description, steps, preconditions=None, postconditions=None)`
- `get_stats()`

---

## Graph Orchestration

### Graph + Nodes + Edges

```python
from genxai.core.graph import Graph
from genxai.core.graph.nodes import InputNode, OutputNode, AgentNode
from genxai.core.graph.edges import Edge

graph = Graph(name="analysis_flow")
graph.add_node(InputNode())
graph.add_node(AgentNode(id="research_node", agent_id="researcher"))
graph.add_node(OutputNode())

graph.add_edge(Edge(source="input", target="research_node"))
graph.add_edge(Edge(source="research_node", target="output"))

graph.validate()
state = await graph.run(input_data={"topic": "RAG"})
```

### WorkflowEngine (Compatibility Wrapper)

```python
from genxai.core.graph.engine import WorkflowEngine

engine = WorkflowEngine(name="workflow")
engine.add_node(InputNode())
engine.add_node(AgentNode(id="agent", agent_id="researcher"))
engine.add_node(OutputNode())
engine.add_edge(Edge(source="input", target="agent"))
engine.add_edge(Edge(source="agent", target="output"))

result = await engine.execute(start_node="input", input_data={"task": "..."})
```

### Flow Orchestrators

Flow orchestrators provide lightweight wrappers for common coordination
patterns without introducing a new execution engine.

```python
from genxai import AgentFactory, RoundRobinFlow, SelectorFlow, P2PFlow

agents = [
    AgentFactory.create_agent(id="analyst", role="Analyst", goal="Analyze"),
    AgentFactory.create_agent(id="writer", role="Writer", goal="Write"),
]

round_robin = RoundRobinFlow(agents)

def choose_next(state, agent_ids):
    return agent_ids[state.get("selector_hop", 0) % len(agent_ids)]

selector = SelectorFlow(agents, selector=choose_next, max_hops=3)

p2p = P2PFlow(agents, max_rounds=4, consensus_threshold=0.7)
```

See [docs/FLOWS.md](./FLOWS.md) for details.

#### FlowOrchestrator (base)

```python
FlowOrchestrator(
    agents: Iterable[Agent],
    name: str = "flow",
    llm_provider: Optional[LLMProvider] = None,
)
```

**Key Methods**
- `build_graph() -> Graph`: build the graph definition for the flow.
- `run(input_data, state=None, max_iterations=100) -> Dict[str, Any]`: execute the flow.

#### RoundRobinFlow

```python
RoundRobinFlow(
    agents: Iterable[Agent],
    name: str = "flow",
    llm_provider: Optional[LLMProvider] = None,
)
```

**Behavior**
- Executes agents in fixed order (A → B → C).
- Uses the core graph engine for execution.

#### SelectorFlow

```python
SelectorFlow(
    agents: Iterable[Agent],
    selector: Callable[[Dict[str, Any], List[str]], str],
    name: str = "selector_flow",
    llm_provider: Optional[LLMProvider] = None,
    max_hops: int = 1,
)
```

**Parameters**
- `selector`: function that returns the next agent ID.
- `max_hops`: max number of selections to execute.

**Behavior**
- Executes the selected agent each hop using the graph engine.

#### P2PFlow

```python
P2PFlow(
    agents: Iterable[Agent],
    name: str = "p2p_flow",
    llm_provider: Optional[LLMProvider] = None,
    max_rounds: int = 5,
    timeout_seconds: float = 300,
    consensus_threshold: float = 0.6,
    convergence_window: int = 3,
    quality_threshold: float = 0.85,
)
```

**Behavior**
- Executes agents directly (peer-style) with consensus, convergence, timeout,
  and quality thresholds for termination.

---

## Triggers

Triggers emit workflow events for schedules, webhooks, and queues.

```python
from genxai.triggers import WebhookTrigger, ScheduleTrigger
from genxai.core.graph.trigger_runner import TriggerWorkflowRunner

runner = TriggerWorkflowRunner(nodes=nodes, edges=edges)
trigger = WebhookTrigger(trigger_id="support_webhook", secret="my-secret")

async def on_event(event):
    result = await runner.handle_event(event)
    print(result)

trigger.on_event(on_event)
await trigger.start()
```

```python
schedule = ScheduleTrigger(trigger_id="daily_job", cron="0 9 * * *")
schedule.on_event(on_event)
await schedule.start()
```

---

## Connectors

Connectors integrate external systems (Kafka, SQS, Postgres CDC, Webhooks).

```python
from genxai.connectors import WebhookConnector, ConnectorRegistry

connector = WebhookConnector(connector_id="webhook_1", secret="my-secret")

async def handle(event):
    print(event.payload)

connector.on_event(handle)
ConnectorRegistry.register(connector)
await ConnectorRegistry.start_all()
```

---

## Worker Queue Engine

```python
from genxai.core.execution import WorkerQueueEngine

engine = WorkerQueueEngine(worker_count=4)

async def handler(payload: dict):
    print("processing", payload)

await engine.start()
task_id = await engine.enqueue({"workflow_id": "wf_1"}, handler)
await engine.stop()
```

---

## Tools

### Tool Registry + Built-ins

```python
from genxai.tools.registry import ToolRegistry
from genxai.tools.builtin import *  # auto-registers all built-in tools

stats = ToolRegistry.get_stats()
calculator = ToolRegistry.get("calculator")
```

### Export Tool Schema Bundle

```python
from genxai.tools.registry import ToolRegistry

bundle = ToolRegistry.export_schema_bundle()
print(bundle["tool_count"])
print(bundle["schema_version"])
```

### Export Tool Schema Bundle to File

```python
from genxai.tools.registry import ToolRegistry

exported_path = ToolRegistry.export_schema_bundle_to_file("tool_schemas.json")
print(exported_path)
```

### Export Tool Schema Bundle to YAML

```python
from genxai.tools.registry import ToolRegistry

exported_path = ToolRegistry.export_schema_bundle_to_file("tool_schemas.yaml")
print(exported_path)
```

### Schema-Based Tool Calling (OpenAI)

```python
import os
from genxai.core.agent.runtime import AgentRuntime

runtime = AgentRuntime(agent=agent, api_key=os.getenv("OPENAI_API_KEY"))
tools = {tool.metadata.name: tool for tool in ToolRegistry.list_all()}
runtime.set_tools(tools)

result = await runtime.execute(
    task="Use the calculator tool to compute 42 * 7."
)
print(result["output"])
```

### Custom Tool Definition

```python
from genxai.tools.base import Tool, ToolMetadata, ToolParameter, ToolCategory

class MyTool(Tool):
    def __init__(self):
        super().__init__(
            metadata=ToolMetadata(
                name="my_tool",
                description="My custom tool",
                category=ToolCategory.CUSTOM,
            ),
            parameters=[
                ToolParameter(
                    name="query",
                    type="string",
                    description="Query string",
                )
            ],
        )

    async def _execute(self, **kwargs):
        return {"result": kwargs["query"].upper()}

ToolRegistry.register(MyTool())
```

---

## Observability

### Metrics

```python
from genxai.observability.metrics import (
    record_agent_execution,
    record_llm_request,
    record_tool_execution,
)
```

### Tracing

```python
from genxai.observability.tracing import span

with span("genxai.agent.execute", {"agent_id": "researcher"}):
    result = await runtime.execute("...")
```

---

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
```

---

## Error Handling

```python
from genxai.core.agent.runtime import AgentExecutionError

try:
    result = await runtime.execute("...")
except AgentExecutionError as e:
    logger.error(f"Agent failed: {e}")
```

---

## Best Practices

1. **Always use async/await** for I/O operations
2. **Enable caching** for expensive operations
3. **Implement proper error handling**
4. **Secure your API keys** via environment variables
5. **Validate graphs** before execution
6. **Keep tools registered** via `genxai.tools.builtin`
7. **Monitor token usage** for cost control
