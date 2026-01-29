import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

interface BaseNodeProps {
  data: {
    label: string
    config?: Record<string, any>
  }
  isConnectable?: boolean
  color?: string
  icon?: React.ReactNode
  showSourceHandle?: boolean
  showTargetHandle?: boolean
}

const BaseNode = memo(({
  data,
  isConnectable = true,
  color = '#3b82f6',
  icon,
  showSourceHandle = true,
  showTargetHandle = true,
}: BaseNodeProps) => {
  return (
    <div
      className="rounded-xl border-2 bg-white px-4 py-3 shadow-md min-w-[150px]"
      style={{ borderColor: color }}
    >
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="!bg-slate-400"
        />
      )}
      
      <div className="flex items-center gap-2">
        {icon && (
          <div className="flex-shrink-0" style={{ color }}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-900">{data.label}</div>
          {data.config?.description && (
            <div className="text-xs text-slate-500 mt-1">{data.config.description}</div>
          )}
        </div>
      </div>

      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="!bg-slate-400"
        />
      )}
    </div>
  )
})

BaseNode.displayName = 'BaseNode'

export default BaseNode
