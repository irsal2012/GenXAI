"""Workflow execution service for GenXAI Studio.

This module provides a thin wrapper around the core GenXAI workflow executor
for Studio-specific concerns like database integration and API key handling.
"""

from typing import Any, Dict, List, Optional

# Import from core library
from genxai.core.graph.executor import execute_workflow_sync


def execute_studio_workflow(
    nodes: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
    input_data: Dict[str, Any],
    openai_api_key: Optional[str] = None,
    anthropic_api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """Execute a workflow using the core GenXAI executor.
    
    This is a thin wrapper that Studio uses to execute workflows.
    It delegates to the core library's execute_workflow_sync function.
    
    Args:
        nodes: Workflow nodes
        edges: Workflow edges
        input_data: Input data
        openai_api_key: OpenAI API key from user
        anthropic_api_key: Anthropic API key from user
    
    Returns:
        Execution result from core executor
    """
    return execute_workflow_sync(
        nodes=nodes,
        edges=edges,
        input_data=input_data,
        openai_api_key=openai_api_key,
        anthropic_api_key=anthropic_api_key,
    )
