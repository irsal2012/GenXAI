"""Export Studio workflows, agents, and tools into runnable code artifacts."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional
import zipfile

import yaml

from studio.backend.services.db import fetch_one, json_loads
from studio.backend.services.tool_service import ToolService
from genxai.core.agent.base import AgentFactory
from genxai.core.agent.config_io import export_agents_yaml

logger = logging.getLogger(__name__)


@dataclass
class ExportResult:
    export_path: Path
    workflow_id: str


def export_workflow_code(
    workflow_id: str,
    output_dir: Optional[Path] = None,
) -> ExportResult:
    """Export a Studio workflow to runnable code artifacts.

    Args:
        workflow_id: Workflow ID stored in the Studio DB.
        output_dir: Optional output directory. Defaults to studio/exports/<workflow_id>.

    Returns:
        ExportResult containing the export path and workflow id.
    """
    workflow_row = fetch_one("SELECT * FROM workflows WHERE id = ?", (workflow_id,))
    if not workflow_row:
        raise ValueError(f"Workflow '{workflow_id}' not found")

    nodes = json_loads(workflow_row.get("nodes"), [])
    edges = json_loads(workflow_row.get("edges"), [])
    metadata = json_loads(workflow_row.get("metadata"), {})

    export_root = output_dir or Path("studio") / "exports" / workflow_id
    export_root.mkdir(parents=True, exist_ok=True)

    tools_dir = export_root / "tools"
    tools_dir.mkdir(parents=True, exist_ok=True)

    _export_tools(tools_dir)
    agents_path = export_root / "agents.yaml"
    _export_agents(agents_path)

    workflow_payload = _build_workflow_yaml_payload(
        workflow_row=workflow_row,
        nodes=nodes,
        edges=edges,
        metadata=metadata,
        agents_ref=agents_path.name,
    )

    workflow_path = export_root / "workflow.yaml"
    workflow_path.write_text(yaml.safe_dump({"workflow": workflow_payload}, sort_keys=False))

    _write_entrypoint(export_root)
    _write_readme(export_root, workflow_id)

    logger.info("Exported workflow '%s' to %s", workflow_id, export_root)
    return ExportResult(export_path=export_root, workflow_id=workflow_id)


def export_workflow_zip(workflow_id: str, output_dir: Optional[Path] = None) -> ExportResult:
    """Export workflow and return a zip archive path."""
    result = export_workflow_code(workflow_id, output_dir=output_dir)
    zip_path = result.export_path.with_suffix('.zip')

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for file_path in result.export_path.rglob("*"):
            if file_path.is_file():
                archive.write(file_path, file_path.relative_to(result.export_path))

    return ExportResult(export_path=zip_path, workflow_id=workflow_id)


def _export_tools(output_dir: Path) -> None:
    tools = ToolService.list_tools()
    for tool in tools:
        if tool.tool_type == "code_based" and tool.code:
            file_path = output_dir / f"{tool.name}.py"
            content = (
                """""
Auto-generated tool: {name}
Description: {description}
Category: {category}
Version: {version}
Author: {author}
"""""
                "\n\n"
                f"# Tool code\n{tool.code}\n"
            ).format(
                name=tool.name,
                description=tool.description,
                category=tool.category,
                version=tool.version,
                author=tool.author,
            )
            file_path.write_text(content)
        else:
            file_path = output_dir / f"{tool.name}.json"
            payload = {
                "name": tool.name,
                "description": tool.description,
                "category": tool.category,
                "tags": tool.tags,
                "version": tool.version,
                "author": tool.author,
                "tool_type": tool.tool_type,
                "template_name": tool.template_name,
                "template_config": tool.template_config,
                "parameters": tool.parameters,
            }
            file_path.write_text(json.dumps(payload, indent=2))


def _export_agents(output_path: Path) -> None:
    agents = []
    rows = _fetch_all_agents()
    for row in rows:
        tools = json_loads(row.get("tools"), [])
        metadata = json_loads(row.get("metadata"), {})
        agent = AgentFactory.create_agent(
            id=row["id"],
            role=row["role"],
            goal=row["goal"],
            backstory=row.get("backstory") or "",
            llm_model=row.get("llm_model") or "gpt-4",
            tools=tools,
            metadata=metadata,
        )
        agents.append(agent)

    export_agents_yaml(agents, output_path)


def _fetch_all_agents() -> List[Dict[str, Any]]:
    from studio.backend.services.db import fetch_all

    return fetch_all("SELECT * FROM agents")


def _build_workflow_yaml_payload(
    workflow_row: Dict[str, Any],
    nodes: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
    metadata: Dict[str, Any],
    agents_ref: str,
) -> Dict[str, Any]:
    serialized_nodes = []
    for node in nodes:
        node_type = node.get("type")
        node_payload: Dict[str, Any] = {
            "id": node.get("id"),
            "type": _map_node_type(node_type),
        }

        if node_type == "agent":
            agent_id = node.get("data", {}).get("agentId") or node.get("id")
            node_payload["agent"] = agent_id

        serialized_nodes.append(node_payload)

    serialized_edges = []
    for edge in edges:
        serialized_edges.append(
            {
                "from": edge.get("source"),
                "to": edge.get("target"),
                **({"condition": edge.get("condition")} if edge.get("condition") else {}),
            }
        )

    return {
        "name": workflow_row.get("name"),
        "description": workflow_row.get("description", ""),
        "metadata": metadata,
        "agents_ref": agents_ref,
        "graph": {
            "nodes": serialized_nodes,
            "edges": serialized_edges,
        },
    }


def _map_node_type(node_type: Optional[str]) -> str:
    if node_type == "start":
        return "input"
    if node_type == "end":
        return "output"
    return node_type or "custom"


def _write_entrypoint(export_root: Path) -> None:
    entrypoint = export_root / "run_workflow.py"
    content = """
import json
from pathlib import Path

from genxai.core.graph import load_workflow_yaml, register_workflow_agents
from genxai.core.graph.executor import execute_workflow_sync


def main() -> None:
    workflow_path = Path(__file__).with_name("workflow.yaml")
    workflow = load_workflow_yaml(workflow_path)
    register_workflow_agents(workflow)

    payload = {"input": "Hello from Studio export"}
    result = execute_workflow_sync(
        nodes=workflow["graph"]["nodes"],
        edges=workflow["graph"]["edges"],
        input_data=payload,
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
""".lstrip()
    entrypoint.write_text(content)


def _write_readme(export_root: Path, workflow_id: str) -> None:
    readme = export_root / "README.md"
    readme.write_text(
        f"""# Studio Export: {workflow_id}

This folder was generated by GenXAI Studio's Export to Code feature.

## Contents
- `workflow.yaml`: Workflow graph + metadata
- `agents.yaml`: Exported agent configurations
- `tools/`: Exported tool files
- `run_workflow.py`: Runnable entrypoint

## Run
```bash
python run_workflow.py
```
"""
    )