import { useState, useEffect } from 'react'
import { useTools, useExecuteTool, useGetToolCode, useUpdateToolCode } from '../services/tools'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import ExecutionHistoryPanel from '../components/playground/ExecutionHistoryPanel'
import ExecutionMetrics from '../components/playground/ExecutionMetrics'
import ErrorDisplay from '../components/playground/ErrorDisplay'
import CodeEditorModal from '../components/playground/CodeEditorModal'
import { CodeBracketIcon } from '@heroicons/react/24/outline'
import type { ToolSummary } from '../types/api'

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

const ToolPlaygroundPage = () => {
  const toolsQuery = useTools()
  const executeTool = useExecuteTool()
  
  const [selectedTool, setSelectedTool] = useState<ToolSummary | null>(null)
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [executionMetrics, setExecutionMetrics] = useState<any>(null)
  const [history, setHistory] = useState<ExecutionHistoryEntry[]>([])
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)
  const [toolCode, setToolCode] = useState<string>('')
  const [isEditable, setIsEditable] = useState(false)

  const updateToolCode = useUpdateToolCode()

  const handleToolSelect = (tool: ToolSummary) => {
    setSelectedTool(tool)
    setParameters({})
    setResult('')
    setError('')
    setIsCodeEditorOpen(false)
  }

  const handleOpenCodeEditor = async () => {
    if (!selectedTool) return

    try {
      const response = await fetch(`/api/tools/${selectedTool.name}/code`)
      if (response.ok) {
        const data = await response.json()
        setToolCode(data.code)
        setIsEditable(data.editable)
        setIsCodeEditorOpen(true)
      }
    } catch (err) {
      // Tool is not editable (built-in tool)
      setIsEditable(false)
    }
  }

  const handleSaveCode = async (code: string) => {
    if (!selectedTool) return

    await updateToolCode.mutateAsync({
      toolName: selectedTool.name,
      code,
    })

    setToolCode(code)
    setIsCodeEditorOpen(false)
    
    // Show success message
    alert('Code updated successfully! You can now test the updated tool.')
  }

  const handleParameterChange = (key: string, value: any) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('tool_execution_history')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setHistory(
          parsed.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }))
        )
      } catch (e) {
        console.error('Failed to load execution history:', e)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('tool_execution_history', JSON.stringify(history))
    }
  }, [history])

  const handleExecute = async () => {
    if (!selectedTool) return

    setError('')
    setResult(null)
    setExecutionMetrics(null)

    try {
      const response = await executeTool.mutateAsync({
        toolName: selectedTool.name,
        parameters,
      })

      setResult(response.data)
      setExecutionMetrics({
        executionTime: response.execution_time,
        success: response.success,
        rateLimitStats: response.rate_limit_stats,
      })

      // Add to history
      const historyEntry: ExecutionHistoryEntry = {
        id: Date.now().toString(),
        toolName: selectedTool.name,
        parameters: { ...parameters },
        result: response.data,
        timestamp: new Date(),
        executionTime: response.execution_time,
        success: response.success,
        error: response.error,
      }

      setHistory((prev) => [historyEntry, ...prev].slice(0, 50)) // Keep last 50
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Execution failed'
      setError(errorMessage)
      
      // Add failed execution to history
      const historyEntry: ExecutionHistoryEntry = {
        id: Date.now().toString(),
        toolName: selectedTool.name,
        parameters: { ...parameters },
        result: null,
        timestamp: new Date(),
        executionTime: 0,
        success: false,
        error: errorMessage,
      }

      setHistory((prev) => [historyEntry, ...prev].slice(0, 50))
    }
  }

  const handleRerun = (entry: ExecutionHistoryEntry) => {
    // Find and select the tool
    const tool = toolsQuery.data?.find((t) => t.name === entry.toolName)
    if (tool) {
      setSelectedTool(tool)
      setParameters(entry.parameters)
      // Optionally auto-execute
      setTimeout(() => handleExecute(), 100)
    }
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem('tool_execution_history')
  }

  const getParameterFields = () => {
    if (!selectedTool?.schema) return []

    // Extract parameters from schema
    const schema = selectedTool.schema as any
    const properties = schema.properties || {}
    
    return Object.entries(properties).map(([key, value]: [string, any]) => ({
      name: key,
      type: value.type || 'string',
      description: value.description || '',
      required: schema.required?.includes(key) || false,
    }))
  }

  if (toolsQuery.isLoading) {
    return <LoadingState message="Loading tools..." />
  }

  if (toolsQuery.isError) {
    return <ErrorState message="Unable to load tools." />
  }

  return (
    <>
      <CodeEditorModal
        isOpen={isCodeEditorOpen}
        toolName={selectedTool?.name || ''}
        initialCode={toolCode}
        onClose={() => setIsCodeEditorOpen(false)}
        onSave={handleSaveCode}
      />

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Tool Playground</h2>
          <p className="text-sm text-slate-500">
            Test tools with custom parameters and see results in real-time
          </p>
        </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tool Selection */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            <h3 className="text-base font-semibold mb-4">Select Tool</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {toolsQuery.data?.map((tool) => (
                <button
                  key={tool.name}
                  className={`w-full text-left rounded-lg border p-3 transition ${
                    selectedTool?.name === tool.name
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => handleToolSelect(tool)}
                >
                  <div className="font-medium text-sm">{tool.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{tool.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tool Configuration & Execution */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTool ? (
            <>
              {/* Tool Info */}
              <div className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold">{selectedTool.name}</h3>
                    <p className="text-sm text-slate-600 mt-2">{selectedTool.description}</p>
                  </div>
                  <button
                    onClick={handleOpenCodeEditor}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition"
                    title="View/Edit Tool Code"
                  >
                    <CodeBracketIcon className="h-4 w-4" />
                    Edit Code
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {selectedTool.category}
                  </span>
                  {selectedTool.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              <div className="card p-5">
                <h3 className="text-base font-semibold mb-4">Parameters</h3>
                {getParameterFields().length > 0 ? (
                  <div className="space-y-4">
                    {getParameterFields().map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {field.name}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.description && (
                          <p className="text-xs text-slate-500 mb-2">{field.description}</p>
                        )}
                        {field.type === 'boolean' ? (
                          <select
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            value={parameters[field.name] || 'false'}
                            onChange={(e) =>
                              handleParameterChange(field.name, e.target.value === 'true')
                            }
                          >
                            <option value="false">False</option>
                            <option value="true">True</option>
                          </select>
                        ) : field.type === 'number' ? (
                          <input
                            type="number"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            value={parameters[field.name] || ''}
                            onChange={(e) =>
                              handleParameterChange(field.name, parseFloat(e.target.value))
                            }
                            placeholder={`Enter ${field.name}`}
                          />
                        ) : (
                          <input
                            type="text"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            value={parameters[field.name] || ''}
                            onChange={(e) => handleParameterChange(field.name, e.target.value)}
                            placeholder={`Enter ${field.name}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No parameters required for this tool.</p>
                )}

                <button
                  className="mt-6 w-full rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                  onClick={handleExecute}
                  disabled={executeTool.isPending}
                >
                  {executeTool.isPending ? 'Executing...' : 'Execute Tool'}
                </button>
              </div>

              {/* Execution Metrics */}
              {executionMetrics && (
                <ExecutionMetrics
                  executionTime={executionMetrics.executionTime}
                  success={executionMetrics.success}
                  rateLimitStats={executionMetrics.rateLimitStats}
                />
              )}

              {/* Results */}
              <div className="card p-5">
                <h3 className="text-base font-semibold mb-4">Execution Result</h3>
                {error && <ErrorDisplay error={error} />}
                {result ? (
                  <pre className="max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-slate-500">
                    Execute the tool to see results here.
                  </p>
                )}
              </div>

              {/* Execution History */}
              <ExecutionHistoryPanel
                history={history}
                onRerun={handleRerun}
                onClear={handleClearHistory}
              />
            </>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-slate-500">Select a tool from the list to get started</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}

export default ToolPlaygroundPage
