import { Handle, Position, type NodeProps } from '@xyflow/react'

const SubworkflowNode = ({ data }: NodeProps) => {
  const status = (data as { status?: string }).status
  const statusStyles: Record<string, string> = {
    running: 'border-blue-500 bg-blue-50/80',
    completed: 'border-emerald-500 bg-emerald-50/80',
    failed: 'border-red-500 bg-red-50/80',
  }
  return (
    <div
      className={`rounded-xl border-2 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow ${
        status ? statusStyles[status] || 'border-slate-400' : 'border-slate-400'
      }`}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#6b7280' }} />
      <div className="flex items-center gap-2">
        <span>🧩</span>
        <span>{String(data.label || 'Subworkflow')}</span>
      </div>
      {status && (
        <div className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase text-slate-500">
          {status === 'running' && (
            <span className="inline-flex h-2.5 w-2.5 animate-spin items-center justify-center rounded-full border border-blue-400 border-t-transparent" />
          )}
          {status}
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: '#6b7280' }} />
    </div>
  )
}

export default SubworkflowNode