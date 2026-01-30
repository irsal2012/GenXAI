"""Tests for workflow checkpoint save/load and resume."""

from __future__ import annotations

import pytest

from genxai.core.graph.engine import Graph
from genxai.core.graph.nodes import InputNode, OutputNode, AgentNode
from genxai.core.graph.edges import Edge
from genxai.core.graph.nodes import NodeStatus


@pytest.mark.asyncio
async def test_checkpoint_round_trip_and_resume(tmp_path) -> None:
    graph = Graph(name="checkpoint_demo")
    graph.add_node(InputNode())
    graph.add_node(AgentNode(id="step", agent_id="step"))
    graph.add_node(OutputNode())
    graph.add_edge(Edge(source="input", target="step"))
    graph.add_edge(Edge(source="step", target="output"))

    state = await graph.run(input_data={"payload": 1})

    # Persist checkpoint
    checkpoint_path = graph.save_checkpoint("first", state, tmp_path)
    assert checkpoint_path.exists()

    # Reset node status to simulate a fresh run
    for node in graph.nodes.values():
        node.status = NodeStatus.PENDING

    checkpoint = graph.load_checkpoint("first", tmp_path)
    resumed_state = await graph.run(input_data={"payload": 2}, resume_from=checkpoint)

    assert resumed_state["input"]["payload"] == 2
    assert "step" in resumed_state