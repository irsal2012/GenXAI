# Agent-Tool Integration Guide

## Overview

In GenXAI, **agents use tools** to accomplish their goals. This document explains the relationship between agents and tools, and how to properly structure workflows.

## Core Concepts

### What is an Agent?

An **Agent** is an AI-powered entity that:
- Has access to a **Large Language Model (LLM)** for intelligent decision-making
- Can be assigned **tools** to accomplish specific tasks
- Has a **role**, **goal**, and **backstory** that guide its behavior
- Makes intelligent decisions about when and how to use its tools

### What is a Tool?

A **Tool** is a specific function or capability that:
- Performs a concrete action (e.g., extract data, send email, query database)
- Does NOT have LLM reasoning capabilities
- Is used BY agents, not as standalone workflow nodes

## Architecture Pattern

### ✅ Correct Pattern: Tools Inside Agents

```
Start → Agent (with tools: extract, transform, load) → End
```

**Why this is better:**
- The agent uses its LLM to understand the task
- The agent decides which tools to use and in what order
- The agent can adapt based on the data and context
- The agent can retry tools if they fail
- More flexible and intelligent

### ❌ Incorrect Pattern: Tools as Separate Nodes

```
Start → Extract Tool → Transform Tool → Agent → Load Tool → End
```

**Why this is problematic:**
- Tools don't have intelligence to make decisions
- Fixed sequence with no adaptability
- Agent can't control the tool execution flow
- Confusing mental model

## How to Use in the Workflow Builder

### 1. Create Tools

First, create your tools in the **Tools** page:
- Go to Tools → Create Tool
- Define the tool's name, description, and parameters
- Example tools: `extract_data`, `transform_data`, `load_data`

### 2. Create Agents with Tools

Create agents in the **Agents** page:
- Go to Agents → Create Agent
- Set the agent's role and goal
- **Assign tools** to the agent from the available tools list
- The agent will have access to these tools during execution

Example agent configuration:
```json
{
  "role": "Data Processor",
  "goal": "Extract, clean, transform, and load data",
  "llm_model": "gpt-4",
  "tools": ["extract_data", "transform_data", "validate_data", "load_data"]
}
```

### 3. Build Workflows with Agents

In the **Workflow Builder**:
- Drag agents from the "Available Agents" section onto the canvas
- The agent node will display:
  - 🤖 Agent icon and name
  - Agent goal/description
  - 🔧 Number of tools assigned
- Connect agents with Start, Decision, and End nodes
- Click on an agent node to configure its tools (coming soon)

## Agent Configuration

### LLM Settings

Every agent is automatically connected to an LLM with these default settings:
- **Provider**: OpenAI
- **Model**: gpt-4
- **Temperature**: 0.7
- **Max Tokens**: Configurable

### Tool Assignment

Tools can be assigned to agents in two ways:

1. **During Agent Creation**: Select tools when creating the agent
2. **In Workflow Builder**: Click on an agent node to modify its tools (coming soon)

### Agent Execution Flow

When a workflow runs and reaches an agent node:

1. **Agent receives input** from the previous node
2. **LLM analyzes** the task and available tools
3. **Agent decides** which tools to use and in what order
4. **Tools are executed** by the agent
5. **Agent processes** the tool outputs
6. **Agent returns** the final result to the next node

## Best Practices

### ✅ DO:
- Assign multiple related tools to a single agent
- Let the agent decide the tool execution order
- Use agents for tasks requiring intelligence and decision-making
- Give agents clear roles and goals

### ❌ DON'T:
- Create separate tool nodes in workflows
- Hardcode tool execution sequences
- Use tools without an agent
- Create agents without tools (unless they only need LLM reasoning)

## Example Workflows

### Data Processing Pipeline

**Good Design:**
```
Start
  ↓
Data Processing Agent
  - Tools: [extract_data, transform_data, validate_data, load_data]
  - Goal: "Extract, clean, transform, and load data"
  ↓
End
```

The agent will:
1. Use `extract_data` to get the data
2. Analyze the data quality
3. Use `transform_data` to clean it
4. Use `validate_data` to check results
5. Use `load_data` to store it
6. Handle errors and retry if needed

### Multi-Agent Workflow

```
Start
  ↓
Research Agent (tools: web_search, summarize)
  ↓
Analysis Agent (tools: analyze_data, create_chart)
  ↓
Report Agent (tools: generate_report, send_email)
  ↓
End
```

Each agent has specialized tools for its role.

## Visualization in UI

### Agent Node Display

Agent nodes in the workflow canvas show:
```
┌─────────────────────┐
│ 🤖 Data Processor   │
│ Process data        │
│ ─────────────────── │
│ 🔧 4 tools          │
└─────────────────────┘
```

### Agent Palette Card

Agent cards in the palette show:
```
┌─────────────────────┐
│ 🤖 Data Processor   │
│ Process and trans...│
│ 🔧 4 tools          │
└─────────────────────┘
```

## Technical Details

### Agent Data Structure

```typescript
interface Agent {
  id: string
  role: string
  goal: string
  backstory: string
  llm_model: string
  tools: string[]  // Array of tool names
  metadata: Record<string, any>
}
```

### Workflow Node Data

```typescript
interface AgentNodeData {
  label: string
  config: {
    role: string
    goal: string
    tools: string[]  // Tools available to this agent
  }
  agentId: string
}
```

## FAQ

**Q: Can an agent work without tools?**
A: Yes! An agent can use just its LLM for reasoning tasks without needing tools.

**Q: Can multiple agents share the same tools?**
A: Yes! Tools can be assigned to multiple agents.

**Q: Can I add tools to an agent after creating it?**
A: Yes! Edit the agent in the Agents page or click the agent node in the workflow builder.

**Q: What happens if an agent doesn't have the right tools?**
A: The agent will try to accomplish the task with available tools or report that it cannot complete the task.

**Q: Can tools call other tools?**
A: No. Only agents can call tools. If you need complex tool orchestration, use an agent.

## Summary

Remember: **Agents use tools, not the other way around.**

- ✅ Agents = Intelligence (LLM) + Capabilities (Tools) + Purpose (Role/Goal)
- ✅ Tools = Functions that agents can call
- ✅ Workflows = Sequences of agents (not tools)

This architecture provides maximum flexibility and follows AI agent best practices.
