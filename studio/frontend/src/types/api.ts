export interface Workflow {
  id: string
  name: string
  description: string
  nodes: Record<string, unknown>[]
  edges: Record<string, unknown>[]
  metadata: Record<string, unknown>
}

export interface WorkflowInput {
  name: string
  description?: string
  nodes: Record<string, unknown>[]
  edges: Record<string, unknown>[]
  metadata?: Record<string, unknown>
}

export interface Agent {
  id: string
  role: string
  goal: string
  backstory: string
  llm_model: string
  tools: string[]
  metadata: Record<string, unknown>
}

export interface AgentInput {
  role: string
  goal: string
  backstory?: string
  llm_model?: string
  tools?: string[]
  metadata?: Record<string, unknown>
}

export interface ToolSummary {
  name: string
  description: string
  category: string
  tags: string[]
  schema?: Record<string, unknown>
  version?: string
  author?: string
  metrics?: Record<string, unknown>
}

export interface ToolStats {
  total_tools: number
  categories: Record<string, number>
  tags: Record<string, number>
}

export interface ExecutionResult {
  id: string
  workflow_id: string
  status: string
  logs: string[]
  result: Record<string, unknown>
  started_at: string
  completed_at: string
}