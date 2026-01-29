/**
 * Agent Details Panel
 * Displays comprehensive agent information when a node is selected
 */

import { useMemo } from 'react'
import type { Node } from '@xyflow/react'

interface AgentNodeData {
  [key: string]: unknown
  label: string
  agentId?: string
  config?: {
    role?: string
    goal?: string
    backstory?: string
    llm_model?: string
    tools?: string[]
    description?: string
    temperature?: number
    max_tokens?: number
    max_iterations?: number
    allow_delegation?: boolean
    verbose?: boolean
    metadata?: Record<string, unknown>
  }
}

interface AgentDetailsPanelProps {
  selectedNode: Node<AgentNodeData> | null
  onClose: () => void
  onConfigure?: (node: Node<AgentNodeData>) => void
}

const AgentDetailsPanel = ({ selectedNode, onClose, onConfigure }: AgentDetailsPanelProps) => {
  const agentData = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'agent') return null
    return selectedNode.data
  }, [selectedNode])

  if (!agentData) return null

  const config = agentData.config || {}
  const tools = config.tools || []
  const hasBackstory = Boolean(config.backstory)
  const hasMetadata = config.metadata && Object.keys(config.metadata).length > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <h3 className="text-sm font-semibold text-slate-800 truncate">{agentData.label}</h3>
            </div>
            {config.role && config.role !== agentData.label && (
              <p className="text-xs text-slate-600 mt-0.5">{config.role}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Goal */}
        {config.goal && (
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Goal</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{config.goal}</p>
          </div>
        )}

        {/* Description */}
        {config.description && config.description !== config.goal && (
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{config.description}</p>
          </div>
        )}

        {/* LLM Configuration */}
        {config.llm_model && (
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">LLM Configuration</h4>
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Model</span>
                <span className="text-xs font-medium text-slate-800 bg-blue-100 px-2 py-0.5 rounded">
                  {config.llm_model}
                </span>
              </div>
              {config.temperature !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Temperature</span>
                  <span className="text-xs font-medium text-slate-800">{config.temperature}</span>
                </div>
              )}
              {config.max_tokens !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Max Tokens</span>
                  <span className="text-xs font-medium text-slate-800">{config.max_tokens}</span>
                </div>
              )}
              {config.max_iterations !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Max Iterations</span>
                  <span className="text-xs font-medium text-slate-800">{config.max_iterations}</span>
                </div>
              )}
              {config.allow_delegation !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Allow Delegation</span>
                  <span className="text-xs font-medium text-slate-800">
                    {config.allow_delegation ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              )}
              {config.verbose !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Verbose Mode</span>
                  <span className="text-xs font-medium text-slate-800">
                    {config.verbose ? '✓ Enabled' : '✗ Disabled'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tools */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
            Tools {tools.length > 0 && <span className="text-slate-500">({tools.length})</span>}
          </h4>
          {tools.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No tools assigned</p>
          ) : (
            <div className="space-y-1.5">
              {tools.map((tool, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="text-xs">🔧</span>
                  <span className="text-xs font-medium text-slate-700">{tool}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Backstory */}
        {hasBackstory && (
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Backstory</h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{config.backstory}</p>
            </div>
          </div>
        )}

        {/* Metadata */}
        {hasMetadata && (
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Additional Metadata</h4>
            <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
              {Object.entries(config.metadata!).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-slate-600 font-medium">{key}:</span>
                  <span className="text-xs text-slate-800 text-right break-all">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Node Info */}
        <div className="pt-3 border-t border-slate-200">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Node Information</h4>
          <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Node ID</span>
              <span className="text-xs font-mono text-slate-800">{selectedNode?.id}</span>
            </div>
            {agentData.agentId && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Agent ID</span>
                <span className="text-xs font-mono text-slate-800">{agentData.agentId}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Type</span>
              <span className="text-xs font-medium text-slate-800">Agent Node</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      {onConfigure && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => selectedNode && onConfigure(selectedNode)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Configure Agent
          </button>
        </div>
      )}
    </div>
  )
}

export default AgentDetailsPanel
