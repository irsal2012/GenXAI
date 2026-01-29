import { useState } from 'react'
import { useTools } from '../services/tools'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import type { ToolSummary } from '../types/api'

const ToolPlaygroundPage = () => {
  const toolsQuery = useTools()
  const [selectedTool, setSelectedTool] = useState<ToolSummary | null>(null)
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [result, setResult] = useState<string>('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string>('')

  const handleToolSelect = (tool: ToolSummary) => {
    setSelectedTool(tool)
    setParameters({})
    setResult('')
    setError('')
  }

  const handleParameterChange = (key: string, value: any) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleExecute = async () => {
    if (!selectedTool) return

    setIsExecuting(true)
    setError('')
    setResult('')

    try {
      // Simulate tool execution (replace with actual API call when backend supports it)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      const mockResult = {
        tool: selectedTool.name,
        parameters,
        output: `Mock execution result for ${selectedTool.name}`,
        timestamp: new Date().toISOString(),
        status: 'success',
      }

      setResult(JSON.stringify(mockResult, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed')
    } finally {
      setIsExecuting(false)
    }
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
                <h3 className="text-base font-semibold">{selectedTool.name}</h3>
                <p className="text-sm text-slate-600 mt-2">{selectedTool.description}</p>
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
                  disabled={isExecuting}
                >
                  {isExecuting ? 'Executing...' : 'Execute Tool'}
                </button>
              </div>

              {/* Results */}
              <div className="card p-5">
                <h3 className="text-base font-semibold mb-4">Execution Result</h3>
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                {result ? (
                  <pre className="max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
                    {result}
                  </pre>
                ) : (
                  <p className="text-sm text-slate-500">
                    Execute the tool to see results here.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-slate-500">Select a tool from the list to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ToolPlaygroundPage
