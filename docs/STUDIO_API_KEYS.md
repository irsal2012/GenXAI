# GenXAI Studio - API Key Management

This document explains how to configure and use API keys in GenXAI Studio.

## Overview

GenXAI Studio allows each user to provide their own API keys for LLM providers (OpenAI, Anthropic, etc.). This approach ensures:

- ✅ **User Responsibility**: Each user manages and pays for their own API usage
- ✅ **Security**: API keys are stored locally in the browser, never on the server
- ✅ **Flexibility**: Different users can use different API keys
- ✅ **Privacy**: Keys are only transmitted to LLM providers, not stored by GenXAI

## How It Works

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │         │   Backend    │         │ LLM Provider│
│  (Frontend) │         │   Server     │         │  (OpenAI)   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │ 1. User enters API key │                        │
      │    in Settings page    │                        │
      │                        │                        │
      │ 2. Key stored in       │                        │
      │    localStorage        │                        │
      │                        │                        │
      │ 3. API request with    │                        │
      │    X-OpenAI-API-Key    │                        │
      │    header              │                        │
      ├───────────────────────>│                        │
      │                        │                        │
      │                        │ 4. Extract key from    │
      │                        │    request header      │
      │                        │                        │
      │                        │ 5. Initialize LLM      │
      │                        │    with user's key     │
      │                        │                        │
      │                        │ 6. Make API call       │
      │                        │    with user's key     │
      │                        ├───────────────────────>│
      │                        │                        │
      │                        │ 7. Response            │
      │                        │<───────────────────────┤
      │                        │                        │
      │ 8. Return result       │                        │
      │<───────────────────────┤                        │
      │                        │                        │
```

### Key Features

1. **Client-Side Storage**: API keys are stored in browser `localStorage`
2. **Request Headers**: Keys are sent in HTTP headers (`X-OpenAI-API-Key`, `X-Anthropic-API-Key`)
3. **Server Middleware**: Backend extracts keys from headers and makes them available to endpoints
4. **No Persistence**: Server never stores keys in database or logs
5. **Direct Usage**: Keys are used directly to initialize LLM providers

## User Guide

### Setting Up API Keys

#### First-Time Setup

1. **Open GenXAI Studio** in your browser
2. You'll see a **"Welcome to GenXAI Studio!"** modal
3. Enter your **OpenAI API Key** (required)
4. Optionally enter your **Anthropic API Key** (for Claude models)
5. Click **"Continue"**

#### Updating API Keys

1. Click **"Settings"** in the sidebar
2. Update your API keys in the input fields
3. Click **"Save Settings"**

#### Getting API Keys

**OpenAI:**
- Visit: https://platform.openai.com/api-keys
- Sign in or create an account
- Click "Create new secret key"
- Copy the key (starts with `sk-...`)

**Anthropic:**
- Visit: https://console.anthropic.com/settings/keys
- Sign in or create an account
- Click "Create Key"
- Copy the key (starts with `sk-ant-...`)

### Security Best Practices

⚠️ **Important Security Notes:**

1. **Don't use shared computers**: Your API keys are stored in the browser
2. **Clear keys when done**: Use "Clear All Keys" button in Settings
3. **Monitor usage**: Check your API usage on the provider's platform
4. **Rotate keys regularly**: Generate new keys periodically
5. **Use separate keys**: Don't share keys between applications

### Clearing API Keys

To remove your API keys:

1. Go to **Settings** page
2. Click **"Clear All Keys"** button
3. Confirm the action

Or manually clear browser localStorage:
```javascript
localStorage.removeItem('genxai_openai_api_key')
localStorage.removeItem('genxai_anthropic_api_key')
```

## Developer Guide

### Frontend Implementation

#### API Key Context

The `ApiKeyContext` provides global state management for API keys:

```typescript
import { useApiKeys } from '../contexts/ApiKeyContext'

