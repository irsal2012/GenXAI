"""
GenXAI - Advanced Agentic AI Framework

A powerful framework for building multi-agent AI systems with graph-based orchestration,
advanced memory systems, and enterprise-grade features.
"""

__version__ = "0.1.0"
__author__ = "GenXAI Team"
__license__ = "MIT"

from genxai.core.agent import (
    Agent,
    AgentConfig,
    AgentFactory,
    AgentRegistry,
    AgentRuntime,
    AgentType,
)
from genxai.core.graph import (
    Edge,
    EnhancedGraph,
    Graph,
    Node,
    NodeType,
    WorkflowExecutor,
    execute_workflow_sync,
)
from genxai.core.memory.manager import MemorySystem
from genxai.tools import (
    DynamicTool,
    Tool,
    ToolCategory,
    ToolMetadata,
    ToolParameter,
    ToolRegistry,
    ToolResult,
)

__all__ = [
    "__version__",
    "Agent",
    "AgentConfig",
    "AgentFactory",
    "AgentRegistry",
    "AgentRuntime",
    "AgentType",
    "Graph",
    "EnhancedGraph",
    "WorkflowExecutor",
    "execute_workflow_sync",
    "Node",
    "NodeType",
    "Edge",
    "Tool",
    "ToolCategory",
    "ToolMetadata",
    "ToolParameter",
    "ToolRegistry",
    "ToolResult",
    "DynamicTool",
    "MemorySystem",
]
