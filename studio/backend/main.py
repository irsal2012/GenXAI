"""FastAPI backend for GenXAI No-Code Studio.

This module can be executed in two ways:

1) From inside `studio/backend/`:
   - `python main.py`
   - `uvicorn main:app --reload`

2) From the repository root as a module:
   - `uvicorn studio.backend.main:app --reload`

To support both, imports below try the local (relative) form first and fall
back to absolute imports.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import logging

try:
    # When running from within `studio/backend/`
    from api import workflows, agents, tools
    from services.db import init_db
except ModuleNotFoundError:
    # When running from repo root as `studio.backend.main`
    from studio.backend.api import workflows, agents, tools
    from studio.backend.services.db import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="GenXAI Studio API",
    description="REST API for GenXAI No-Code Studio",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {
        "message": "GenXAI Studio API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


# Initialize database
init_db()

# Load tools from database on startup
@app.on_event("startup")
async def startup_event():
    """Load tools from database on server startup."""
    try:
        from genxai.tools.persistence import ToolService
        logger.info("Loading tools from database...")
        ToolService.load_all_tools()
        logger.info("Tools loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load tools: {e}")

# Include routers
app.include_router(workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(tools.router, prefix="/api/tools", tags=["tools"])
app.include_router(workflows.executions_router, prefix="/api/executions", tags=["executions"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
