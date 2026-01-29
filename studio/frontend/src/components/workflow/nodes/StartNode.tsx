import { memo } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import type { Node, NodeProps } from '@xyflow/react'

interface StartNodeData {
  [key: string]: unknown
  label: string
}

type StartNodeType = Node<StartNodeData, 'start'>

const StartNode = memo(({ id, data, isConnectable, selected }: NodeProps<StartNodeType>) => {
  const { deleteElements } = useReactFlow()

  const containerClass = selected
    ? 'border-green-500 bg-green-50'
    : 'border-green-500 bg-white hover:bg-green-50'

  return (
    <div
      className={`relative flex items-center justify-center px-4 py-2 rounded-lg border-2 shadow-sm min-w-[140px] transition-colors ${containerClass}`}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-green-500 !w-3 !h-3"
      />

      {/* Content */}
      <div className="text-sm font-semibold text-slate-800">{data.label}</div>

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

StartNode.displayName = 'StartNode'

export default StartNode
