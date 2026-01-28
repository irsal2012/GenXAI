"""Short-term memory implementation."""

from collections import deque
from typing import Any, Dict, List, Optional
from datetime import datetime
import logging

from genxai.core.memory.base import Memory, MemoryType

logger = logging.getLogger(__name__)


class ShortTermMemory:
    """Recent conversation context (like human working memory)."""

    def __init__(self, capacity: int = 20) -> None:
        """Initialize short-term memory.

        Args:
            capacity: Maximum number of memories to store
        """
        self.capacity = capacity
        self.memories: deque[Memory] = deque(maxlen=capacity)
        self._total_added = 0

    async def add(
        self, content: Any, metadata: Optional[Dict[str, Any]] = None
    ) -> Memory:
        """Add to short-term memory with automatic eviction.

        Args:
            content: Content to store
            metadata: Optional metadata

        Returns:
            Created memory
        """
        memory = Memory(
            id=f"stm_{self._total_added}",
            type=MemoryType.SHORT_TERM,
            content=content,
            metadata=metadata or {},
            timestamp=datetime.now(),
            importance=self._calculate_importance(content),
            access_count=0,
            last_accessed=datetime.now(),
        )

        self.memories.append(memory)
        self._total_added += 1

        logger.debug(f"Added to short-term memory: {memory.id}")
        return memory

    async def get_recent(self, n: int = 10) -> List[Memory]:
        """Get n most recent memories.

        Args:
            n: Number of memories to retrieve

        Returns:
            List of recent memories
        """
        return list(self.memories)[-n:]

    async def get_context(self, max_tokens: int = 4000) -> str:
        """Get recent context for LLM.

        Args:
            max_tokens: Maximum tokens to include

        Returns:
            Formatted context string
        """
        context = []
        token_count = 0

        for memory in reversed(self.memories):
            memory_text = str(memory.content)
            memory_tokens = len(memory_text.split())

            if token_count + memory_tokens > max_tokens:
                break

            context.insert(0, memory_text)
            token_count += memory_tokens
            memory.access_count += 1
            memory.last_accessed = datetime.now()

        return "\n".join(context)

    async def clear(self) -> None:
        """Clear all short-term memories."""
        self.memories.clear()
        logger.info("Cleared short-term memory")

    async def get_important(self, threshold: float = 0.7) -> List[Memory]:
        """Get memories above importance threshold.

        Args:
            threshold: Importance threshold (0.0 to 1.0)

        Returns:
            List of important memories
        """
        return [m for m in self.memories if m.importance >= threshold]

    def _calculate_importance(self, content: Any) -> float:
        """Calculate importance score (0.0 to 1.0).

        Args:
            content: Memory content

        Returns:
            Importance score
        """
        # Simple heuristic: longer content = more important
        # In practice, use LLM to assess importance
        text = str(content)
        if len(text) > 500:
            return 0.8
        elif len(text) > 200:
            return 0.6
        else:
            return 0.4

    def get_stats(self) -> Dict[str, Any]:
        """Get memory statistics.

        Returns:
            Statistics dictionary
        """
        return {
            "capacity": self.capacity,
            "current_size": len(self.memories),
            "total_added": self._total_added,
            "utilization": len(self.memories) / self.capacity if self.capacity > 0 else 0,
            "avg_importance": (
                sum(m.importance for m in self.memories) / len(self.memories)
                if self.memories
                else 0
            ),
        }

    def __repr__(self) -> str:
        """String representation."""
        return f"ShortTermMemory(size={len(self.memories)}/{self.capacity})"
