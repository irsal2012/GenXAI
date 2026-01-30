"""YAML import/export utilities for agent configuration."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Iterable, List
import yaml

from genxai.core.agent.base import Agent, AgentConfig


def agent_config_to_dict(config: AgentConfig) -> Dict[str, Any]:
    """Serialize AgentConfig to a dictionary."""
    return config.model_dump(mode="json")


def agent_config_from_dict(data: Dict[str, Any]) -> AgentConfig:
    """Load AgentConfig from a dictionary."""
    return AgentConfig(**data)


def agent_to_dict(agent: Agent) -> Dict[str, Any]:
    """Serialize Agent to a dictionary."""
    return {"id": agent.id, "config": agent_config_to_dict(agent.config)}


def agent_from_dict(data: Dict[str, Any]) -> Agent:
    """Load Agent from a dictionary."""
    return Agent(id=data["id"], config=agent_config_from_dict(data["config"]))


def export_agent_config_yaml(agent: Agent, path: Path) -> None:
    """Export an agent configuration to a YAML file."""
    payload = agent_to_dict(agent)
    path.write_text(yaml.safe_dump(payload, sort_keys=False))


def import_agent_config_yaml(path: Path) -> Agent:
    """Import an agent configuration from a YAML file."""
    data = yaml.safe_load(path.read_text())
    if not isinstance(data, dict):
        raise ValueError("Invalid YAML format for agent config")
    return agent_from_dict(data)


def export_agents_yaml(agents: Iterable[Agent], path: Path) -> None:
    """Export a list of agents to YAML."""
    payload = {"agents": [agent_to_dict(agent) for agent in agents]}
    path.write_text(yaml.safe_dump(payload, sort_keys=False))


def import_agents_yaml(path: Path) -> List[Agent]:
    """Import a list of agents from YAML."""
    data = yaml.safe_load(path.read_text())
    if not isinstance(data, dict) or "agents" not in data:
        raise ValueError("Invalid YAML format for agents list")
    if not isinstance(data["agents"], list):
        raise ValueError("Invalid YAML format for agents list")
    return [agent_from_dict(item) for item in data["agents"]]