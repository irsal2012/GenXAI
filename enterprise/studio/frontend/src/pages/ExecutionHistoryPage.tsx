import { useMemo, useState } from 'react'
import { useExecutions, useWorkflows } from '../services/workflows'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

const ExecutionHistoryPage = () => {
  const executionsQuery = useExecutions()
  const workflowsQuery = useWorkflows()
  const [filter, setFilter] = useState('')

  const workflowMap = useMemo(() => {
    const map = new Map<string, string>()
    workflowsQuery.data?.forEach((workflow) => map.set(workflow.id, workflow.name))
    return map
  }, [workflowsQuery.data])

  const filteredExecutions = useMemo(() => {
    const executions = executionsQuery.data || []
    if (!filter) return executions
    return executions.filter((execution) => {
      const workflowName = workflowMap.get(execution.workflow_id) || execution.workflow_id
      return (
        workflowName.toLowerCase().includes(filter.toLowerCase()) ||
        execution.workflow_id.toLowerCase().includes(filter.toLowerCase()) ||
        execution.status.toLowerCase().includes(filter.toLowerCase())
      )
    })
  }, [executionsQuery.data, filter, workflowMap])

  if (executionsQuery.isLoading || workflowsQuery.isLoading) {
    return <LoadingState message="Loading execution history..." />
  }

  if (executionsQuery.isError || workflowsQuery.isError) {
    return <ErrorState message="Unable to load execution history." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Execution History</h2>
        <p className="text-sm text-slate-500">Review previous workflow runs and outcomes.</p>
      </div>

      <div className="card p-4">
        <label className="text-xs font-medium uppercase text-slate-500">Filter</label>
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Search by workflow name, id, or status"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredExecutions.map((execution) => (
          <div key={execution.id} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {workflowMap.get(execution.workflow_id) || execution.workflow_id}
                </p>
                <p className="text-xs text-slate-500">Execution ID: {execution.id}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  execution.status === 'success' || execution.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : execution.status === 'error' || execution.status === 'failed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {execution.status}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-2">
              <div>Started: {new Date(execution.started_at).toLocaleString()}</div>
              <div>Completed: {new Date(execution.completed_at).toLocaleString()}</div>
            </div>
            {execution.logs?.length ? (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                {execution.logs.join('\n')}
              </div>
            ) : null}
          </div>
        ))}

        {filteredExecutions.length === 0 && (
          <div className="card p-6 text-center text-sm text-slate-500">
            No executions found.
          </div>
        )}
      </div>
    </div>
  )
}

export default ExecutionHistoryPage