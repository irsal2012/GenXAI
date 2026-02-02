"""Workflow API endpoints."""

from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from typing import List, Dict, Any
from pydantic import BaseModel
import uuid

try:
    # When running from within `studio/backend/`
    from services.db import execute, fetch_all, fetch_one, json_dumps, json_loads
except ModuleNotFoundError:
    # When running from repo root as `studio.backend.*`
    from studio.backend.services.db import (
        execute,
        fetch_all,
        fetch_one,
        json_dumps,
        json_loads,
    )

router = APIRouter()
executions_router = APIRouter()
templates_router = APIRouter()


class WorkflowCreate(BaseModel):
    """Workflow creation request."""

    name: str
    description: str = ""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    metadata: Dict[str, Any] = {}


class WorkflowResponse(BaseModel):
    """Workflow response."""

    id: str
    name: str
    description: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    metadata: Dict[str, Any]


class WorkflowExportResponse(BaseModel):
    """Workflow export response."""

    success: bool
    workflow_id: str
    export_path: str


class WorkflowDownloadResponse(BaseModel):
    """Workflow download response."""

    success: bool
    workflow_id: str
    download_path: str


class TemplateCreate(BaseModel):
    """Workflow template creation request."""

    name: str
    description: str = ""
    category: str = "General"
    difficulty: str = "intermediate"
    tags: List[str] = []
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    metadata: Dict[str, Any] = {}


class TemplateResponse(BaseModel):
    """Workflow template response."""

    id: str
    name: str
    description: str
    category: str
    difficulty: str
    tags: List[str]
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    created_at: str
    updated_at: str


@router.get("/")
async def list_workflows() -> List[WorkflowResponse]:
    """List all workflows."""
    workflows = fetch_all("SELECT * FROM workflows")
    return [
        WorkflowResponse(
            id=workflow["id"],
            name=workflow["name"],
            description=workflow["description"],
            nodes=json_loads(workflow["nodes"], []),
            edges=json_loads(workflow["edges"], []),
            metadata=json_loads(workflow["metadata"], {}),
        )
        for workflow in workflows
    ]


