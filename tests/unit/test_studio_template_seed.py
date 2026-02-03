"""Tests for Studio workflow template seeding."""

from pathlib import Path

from studio.backend.services import db


def test_user_proxy_template_seeded(tmp_path: Path) -> None:
    original_db_path = db.DB_PATH
    db.DB_PATH = tmp_path / "studio_test.db"
    try:
        db.init_db()
        templates = db.fetch_all("SELECT * FROM workflow_templates")
        ids = {template["id"] for template in templates}
        assert "tpl_user_proxy" in ids
    finally:
        if db.DB_PATH.exists():
            with db.get_connection() as conn:
                conn.execute("VACUUM")
        db.DB_PATH = original_db_path