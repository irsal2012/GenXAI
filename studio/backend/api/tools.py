"""Tool API endpoints."""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from genxai.tools.registry import ToolRegistry
from genxai.tools.base import Tool, ToolMetadata, ToolParameter, ToolCategory

router = APIRouter()


class ToolParameterInput(BaseModel):
    """Input model for tool parameter."""
    name: str
    type: str
    description: str
    required: bool = True
    default: Optional[Any] = None
    enum: Optional[List[Any]] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    pattern: Optional[str] = None


class ToolCreateInput(BaseModel):
    """Input model for creating a tool."""
    name: str
    description: str
    category: str
    tags: List[str] = []
    version: str = "1.0.0"
    author: str = "GenXAI User"
    parameters: List[ToolParameterInput]
    code: Optional[str] = None  # For code-based tools
    template: Optional[str] = None  # For template-based tools
    template_config: Optional[Dict[str, Any]] = None  # Template configuration


class ToolTemplateInput(BaseModel):
    """Input model for template-based tool creation."""
    name: str
    description: str
    category: str
    tags: List[str] = []
    template: str
    config: Dict[str, Any]


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


@router.get("/stats")
async def get_stats() -> Dict[str, Any]:
    """Get tool registry statistics."""
    return ToolRegistry.get_stats()


@router.get("/{tool_name}")
async def get_tool(tool_name: str) -> Dict[str, Any]:
    """Get tool details."""
    tool = ToolRegistry.get(tool_name)
    if not tool:
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


@router.post("/")
async def create_tool(tool_input: ToolCreateInput) -> Dict[str, Any]:
    """Create a new tool (code-based or template-based)."""
    try:
        # Check if tool already exists
        if ToolRegistry.get(tool_input.name):
            raise HTTPException(
                status_code=400, 
                detail=f"Tool '{tool_input.name}' already exists"
            )

        # Validate category
        try:
            category = ToolCategory(tool_input.category)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category: {tool_input.category}"
            )

        # Create tool based on type
        if tool_input.code:
            # Code-based tool creation
            tool = await _create_code_based_tool(tool_input, category)
        elif tool_input.template:
            # Template-based tool creation
            tool = await _create_template_based_tool(tool_input, category)
        else:
            raise HTTPException(
                status_code=400,
                detail="Either 'code' or 'template' must be provided"
            )

        # Register the tool
        ToolRegistry.register(tool)

        return {
            "success": True,
            "message": f"Tool '{tool_input.name}' created successfully",
            "tool": {
                "name": tool.metadata.name,
                "description": tool.metadata.description,
                "category": tool.metadata.category.value,
                "tags": tool.metadata.tags,
                "schema": tool.get_schema(),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create tool: {str(e)}")


@router.post("/from-template")
async def create_tool_from_template(template_input: ToolTemplateInput) -> Dict[str, Any]:
    """Create a tool from a template."""
    try:
        # Check if tool already exists
        if ToolRegistry.get(template_input.name):
            raise HTTPException(
                status_code=400,
                detail=f"Tool '{template_input.name}' already exists"
            )

        # Validate category
        try:
            category = ToolCategory(template_input.category)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category: {template_input.category}"
            )

        # Create tool from template
        from genxai.tools.templates import create_tool_from_template
        
        tool = create_tool_from_template(
            name=template_input.name,
            description=template_input.description,
            category=category,
            tags=template_input.tags,
            template=template_input.template,
            config=template_input.config
        )

        # Register the tool
        ToolRegistry.register(tool)

        return {
            "success": True,
            "message": f"Tool '{template_input.name}' created from template successfully",
            "tool": {
                "name": tool.metadata.name,
                "description": tool.metadata.description,
                "category": tool.metadata.category.value,
                "tags": tool.metadata.tags,
                "schema": tool.get_schema(),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create tool from template: {str(e)}"
        )


@router.get("/templates/list")
async def list_templates() -> List[Dict[str, Any]]:
    """List available tool templates."""
    from genxai.tools.templates import get_available_templates
    return get_available_templates()


@router.delete("/{tool_name}")
async def delete_tool(tool_name: str) -> Dict[str, Any]:
    """Delete a tool from the registry."""
    tool = ToolRegistry.get(tool_name)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    ToolRegistry.unregister(tool_name)
    
    return {
        "success": True,
        "message": f"Tool '{tool_name}' deleted successfully"
    }


async def _create_code_based_tool(
    tool_input: ToolCreateInput, 
    category: ToolCategory
) -> Tool:
    """Create a tool from Python code."""
    import ast
    import textwrap
    from genxai.tools.dynamic import DynamicTool
    
    # Validate Python code
    try:
        ast.parse(tool_input.code)
    except SyntaxError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid Python code: {str(e)}"
        )
    
    # Create metadata
    metadata = ToolMetadata(
        name=tool_input.name,
        description=tool_input.description,
        category=category,
        tags=tool_input.tags,
        version=tool_input.version,
        author=tool_input.author,
    )
    
    # Create parameters
    parameters = [
        ToolParameter(
            name=p.name,
            type=p.type,
            description=p.description,
            required=p.required,
            default=p.default,
            enum=p.enum,
            min_value=p.min_value,
            max_value=p.max_value,
            pattern=p.pattern,
        )
        for p in tool_input.parameters
    ]
    
    # Create dynamic tool
    tool = DynamicTool(metadata, parameters, tool_input.code)
    
    return tool


async def _create_template_based_tool(
    tool_input: ToolCreateInput,
    category: ToolCategory
) -> Tool:
    """Create a tool from a template."""
    from genxai.tools.templates import create_tool_from_template
    
    tool = create_tool_from_template(
        name=tool_input.name,
        description=tool_input.description,
        category=category,
        tags=tool_input.tags,
        template=tool_input.template,
        config=tool_input.template_config or {}
    )
    
    return tool
