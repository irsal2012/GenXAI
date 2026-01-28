"""Tool API endpoints."""

from fastapi import APIRouter
from typing import List, Dict, Any

from genxai.tools.registry import ToolRegistry

router = APIRouter()


@router.get("/")
async def list_tools() -> List[Dict[str, Any]]:
    """List all available tools."""
    tools = ToolRegistry.list_all()
    return [
        {
            "name": tool.metadata.name,
            "description": tool.metadata.description,
            "category": tool.metadata.category.value,
            "tags": tool.metadata.tags,
            "schema": tool.get_schema(),
        }
        for tool in tools
    ]


@router.get("/categories")
async def list_categories() -> List[str]:
    """List all tool categories."""
    categories = ToolRegistry.list_categories()
    return [cat.value for cat in categories]


@router.get("/search")
async def search_tools(query: str, category: str = None) -> List[Dict[str, Any]]:
    """Search tools by query and category."""
    from genxai.tools.base import ToolCategory

    cat = ToolCategory(category) if category else None
    tools = ToolRegistry.search(query, cat)

    return [
        {
            "name": tool.metadata.name,
            "description": tool.metadata.description,
            "category": tool.metadata.category.value,
            "tags": tool.metadata.tags,
        }
        for tool in tools
    ]


@router.get("/{tool_name}")
async def get_tool(tool_name: str) -> Dict[str, Any]:
    """Get tool details."""
    tool = ToolRegistry.get(tool_name)
    if not tool:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Tool not found")

    return {
        "name": tool.metadata.name,
        "description": tool.metadata.description,
        "category": tool.metadata.category.value,
        "tags": tool.metadata.tags,
        "version": tool.metadata.version,
        "author": tool.metadata.author,
        "schema": tool.get_schema(),
        "metrics": tool.get_metrics(),
    }


@router.get("/stats")
async def get_stats() -> Dict[str, Any]:
    """Get tool registry statistics."""
    return ToolRegistry.get_stats()
