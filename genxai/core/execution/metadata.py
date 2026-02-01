"""Execution metadata store for workflow runs."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional
import json
import uuid


@dataclass
class ExecutionRecord:
    """Represents a workflow execution record."""

    run_id: str
    workflow: str
    status: str
    started_at: str
    completed_at: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "run_id": self.run_id,
            "workflow": self.workflow,
            "status": self.status,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "metadata": self.metadata,
            "error": self.error,
            "result": self.result,
        }


class ExecutionStore:
    """In-memory execution store with optional JSON persistence."""

    def __init__(self, persistence_path: Optional[Path] = None) -> None:
        self._records: Dict[str, ExecutionRecord] = {}
        self._persistence_path = persistence_path

    def generate_run_id(self) -> str:
        return str(uuid.uuid4())

    def create(
        self,
        run_id: str,
        workflow: str,
        status: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ExecutionRecord:
        if run_id in self._records:
            return self._records[run_id]

        record = ExecutionRecord(
            run_id=run_id,
            workflow=workflow,
            status=status,
            started_at=datetime.now().isoformat(),
            metadata=metadata or {},
        )
        self._records[run_id] = record
        self._persist(record)
        return record

    def update(
        self,
        run_id: str,
        status: Optional[str] = None,
        error: Optional[str] = None,
        result: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        completed: bool = False,
    ) -> ExecutionRecord:
        record = self._records[run_id]
        if status is not None:
            record.status = status
        if error is not None:
            record.error = error
        if result is not None:
            record.result = result
        if metadata:
            record.metadata.update(metadata)
        if completed:
            record.completed_at = datetime.now().isoformat()
        self._persist(record)
        return record

    def get(self, run_id: str) -> Optional[ExecutionRecord]:
        return self._records.get(run_id)

    def _persist(self, record: ExecutionRecord) -> None:
        if not self._persistence_path:
            return
        self._persistence_path.mkdir(parents=True, exist_ok=True)
        path = self._persistence_path / f"execution_{record.run_id}.json"
        path.write_text(json.dumps(record.to_dict(), indent=2, default=str))