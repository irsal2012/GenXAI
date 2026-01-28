import { useEffect, useState } from 'react'
import { apiService, Agent } from '../services/api'

export default function AgentDesigner() {
  const [agents, setAgents] = useState<Agent[]>([])

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    role: '',
    goal: '',
    backstory: '',
    llm_model: 'gpt-4',
    tools: [],
    metadata: {}
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableTools = [
    'web_search', 'file_reader', 'calculator', 'email_sender',
    'database_query', 'api_caller', 'image_generator', 'text_analyzer',
    'data_transformer', 'code_generator', 'grammar_checker', 'debugger'
  ]

  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiService.getAgents()
        setAgents(data)
      } catch (err) {
        setError('Unable to load agents')
      } finally {
        setIsLoading(false)
      }
    }

    loadAgents()
  }, [])

  const createAgent = async () => {
    if (newAgent.role && newAgent.goal) {
      try {
        const created = await apiService.createAgent({
          role: newAgent.role,
          goal: newAgent.goal,
          backstory: newAgent.backstory || '',
          llm_model: newAgent.llm_model || 'gpt-4',
          tools: newAgent.tools || [],
          metadata: newAgent.metadata || {},
        } as Omit<Agent, 'id'>)
        setAgents(prev => [...prev, created])
        setNewAgent({ role: '', goal: '', backstory: '', llm_model: 'gpt-4', tools: [], metadata: {} })
        setIsCreating(false)
      } catch (err) {
        setError('Unable to create agent')
      }
    }
  }

  const deleteAgent = async (id: string) => {
    try {
      await apiService.deleteAgent(id)
      setAgents(agents.filter(a => a.id !== id))
      setSelectedAgent(null)
    } catch (err) {
      setError('Unable to delete agent')
    }
  }

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    try {
      const updated = await apiService.updateAgent(id, updates)
      setAgents(agents.map(a => a.id === id ? updated : a))
    } catch (err) {
      setError('Unable to update agent')
    }
  }

  const toggleTool = (agentId: string, tool: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (agent) {
      const tools = agent.tools.includes(tool)
        ? agent.tools.filter(t => t !== tool)
        : [...agent.tools, tool]
      updateAgent(agentId, { tools })
    }
  }

  const selectedAgentData = agents.find(a => a.id === selectedAgent)

  return (
    <div className="h-full flex text-slate-200">
      {/* Agent List */}
      <div className="w-80 bg-slate-900/60 border-r border-white/10 p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Agents</h3>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary p-2.5 rounded-xl transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`p-4 rounded-lg cursor-pointer transition ${
                selectedAgent === agent.id
                  ? 'bg-white/10 border border-purple-400/60 shadow-lg shadow-purple-500/20'
                  : 'bg-slate-800/60 border border-transparent hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{agent.role}</h4>
                <span className="badge-pill bg-purple-500/20 text-purple-200">
                  {agent.llm_model}
                </span>
              </div>
              <p className="text-sm text-gray-400">{agent.goal}</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {agent.tools.length} tools
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Details / Editor */}
      <div className="flex-1 p-8 overflow-y-auto">
        {isCreating ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Create New Agent</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 card-elevated rounded-2xl p-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                <input
                  type="text"
                  value={newAgent.role}
                  onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                  className="w-full input-field px-4 py-3"
                  placeholder="e.g., Research Specialist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goal *</label>
                <textarea
                  value={newAgent.goal}
                  onChange={(e) => setNewAgent({ ...newAgent, goal: e.target.value })}
                  className="w-full input-field px-4 py-3 h-24"
                  placeholder="What is the agent's primary objective?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">LLM Model</label>
                <input
                  type="text"
                  value={newAgent.llm_model}
                  onChange={(e) => setNewAgent({ ...newAgent, llm_model: e.target.value })}
                  className="w-full input-field px-4 py-3"
                  placeholder="e.g., gpt-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Backstory</label>
                <textarea
                  value={newAgent.backstory}
                  onChange={(e) => setNewAgent({ ...newAgent, backstory: e.target.value })}
                  className="w-full input-field px-4 py-3 h-32"
                  placeholder="Provide context and background for the agent"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={createAgent}
                  className="flex-1 btn-primary py-3 px-6 rounded-xl"
                >
                  Create Agent
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 btn-secondary py-3 px-6 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : selectedAgentData ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">{selectedAgentData.role}</h2>
                <p className="text-slate-400 mt-1">{selectedAgentData.goal}</p>
              </div>
              <div className="flex space-x-2">
                <span className="badge-pill bg-purple-500/20 text-purple-200">
                  {selectedAgentData.llm_model}
                </span>
                <button
                  onClick={() => deleteAgent(selectedAgentData.id)}
                  className="bg-rose-500/90 hover:bg-rose-500 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-elevated rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Goal</label>
                    <textarea
                      value={selectedAgentData.goal}
                      onChange={(e) => updateAgent(selectedAgentData.id, { goal: e.target.value })}
                      className="w-full input-field px-4 py-3 h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Backstory</label>
                    <textarea
                      value={selectedAgentData.backstory}
                      onChange={(e) => updateAgent(selectedAgentData.id, { backstory: e.target.value })}
                      className="w-full input-field px-4 py-3 h-32"
                    />
                  </div>
                </div>
              </div>

              <div className="card-elevated rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tools</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTools.map((tool) => (
                    <button
                      key={tool}
                      onClick={() => toggleTool(selectedAgentData.id, tool)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedAgentData.tools.includes(tool)
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {tool.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-elevated rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                <div className="flex space-x-4">
                  <button className="flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg shadow-emerald-500/20">
                    Deploy Agent
                  </button>
                  <button className="flex-1 bg-blue-500/90 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg shadow-blue-500/20">
                    Test Agent
                  </button>
                  <button className="flex-1 btn-primary py-3 px-6 rounded-xl">
                    Export Config
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No Agent Selected</h3>
              <p className="text-slate-400 mb-6">Select an agent from the list or create a new one</p>
              <button
                onClick={() => setIsCreating(true)}
                className="btn-primary py-3 px-8 rounded-xl"
              >
                Create New Agent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
