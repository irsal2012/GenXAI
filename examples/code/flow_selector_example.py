"""Example usage of SelectorFlow."""

import asyncio

from genxai import AgentFactory, SelectorFlow


def choose_next(state, agent_ids):
    return agent_ids[state.get("selector_hop", 0) % len(agent_ids)]


async def main() -> None:
    agents = [
        AgentFactory.create_agent(id="planner", role="Planner", goal="Plan"),
        AgentFactory.create_agent(id="builder", role="Builder", goal="Build"),
    ]

    flow = SelectorFlow(agents, selector=choose_next, max_hops=4)
    result = await flow.run({"goal": "Ship v1"})
    print("SelectorFlow hops:", result.get("selector_hop"))


if __name__ == "__main__":
    asyncio.run(main())