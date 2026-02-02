import { memo } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import type { Node, NodeProps } from '@xyflow/react'

interface EndNodeData {
  [key: string]: unknown
  label: string
}

type EndNodeType = Node<EndNodeData, 'end'>

const EndNode = memo(({ id, data, isConnectable, selected }: NodeProps<EndNodeType>) => {
  const { deleteElements } = useReactFlow()
  const status = (data as { status?: string }).status
  const statusStyles: Record<string, string> = {
    running: 'border-blue-500 bg-blue-50/80',
    completed: 'border-emerald-500 bg-emerald-50/80',
    failed: 'border-red-500 bg-red-50/80',
  }

  const containerClass = selected
    ? 'border-red-500 bg-red-50'
    : 'border-red-500 bg-white hover:bg-red-50'

  return (
    <div
      className={`relative flex items-start gap-2 px-3 py-2 rounded-lg border-2 shadow-sm min-w-[180px] transition-colors ${
        status ? statusStyles[status] || containerClass : containerClass
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!bg-red-500 !w-3 !h-3"
      />

      {/* Icon */}
      <div className="flex-shrink-0 w-8 h-8 bg-slate-400 rounded flex items-center justify-center text-white text-lg mt-0.5">
        ◼
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{data.label}</div>
        <div className="text-xs text-slate-500">Workflow exit point</div>
      </div>
      {status && (
        <div className="absolute top-2 right-2 rounded-full bg-white/80 px-2 py-0.5 text-[9px] uppercase text-slate-500">
          {status}
        </div>
      )}

      {/* Delete button (always visible on hover) */}
      <button
        type="button"
        title="Delete node"
        aria-label="Delete node"
        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 border border-red-600 text-white hover:bg-red-600 shadow-md flex items-center justify-center text-xs font-bold opacity-0 hover:!opacity-100 transition-opacity z-10"
        style={{ opacity: selected ? 1 : undefined }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          deleteElements({ nodes: [{ id }] })
        }}
      >
        ×
      </button>
    </div>
  )
})

EndNode.displayName = 'EndNode'

export default EndNode
