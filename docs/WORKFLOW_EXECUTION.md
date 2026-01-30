# Workflow Execution in GenXAI Studio

This document explains how workflow execution works in GenXAI Studio.

## Overview

The "Run Workflow" button in the Workflow Builder now executes workflows using the GenXAI engine with real agent and tool execution.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend API    │         │  GenXAI Engine  │
│  (React)        │         │   (FastAPI)      │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        │ 1. Click "Run Workflow"    │                            │
        │    POST /workflows/{id}/   │                            │
        │    execute                 │                            │
        ├───────────────────────────>│                            │
        │                            │                            │
        │                            │ 2. Get workflow from DB    │
        │                            │    (nodes, edges)          │
        │                            │                            │
        │                            │ 3. Call WorkflowExecutor   │
        │                            ├───────────────────────────>│
        │                            │                            │
        │                            │                            │ 4. Create agents
        │                            │                            │    from nodes
        │                            │                            │
        │                            │                            │ 5. Register agents
        │                            │                            │    in AgentRegistry
        │                            │                            │
        │                            │                            │ 6. Build graph
        │                            │                            │    from nodes/edges
        │                            │                            │
        │                            │                            │ 7. Execute graph
        │                            │                            │    with tools
        │                            │                            │
        │                            │ 8. Return execution result │
        │                            │<───────────────────────────┤
        │                            │                            │
        │                            │ 9. Save to executions DB   │
        │                            │                            │
        │ 10. Display result         │                            │
        │<───────────────────────────┤                            │
        │                            │                            │