@router.post("/")
async def create_workflow(workflow: WorkflowCreate) -> WorkflowResponse:
    """Create a new workflow."""
    workflow_id = f"wf_{uuid.uuid4().hex[:8]}"
    workflow_data = workflow.dict()
    execute(
        """
        INSERT INTO workflows (id, name, description, nodes, edges, metadata)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            workflow_id,
            workflow_data["name"],
            workflow_data.get("description", ""),
            json_dumps(workflow_data.get("nodes", [])),
            json_dumps(workflow_data.get("edges", [])),
            json_dumps(workflow_data.get("metadata", {})),
        ),
    )

    return WorkflowResponse(id=workflow_id, **workflow_data)


@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str) -> WorkflowResponse:
    """Get a specific workflow."""
    workflow = fetch_one("SELECT * FROM workflows WHERE id = ?", (workflow_id,))
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowResponse(
        id=workflow["id"],
        name=workflow["name"],
        description=workflow["description"],
        nodes=json_loads(workflow["nodes"], []),
        edges=json_loads(workflow["edges"], []),
        metadata=json_loads(workflow["metadata"], {}),
    )


@router.put("/{workflow_id}")
async def update_workflow(workflow_id: str, workflow: WorkflowCreate) -> WorkflowResponse:
    """Update a workflow."""
    existing = fetch_one("SELECT id FROM workflows WHERE id = ?", (workflow_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow_data = workflow.dict()
    execute(
        """
        UPDATE workflows
        SET name = ?, description = ?, nodes = ?, edges = ?, metadata = ?
        WHERE id = ?
        """,
        (
            workflow_data["name"],
            workflow_data.get("description", ""),
            json_dumps(workflow_data.get("nodes", [])),
            json_dumps(workflow_data.get("edges", [])),
            json_dumps(workflow_data.get("metadata", {})),
            workflow_id,
        ),
    )
    return WorkflowResponse(id=workflow_id, **workflow_data)


@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str) -> Dict[str, str]:
    """Delete a workflow."""
    existing = fetch_one("SELECT id FROM workflows WHERE id = ?", (workflow_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Workflow not found")
    execute("DELETE FROM workflows WHERE id = ?", (workflow_id,))
    return {"message": "Workflow deleted successfully"}


@router.post("/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: str, 
    input_data: Dict[str, Any],
    request: Request
) -> Dict[str, Any]:
    """Execute a workflow with user's API keys."""
    # Get workflow from database
    workflow_data = fetch_one("SELECT * FROM workflows WHERE id = ?", (workflow_id,))
    if not workflow_data:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # Extract API keys from request state (set by middleware)
    openai_api_key = getattr(request.state, 'openai_api_key', None)
    anthropic_api_key = getattr(request.state, 'anthropic_api_key', None)

    execution_id = f"exec_{uuid.uuid4().hex[:8]}"
    started_at = datetime.utcnow().isoformat()
    
    # Parse workflow nodes and edges
    nodes = json_loads(workflow_data["nodes"], [])
    edges = json_loads(workflow_data["edges"], [])
    
    # Execute workflow using GenXAI engine
    try:
        # Support running backend in both modes:
        # 1) from inside `studio/backend/` (e.g. `uvicorn main:app --reload`)
        # 2) from repo root as module (e.g. `uvicorn studio.backend.main:app --reload`)
        try:
            # When running from within `studio/backend/`
            from services.workflow_executor import execute_studio_workflow
        except ModuleNotFoundError:
            # When running from repo root as `studio.backend.*`
            from studio.backend.services.workflow_executor import execute_studio_workflow
        
        execution_result = await execute_studio_workflow(
            nodes=nodes,
            edges=edges,
            input_data=input_data,
            openai_api_key=openai_api_key,
            anthropic_api_key=anthropic_api_key
        )
        
        status = execution_result.get("status", "completed")
        logs = [execution_result.get("message", "Execution completed")]
        
        if status == "error":
            logs.append(f"Error: {execution_result.get('error', 'Unknown error')}")
        
    except Exception as e:
        status = "failed"
        execution_result = {
            "status": "error",
            "error": str(e),
            "message": f"Execution failed: {str(e)}"
        }
        logs = [f"Execution failed: {str(e)}"]

    # Save execution to database
    execute(
        """
        INSERT INTO executions (id, workflow_id, status, logs, result, started_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            execution_id,
            workflow_id,
            status,
            json_dumps(logs),
            json_dumps(execution_result),
            started_at,
            datetime.utcnow().isoformat(),
        ),
    )

    return {
        "id": execution_id,
        "workflow_id": workflow_id,
        "status": status,
        "logs": logs,
        "result": execution_result,
        "node_events": execution_result.get("node_events", []),
        "node_results": execution_result.get("node_results", {}),
        "started_at": started_at,
        "completed_at": datetime.utcnow().isoformat(),
    }


@router.post("/{workflow_id}/export-code")
async def export_workflow_code_endpoint(workflow_id: str) -> WorkflowExportResponse:
    """Export a workflow into runnable code artifacts."""
    try:
        try:
            from services.export_service import export_workflow_code
        except ModuleNotFoundError:
            from studio.backend.services.export_service import export_workflow_code

        result = export_workflow_code(workflow_id)
        return WorkflowExportResponse(
            success=True,
            workflow_id=workflow_id,
            export_path=str(result.export_path),
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Export failed: {exc}") from exc


@router.get("/{workflow_id}/download-code")
async def download_workflow_code(workflow_id: str) -> FileResponse:
    """Download a workflow export bundle as a zip."""
    try:
        try:
            from services.export_service import export_workflow_zip
        except ModuleNotFoundError:
            from studio.backend.services.export_service import export_workflow_zip

        result = export_workflow_zip(workflow_id)
        return FileResponse(
            path=str(result.export_path),
            filename=f"{workflow_id}.zip",
            media_type="application/zip",
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Download failed: {exc}") from exc


@executions_router.get("/{execution_id}")
async def get_execution(execution_id: str) -> Dict[str, Any]:
    """Get execution details."""
    execution = fetch_one("SELECT * FROM executions WHERE id = ?", (execution_id,))
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    result_payload = json_loads(execution["result"], {})
    return {
        "id": execution["id"],
        "workflow_id": execution["workflow_id"],
        "status": execution["status"],
        "logs": json_loads(execution["logs"], []),
        "result": result_payload,
        "node_events": result_payload.get("node_events", []),
        "node_results": result_payload.get("node_results", {}),
        "started_at": execution["started_at"],
        "completed_at": execution["completed_at"],
    }


@executions_router.get("/")
async def list_executions() -> List[Dict[str, Any]]:
    """List workflow executions."""
    executions = fetch_all("SELECT * FROM executions ORDER BY started_at DESC")
    response: List[Dict[str, Any]] = []
    for execution in executions:
        result_payload = json_loads(execution["result"], {})
        response.append(
            {
                "id": execution["id"],
                "workflow_id": execution["workflow_id"],
                "status": execution["status"],
                "logs": json_loads(execution["logs"], []),
                "result": result_payload,
                "node_events": result_payload.get("node_events", []),
                "node_results": result_payload.get("node_results", {}),
                "started_at": execution["started_at"],
                "completed_at": execution["completed_at"],
            }
        )
    return response


@templates_router.get("/")
async def list_templates() -> List[TemplateResponse]:
    """List workflow templates."""
    templates = fetch_all("SELECT * FROM workflow_templates ORDER BY created_at DESC")
    return [
        TemplateResponse(
            id=template["id"],
            name=template["name"],
            description=template["description"],
            category=template["category"],
            difficulty=template["difficulty"],
            tags=json_loads(template["tags"], []),
            nodes=json_loads(template["nodes"], []),
            edges=json_loads(template["edges"], []),
            metadata=json_loads(template["metadata"], {}),
            created_at=template["created_at"],
            updated_at=template["updated_at"],
        )
        for template in templates
    ]


@templates_router.post("/")
async def create_template(template: TemplateCreate) -> TemplateResponse:
    """Create a new workflow template."""
    template_id = f"tpl_{uuid.uuid4().hex[:8]}"
    timestamp = datetime.utcnow().isoformat()
    template_data = template.dict()
    execute(
        """
        INSERT INTO workflow_templates (id, name, description, category, difficulty, tags, nodes, edges, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            template_id,
            template_data["name"],
            template_data.get("description", ""),
            template_data.get("category", "General"),
            template_data.get("difficulty", "intermediate"),
            json_dumps(template_data.get("tags", [])),
            json_dumps(template_data.get("nodes", [])),
            json_dumps(template_data.get("edges", [])),
            json_dumps(template_data.get("metadata", {})),
            timestamp,
            timestamp,
        ),
    )

    return TemplateResponse(
        id=template_id,
        created_at=timestamp,
        updated_at=timestamp,
        **template_data,
    )


@templates_router.put("/{template_id}")
async def update_template(template_id: str, template: TemplateCreate) -> TemplateResponse:
    """Update an existing workflow template."""
    existing = fetch_one("SELECT * FROM workflow_templates WHERE id = ?", (template_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Template not found")

    template_data = template.dict()
    timestamp = datetime.utcnow().isoformat()
    execute(
        """
        UPDATE workflow_templates
        SET name = ?, description = ?, category = ?, difficulty = ?, tags = ?, nodes = ?, edges = ?, metadata = ?, updated_at = ?
        WHERE id = ?
        """,
        (
            template_data["name"],
            template_data.get("description", ""),
            template_data.get("category", "General"),
            template_data.get("difficulty", "intermediate"),
            json_dumps(template_data.get("tags", [])),
            json_dumps(template_data.get("nodes", [])),
            json_dumps(template_data.get("edges", [])),
            json_dumps(template_data.get("metadata", {})),
            timestamp,
            template_id,
        ),
    )

    return TemplateResponse(
        id=template_id,
        created_at=existing["created_at"],
        updated_at=timestamp,
        **template_data,
    )


@templates_router.delete("/{template_id}")
async def delete_template(template_id: str) -> Dict[str, str]:
    """Delete a workflow template."""
    existing = fetch_one("SELECT id FROM workflow_templates WHERE id = ?", (template_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Template not found")
    execute("DELETE FROM workflow_templates WHERE id = ?", (template_id,))
    return {"message": "Template deleted successfully"}
