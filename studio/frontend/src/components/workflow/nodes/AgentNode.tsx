import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { Node, NodeProps } from '@xyflow/react'

interface AgentNodeData {
  // ReactFlow's Node generic constrains `data` to Record<string, unknown>
  // so we extend it to keep strong typing while satisfying the constraint.
  [key: string]: unknown
  label: string
  config?: {
    role?: string
    goal?: string
    tools?: string[]
    description?: string
  }
}

type AgentNodeType = Node<AgentNodeData, 'agent'>

const AgentNode = memo(({ data, isConnectable, selected }: NodeProps<AgentNodeType>) => {
  const containerClass = selected
    ? 'border-blue-500 bg-blue-50'
    : 'border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300'

  return (
    <div
      className={`flex items-start gap-2 p-2 rounded-lg border shadow-sm min-w-[220px] max-w-[320px] transition-colors ${containerClass}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-blue-500 !w-3 !h-3"
      />

      {/* Icon */}
      <div className="text-lg leading-none mt-0.5">🤖</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-700 truncate">{data.label}</div>
        {(data.config?.goal || data.config?.description || data.config?.role) && (
          <div className="text-xs text-slate-500 truncate">
            {data.config?.goal || data.config?.description || data.config?.role}
          </div>
        )}
      </div>

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
