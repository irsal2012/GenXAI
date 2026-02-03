"""Example usage of RoundRobinFlow."""

import asyncio

from genxai import AgentFactory, RoundRobinFlow


async def main() -> None:
    agents = [
        AgentFactory.create_agent(id="analyst", role="Analyst", goal="Analyze"),
        AgentFactory.create_agent(id="writer", role="Writer", goal="Write"),
        AgentFactory.create_agent(id="reviewer", role="Reviewer", goal="Review"),
    ]

    flow = RoundRobinFlow(agents, name="round_robin_demo")
    result = await flow.run({"topic": "AI adoption"})
    print("RoundRobinFlow result keys:", list(result.keys()))


if __name__ == "__main__":
    asyncio.run(main())