"""Edge types and implementations for graph connections."""

from typing import Any, Callable, Dict, Optional
from pydantic import BaseModel, Field


class Edge(BaseModel):
    """Edge connecting two nodes in the graph."""

    source: str
    target: str
    condition: Optional[Callable[[Dict[str, Any]], bool]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    priority: int = 0  # For ordering multiple edges from same source

    class Config:
        """Pydantic configuration."""

        arbitrary_types_allowed = True

    def __repr__(self) -> str:
        """String representation of the edge."""
        condition_str = "conditional" if self.condition else "unconditional"
        return f"Edge({self.source} -> {self.target}, {condition_str})"

    def __hash__(self) -> int:
        """Hash function for edge."""
        return hash((self.source, self.target))

    def evaluate_condition(self, state: Dict[str, Any]) -> bool:
        """Evaluate the edge condition with given state."""
        if self.condition is None:
            return True
        try:
            return self.condition(state)
        except Exception:
            return False


class ConditionalEdge(Edge):
    """Edge with a condition that must be satisfied."""

    def __init__(
        self,
        source: str,
        target: str,
        condition: Callable[[Dict[str, Any]], bool],
        **kwargs: Any,
    ) -> None:
        """Initialize conditional edge."""
        super().__init__(source=source, target=target, condition=condition, **kwargs)


class ParallelEdge(Edge):
    """Edge that allows parallel execution."""

    def __init__(self, source: str, target: str, **kwargs: Any) -> None:
        """Initialize parallel edge."""
        super().__init__(
            source=source,
            target=target,
            metadata={"parallel": True, **kwargs.get("metadata", {})},
            **{k: v for k, v in kwargs.items() if k != "metadata"},
        )
