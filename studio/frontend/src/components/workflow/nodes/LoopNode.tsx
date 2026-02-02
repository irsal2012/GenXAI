import { Handle, Position, type NodeProps } from '@xyflow/react'

const LoopNode = ({ data }: NodeProps) => {
  const status = (data as { status?: string }).status
  const statusStyles: Record<string, string> = {
    running: 'border-blue-500 bg-blue-50/80',
    completed: 'border-emerald-500 bg-emerald-50/80',
    failed: 'border-red-500 bg-red-50/80',
  }
  return (
    <div
      className={`rounded-xl border-2 bg-white px-4 py-2 text-xs font-semibold text-purple-700 shadow ${
        status ? statusStyles[status] || 'border-purple-400' : 'border-purple-400'
      }`}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#a855f7' }} />
      <div className="flex items-center gap-2">
        <span>🔁</span>
        <span>{String(data.label || 'Loop')}</span>
      </div>
      {status && (
        <div className="mt-1 text-[10px] uppercase text-slate-500">{status}</div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: '#a855f7' }} />
    </div>
  )
}

export default LoopNode