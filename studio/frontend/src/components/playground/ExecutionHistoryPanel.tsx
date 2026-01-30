import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline'

interface ExecutionHistoryEntry {
  id: string
  toolName: string
  parameters: Record<string, any>
  result: any
  timestamp: Date
  executionTime: number
  success: boolean
  error?: string
}

interface ExecutionHistoryPanelProps {
  history: ExecutionHistoryEntry[]
  onRerun: (entry: ExecutionHistoryEntry) => void
  onClear: () => void
}

const ExecutionHistoryPanel = ({ history, onRerun, onClear }: ExecutionHistoryPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)

  if (history.length === 0) {
    return null
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-base font-semibold hover:text-primary-600"
        >
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
          Execution History ({history.length})
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
        >
          <TrashIcon className="h-4 w-4" />
          Clear
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-lg border p-3 cursor-pointer transition ${
                selectedEntry === entry.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{entry.toolName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        entry.success
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {entry.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {entry.timestamp.toLocaleString()} • {entry.executionTime.toFixed(2)}s
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRerun(entry)
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Re-run
                </button>
              </div>

              {selectedEntry === entry.id && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="mb-2">
                    <div className="text-xs font-semibold text-slate-700 mb-1">Parameters:</div>
                    <pre className="text-xs bg-slate-900 text-slate-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(entry.parameters, null, 2)}
                    </pre>
                  </div>
                  {entry.error ? (
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-red-700 mb-1">Error:</div>
                      <div className="text-xs bg-red-50 text-red-700 p-2 rounded">
                        {entry.error}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1">Result:</div>
                      <pre className="text-xs bg-slate-900 text-slate-100 p-2 rounded overflow-x-auto max-h-40">
                        {JSON.stringify(entry.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExecutionHistoryPanel
