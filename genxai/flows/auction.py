"""Auction flow orchestrator."""

from typing import Any, Dict, List, Optional

from genxai.core.agent.runtime import AgentRuntime
from genxai.flows.base import FlowOrchestrator


class AuctionFlow(FlowOrchestrator):
    """Agents bid to handle a task; highest bid executes."""

    def __init__(
        self,
        agents: List[Any],
        name: str = "auction_flow",
        llm_provider: Any = None,
    ) -> None:
        super().__init__(agents=agents, name=name, llm_provider=llm_provider)

    async def run(
        self,
        input_data: Any,
        state: Optional[Dict[str, Any]] = None,
        max_iterations: int = 100,
    ) -> Dict[str, Any]:
        if state is None:
            state = {}
        state["input"] = input_data
        state.setdefault("bids", {})

        runtimes = {
            agent.id: AgentRuntime(agent=agent, llm_provider=self.llm_provider)
            for agent in self.agents
        }

        for agent in self.agents:
            bid_result = await runtimes[agent.id].execute(
                task=state.get("bid_task", "Provide a numeric bid between 0 and 1"),
                context=state,
            )
            try:
                bid_value = float(bid_result.get("output", 0))
            except (TypeError, ValueError):
                bid_value = 0.0
            state["bids"][agent.id] = bid_value

        winner_id = max(state["bids"], key=state["bids"].get)
        winner_runtime = runtimes[winner_id]
        execution = await winner_runtime.execute(
            task=state.get("task", "Execute the task"),
            context={**state, "winner_id": winner_id},
        )
        state["winner_id"] = winner_id
        state["winner_result"] = execution
        return state