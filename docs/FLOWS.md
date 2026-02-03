# Flow Orchestrators

Flow orchestrators are lightweight wrappers that build and execute
graph workflows for common coordination patterns. They expose a
simple API without introducing new engine abstractions.

## Available Flows

### `RoundRobinFlow`
Executes agents in a fixed order (A → B → C → ...).

```python
from genxai import AgentFactory, RoundRobinFlow

agents = [
    AgentFactory.create_agent(id="analyst", role="Analyst", goal="Analyze"),
    AgentFactory.create_agent(id="writer", role="Writer", goal="Write"),
]

flow = RoundRobinFlow(agents)
result_state = await flow.run({"topic": "market trends"})
```

### `SelectorFlow`
Chooses the next agent dynamically using a selector callback.

```python
from genxai import AgentFactory, SelectorFlow

def choose_next(state, agent_ids):
    return agent_ids[state.get("selector_hop", 0) % len(agent_ids)]

agents = [
    AgentFactory.create_agent(id="planner", role="Planner", goal="Plan"),
    AgentFactory.create_agent(id="builder", role="Builder", goal="Build"),
]

flow = SelectorFlow(agents, selector=choose_next, max_hops=3)
result_state = await flow.run({"goal": "Launch"})
```

### `P2PFlow`
Runs a peer-to-peer loop with lightweight consensus stopping.

```python
from genxai import AgentFactory, P2PFlow

agents = [
    AgentFactory.create_agent(id="a1", role="Analyst", goal="Contribute"),
    AgentFactory.create_agent(id="a2", role="Reviewer", goal="Review"),
]

flow = P2PFlow(
    agents,
    max_rounds=4,
    consensus_threshold=0.75,
    convergence_window=2,
    quality_threshold=0.8,
)
result_state = await flow.run({"topic": "Architecture"})
```

## Notes
- These flows register agents in `AgentRegistry` automatically.
- `SelectorFlow` uses a callback to pick the next agent each hop.
- `P2PFlow` executes agents directly to allow decentralized patterns.
- P2P termination checks include consensus, convergence, timeout, and quality thresholds.