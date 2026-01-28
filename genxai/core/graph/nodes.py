"""Node types and implementations for graph-based orchestration."""

from enum import Enum
from typing import Any, Dict, Optional, Protocol
from pydantic import BaseModel, Field


class NodeType(str, Enum):
    """Types of nodes in the graph."""

    AGENT = "agent"
    TOOL = "tool"
    CONDITION = "condition"
    SUBGRAPH = "subgraph"
    HUMAN = "human"
    INPUT = "input"
    OUTPUT = "output"


class NodeConfig(BaseModel):
    """Configuration for a node."""

    type: NodeType
    data: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class NodeStatus(str, Enum):
    """Execution status of a node."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class Node(BaseModel):
    """Base node in the execution graph."""

    id: str
    type: NodeType
    config: NodeConfig
    status: NodeStatus = NodeStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None

    class Config:
        """Pydantic configuration."""

        arbitrary_types_allowed = True

    def __repr__(self) -> str:
        """String representation of the node."""
        return f"Node(id={self.id}, type={self.type}, status={self.status})"

    def __hash__(self) -> int:
        """Hash function for node."""
        return hash(self.id)


class NodeExecutor(Protocol):
    """Protocol for node execution."""

    async def execute(self, node: Node, context: Dict[str, Any]) -> Any:
        """Execute the node with given context."""
        ...


class AgentNode(Node):
    """Node that executes an agent."""

    def __init__(self, id: str, agent_id: str, **kwargs: Any) -> None:
        """Initialize agent node."""
        super().__init__(
            id=id,
            type=NodeType.AGENT,
            config=NodeConfig(type=NodeType.AGENT, data={"agent_id": agent_id}),
            **kwargs,
        )


class ToolNode(Node):
    """Node that executes a tool."""

    def __init__(self, id: str, tool_name: str, **kwargs: Any) -> None:
        """Initialize tool node."""
        super().__init__(
            id=id,
            type=NodeType.TOOL,
            config=NodeConfig(type=NodeType.TOOL, data={"tool_name": tool_name}),
            **kwargs,
        )


class ConditionNode(Node):
    """Node that evaluates a condition."""

    def __init__(self, id: str, condition: str, **kwargs: Any) -> None:
        """Initialize condition node."""
        super().__init__(
            id=id,
            type=NodeType.CONDITION,
            config=NodeConfig(type=NodeType.CONDITION, data={"condition": condition}),
            **kwargs,
        )


class InputNode(Node):
    """Node that receives input."""

    def __init__(self, id: str = "input", **kwargs: Any) -> None:
        """Initialize input node."""
        super().__init__(
            id=id, type=NodeType.INPUT, config=NodeConfig(type=NodeType.INPUT), **kwargs
        )


class OutputNode(Node):
    """Node that produces output."""

    def __init__(self, id: str = "output", **kwargs: Any) -> None:
        """Initialize output node."""
        super().__init__(
            id=id, type=NodeType.OUTPUT, config=NodeConfig(type=NodeType.OUTPUT), **kwargs
        )
