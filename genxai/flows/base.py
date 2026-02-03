"""Base orchestrator for composable flow patterns."""

from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional
from abc import ABC, abstractmethod

from genxai.core.agent.base import Agent
from genxai.core.agent.registry import AgentRegistry
from genxai.core.graph.engine import Graph
from genxai.core.graph.nodes import AgentNode


class FlowOrchestrator(ABC):
    """Base class for flow orchestrators.

    A flow orchestrator converts a list of agents into a Graph
    and executes it using the existing graph engine.
    """

    def __init__(
        self,
        agents: Iterable[Agent],
        name: str = "flow",
        llm_provider: Any = None,
        allow_empty_agents: bool = False,
    ) -> None:
        self.agents = list(agents)
        if not self.agents and not allow_empty_agents:
            raise ValueError("FlowOrchestrator requires at least one agent")

        self.name = name
        self.llm_provider = llm_provider

        for agent in self.agents:
            AgentRegistry.register(agent)

    @abstractmethod
    def build_graph(self) -> Graph:
        """Construct a Graph for this flow pattern."""

    async def run(
        self,
        input_data: Any,
        state: Optional[Dict[str, Any]] = None,
        max_iterations: int = 100,
    ) -> Dict[str, Any]:
        """Execute the flow graph with the provided input."""
        graph = self.build_graph()
        return await graph.run(
            input_data=input_data,
            max_iterations=max_iterations,
            state=state,
            llm_provider=self.llm_provider,
        )

    def _agent_nodes(self) -> List[AgentNode]:
        """Create AgentNode instances for each registered agent."""
        return [AgentNode(id=agent.id, agent_id=agent.id) for agent in self.agents]