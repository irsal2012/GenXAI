"""Agent API endpoints."""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel

router = APIRouter()

# In-memory storage
agents_db: Dict[str, Dict[str, Any]] = {}


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
    return [AgentResponse(id=agent_id, **agent) for agent_id, agent in agents_db.items()]


@router.post("/")
async def create_agent(agent: AgentCreate) -> AgentResponse:
    """Create a new agent."""
    agent_id = f"agent_{len(agents_db) + 1}"
    agent_data = agent.dict()
    agents_db[agent_id] = agent_data

    return AgentResponse(id=agent_id, **agent_data)


@router.get("/{agent_id}")
async def get_agent(agent_id: str) -> AgentResponse:
    """Get a specific agent."""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")

    return AgentResponse(id=agent_id, **agents_db[agent_id])


@router.put("/{agent_id}")
async def update_agent(agent_id: str, agent: AgentCreate) -> AgentResponse:
    """Update an agent."""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")

    agents_db[agent_id] = agent.dict()
    return AgentResponse(id=agent_id, **agents_db[agent_id])


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str) -> Dict[str, str]:
    """Delete an agent."""
    if agent_id not in agents_db:
        raise HTTPException(status_code=404, detail="Agent not found")

    del agents_db[agent_id]
    return {"message": "Agent deleted successfully"}
