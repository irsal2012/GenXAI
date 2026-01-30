"""Middleware to extract API keys from request headers."""

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request


class ApiKeyMiddleware(BaseHTTPMiddleware):
    """Middleware to extract API keys from request headers and store in request state."""

    async def dispatch(self, request: Request, call_next):
        # Extract API keys from headers
        request.state.openai_api_key = request.headers.get("X-OpenAI-API-Key")
        request.state.anthropic_api_key = request.headers.get("X-Anthropic-API-Key")

        # Continue processing the request
        response = await call_next(request)
        return response
