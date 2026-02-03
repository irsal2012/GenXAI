# GenXAI Studio - No-Code Interface

Visual workflow builder for GenXAI framework.

## 🚀 Quick Start

### Backend Setup

```bash
# From project root
cd /Users/iimran/Desktop/GenXAI
source venv/bin/activate

# Install API dependencies
pip install -e ".[api]"

# Run backend server
python studio/backend/main.py

# Or with uvicorn
uvicorn studio.backend.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend
cd studio/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 📋 API Endpoints

### Workflows
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/{id}` - Get workflow
- `PUT /api/workflows/{id}` - Update workflow
- `DELETE /api/workflows/{id}` - Delete workflow
- `POST /api/workflows/{id}/execute` - Execute workflow
- `POST /api/workflows/{id}/export-code` - Export workflow to runnable code bundle
- `GET /api/workflows/{id}/download-code` - Download workflow code bundle (zip)

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create agent
- `GET /api/agents/{id}` - Get agent
- `PUT /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent

### Tools
- `GET /api/tools` - List all tools
- `GET /api/tools/categories` - List categories
- `GET /api/tools/search?query=...` - Search tools
- `GET /api/tools/{name}` - Get tool details
- `GET /api/tools/stats` - Get statistics

## 🏗️ Architecture

```
studio/
├── backend/              # FastAPI backend
│   ├── main.py          # FastAPI app
│   ├── api/             # API routers
│   │   ├── workflows.py
│   │   ├── agents.py
│   │   └── tools.py
│   ├── services/        # Business logic
│   └── models/          # Data models
│
└── frontend/            # React frontend
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── hooks/       # Custom hooks
    │   ├── services/    # API services
    │   └── types/       # TypeScript types
    ├── package.json
    └── vite.config.ts
```

## 🎨 Features

### Current (Phase 3 - Weeks 9-10):
- ✅ REST API with FastAPI
- ✅ CRUD operations for workflows, agents, tools
- ✅ React + TypeScript frontend
- ✅ TailwindCSS styling
- ✅ Vite build system
- ✅ API proxy configuration

### Planned (Weeks 11-12):
- ⏳ Graph Editor with ReactFlow
- ⏳ Agent Designer UI
- ⏳ Tool Browser
- ⏳ Template Library
- ⏳ Real-time Testing Playground
- ⏳ One-click Deployment

## 🧭 Studio Walkthrough: UserProxy Workflow

This walkthrough shows how to build a UserProxy-style workflow in Studio using
the built-in `human_input` tool.

1. **Open Studio** and create a new workflow in the **Workflows** page.
2. **Add Nodes** on the canvas:
   - **Start** (Input)
   - **Tool** (Human Input)
   - **Agent** (Assistant)
   - **End** (Output)
3. **Configure the Tool node**:
   - Tool: `human_input`
   - Params: `{ "prompt": "What do you need?" }`
4. **Create or select the Assistant agent**:
   - Role: `Assistant`
   - Goal: `Help the user`
   - Tools: optional (e.g., `text_analyzer`)
5. **Connect edges**: Start → Tool → Agent → End
6. **Save the workflow**, then execute with a test input.

Tips:
- The `human_input` tool runs in the backend context and will prompt in the
  terminal where the backend server is running.
- For web-based user input, replace `human_input` with a webhook or UI tool.

### Canvas JSON Defaults (UserProxy Template)

Use this as a quick JSON starter for the Studio workflow builder:

```json
{
  "name": "User Proxy Workflow",
  "description": "Collects human input before the assistant runs",
  "nodes": [
    { "id": "start", "type": "start", "position": { "x": 200, "y": 50 }, "label": "Start", "config": {} },
    {
      "id": "user_input",
      "type": "tool",
      "position": { "x": 200, "y": 200 },
      "label": "Human Input",
      "config": { "tool_name": "human_input", "tool_params": { "prompt": "What do you need?" } }
    },
    {
      "id": "assistant",
      "type": "agent",
      "position": { "x": 200, "y": 350 },
      "label": "Assistant",
      "config": { "agent_id": "assistant" }
    },
    { "id": "end", "type": "end", "position": { "x": 200, "y": 500 }, "label": "End", "config": {} }
  ],
  "edges": [
    { "id": "e1", "source": "start", "target": "user_input" },
    { "id": "e2", "source": "user_input", "target": "assistant" },
    { "id": "e3", "source": "assistant", "target": "end" }
  ],
  "metadata": { "template": "user_proxy" }
}
```

### Screenshots (Placeholders)

> 📸 Add Studio screenshots here when available:
> - Workflow canvas with Start → Tool → Agent → End
> - Tool configuration panel showing `human_input`
> - Agent configuration panel for the Assistant

### Downloadable Template

You can import a ready-made JSON template from:

- `studio/exports/user_proxy_template.json`

### Templates Page

The **Templates** page ships with a preloaded **User Proxy Workflow** template.
It will appear automatically after the backend starts and initializes the
database.

## 🛠️ Development

### Backend Development

```bash
# Run with auto-reload
uvicorn studio.backend.main:app --reload

# Run tests
pytest studio/backend/tests/
```

### Frontend Development

```bash
cd studio/frontend

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## 📚 Technology Stack

### Backend:
- **Framework**: FastAPI
- **Validation**: Pydantic
- **CORS**: Enabled for React dev server
- **Storage**: In-memory (ready for database)

### Frontend:
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Graph**: ReactFlow (for visual workflows)
- **State**: Zustand
- **API**: Axios + React Query

## 🔗 Integration

The frontend communicates with the backend via REST API:

```typescript
// Example API call
const response = await fetch('http://localhost:8000/api/workflows');
const workflows = await response.json();
```

## 📖 Documentation

- [Architecture](../ARCHITECTURE.md)
- [API Reference](http://localhost:8000/docs) (when running)
- [Getting Started](../GETTING_STARTED.md)

## 🤝 Contributing

The no-code studio is part of the GenXAI framework. See main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**GenXAI Studio - Build AI Agent Workflows Visually** 🎨
