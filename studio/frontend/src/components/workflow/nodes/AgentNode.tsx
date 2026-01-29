import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'

interface AgentNodeData {
  label: string
  config?: {
    role?: string
    goal?: string
    tools?: string[]
    description?: string
  }
}

const AgentNode = memo(({ data, isConnectable }: NodeProps<AgentNodeData>) => {
  const color = '#3b82f6' // blue

  return (
    <div
      className="rounded-xl border-2 bg-white px-4 py-3 shadow-lg min-w-[180px] max-w-[250px]"
      style={{ borderColor: color }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-blue-500 !w-3 !h-3"
      />
      
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5" style={{ color }}>
          <UserCircleIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate">{data.label}</div>
          {data.config?.role && (
            <div className="text-xs text-slate-600 mt-1 truncate">{data.config.role}</div>
          )}
          {data.config?.tools && data.config.tools.length > 0 && (
            <div className="text-xs text-slate-500 mt-1">
              {data.config.tools.length} tool{data.config.tools.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
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
