"""Workflow API endpoints."""

from datetime import datetime
from fastapi import APIRouter, HTTPException
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
async def execute_workflow(workflow_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a workflow."""
    workflow = fetch_one("SELECT id FROM workflows WHERE id = ?", (workflow_id,))
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    execution_id = f"exec_{uuid.uuid4().hex[:8]}"
    started_at = datetime.utcnow().isoformat()
    result = {"message": "Workflow execution placeholder", "input": input_data}

    execute(
        """
        INSERT INTO executions (id, workflow_id, status, logs, result, started_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            execution_id,
            workflow_id,
            "completed",
            json_dumps(["Execution completed"]),
            json_dumps(result),
            started_at,
            datetime.utcnow().isoformat(),
        ),
    )

    return {
        "id": execution_id,
        "workflow_id": workflow_id,
        "status": "completed",
        "logs": ["Execution completed"],
        "result": result,
        "started_at": started_at,
        "completed_at": datetime.utcnow().isoformat(),
    }


@executions_router.get("/{execution_id}")
async def get_execution(execution_id: str) -> Dict[str, Any]:
    """Get execution details."""
    execution = fetch_one("SELECT * FROM executions WHERE id = ?", (execution_id,))
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    return {
        "id": execution["id"],
        "workflow_id": execution["workflow_id"],
        "status": execution["status"],
        "logs": json_loads(execution["logs"], []),
        "result": json_loads(execution["result"], {}),
        "started_at": execution["started_at"],
        "completed_at": execution["completed_at"],
    }
