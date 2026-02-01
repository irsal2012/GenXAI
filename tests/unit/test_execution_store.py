"""Unit tests for the execution metadata store."""

from genxai.core.execution import ExecutionStore


def test_execution_store_create_update():
    store = ExecutionStore()
    run_id = store.generate_run_id()
    record = store.create(run_id, workflow="wf", status="running")

    assert record.run_id == run_id
    assert record.status == "running"

    store.update(run_id, status="success", result={"ok": True}, completed=True)
    updated = store.get(run_id)

    assert updated is not None
    assert updated.status == "success"
    assert updated.result == {"ok": True}