"""Example usage of CriticReviewFlow."""

import asyncio

from genxai import AgentFactory, CriticReviewFlow


async def main() -> None:
    agents = [
        AgentFactory.create_agent(id="writer", role="Writer", goal="Draft"),
        AgentFactory.create_agent(id="critic", role="Critic", goal="Review"),
    ]

    flow = CriticReviewFlow(agents, max_iterations=2)
    result = await flow.run({"topic": "Product launch"})
    print("CriticReviewFlow drafts:", len(result.get("drafts", [])))


if __name__ == "__main__":
    asyncio.run(main())