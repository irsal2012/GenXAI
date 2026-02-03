"""SQLite persistence for GenXAI Studio."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

DB_PATH = Path(__file__).resolve().parent.parent / "genxai_studio.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS workflows (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                nodes TEXT NOT NULL,
                edges TEXT NOT NULL,
                metadata TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY,
                role TEXT NOT NULL,
                goal TEXT NOT NULL,
                backstory TEXT,
                llm_model TEXT NOT NULL,
                tools TEXT NOT NULL,
                metadata TEXT NOT NULL
            )
            """
        )

        # Best-effort data hygiene/migration:
        # Older versions stored empty lists as '{}' due to json_dumps using `value or {}`.
        # That breaks the API when validating `tools: List[str]`.
        conn.execute(
            """
            UPDATE agents
            SET tools = '[]'
            WHERE tools = '{}' OR tools IS NULL OR tools = ''
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS executions (
                id TEXT PRIMARY KEY,
                workflow_id TEXT NOT NULL,
                status TEXT NOT NULL,
                logs TEXT NOT NULL,
                result TEXT NOT NULL,
                started_at TEXT NOT NULL,
                completed_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS workflow_templates (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT,
                difficulty TEXT,
                tags TEXT NOT NULL,
                nodes TEXT NOT NULL,
                edges TEXT NOT NULL,
                metadata TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )

        _seed_default_templates(conn)


def _seed_default_templates(conn: sqlite3.Connection) -> None:
    """Insert bundled workflow templates if they do not exist yet."""
    templates = [
        {
            "id": "tpl_user_proxy",
            "name": "User Proxy Workflow",
            "description": "Collects human input before the assistant runs",
            "category": "interaction",
            "difficulty": "beginner",
            "tags": ["user_proxy", "human_input", "tool", "assistant"],
            "nodes": [
                {
                    "id": "start",
                    "type": "start",
                    "position": {"x": 200, "y": 50},
                    "label": "Start",
                    "config": {},
                },
                {
                    "id": "user_input",
                    "type": "tool",
                    "position": {"x": 200, "y": 200},
                    "label": "Human Input",
                    "config": {
                        "tool_name": "human_input",
                        "tool_params": {"prompt": "What do you need?"},
                    },
                },
                {
                    "id": "assistant",
                    "type": "agent",
                    "position": {"x": 200, "y": 350},
                    "label": "Assistant",
                    "config": {"agent_id": "assistant"},
                },
                {
                    "id": "end",
                    "type": "end",
                    "position": {"x": 200, "y": 500},
                    "label": "End",
                    "config": {},
                },
            ],
            "edges": [
                {"id": "e1", "source": "start", "target": "user_input"},
                {"id": "e2", "source": "user_input", "target": "assistant"},
                {"id": "e3", "source": "assistant", "target": "end"},
            ],
            "metadata": {"template": "user_proxy"},
        }
    ]

    for template in templates:
        existing = conn.execute(
            "SELECT id FROM workflow_templates WHERE id = ?",
            (template["id"],),
        ).fetchone()
        if existing:
            continue

        timestamp = datetime.utcnow().isoformat()
        conn.execute(
            """
            INSERT INTO workflow_templates
            (id, name, description, category, difficulty, tags, nodes, edges, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                template["id"],
                template["name"],
                template["description"],
                template["category"],
                template["difficulty"],
                json.dumps(template["tags"]),
                json.dumps(template["nodes"]),
                json.dumps(template["edges"]),
                json.dumps(template["metadata"]),
                timestamp,
                timestamp,
            ),
        )


def json_dumps(value: Any) -> str:
    """Serialize Python values to JSON for storage.

    IMPORTANT: we must preserve empty containers.

    The previous implementation used `value or {}` which incorrectly converted empty
    lists (e.g. tools=[]) into `{}`. That later causes API failures when we
    deserialize and validate against Pydantic models expecting `List[str]`.
    """

    return json.dumps(value)


def json_loads(value: Optional[str], default: Any) -> Any:
    if value is None:
        return default
    try:
        parsed = json.loads(value)
    except Exception:
        return default
    return default if parsed is None else parsed


def fetch_all(query: str, params: Iterable[Any] = ()) -> list[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]


def fetch_one(query: str, params: Iterable[Any] = ()) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        row = conn.execute(query, params).fetchone()
        return dict(row) if row else None


def execute(query: str, params: Iterable[Any] = ()) -> None:
    with get_connection() as conn:
        conn.execute(query, params)
        conn.commit()