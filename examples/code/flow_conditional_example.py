"""Example usage of ConditionalFlow."""

import asyncio

from genxai import AgentFactory, ConditionalFlow


def choose_agent(state):
    return "analyst" if state.get("priority") == "high" else "reviewer"


async def main() -> None:
    agents = [
        AgentFactory.create_agent(id="analyst", role="Analyst", goal="Analyze"),
        AgentFactory.create_agent(id="reviewer", role="Reviewer", goal="Review"),
    ]

    flow = ConditionalFlow(agents, condition=choose_agent)
    result = await flow.run({"priority": "high"})
    print("ConditionalFlow nodes:", result.get("node_results", {}).keys())


if __name__ == "__main__":
    asyncio.run(main())