const MyComponent = () => {
  const { apiKeys, setApiKey, clearApiKeys, hasApiKeys } = useApiKeys()
  
  // Check if keys are configured
  if (!hasApiKeys()) {
    return <div>Please configure API keys in Settings</div>
  }
  
  // Use keys...
}
```

#### API Service

The API service automatically includes API keys in request headers:

```typescript
// studio/frontend/src/services/api.ts
api.interceptors.request.use((config) => {
  const openaiKey = localStorage.getItem('genxai_openai_api_key')
  const anthropicKey = localStorage.getItem('genxai_anthropic_api_key')
  
  if (openaiKey) {
    config.headers['X-OpenAI-API-Key'] = openaiKey
  }
  if (anthropicKey) {
    config.headers['X-Anthropic-API-Key'] = anthropicKey
  }
  
  return config
})
```

### Backend Implementation

#### Middleware

The `ApiKeyMiddleware` extracts API keys from request headers:

```python
# studio/backend/middleware/api_keys.py
class ApiKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract API keys from headers
        request.state.openai_api_key = request.headers.get("X-OpenAI-API-Key")
        request.state.anthropic_api_key = request.headers.get("X-Anthropic-API-Key")
        
        response = await call_next(request)
        return response
```

#### Using API Keys in Endpoints

Access API keys from `request.state`:

```python
from fastapi import Request
from genxai.llm.providers.openai import OpenAIProvider

@router.post("/execute")
async def execute_workflow(request: Request):
    # Get API key from request
    openai_key = request.state.openai_api_key
    
    # Initialize LLM with user's key
    llm = OpenAIProvider(
        model="gpt-4",
        api_key=openai_key  # Use user's key!
    )
    
    # Use LLM...
```

### Core Library Integration

The GenXAI core library already supports API keys:

```python
# genxai/llm/providers/openai.py
class OpenAIProvider:
    def __init__(self, api_key: Optional[str] = None, ...):
        # Use provided key or fall back to environment variable
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
```

## Comparison with Other Frameworks

### AutoGen Studio

GenXAI Studio follows the same pattern as AutoGen Studio:

| Feature | AutoGen Studio | GenXAI Studio |
|---------|---------------|---------------|
| Settings Page | ✅ Yes | ✅ Yes |
| localStorage | ✅ Yes | ✅ Yes |
| Per-User Keys | ✅ Yes | ✅ Yes |
| Multiple Providers | OpenAI, Azure | OpenAI, Anthropic |

### Framework Library Usage

When using GenXAI as a **framework library** (not Studio):

```python
# Users provide their own API keys in code
import os
from genxai.llm.providers.openai import OpenAIProvider

# Method 1: Environment variable
os.environ["OPENAI_API_KEY"] = "sk-..."

# Method 2: Direct parameter
llm = OpenAIProvider(api_key="sk-...")
```

This is identical to how AutoGen, CrewAI, and LangChain work.

## Troubleshooting

### "API key not configured" Error

**Problem**: Workflow execution fails with missing API key error

**Solution**:
1. Go to Settings page
2. Enter your OpenAI API key
3. Click "Save Settings"
4. Try running the workflow again

### "Invalid API key" Error

**Problem**: LLM provider rejects the API key

**Solution**:
1. Verify your API key is correct
2. Check if the key has been revoked
3. Generate a new key from the provider's platform
4. Update the key in Settings

### Keys Not Persisting

**Problem**: API keys are lost after browser refresh

**Solution**:
1. Check browser localStorage is enabled
2. Ensure you're not in private/incognito mode
3. Check browser console for errors
4. Try clearing cache and re-entering keys

### CORS Errors

**Problem**: API requests fail with CORS errors

**Solution**:
1. Ensure backend is running on `http://localhost:8000`
2. Ensure frontend is running on `http://localhost:5173` or `http://localhost:3000`
3. Check CORS configuration in `studio/backend/main.py`

## FAQ

**Q: Are my API keys safe?**
A: Keys are stored in your browser's localStorage and only sent to LLM providers. They are never stored on the GenXAI server.

**Q: Can I use different keys for different projects?**
A: Currently, keys are global per browser. You can switch keys in Settings or use different browsers.

**Q: What happens if I don't provide an API key?**
A: You can still use the Studio UI to design workflows, but you won't be able to execute them until you provide an API key.

**Q: Can I use Azure OpenAI or other providers?**
A: Currently, GenXAI Studio supports OpenAI and Anthropic. Support for Azure OpenAI and other providers can be added.

**Q: How much will API usage cost?**
A: You pay directly to the LLM provider based on your usage. Check their pricing pages:
- OpenAI: https://openai.com/pricing
- Anthropic: https://www.anthropic.com/pricing

## Support

For issues or questions:
- GitHub Issues: https://github.com/irsal2012/GenXAI/issues
- Documentation: See other docs in `/docs` folder
