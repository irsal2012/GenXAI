import type { ReactFlowNode } from '../../utils/workflowConverter'

interface ExecutionOverlayProps {
  nodeStatuses: Record<string, 'running' | 'completed' | 'failed' | 'pending'>
  lastEvent?: {
    node_id: string
    status: string
    timestamp: number
  }
  nodes: ReactFlowNode[]
}

const ExecutionOverlay = ({ nodeStatuses, lastEvent, nodes }: ExecutionOverlayProps) => {
  const totalNodes = nodes.length
  const completedNodes = Object.values(nodeStatuses).filter((status) => status === 'completed').length
  const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0

  return (
    <div className="absolute right-6 top-6 z-30 w-72 rounded-2xl border border-white/40 bg-white/90 p-4 text-xs text-slate-600 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">Execution Status</div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
          {progress}%
        </span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 space-y-2">
        {lastEvent ? (
          <div>
            <div className="text-[10px] uppercase text-slate-400">Last Event</div>
            <div className="text-xs text-slate-700">
              {lastEvent.node_id} → {lastEvent.status}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500">No execution events yet.</div>
        )}
      </div>
    </div>
  )
}

export default ExecutionOverlay