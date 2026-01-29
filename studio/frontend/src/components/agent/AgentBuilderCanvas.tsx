/**
 * Agent Builder Canvas - Drop zone and configuration area for building agents
 * Handles tool drops and agent property configuration
 */

import { useState, useCallback } from 'react'
import type { ToolSummary } from '../../types/api'

interface AgentBuilderCanvasProps {
  onAgentChange?: (agentData: AgentData) => void
}

export interface AgentData {
  role: string
  goal: string
  backstory: string
  llm_model: string
  tools: string[]
  metadata: Record<string, unknown>
}

const AgentBuilderCanvas = ({ onAgentChange }: AgentBuilderCanvasProps) => {
  const [agentData, setAgentData] = useState<AgentData>({
    role: '',
    goal: '',
    backstory: '',
    llm_model: 'gpt-4',
    tools: [],
    metadata: {},
  })

  const [selectedTools, setSelectedTools] = useState<ToolSummary[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Update parent component when agent data changes
  const updateAgentData = useCallback(
    (updates: Partial<AgentData>) => {
      const newData = { ...agentData, ...updates }
      setAgentData(newData)
      onAgentChange?.(newData)
    },
    [agentData, onAgentChange]
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDraggingOver(false)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDraggingOver(false)

      const toolData = event.dataTransfer.getData('application/tool')
      if (!toolData) return

      try {
        const tool: ToolSummary = JSON.parse(toolData)
        
        // Check if tool already exists
        if (selectedTools.some((t) => t.name === tool.name)) {
          return
        }

        const newTools = [...selectedTools, tool]
        setSelectedTools(newTools)
        updateAgentData({ tools: newTools.map((t) => t.name) })
      } catch (error) {
        console.error('Failed to parse tool data:', error)
      }
    },
    [selectedTools, updateAgentData]
  )

  const handleRemoveTool = useCallback(
    (toolName: string) => {
      const newTools = selectedTools.filter((t) => t.name !== toolName)
      setSelectedTools(newTools)
      updateAgentData({ tools: newTools.map((t) => t.name) })
    },
    [selectedTools, updateAgentData]
  )

  // Color mapping for categories
  const categoryColors: Record<string, string> = {
    computation: '#8b5cf6',
    file: '#3b82f6',
    web: '#10b981',
    database: '#f59e0b',
    api: '#ef4444',
    default: '#6b7280',
  }

  const getCategoryColor = (category: string) => {
    return categoryColors[category.toLowerCase()] || categoryColors.default
  }

  const categoryIcons: Record<string, string> = {
    computation: '🧮',
    file: '📁',
    web: '🌐',
    database: '🗄️',
    api: '🔌',
    default: '🔧',
  }

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category.toLowerCase()] || categoryIcons.default
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Agent Configuration Form */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Agent Configuration</h3>
          
          <div className="space-y-4">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={agentData.role}
                onChange={(e) => updateAgentData({ role: e.target.value })}
                placeholder="e.g., Research Assistant, Data Analyst, Content Writer"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Goal <span className="text-red-500">*</span>
              </label>
              <textarea
                value={agentData.goal}
                onChange={(e) => updateAgentData({ goal: e.target.value })}
                placeholder="Describe what this agent should accomplish..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Backstory */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Backstory
              </label>
              <textarea
                value={agentData.backstory}
                onChange={(e) => updateAgentData({ backstory: e.target.value })}
                placeholder="Provide context about the agent's expertise and background..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* LLM Model */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                LLM Model
              </label>
              <select
                value={agentData.llm_model}
                onChange={(e) => updateAgentData({ llm_model: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tools Drop Zone */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Agent Tools ({selectedTools.length})
          </h3>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`min-h-[300px] border-2 border-dashed rounded-xl p-6 transition-all ${
              isDraggingOver
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-300 bg-white'
            }`}
          >
            {selectedTools.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-6xl mb-4">🔧</div>
                <h4 className="text-lg font-medium text-slate-700 mb-2">
                  {isDraggingOver ? 'Drop tool here' : 'No tools added yet'}
                </h4>
                <p className="text-sm text-slate-500 max-w-md">
                  Drag and drop tools from the left sidebar to equip your agent with capabilities
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-start gap-3 p-4 rounded-lg border-2 border-slate-200 bg-white hover:shadow-md transition-all"
                    style={{
                      borderLeftColor: getCategoryColor(tool.category),
                      borderLeftWidth: '4px',
                    }}
                  >
                    <div className="text-2xl flex-shrink-0">
                      {getCategoryIcon(tool.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700">
                        {tool.name}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {tool.description}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: getCategoryColor(tool.category) }}
                        >
                          {tool.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTool(tool.name)}
                      className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove tool"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTools.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>✓ {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''} added:</strong>{' '}
                {selectedTools.map((t) => t.name).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Agent Summary */}
        <div className="card p-6 bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Agent Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Role:</span>
              <span className="text-slate-600">{agentData.role || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Model:</span>
              <span className="text-slate-600">{agentData.llm_model}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Tools:</span>
              <span className="text-slate-600">
                {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentBuilderCanvas
