"""Example usage of LoopFlow."""

import asyncio

from genxai import AgentFactory, LoopFlow


async def main() -> None:
    agents = [AgentFactory.create_agent(id="loop_agent", role="Loop", goal="Iterate")]

    flow = LoopFlow(agents, condition_key="done", max_iterations=3)
    result = await flow.run({"done": False})
    print("LoopFlow state keys:", list(result.keys()))


if __name__ == "__main__":
    asyncio.run(main())