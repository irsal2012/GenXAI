# GenXAI - Advanced Agentic AI Framework

**Version:** 1.0.0 (Design Phase)  
**Status:** Planning & Architecture  
**License:** MIT (Planned)

---

## 🚀 Overview

GenXAI is an advanced agentic AI framework designed to surpass existing solutions (CrewAI, AutoGen, BeeAI) by combining:

- **Graph-Based Orchestration** (like LangGraph) for complex agent workflows
- **Advanced Memory Systems** with multiple memory types (short-term, long-term, episodic, semantic, procedural)
- **No-Code Interface** for visual workflow building
- **50+ Built-in Tools** for web, database, file, computation, and communication tasks
- **Enterprise Features** including observability, security, and scalability

---

## ✨ Key Features

### 🔗 Graph-Based Workflows
- Define complex agent relationships as directed graphs
- Conditional edges and dynamic routing
- Parallel and sequential execution
- Cycles, loops, and subgraphs
- Real-time visualization

### 🧠 Advanced Agent Capabilities
- **Multi-Modal**: Text, vision, audio, code understanding
- **Learning**: Self-improvement through feedback
- **Memory**: Multi-layered memory system
- **Tools**: 50+ built-in tools + custom tool creation
- **Personality**: Configurable agent personalities

### 💾 Multi-Layered Memory
- **Short-Term**: Recent conversation context
- **Long-Term**: Persistent knowledge with vector search
- **Episodic**: Past experiences and learning
- **Semantic**: Factual knowledge base
- **Procedural**: Learned skills and procedures
- **Working**: Active processing space

### 🎨 No-Code Studio
- Drag-and-drop workflow builder
- Visual agent designer
- Tool marketplace
- Template library
- Real-time testing playground
- One-click deployment

### ⚡ Trigger SDK (Non-Studio)
- Webhook triggers for external events
- Cron/interval schedule triggers
- Async queue triggers for message-driven workflows
- Lightweight registry to start/stop triggers programmatically

### 🏢 Enterprise-Ready
- **Observability**: Logging, metrics, tracing
- **Security**: RBAC, encryption, guardrails
- **Scalability**: Horizontal scaling, distributed execution
- **Reliability**: 99.9% uptime target

### 📈 Metrics API
- **Prometheus endpoint** at `/metrics` (non-Studio FastAPI app)
- **CLI launch**: `genxai metrics serve --host 0.0.0.0 --port 8001`

---

## 📋 Documentation

Comprehensive documentation is available in the following files:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture and design principles
- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Detailed functional and non-functional requirements
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - 20-week development roadmap
- **[TOOLS_DESIGN.md](./TOOLS_DESIGN.md)** - Tool system architecture and 50+ built-in tools
- **[MEMORY_DESIGN.md](./MEMORY_DESIGN.md)** - Multi-layered memory system design

---

## 🎯 Design Goals

1. **Superior to Existing Frameworks**: More features than CrewAI, AutoGen, BeeAI
2. **Graph-First**: Complex orchestration like LangGraph, but better
3. **No-Code Friendly**: Visual interface for non-technical users
4. **Enterprise-Grade**: Production-ready with observability and security
5. **Extensible**: Plugin architecture for easy customization

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  No-Code Studio  │  │   CLI/SDK/API    │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   ORCHESTRATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Graph Engine │  │ Flow Control │  │ State Manager│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      AGENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Agent Runtime│  │ Memory System│  │ Tool Registry│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete details.

---

## 🚦 Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
- Core graph engine
- Basic agent system
- CLI interface
- Initial documentation

### Phase 2: Advanced Features (Weeks 5-8)
- Complete memory system
- Communication layer
- 20+ built-in tools

### Phase 3: No-Code Studio (Weeks 9-12)
- Visual workflow builder
- REST API
- Real-time testing

### Phase 4: Enterprise Features (Weeks 13-16)
- Observability stack
- Security features
- 50+ tools total

### Phase 5: Polish & Launch (Weeks 17-20)
- Documentation
- Examples & templates
- Beta testing
- Official launch 🚀

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed timeline.

---

## 💡 Quick Start

### Using GenXAI as a Framework Library

```python
import os
from genxai import Agent, AgentConfig, AgentRegistry, Graph

# Set your API key (required)
os.environ["OPENAI_API_KEY"] = "sk-your-api-key-here"

# Define agents
classifier = Agent(
    id="classifier",
    config=AgentConfig(
        role="Classifier",
        goal="Categorize customer requests",
        llm_model="gpt-4",
        tools=["sentiment_analysis", "category_detector"],
    ),
)

support = Agent(
    id="support",
    config=AgentConfig(
        role="Support Agent",
        goal="Resolve customer issues",
        llm_model="claude-3-opus",
        enable_memory=True,
    ),
)

AgentRegistry.register(classifier)
AgentRegistry.register(support)

# Build graph
graph = Graph()
from genxai.core.graph.nodes import InputNode, OutputNode, AgentNode
from genxai.core.graph.edges import Edge

graph.add_node(InputNode(id="start"))
graph.add_node(AgentNode(id="classify", agent_id="classifier"))
graph.add_node(AgentNode(id="support", agent_id="support"))
graph.add_node(OutputNode(id="end"))

graph.add_edge(Edge(source="start", target="classify"))
graph.add_edge(Edge(source="classify", target="support"))
graph.add_edge(Edge(source="support", target="end"))

# Run workflow
result = await graph.run(input_data="My app crashed")
```

