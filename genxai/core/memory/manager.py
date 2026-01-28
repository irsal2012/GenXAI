"""Memory system manager coordinating all memory types."""

from typing import Optional
import logging

from genxai.core.memory.base import MemoryConfig
from genxai.core.memory.short_term import ShortTermMemory

logger = logging.getLogger(__name__)


class MemorySystem:
    """Comprehensive memory management system."""

    def __init__(self, agent_id: str, config: Optional[MemoryConfig] = None) -> None:
        """Initialize memory system.

        Args:
            agent_id: ID of the agent this memory belongs to
            config: Memory configuration
        """
        self.agent_id = agent_id
        self.config = config or MemoryConfig()

        # Initialize memory stores
        self.short_term = ShortTermMemory(capacity=self.config.short_term_capacity)

        # Placeholders for other memory types (to be implemented)
        self.long_term: Optional[Any] = None
        self.episodic: Optional[Any] = None
        self.semantic: Optional[Any] = None
        self.procedural: Optional[Any] = None
        self.working: Optional[Any] = None

        logger.info(f"Memory system initialized for agent: {agent_id}")

    async def add_to_short_term(self, content: Any, metadata: Optional[dict] = None) -> None:
        """Add content to short-term memory.

        Args:
            content: Content to store
            metadata: Optional metadata
        """
        await self.short_term.add(content, metadata)

    async def get_context(self, max_tokens: int = 4000) -> str:
        """Get context from short-term memory for LLM.

        Args:
            max_tokens: Maximum tokens to include

        Returns:
            Formatted context string
        """
        return await self.short_term.get_context(max_tokens)

    async def clear_short_term(self) -> None:
        """Clear short-term memory."""
        await self.short_term.clear()

    def get_stats(self) -> dict:
        """Get memory system statistics.

        Returns:
            Statistics dictionary
        """
        stats = {
            "agent_id": self.agent_id,
            "short_term": self.short_term.get_stats(),
        }

        # Add stats for other memory types when implemented
        if self.long_term:
            stats["long_term"] = {}  # Placeholder

        return stats

    def __repr__(self) -> str:
        """String representation."""
        return f"MemorySystem(agent_id={self.agent_id}, short_term={len(self.short_term.memories)})"
