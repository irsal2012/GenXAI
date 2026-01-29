"""Agent API endpoints."""

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
async def create_agent(agent: AgentCreate) -> AgentResponse:
    """Create a new agent."""
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
