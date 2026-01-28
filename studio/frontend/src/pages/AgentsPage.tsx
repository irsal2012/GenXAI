import { useEffect, useState } from 'react'
import { apiService, Agent } from '../services/api'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import { useToast } from '../components/Toast'

const emptyForm = {
  role: '',
  goal: '',
  backstory: '',
  llm_model: 'gpt-4',
  tools: [] as string[],
  metadata: {} as Record<string, any>,
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toolsText, setToolsText] = useState('')
  const { showToast } = useToast()

  const refreshAgents = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.getAgents()
      setAgents(response)
    } catch (err) {
      showToast('Unable to load agents', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshAgents()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const tools = toolsText.split(',').map((t) => t.trim()).filter(Boolean)

    const payload = {
      ...form,
      tools,
      metadata: form.metadata || {},
    }

    try {
      if (editingId) {
        await apiService.updateAgent(editingId, payload)
        showToast('Agent updated successfully', 'success')
      } else {
        await apiService.createAgent(payload)
        showToast('Agent created successfully', 'success')
      }
      
      setForm(emptyForm)
      setToolsText('')
      setEditingId(null)
      await refreshAgents()
    } catch (err) {
      showToast('Unable to save agent', 'error')
    }
  }

  const startEdit = (agent: Agent) => {
    setEditingId(agent.id)
    setForm({
      role: agent.role,
      goal: agent.goal,
      backstory: agent.backstory,
      llm_model: agent.llm_model,
      tools: agent.tools || [],
      metadata: agent.metadata || {},
    })
    setToolsText((agent.tools || []).join(', '))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setToolsText('')
  }

  const handleDelete = async (agentId: string) => {
    try {
      await apiService.deleteAgent(agentId)
      showToast('Agent deleted', 'success')
      await refreshAgents()
    } catch (err) {
      showToast('Unable to delete agent', 'error')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Agents</h2>
                <p className="text-sm text-slate-400">Manage AI agent configurations</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">Total Agents</div>
              <div className="text-2xl font-bold text-white">{agents.length}</div>
            </div>
            <Button size="sm" onClick={refreshAgents}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Form Section */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-1">
            {editingId ? 'Edit Agent' : 'Create New Agent'}
          </h3>
          <p className="text-sm text-slate-400">Define agent personality, role, and capabilities</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Role"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            placeholder="e.g., Senior Data Analyst"
            required
          />

          <Input
            label="Goal"
            value={form.goal}
            onChange={(e) => setForm((prev) => ({ ...prev, goal: e.target.value }))}
            placeholder="What is the agent's primary objective?"
            required
          />

          <Textarea
            label="Backstory"
            value={form.backstory}
            onChange={(e) => setForm((prev) => ({ ...prev, backstory: e.target.value }))}
            rows={4}
            placeholder="Provide context and personality for the agent..."
            helperText="A compelling backstory helps the agent understand its context"
          />

          <Input
            label="Tools"
            value={toolsText}
            onChange={(e) => setToolsText(e.target.value)}
            placeholder="tool1, tool2, tool3"
            helperText="Comma-separated list of tool names"
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit">
              {editingId ? 'Update Agent' : 'Create Agent'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Agents List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Existing Agents</h3>
        {isLoading ? (
          <Card className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading agents...
            </div>
          </Card>
        ) : agents.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">No agents yet</h4>
              <p className="text-sm text-slate-400">Create your first agent to start building intelligent workflows.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id} hover className="p-5">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{agent.role.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{agent.role}</h4>
                          <p className="text-xs text-slate-400">{agent.llm_model}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-lg font-medium">
                        {agent.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-1">Goal</div>
                      <p className="text-sm text-slate-300">{agent.goal}</p>
                    </div>
                    {agent.backstory && (
                      <div>
                        <div className="text-xs font-semibold text-slate-400 mb-1">Backstory</div>
                        <p className="text-sm text-slate-300 line-clamp-2">{agent.backstory}</p>
                      </div>
                    )}
                  </div>

                  {agent.tools && agent.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {agent.tools.map((tool, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(agent)} className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(agent.id)}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