```

## Components

### 1. Frontend (`WorkflowBuilderPage.tsx`)

**Location**: `studio/frontend/src/pages/WorkflowBuilderPage.tsx`

**Functionality**:
- Displays "Run Workflow" button
- Calls `useExecuteWorkflow` hook
- Shows execution results in "Execution output" panel

**Code**:
```typescript
const handleExecute = async () => {
  if (!workflowId) return
  const result = await executeWorkflow.mutateAsync({ input: 'demo payload' })
  setExecutionResult(JSON.stringify(result, null, 2))
}
```

### 2. API Service (`workflows.ts`)

**Location**: `studio/frontend/src/services/workflows.ts`

**Functionality**:
- Sends POST request to `/workflows/{id}/execute`
- Includes user's API keys in headers (via axios interceptor)

**Code**:
```typescript
export const useExecuteWorkflow = (workflowId: string) => {
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const { data } = await api.post<ExecutionResult>(
        `/workflows/${workflowId}/execute`, 
        input
      )
      return data
    },
  })
}
```

### 3. Backend API (`workflows.py`)

**Location**: `studio/backend/api/workflows.py`

**Functionality**:
- Receives execution request
- Extracts user's API keys from request headers
- Loads workflow from database
- Calls `WorkflowExecutor` to execute workflow
- Saves execution record to database
- Returns execution result

**Key Changes**:
```python
@router.post("/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, input_data: Dict[str, Any], request: Request):
    # Get workflow from database
    workflow_data = fetch_one("SELECT * FROM workflows WHERE id = ?", (workflow_id,))
    
    # Extract API keys
    openai_api_key = getattr(request.state, 'openai_api_key', None)
    
    # Parse nodes and edges
    nodes = json_loads(workflow_data["nodes"], [])
    edges = json_loads(workflow_data["edges"], [])
    
    # Execute workflow using GenXAI engine
    from studio.backend.services.workflow_executor import execute_workflow_sync
    
    execution_result = execute_workflow_sync(
        nodes=nodes,
        edges=edges,
        input_data=input_data,
        openai_api_key=openai_api_key,
        anthropic_api_key=anthropic_api_key
    )
    
    # Save and return result
    ...
```

### 4. Workflow Executor (`workflow_executor.py`)

**Location**: `studio/backend/services/workflow_executor.py`

**Functionality**:
- Registers built-in tools (calculator, file_reader)
- Creates agents from workflow nodes
- Registers agents in `AgentRegistry`
- Builds GenXAI graph from nodes and edges
- Executes graph with input data
- Returns execution result

**Key Features**:
- Uses `EnhancedGraph` from testable_workflow example
- Supports agent nodes with tools
- Handles conditional edges
- Cleans up registries after execution

**Code Structure**:
```python
class WorkflowExecutor:
    def __init__(self, openai_api_key, anthropic_api_key):
        self._setup_tools()
    
    def _setup_tools(self):
        # Register calculator, file_reader
        
    def _create_agents_from_nodes(self, nodes):
        # Create agents from workflow nodes
        # Register in AgentRegistry
        
    def _build_graph(self, nodes, edges):
        # Build EnhancedGraph
        # Add nodes (InputNode, AgentNode, OutputNode)
        # Add edges (Edge, ConditionalEdge)
        
    async def execute(self, nodes, edges, input_data):
        # Create agents
        # Build graph
        # Validate graph
        # Execute graph
        # Return result
```

## Workflow Node Format

### Agent Node

```json
{
  "id": "agent_1",
  "type": "agent",
  "config": {
    "role": "Data Analyst",
    "goal": "Analyze data and provide insights",
    "backstory": "Expert data analyst with 10 years experience",
    "tools": ["calculator"],
    "llm_model": "gpt-4",
    "temperature": 0.7
  }
}
```

### Input Node

```json
{
  "id": "input",
  "type": "input"
}
```

### Output Node

```json
{
  "id": "output",
  "type": "output"
}
```

### Edge

```json
{
  "source": "input",
  "target": "agent_1"
}
```

### Conditional Edge

```json
{
  "source": "agent_1",
  "target": "agent_2",
  "condition": "category == 'analysis'"
}
```

## Execution Flow

1. **User clicks "Run Workflow"**
   - Frontend sends POST request with input data

2. **Backend receives request**
   - Extracts user's API keys from headers
   - Loads workflow from database

3. **WorkflowExecutor initializes**
   - Registers built-in tools
   - Prepares for execution

4. **Agents are created**
   - Parse agent nodes from workflow
   - Create Agent instances with AgentFactory
   - Register in AgentRegistry

5. **Graph is built**
   - Create EnhancedGraph
   - Add nodes (Input, Agent, Output)
   - Add edges (regular and conditional)

6. **Graph is validated**
   - Check for disconnected components
   - Verify all edges reference valid nodes

7. **Graph is executed**
   - Start from input node
   - Execute agents sequentially/parallel
   - Agents use tools when needed
   - State flows through edges

8. **Results are returned**
   - Execution result includes:
     - Status (success/error)
     - Result data
     - Nodes executed
     - Error messages (if any)

9. **Cleanup**
   - Clear AgentRegistry
   - Prepare for next execution

## Execution Result Format

```json
{
  "id": "exec_abc123",
  "workflow_id": "wf_xyz789",
  "status": "success",
  "logs": [
    "Workflow executed successfully"
  ],
  "result": {
    "status": "success",
    "result": {
      "input": {...},
      "agent_1": {...},
      "output": {...}
    },
    "nodes_executed": 3,
    "message": "Workflow executed successfully"
  },
  "started_at": "2026-01-29T20:00:00",
  "completed_at": "2026-01-29T20:00:05"
}
```

## Available Tools

### Built-in Tools

1. **Calculator** (`calculator`)
   - Evaluates mathematical expressions
   - Example: `"10 * 5 + 3"` → `53`

2. **File Reader** (`file_reader`)
   - Reads file contents
   - Returns file size, lines, content

### Adding Custom Tools

To add custom tools:

1. Create tool in `genxai/tools/custom/`
2. Register in `WorkflowExecutor._setup_tools()`
3. Reference in agent node config

## API Keys

### How API Keys Work

1. User enters API keys in Settings page
2. Keys stored in browser localStorage
3. Frontend includes keys in request headers:
   - `X-OpenAI-API-Key`
   - `X-Anthropic-API-Key`
4. Backend middleware extracts keys
5. WorkflowExecutor receives keys
6. Agents use keys for LLM calls

### Without API Keys

If no API keys are provided:
- Workflow still executes
- Agents use placeholder responses
- Tools execute normally
- Useful for testing workflow structure

## Error Handling

### Execution Errors

If execution fails:
```json
{
  "status": "failed",
  "logs": ["Execution failed: Agent 'agent_1' not found"],
  "result": {
    "status": "error",
    "error": "Agent 'agent_1' not found",
    "message": "Execution failed: Agent 'agent_1' not found"
  }
}
```

### Common Errors

1. **Agent not found**
   - Cause: Agent node ID doesn't match created agent
   - Solution: Ensure node ID matches agent ID

2. **Tool not found**
   - Cause: Agent references non-existent tool
   - Solution: Register tool or remove from agent config

3. **Graph validation failed**
   - Cause: Invalid graph structure (cycles, disconnected nodes)
   - Solution: Fix workflow structure in builder

4. **API key missing**
   - Cause: LLM call attempted without API key
   - Solution: Add API key in Settings

## Testing

### Test Workflow Execution

1. **Create test workflow**:
   ```json
   {
     "name": "Test Workflow",
     "nodes": [
       {"id": "input", "type": "input"},
       {
         "id": "math_agent",
         "type": "agent",
         "config": {
           "role": "Math Expert",
           "goal": "Solve math problems",
           "tools": ["calculator"]
         }
       },
       {"id": "output", "type": "output"}
     ],
     "edges": [
       {"source": "input", "target": "math_agent"},
       {"source": "math_agent", "target": "output"}
     ]
   }
   ```

2. **Execute workflow**:
   - Click "Run Workflow"
   - Check execution output panel
   - Verify result includes calculator output

3. **Check execution record**:
   - Query executions table
   - Verify status, logs, result

## Troubleshooting

### Workflow doesn't execute

1. Check backend logs for errors
2. Verify workflow has valid nodes/edges
3. Ensure backend server is running
4. Check browser console for API errors

### Agent not executing

1. Verify agent node has correct structure
2. Check agent is registered in AgentRegistry
3. Ensure node ID matches agent ID
4. Check backend logs for agent creation errors

### Tool not working

1. Verify tool is registered in ToolRegistry
2. Check tool name matches agent config
3. Ensure tool execution logic is correct
4. Check backend logs for tool errors

## Future Enhancements

1. **Real-time execution updates**
   - WebSocket connection for live logs
   - Progress indicators for long-running workflows

2. **Enhanced condition evaluation**
   - Support complex expressions
   - Python eval() with sandboxing

3. **Parallel execution**
   - Execute independent agents concurrently
   - Optimize workflow performance

4. **Execution history**
   - View past executions
   - Compare results
   - Replay executions

5. **Custom tool integration**
   - UI for registering custom tools
   - Tool marketplace

## Related Documentation

- [Agent Tool Integration](./AGENT_TOOL_INTEGRATION.md)
- [Tool Playground](./TOOL_PLAYGROUND.md)
- [Studio API Keys](./STUDIO_API_KEYS.md)
- [Workflow Best Practices](./WORKFLOW_BEST_PRACTICES.md)

## Support

For issues or questions:
- GitHub Issues: https://github.com/irsal2012/GenXAI/issues
- Check backend logs: `studio/logs/`
- Enable debug logging in `workflow_executor.py`
