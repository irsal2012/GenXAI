"""Example usage of MapReduceFlow."""

import asyncio

from genxai import AgentFactory, MapReduceFlow


async def main() -> None:
    agents = [
        AgentFactory.create_agent(id="mapper1", role="Mapper", goal="Process"),
        AgentFactory.create_agent(id="mapper2", role="Mapper", goal="Process"),
        AgentFactory.create_agent(id="reducer", role="Reducer", goal="Summarize"),
    ]

    flow = MapReduceFlow(agents)
    result = await flow.run({"data": "sharded input"})
    print("Reduce result:", result.get("reduce_result"))


if __name__ == "__main__":
    asyncio.run(main())