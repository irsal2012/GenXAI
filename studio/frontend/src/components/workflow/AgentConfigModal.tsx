/**
 * Agent Configuration Modal
 * Allows users to configure agent properties and assign tools
 */

import { useState, useEffect } from 'react'
import { useTools } from '../../services/tools'

interface AgentConfigModalProps {
  isOpen: boolean
  onClose: () => void
  agentData: {
    id: string
    label: string
    config?: {
      role?: string
      goal?: string
      tools?: string[]
      description?: string
    }
  }
  onSave: (updatedConfig: any) => void
}

const AgentConfigModal = ({ isOpen, onClose, agentData, onSave }: AgentConfigModalProps) => {
  const { data: availableTools, isLoading: toolsLoading } = useTools()
  const [selectedTools, setSelectedTools] = useState<string[]>(agentData.config?.tools || [])

  useEffect(() => {
    setSelectedTools(agentData.config?.tools || [])
  }, [agentData])

  if (!isOpen) return null

  const handleToolToggle = (toolName: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolName) ? prev.filter((t) => t !== toolName) : [...prev, toolName]
    )
  }

  const handleSave = () => {
    onSave({
      ...agentData.config,
      tools: selectedTools,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Configure Agent</h2>
          <p className="text-sm text-slate-600 mt-1">{agentData.label}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Agent Info */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Agent Information</h3>
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div>
                <span className="text-xs font-medium text-slate-600">Role:</span>
                <p className="text-sm text-slate-800">{agentData.config?.role || agentData.label}</p>
              </div>
              {agentData.config?.goal && (
                <div>
                  <span className="text-xs font-medium text-slate-600">Goal:</span>
                  <p className="text-sm text-slate-800">{agentData.config.goal}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tools Selection */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Assign Tools</h3>
            <p className="text-xs text-slate-500 mb-3">
              Select the tools this agent can use to accomplish its goals
            </p>

            {toolsLoading && (
              <div className="text-sm text-slate-500 italic">Loading tools...</div>
            )}

            {!toolsLoading && (!availableTools || availableTools.length === 0) && (
              <div className="text-sm text-slate-500 italic">
                No tools available. Create tools first in the Tools page.
              </div>
            )}

            {!toolsLoading && availableTools && availableTools.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3">
                {availableTools.map((tool) => (
                  <label
                    key={tool.name}
                    className="flex items-start gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTools.includes(tool.name)}
                      onChange={() => handleToolToggle(tool.name)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700">{tool.name}</div>
                      {tool.description && (
                        <div className="text-xs text-slate-500 mt-0.5">{tool.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Selected Tools Summary */}
            {selectedTools.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs font-medium text-blue-700 mb-1">
                  Selected Tools ({selectedTools.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedTools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {tool}
                      <button
                        onClick={() => handleToolToggle(tool)}
                        className="hover:text-blue-900"
                        title="Remove tool"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default AgentConfigModal
