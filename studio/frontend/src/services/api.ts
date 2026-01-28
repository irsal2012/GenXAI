// API service for GenXAI Studio backend communication

const API_BASE_URL = 'http://localhost:8000'

export interface Agent {
  id: string
  role: string
  goal: string
  backstory: string
  llm_model: string
  tools: string[]
  metadata: Record<string, any>
}

export interface Workflow {
  id: string
  name: string
  description: string
  nodes: any[]
  edges: any[]
  metadata: Record<string, any>
}

export interface Tool {
  name: string
  category: string
  description: string
  tags?: string[]
  schema?: Record<string, any>
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  status: 'running' | 'completed' | 'failed'
  logs: string[]
  result: any
  started_at: string
  completed_at?: string
}

class ApiService {
  // Agent APIs
  async getAgents(): Promise<Agent[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agents`)
      if (!response.ok) throw new Error('Failed to fetch agents')
      return await response.json()
    } catch (error) {
      console.error('Error fetching agents:', error)
      return []
    }
  }

  async createAgent(agent: Omit<Agent, 'id'>): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent)
    })
    if (!response.ok) throw new Error('Failed to create agent')
    return await response.json()
  }

  async updateAgent(id: string, agent: Partial<Agent>): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent)
    })
    if (!response.ok) throw new Error('Failed to update agent')
    return await response.json()
  }

  async deleteAgent(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete agent')
  }

  // Workflow APIs
  async getWorkflows(): Promise<Workflow[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workflows`)
      if (!response.ok) throw new Error('Failed to fetch workflows')
      return await response.json()
    } catch (error) {
      console.error('Error fetching workflows:', error)
      return []
    }
  }

  async createWorkflow(workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    const response = await fetch(`${API_BASE_URL}/api/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    })
    if (!response.ok) throw new Error('Failed to create workflow')
    return await response.json()
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    })
    if (!response.ok) throw new Error('Failed to update workflow')
    return await response.json()
  }

  async deleteWorkflow(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete workflow')
  }

  async executeWorkflow(id: string): Promise<WorkflowExecution> {
    const response = await fetch(`${API_BASE_URL}/api/workflows/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    if (!response.ok) throw new Error('Failed to execute workflow')
    return await response.json()
  }

  async getWorkflowExecution(executionId: string): Promise<WorkflowExecution> {
    const response = await fetch(`${API_BASE_URL}/api/executions/${executionId}`)
    if (!response.ok) throw new Error('Failed to fetch execution')
    return await response.json()
  }

  // Tool APIs
  async getTools(): Promise<Tool[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tools`)
      if (!response.ok) throw new Error('Failed to fetch tools')
      return await response.json()
    } catch (error) {
      console.error('Error fetching tools:', error)
      return []
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      return response.ok
    } catch (error) {
      return false
    }
  }
}

export const apiService = new ApiService()
