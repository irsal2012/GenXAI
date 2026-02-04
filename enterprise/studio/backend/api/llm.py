"""LLM connection testing API endpoints."""

from fastapi import APIRouter, Request
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/test-connection")
async def test_llm_connection(request: Request) -> Dict[str, Any]:
    """Test LLM provider connections.
    
    Tests the validity of API keys by making minimal API calls to each provider.
    
    Returns:
        Dictionary with connection status for each provider
    """
    openai_key = getattr(request.state, 'openai_api_key', None)
    anthropic_key = getattr(request.state, 'anthropic_api_key', None)
    
    result = {
        "openai": await _test_openai_connection(openai_key),
        "anthropic": await _test_anthropic_connection(anthropic_key),
    }
    
    return result


async def _test_openai_connection(api_key: str | None) -> Dict[str, Any]:
    """Test OpenAI API connection.
    
    Args:
        api_key: OpenAI API key
        
    Returns:
        Connection status dictionary
    """
    if not api_key:
        return {
            "status": "no_key",
            "message": "No API key provided",
        }
    
    try:
        from openai import AsyncOpenAI
        
        client = AsyncOpenAI(api_key=api_key)
        
        # Make a minimal API call to test the connection
        # List models is fast and doesn't consume tokens
        models = await client.models.list()
        
        # Get the first available GPT model
        available_models = [m.id for m in models.data if m.id.startswith('gpt')]
        model_name = available_models[0] if available_models else "gpt-4"
        
        return {
            "status": "connected",
            "message": "Connected successfully",
            "model": model_name,
        }
        
    except ImportError:
        logger.error("OpenAI package not installed")
        return {
            "status": "error",
            "message": "OpenAI package not installed. Install with: pip install openai",
        }
    except Exception as e:
        error_msg = str(e)
        logger.error(f"OpenAI connection test failed: {error_msg}")
        
        # Parse common error types
        if "Incorrect API key" in error_msg or "invalid_api_key" in error_msg:
            message = "Invalid API key - please check your key"
        elif "rate_limit" in error_msg.lower():
            message = "Rate limit exceeded - please try again later"
        elif "timeout" in error_msg.lower() or "connection" in error_msg.lower():
            message = "Network error - check your connection"
        else:
            message = f"Connection failed: {error_msg}"
        
        return {
            "status": "error",
            "message": message,
        }


async def _test_anthropic_connection(api_key: str | None) -> Dict[str, Any]:
    """Test Anthropic API connection.
    
    Args:
        api_key: Anthropic API key
        
    Returns:
        Connection status dictionary
    """
    if not api_key:
        return {
            "status": "no_key",
            "message": "No API key provided",
        }
    
    try:
        from anthropic import AsyncAnthropic
        
        client = AsyncAnthropic(api_key=api_key)
        
        # Make a minimal API call to test the connection
        # Create a very short message to minimize token usage
        response = await client.messages.create(
            model="claude-3-haiku-20240307",  # Fastest/cheapest model
            max_tokens=1,
            messages=[{"role": "user", "content": "Hi"}]
        )
        
        return {
            "status": "connected",
            "message": "Connected successfully",
            "model": response.model,
        }
        
    except ImportError:
        logger.error("Anthropic package not installed")
        return {
            "status": "error",
            "message": "Anthropic package not installed. Install with: pip install anthropic",
        }
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Anthropic connection test failed: {error_msg}")
        
        # Parse common error types
        if "invalid_api_key" in error_msg.lower() or "authentication" in error_msg.lower():
            message = "Invalid API key - please check your key"
        elif "rate_limit" in error_msg.lower():
            message = "Rate limit exceeded - please try again later"
        elif "timeout" in error_msg.lower() or "connection" in error_msg.lower():
            message = "Network error - check your connection"
        else:
            message = f"Connection failed: {error_msg}"
        
        return {
            "status": "error",
            "message": message,
        }
