"""SQLite persistence for GenXAI Studio."""

from __future__ import annotations

import json
import sqlite3
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


def json_dumps(value: Any) -> str:
    return json.dumps(value or {})


def json_loads(value: Optional[str], default: Any) -> Any:
    if value is None:
        return default
    return json.loads(value)


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