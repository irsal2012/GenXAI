import { useMemo, useState } from 'react'
import type { ExecutionResult } from '../../types/api'

interface ExecutionResultsPanelProps {
  execution?: ExecutionResult
  onClose: () => void
  nodeLabels: Record<string, string>
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

const ExecutionResultsPanel = ({ execution, onClose, nodeLabels }: ExecutionResultsPanelProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})

  const nodeResults = useMemo(() => execution?.node_results ?? {}, [execution?.node_results])
  const nodeEntries = useMemo(() => Object.entries(nodeResults), [nodeResults])

  if (!execution) {
    return null
  }

  return (
    <div className="absolute right-6 top-24 z-40 h-[70vh] w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">Execution Results</div>
          <div className="text-[11px] text-slate-500">{execution.id}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
        >
          Close
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto px-4 py-3 text-xs text-slate-600">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="text-[11px] uppercase text-slate-400">Workflow Status</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">{execution.status}</span>
            <span className="text-[11px] text-slate-500">{execution.completed_at}</span>
          </div>
        </div>

        {nodeEntries.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-slate-500">
            No node results available yet.
          </div>
        )}

        {nodeEntries.map(([nodeId, result]) => {
          const isExpanded = expandedNodes[nodeId]
          const statusColor =
            result.status === 'completed'
              ? 'text-emerald-600'
              : result.status === 'failed'
                ? 'text-red-600'
                : 'text-blue-600'

          return (
            <div key={nodeId} className="rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left"
                onClick={() =>
                  setExpandedNodes((prev) => ({
                    ...prev,
                    [nodeId]: !prev[nodeId],
                  }))
                }
              >
                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    {nodeLabels[nodeId] ?? nodeId}
                  </div>
                  <div className="text-[10px] text-slate-400">{nodeId}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold ${statusColor}`}>{result.status}</span>
                  {result.duration_ms !== undefined && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                      {result.duration_ms} ms
                    </span>
                  )}
                  <span className="text-slate-400">{isExpanded ? '−' : '+'}</span>
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-slate-200 px-3 py-2">
                  {result.error && (
                    <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-700">
                      {result.error}
                    </div>
                  )}
                  <pre className="max-h-40 overflow-auto rounded-lg bg-slate-900 p-2 text-[10px] text-slate-100">
                    {formatValue(result.output)}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ExecutionResultsPanel