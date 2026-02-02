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

export interface ToolParameter {
  name: string
  type: string
  description: string
  required: boolean
  default?: unknown
  enum?: string[]
}

export interface ToolTemplateConfigField {
  type?: string
  description?: string
  required?: boolean
  enum?: string[]
  default?: unknown
}

export interface ToolTemplate {
  id: string
  name: string
  description?: string
  config_schema?: Record<string, ToolTemplateConfigField>
}

export interface ToolCreatePayload {
  name: string
  description: string
  category: string
  tags: string[]
  version?: string
  author?: string
  code?: string
  parameters?: ToolParameter[]
  template?: string
  template_config?: Record<string, unknown>
}

export interface ToolExecutionResponse {
  data: unknown
  execution_time: number
  success: boolean
  rate_limit_stats?: Record<string, unknown>
  error?: string
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

export interface WorkflowExport {
  success: boolean
  workflow_id: string
  export_path: string
}