// Local storage service for persisting data

export class StorageService {
  private prefix = 'genxai_'

  // Generic storage methods
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key))
  }

  // Workflow-specific methods
  saveWorkflow(id: string, workflow: any): void {
    const workflows = this.getWorkflows()
    const index = workflows.findIndex(w => w.id === id)
    if (index >= 0) {
      workflows[index] = workflow
    } else {
      workflows.push(workflow)
    }
    this.set('workflows', workflows)
  }

  getWorkflows(): any[] {
    return this.get('workflows') || []
  }

  deleteWorkflow(id: string): void {
    const workflows = this.getWorkflows().filter(w => w.id !== id)
    this.set('workflows', workflows)
  }

  // Agent-specific methods
  saveAgent(id: string, agent: any): void {
    const agents = this.getAgents()
    const index = agents.findIndex(a => a.id === id)
    if (index >= 0) {
      agents[index] = agent
    } else {
      agents.push(agent)
    }
    this.set('agents', agents)
  }

  getAgents(): any[] {
    return this.get('agents') || []
  }

  deleteAgent(id: string): void {
    const agents = this.getAgents().filter(a => a.id !== id)
    this.set('agents', agents)
  }

  // Tool-specific methods
  saveToolState(toolId: string, installed: boolean): void {
    const toolStates = this.getToolStates()
    toolStates[toolId] = installed
    this.set('tool_states', toolStates)
  }

  getToolStates(): Record<string, boolean> {
    return this.get('tool_states') || {}
  }

  // Settings
  saveSettings(settings: any): void {
    this.set('settings', settings)
  }

  getSettings(): any {
    return this.get('settings') || {
      theme: 'dark',
      autoSave: true,
      backendUrl: 'http://localhost:8000'
    }
  }

  // Recent activity
  addRecentActivity(activity: { type: string; id: string; name: string; timestamp: number }): void {
    const activities = this.getRecentActivities()
    activities.unshift(activity)
    // Keep only last 20 activities
    this.set('recent_activities', activities.slice(0, 20))
  }

  getRecentActivities(): any[] {
    return this.get('recent_activities') || []
  }
}

export const storageService = new StorageService()
