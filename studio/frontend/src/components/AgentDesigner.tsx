import { useState } from 'react'

interface Agent {
  id: string
  name: string
  role: string
  goal: string
  backstory: string
  tools: string[]
  status: 'active' | 'draft' | 'inactive'
}

export default function AgentDesigner() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Research Agent',
      role: 'Research Specialist',
      goal: 'Gather and analyze information from various sources',
      backstory: 'Expert in web research and data gathering with years of experience',
      tools: ['web_search', 'file_reader', 'data_analyzer'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Writer Agent',
      role: 'Content Creator',
      goal: 'Create high-quality content based on research',
      backstory: 'Professional writer with expertise in various content formats',
      tools: ['text_generator', 'grammar_checker', 'style_analyzer'],
      status: 'draft'
    },
    {
      id: '3',
      name: 'Code Agent',
      role: 'Software Developer',
      goal: 'Write, review, and optimize code',
      backstory: 'Senior developer with full-stack expertise',
      tools: ['code_generator', 'code_analyzer', 'debugger'],
      status: 'active'
    }
  ])

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    name: '',
    role: '',
    goal: '',
    backstory: '',
    tools: [],
    status: 'draft'
  })

  const availableTools = [
    'web_search', 'file_reader', 'calculator', 'email_sender',
    'database_query', 'api_caller', 'image_generator', 'text_analyzer',
    'data_transformer', 'code_generator', 'grammar_checker', 'debugger'
  ]

  const createAgent = () => {
    if (newAgent.name && newAgent.role) {
      const agent: Agent = {
        id: Date.now().toString(),
        name: newAgent.name,
        role: newAgent.role,
        goal: newAgent.goal || '',
        backstory: newAgent.backstory || '',
        tools: newAgent.tools || [],
        status: 'draft'
      }
      setAgents([...agents, agent])
      setNewAgent({ name: '', role: '', goal: '', backstory: '', tools: [], status: 'draft' })
      setIsCreating(false)
    }
  }

  const deleteAgent = (id: string) => {
    setAgents(agents.filter(a => a.id !== id))
    setSelectedAgent(null)
  }

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(agents.map(a => a.id === id ? { ...a, ...updates } : a))
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'draft': return 'bg-yellow-500/20 text-yellow-400'
      case 'inactive': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const selectedAgentData = agents.find(a => a.id === selectedAgent)

  return (
    <div className="h-full flex">
      {/* Agent List */}
      <div className="w-80 bg-slate-800/50 border-r border-purple-500/20 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Agents</h3>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition"
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
                  ? 'bg-purple-600/30 border border-purple-500'
                  : 'bg-slate-700/50 border border-transparent hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{agent.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </div>
              <p className="text-sm text-gray-400">{agent.role}</p>
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
      <div className="flex-1 p-6 overflow-y-auto">
        {isCreating ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Agent</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name *</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Research Agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                <input
                  type="text"
                  value={newAgent.role}
                  onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                  className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Research Specialist"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goal</label>
                <textarea
                  value={newAgent.goal}
                  onChange={(e) => setNewAgent({ ...newAgent, goal: e.target.value })}
                  className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 h-24"
                  placeholder="What is the agent's primary objective?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Backstory</label>
                <textarea
                  value={newAgent.backstory}
                  onChange={(e) => setNewAgent({ ...newAgent, backstory: e.target.value })}
                  className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 h-32"
                  placeholder="Provide context and background for the agent"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={createAgent}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Create Agent
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition"
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
                <h2 className="text-2xl font-bold text-white">{selectedAgentData.name}</h2>
                <p className="text-gray-400 mt-1">{selectedAgentData.role}</p>
              </div>
              <div className="flex space-x-2">
                <select
                  value={selectedAgentData.status}
                  onChange={(e) => updateAgent(selectedAgentData.id, { status: e.target.value as Agent['status'] })}
                  className="bg-slate-700 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  onClick={() => deleteAgent(selectedAgentData.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Goal</label>
                    <textarea
                      value={selectedAgentData.goal}
                      onChange={(e) => updateAgent(selectedAgentData.id, { goal: e.target.value })}
                      className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Backstory</label>
                    <textarea
                      value={selectedAgentData.backstory}
                      onChange={(e) => updateAgent(selectedAgentData.id, { backstory: e.target.value })}
                      className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 h-32"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Tools</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTools.map((tool) => (
                    <button
                      key={tool}
                      onClick={() => toggleTool(selectedAgentData.id, tool)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedAgentData.tools.includes(tool)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {tool.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                <div className="flex space-x-4">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">
                    Deploy Agent
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
                    Test Agent
                  </button>
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition">
                    Export Config
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No Agent Selected</h3>
              <p className="text-gray-400 mb-6">Select an agent from the list or create a new one</p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition"
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
