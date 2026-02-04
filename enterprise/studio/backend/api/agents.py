"""Agent API endpoints."""

from fastapi import APIRouter, HTTPException, Request
from typing import List, Dict, Any
from pydantic import BaseModel
import hashlib
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


def _normalize_tools(value: Any) -> List[str]:
    """Ensure we always return a List[str] for tools.

    Historical data could contain JSON objects (e.g. '{}') because older versions
    mistakenly serialized empty lists as '{}' in the DB.
    """

    if value is None:
        return []
    if isinstance(value, list):
        return [str(v) for v in value]
    # If we got a dict/object, treat as empty list (invalid for tools).
    return []


def _normalize_metadata(value: Any) -> Dict[str, Any]:
    if value is None:
        return {}
    if isinstance(value, dict):
        return value
    return {}


class AgentCreate(BaseModel):
    """Agent creation request."""

    role: str
    goal: str
    backstory: str = ""
    llm_model: str = "gpt-4"
    tools: List[str] = []
    metadata: Dict[str, Any] = {}


class AgentResponse(BaseModel):
    """Agent response."""

    id: str
    role: str
    goal: str
    backstory: str
    llm_model: str
    tools: List[str]
    metadata: Dict[str, Any]


class AgentSyncResponse(BaseModel):
    """Workflow agent sync response."""

    synced: int
    skipped: int
    created_ids: List[str]


@router.get("/")
async def list_agents() -> List[AgentResponse]:
    """List all agents."""
    agents = fetch_all("SELECT * FROM agents")
    responses: List[AgentResponse] = []
    for agent in agents:
        tools = _normalize_tools(json_loads(agent.get("tools"), []))
        metadata = _normalize_metadata(json_loads(agent.get("metadata"), {}))
        responses.append(
            AgentResponse(
                id=agent["id"],
                role=agent["role"],
                goal=agent["goal"],
                backstory=agent["backstory"],
                llm_model=agent["llm_model"],
                tools=tools,
                metadata=metadata,
            )
        )
    return responses


@router.post("/")
async def create_agent(agent: AgentCreate, request: Request) -> AgentResponse:
    """Create a new agent.
    
    Note: API keys from request.state are available for future agent execution.
    When agents are executed, use:
        openai_api_key = request.state.openai_api_key
        anthropic_api_key = request.state.anthropic_api_key
    """
    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    agent_data = agent.dict()
    execute(
        """
        INSERT INTO agents (id, role, goal, backstory, llm_model, tools, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            agent_id,
            agent_data["role"],
            agent_data["goal"],
            agent_data.get("backstory", ""),
            agent_data.get("llm_model", "gpt-4"),
            json_dumps(agent_data.get("tools", [])),
            json_dumps(agent_data.get("metadata", {})),
        ),
    )

    return AgentResponse(id=agent_id, **agent_data)


@router.post("/sync-from-workflows")
async def sync_agents_from_workflows() -> AgentSyncResponse:
    """Sync agent nodes from workflows into the agents catalog."""
    workflows = fetch_all("SELECT id, nodes FROM workflows")
    existing_agents = fetch_all("SELECT id, role, goal FROM agents")
    existing_keys = {f"{agent['role'].strip()}::{agent['goal'].strip()}" for agent in existing_agents}

    created_ids: List[str] = []
    skipped = 0

    for workflow in workflows:
        workflow_id = workflow["id"]
        nodes = json_loads(workflow.get("nodes"), [])
        for node in nodes:
            if node.get("type") != "agent":
                continue
            config = node.get("config", {})
            role = (config.get("role") or node.get("label") or "").strip()
            goal = (config.get("goal") or "").strip()
            if not role or not goal:
                skipped += 1
                continue
            key = f"{role}::{goal}"
            if key in existing_keys:
                skipped += 1
                continue

            backstory = (config.get("backstory") or "").strip()
            llm_model = (config.get("llm_model") or "gpt-4").strip()
            tools = _normalize_tools(config.get("tools"))
            metadata = _normalize_metadata(config.get("metadata"))
            metadata = {
                **metadata,
                "source": "workflow_sync",
                "workflow_id": workflow_id,
                "node_id": node.get("id"),
            }

            identity = f"{role}|{goal}|{workflow_id}|{node.get('id')}"
            identity_hash = hashlib.sha1(identity.encode("utf-8")).hexdigest()[:8]
            agent_id = f"agent_workflow_{identity_hash}"

            execute(
                """
                INSERT INTO agents (id, role, goal, backstory, llm_model, tools, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    agent_id,
                    role,
                    goal,
                    backstory,
                    llm_model,
                    json_dumps(tools),
                    json_dumps(metadata),
                ),
            )
            created_ids.append(agent_id)
            existing_keys.add(key)

    return AgentSyncResponse(synced=len(created_ids), skipped=skipped, created_ids=created_ids)


@router.get("/{agent_id}")
async def get_agent(agent_id: str) -> AgentResponse:
    """Get a specific agent."""
    agent = fetch_one("SELECT * FROM agents WHERE id = ?", (agent_id,))
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentResponse(
        id=agent["id"],
        role=agent["role"],
        goal=agent["goal"],
        backstory=agent["backstory"],
        llm_model=agent["llm_model"],
        tools=_normalize_tools(json_loads(agent.get("tools"), [])),
        metadata=_normalize_metadata(json_loads(agent.get("metadata"), {})),
    )


@router.put("/{agent_id}")
async def update_agent(agent_id: str, agent: AgentCreate) -> AgentResponse:
    """Update an agent."""
    existing = fetch_one("SELECT id FROM agents WHERE id = ?", (agent_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent_data = agent.dict()
    execute(
        """
        UPDATE agents
        SET role = ?, goal = ?, backstory = ?, llm_model = ?, tools = ?, metadata = ?
        WHERE id = ?
        """,
        (
            agent_data["role"],
            agent_data["goal"],
            agent_data.get("backstory", ""),
            agent_data.get("llm_model", "gpt-4"),
            json_dumps(agent_data.get("tools", [])),
            json_dumps(agent_data.get("metadata", {})),
            agent_id,
        ),
    )
    return AgentResponse(id=agent_id, **agent_data)


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str) -> Dict[str, str]:
    """Delete an agent."""
    existing = fetch_one("SELECT id FROM agents WHERE id = ?", (agent_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Agent not found")
    execute("DELETE FROM agents WHERE id = ?", (agent_id,))
    return {"message": "Agent deleted successfully"}
