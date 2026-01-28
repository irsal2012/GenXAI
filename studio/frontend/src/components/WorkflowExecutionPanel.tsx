import { useState, useEffect } from 'react'
import { apiService, WorkflowExecution } from '../services/api'

interface Props {
  executionId: string | null
  onClose: () => void
}

export default function WorkflowExecutionPanel({ executionId, onClose }: Props) {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!executionId) return

    const fetchExecution = async () => {
      setLoading(true)
      try {
        const data = await apiService.getWorkflowExecution(executionId)
        setExecution(data)
      } catch (error) {
        console.error('Error fetching execution:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExecution()

    // Poll for updates if execution is running
    const interval = setInterval(() => {
      if (execution?.status === 'running') {
        fetchExecution()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [executionId, execution?.status])

  if (!executionId) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-400 bg-blue-500/20'
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'failed': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl border border-purple-500/20 w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">Workflow Execution</h2>
            {execution && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(execution.status)}`}>
                {getStatusIcon(execution.status)}
                <span className="capitalize">{execution.status}</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && !execution ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-gray-400">Loading execution details...</p>
              </div>
            </div>
          ) : execution ? (
            <div className="space-y-6">
              {/* Execution Info */}
              <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">Execution Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Execution ID:</span>
                    <p className="text-white font-mono">{execution.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Workflow ID:</span>
                    <p className="text-white font-mono">{execution.workflow_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Started At:</span>
                    <p className="text-white">{new Date(execution.started_at).toLocaleString()}</p>
                  </div>
                  {execution.completed_at && (
                    <div>
                      <span className="text-gray-400">Completed At:</span>
                      <p className="text-white">{new Date(execution.completed_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Logs */}
              <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">Execution Logs</h3>
                <div className="bg-black/50 rounded p-4 max-h-96 overflow-y-auto font-mono text-sm">
                  {execution.logs && execution.logs.length > 0 ? (
                    execution.logs.map((log, idx) => (
                      <div key={idx} className="text-gray-300 mb-1">
                        <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No logs available yet...</p>
                  )}
                  {execution.status === 'running' && (
                    <div className="text-blue-400 animate-pulse">
                      <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> Execution in progress...
                    </div>
                  )}
                </div>
              </div>

              {/* Result */}
              {execution.result && (
                <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3">Execution Result</h3>
                  <pre className="bg-black/50 rounded p-4 overflow-x-auto text-sm text-gray-300">
                    {JSON.stringify(execution.result, null, 2)}
                  </pre>
                </div>
              )}

              {/* Progress Indicator */}
              {execution.status === 'running' && (
                <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-white font-medium">Workflow is running...</p>
                      <p className="text-gray-400 text-sm">This may take a few moments</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">Execution Not Found</h3>
                <p className="text-gray-400">Unable to load execution details</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-500/20 flex justify-end space-x-4">
          {execution?.status === 'running' && (
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition">
              Stop Execution
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