### Trigger SDK Quick Start

```python
from genxai.triggers import WebhookTrigger
from genxai.core.graph import TriggerWorkflowRunner

trigger = WebhookTrigger(trigger_id="support_webhook", secret="my-secret")

# Wire trigger to workflow
runner = TriggerWorkflowRunner(nodes=nodes, edges=edges)

async def on_event(event):
    result = await runner.handle_event(event)
    print("Workflow result:", result)

trigger.on_event(on_event)
await trigger.start()

# In your FastAPI handler:
# await trigger.handle_request(payload, raw_body=raw, headers=request.headers)
```

### Install Options

```bash
# Core install
pip install genxai

# Full install with providers/tools/observability/API
pip install "genxai[llm,tools,observability,api]"

# Everything included
pip install "genxai[all]"
```

### No-Code Interface

```yaml
workflow:
  name: "Customer Support"
  agents:
    - id: "classifier"
      role: "Classifier"
      llm: "gpt-4"
    - id: "support"
      role: "Support Agent"
      llm: "claude-3-opus"
  
  graph:
    nodes:
      - id: "start"
        type: "input"
      - id: "classify"
        agent: "classifier"
      - id: "support"
        agent: "support"
    edges:
      - from: "start"
        to: "classify"
      - from: "classify"
        to: "support"
        condition: "category == 'technical'"
```

---

## 🛠️ Technology Stack

### Core Framework
- **Language**: Python 3.11+
- **Validation**: Pydantic v2
- **Concurrency**: AsyncIO
- **Testing**: Pytest

### Storage
- **Metadata**: PostgreSQL
- **Caching**: Redis
- **Vector DB**: Pinecone, Weaviate, Chroma
- **Graph DB**: Neo4j

### LLM Providers
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3)
- Google (Gemini)
- Cohere
- Local models (Ollama, LM Studio)

### No-Code Studio
- **Frontend**: React + TypeScript
- **Graph Viz**: ReactFlow
- **Styling**: TailwindCSS
- **Backend**: FastAPI

### DevOps
- **Containers**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana

---

## 🎯 Key Differentiators

### vs CrewAI
✅ Graph-based workflows (not just sequential)  
✅ Advanced memory system  
✅ No-code interface  
✅ Learning agents  
✅ Enterprise features

### vs AutoGen
✅ Simpler configuration  
✅ Rich built-in tools  
✅ Visual workflow builder  
✅ Better state management  
✅ Multi-modal support

### vs BeeAI
✅ More sophisticated agents  
✅ Complex orchestration  
✅ Advanced memory  
✅ Enterprise scalability  
✅ Comprehensive tooling

### vs LangGraph
✅ All graph features PLUS:  
✅ No-code interface  
✅ Advanced agent capabilities  
✅ Multi-layered memory  
✅ Tool marketplace  
✅ Learning and adaptation

---

## 📊 Success Metrics

### Technical
- ✅ All functional requirements implemented
- ✅ 80%+ test coverage
- ✅ 99.9% uptime
- ✅ < 2s agent response time

### Business
- 🎯 10,000+ GitHub stars in first year
- 🎯 100+ contributors
- 🎯 100+ companies in production
- 🎯 4.5+ star rating

### User Experience
- 🎯 < 5 minutes to first workflow
- 🎯 Non-technical users productive in < 1 hour
- 🎯 < 5% framework-related failures

---

## 🤝 Contributing

We welcome contributions! This project is currently in the design phase. Once implementation begins, we'll provide:

- Contributing guidelines
- Code of conduct
- Development setup instructions
- Issue templates
- Pull request templates

---

## 📜 License

MIT License (Planned)

---

## 🔗 Links

- **Documentation**: See docs/ directory
- **GitHub**: (To be created)
- **Discord**: (To be created)
- **Website**: (To be created)

---

## 📧 Contact

For questions or collaboration opportunities, please reach out through GitHub Discussions (once created).

---

## 🙏 Acknowledgments

Inspired by:
- [LangGraph](https://github.com/langchain-ai/langgraph) - Graph-based orchestration
- [CrewAI](https://github.com/joaomdmoura/crewAI) - Multi-agent collaboration
- [AutoGen](https://github.com/microsoft/autogen) - Conversational agents
- [BeeAI](https://github.com/i-am-bee/bee-agent-framework) - Agent framework design

---

## 📈 Project Status

**Current Phase**: Design & Planning  
**Next Milestone**: Begin Phase 1 implementation  
**Expected Launch**: Week 20 (approximately 5 months from start)

---

**Built with ❤️ by the GenXAI team**
