import { memo } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import type { Node, NodeProps } from '@xyflow/react'

interface AgentNodeData {
  // ReactFlow's Node generic constrains `data` to Record<string, unknown>
  // so we extend it to keep strong typing while satisfying the constraint.
  [key: string]: unknown
  label: string
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

type AgentNodeType = Node<AgentNodeData, 'agent'>

const AgentNode = memo(({ id, data, isConnectable, selected }: NodeProps<AgentNodeType>) => {
  const { deleteElements } = useReactFlow()

  const containerClass = selected
    ? 'border-blue-500 bg-blue-50'
    : 'border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300'

  const tools = data.config?.tools || []
  const hasTools = tools.length > 0
  const llmModel = data.config?.llm_model
  const backstory = data.config?.backstory
  const backstoryPreview = backstory ? backstory.substring(0, 50) + (backstory.length > 50 ? '...' : '') : null

  // Tooltip content for full information
  const tooltipContent = [
    data.label,
    data.config?.role && data.config.role !== data.label ? `Role: ${data.config.role}` : null,
    data.config?.goal ? `Goal: ${data.config.goal}` : null,
    llmModel ? `Model: ${llmModel}` : null,
    hasTools ? `Tools: ${tools.join(', ')}` : null,
  ].filter(Boolean).join('\n')

  return (
    <div
      className={`relative flex flex-col gap-1 px-2 py-1.5 rounded-lg border shadow-sm min-w-[160px] max-w-[220px] transition-colors ${containerClass}`}
      title={tooltipContent}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-blue-500 !w-3 !h-3"
      />

      {/* Header with icon, label, and LLM badge */}
      <div className="flex items-start gap-1.5">
        {/* Icon */}
        <div className="text-sm leading-none mt-0.5">🤖</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 justify-between">
            <div className="text-[11px] leading-4 font-medium text-slate-700 truncate">{data.label}</div>
            {llmModel && (
              <span className="text-[9px] leading-3 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium whitespace-nowrap">
                {llmModel}
              </span>
            )}
          </div>
          {(data.config?.goal || data.config?.description || data.config?.role) && (
            <div className="text-[11px] leading-4 text-slate-500 truncate">
              {data.config?.goal || data.config?.description || data.config?.role}
            </div>
          )}
        </div>
      </div>

      {/* Backstory preview */}
      {backstoryPreview && (
        <div className="flex items-start gap-1 pt-1 border-t border-slate-200">
          <div className="text-[10px] leading-none mt-0.5">📝</div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] leading-3 text-slate-600 truncate" title={backstory}>
              {backstoryPreview}
            </div>
          </div>
        </div>
      )}

      {/* Tools section - show individual tools when 3 or fewer, otherwise show count */}
      {hasTools && (
        <div className="flex items-start gap-1 pt-1 border-t border-slate-200">
          <div className="text-[10px] leading-none mt-0.5">🔧</div>
          <div className="flex-1 min-w-0">
            {tools.length <= 3 ? (
              <div className="flex flex-wrap gap-0.5">
                {tools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] leading-3 px-1 py-0.5 bg-slate-100 text-slate-700 rounded"
                    title={tool}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[10px] leading-3 text-slate-600 truncate" title={tools.join(', ')}>
                {tools.length} tool{tools.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete button (always visible on hover) */}
      <button
        type="button"
        title="Delete node"
        aria-label="Delete node"
        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 border border-red-600 text-white hover:bg-red-600 shadow-md flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity z-10"
        style={{ opacity: selected ? 1 : undefined }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // ReactFlow will also remove connected edges
          deleteElements({ nodes: [{ id }] })
        }}
      >
        ×
      </button>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  )
})

AgentNode.displayName = 'AgentNode'

export default AgentNode
