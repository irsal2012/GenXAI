/**
 * Agent Builder Page - Visual drag-and-drop interface for creating agents
 * Combines ToolPalette and AgentBuilderCanvas for intuitive agent creation
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateAgent } from '../services/agents'
import ToolPalette from '../components/agent/ToolPalette'
import AgentBuilderCanvas, { type AgentData } from '../components/agent/AgentBuilderCanvas'

const AgentBuilderPage = () => {
  const navigate = useNavigate()
  const createAgent = useCreateAgent()
  const [agentData, setAgentData] = useState<AgentData | null>(null)
  const [validationError, setValidationError] = useState<string>('')

  const handleAgentChange = (data: AgentData) => {
    setAgentData(data)
    setValidationError('')
  }

  const validateAgent = (): boolean => {
    if (!agentData) {
      setValidationError('Agent data is missing')
      return false
    }

    if (!agentData.role || agentData.role.trim() === '') {
      setValidationError('Role is required')
      return false
    }

    if (!agentData.goal || agentData.goal.trim() === '') {
      setValidationError('Goal is required')
      return false
    }

    return true
  }

  const handleCreateAgent = async () => {
    if (!validateAgent() || !agentData) {
      return
    }

    try {
      await createAgent.mutateAsync({
        role: agentData.role,
        goal: agentData.goal,
        backstory: agentData.backstory || undefined,
        llm_model: agentData.llm_model,
        tools: agentData.tools,
        metadata: agentData.metadata,
      })

      // Navigate back to agents page on success
      navigate('/agents')
    } catch (error) {
      console.error('Failed to create agent:', error)
      setValidationError('Failed to create agent. Please try again.')
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/agents')
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Visual Agent Builder</h1>
            <p className="text-sm text-slate-500 mt-1">
              Drag and drop tools to create your AI agent
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAgent}
              disabled={createAgent.isPending}
              className="rounded-xl bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createAgent.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Agent'
              )}
            </button>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Error:</strong> {validationError}
            </p>
          </div>
        )}

        {/* Success Message */}
        {createAgent.isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>✓ Success:</strong> Agent created successfully!
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ToolPalette />
        <AgentBuilderCanvas onAgentChange={handleAgentChange} />
      </div>

      {/* Help Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-t border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              <strong>Tip:</strong> Drag tools from the left panel and drop them onto the canvas to add capabilities to your agent
            </span>
          </div>
          <div className="text-slate-500">
            {agentData?.tools.length || 0} tool{agentData?.tools.length !== 1 ? 's' : ''} selected
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentBuilderPage
