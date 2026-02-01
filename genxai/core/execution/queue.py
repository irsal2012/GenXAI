"""Async worker queue engine for distributed execution."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable, Optional, Protocol
import uuid
import logging

logger = logging.getLogger(__name__)


@dataclass
class QueueTask:
    """Represents a unit of work for the worker queue."""

    task_id: str
    payload: dict[str, Any]
    handler: Callable[[dict[str, Any]], Awaitable[Any]]
    metadata: dict[str, Any] = field(default_factory=dict)


class QueueBackend(Protocol):
    """Protocol for queue backends."""

    async def put(self, task: QueueTask) -> None:
        ...

    async def get(self) -> QueueTask:
        ...

    def qsize(self) -> int:
        ...


class InMemoryQueueBackend:
    """In-memory asyncio queue backend."""

    def __init__(self) -> None:
        self._queue: asyncio.Queue[QueueTask] = asyncio.Queue()

    async def put(self, task: QueueTask) -> None:
        await self._queue.put(task)

    async def get(self) -> QueueTask:
        return await self._queue.get()

    def qsize(self) -> int:
        return self._queue.qsize()


class WorkerQueueEngine:
    """Simple async worker engine for processing queued tasks."""

    def __init__(
        self,
        backend: Optional[QueueBackend] = None,
        worker_count: int = 2,
        max_retries: int = 3,
        backoff_seconds: float = 0.5,
    ) -> None:
        self._backend = backend or InMemoryQueueBackend()
        self._worker_count = worker_count
        self._max_retries = max_retries
        self._backoff_seconds = backoff_seconds
        self._workers: list[asyncio.Task[None]] = []
        self._running = False

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        for idx in range(self._worker_count):
            worker = asyncio.create_task(self._worker_loop(idx))
            self._workers.append(worker)

    async def stop(self) -> None:
        if not self._running:
            return
        self._running = False
        for worker in self._workers:
            worker.cancel()
        await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers.clear()

    async def enqueue(
        self,
        payload: dict[str, Any],
        handler: Callable[[dict[str, Any]], Awaitable[Any]],
        metadata: Optional[dict[str, Any]] = None,
        run_id: Optional[str] = None,
    ) -> str:
        task_id = run_id or str(uuid.uuid4())
        task = QueueTask(
            task_id=task_id,
            payload=payload,
            handler=handler,
            metadata=metadata or {},
        )
        await self._backend.put(task)
        return task_id

    async def _worker_loop(self, worker_id: int) -> None:
        while self._running:
            try:
                task = await self._backend.get()
                await self._execute_with_retry(task)
                logger.debug(
                    "Worker %s processed task %s", worker_id, task.task_id
                )
            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.error("Worker %s failed: %s", worker_id, exc)

    async def _execute_with_retry(self, task: QueueTask) -> None:
        attempts = 0
        while True:
            try:
                await task.handler(task.payload)
                return
            except Exception as exc:
                attempts += 1
                if attempts > self._max_retries:
                    raise exc
                await asyncio.sleep(self._backoff_seconds * attempts)


class RQQueueBackend:
    """Placeholder backend for Redis/RQ integration.

    This is a stub that documents the interface needed for an RQ backend.
    """

    def __init__(self) -> None:
        raise NotImplementedError(
            "RQQueueBackend is a stub. Implement with Redis + rq when ready."
        )