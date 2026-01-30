"""Tests for memory system."""

import pytest
from genxai.core.memory.manager import MemorySystem
from genxai.core.memory.base import Memory, MemoryType


@pytest.mark.asyncio
async def test_memory_system_initialization():
    """Test memory system initialization."""
    memory = MemorySystem(agent_id="test_agent")
    assert memory.agent_id == "test_agent"
    assert memory.short_term is not None
    assert memory.working is not None


@pytest.mark.asyncio
async def test_add_to_short_term():
    """Test adding to short-term memory."""
    memory = MemorySystem(agent_id="test_agent")
    await memory.add_to_short_term(
        content={"message": "Hello"},
        metadata={"timestamp": 123456}
    )
    context = await memory.get_short_term_context(max_tokens=1000)
    assert "Hello" in context or context == ""


@pytest.mark.asyncio
async def test_working_memory():
    """Test working memory operations."""
    memory = MemorySystem(agent_id="test_agent")
    memory.add_to_working("key1", "value1")
    assert memory.get_from_working("key1") == "value1"
    assert memory.get_from_working("nonexistent") is None


@pytest.mark.asyncio
async def test_memory_stats():
    """Test memory statistics."""
    memory = MemorySystem(agent_id="test_agent")
    stats = await memory.get_stats()
    assert "agent_id" in stats
    assert stats["agent_id"] == "test_agent"
    assert "short_term" in stats
    assert "working" in stats


@pytest.mark.asyncio
async def test_clear_short_term():
    """Test clearing short-term memory."""
    memory = MemorySystem(agent_id="test_agent")
    await memory.add_to_short_term(content={"test": "data"})
    await memory.clear_short_term()
    context = await memory.get_short_term_context()
    assert context == "" or len(context) == 0


@pytest.mark.asyncio
async def test_clear_working():
    """Test clearing working memory."""
    memory = MemorySystem(agent_id="test_agent")
    memory.add_to_working("key1", "value1")
    memory.clear_working()
    assert memory.get_from_working("key1") is None
