"""Example usage of AuctionFlow."""

import asyncio

from genxai import AgentFactory, AuctionFlow


async def main() -> None:
    agents = [
        AgentFactory.create_agent(id="bidder1", role="Bidder", goal="Bid"),
        AgentFactory.create_agent(id="bidder2", role="Bidder", goal="Bid"),
    ]

    flow = AuctionFlow(agents)
    result = await flow.run({"task": "Handle request"})
    print("Auction winner:", result.get("winner_id"))


if __name__ == "__main__":
    asyncio.run(main())