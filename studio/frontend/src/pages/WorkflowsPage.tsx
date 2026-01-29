import { Link } from 'react-router-dom'
import { useCreateWorkflow, useDeleteWorkflow, useWorkflows } from '../services/workflows'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import type { WorkflowInput } from '../types/api'

const emptyWorkflow: WorkflowInput = {
  name: 'New Workflow',
  description: 'Describe your workflow goals',
  nodes: [],
  edges: [],
  metadata: {},
}

const WorkflowsPage = () => {
  const workflowsQuery = useWorkflows()
  const createWorkflow = useCreateWorkflow()
  const deleteWorkflow = useDeleteWorkflow()

  const handleCreate = async () => {
    await createWorkflow.mutateAsync({
      ...emptyWorkflow,
      name: `Workflow ${Date.now()}`,
    })
  }

  const handleDelete = async (workflowId: string) => {
    if (!window.confirm('Delete this workflow?')) return
    await deleteWorkflow.mutateAsync(workflowId)
  }

  if (workflowsQuery.isLoading) {
    return <LoadingState message="Loading workflows..." />
  }

  if (workflowsQuery.isError) {
    return <ErrorState message="Unable to load workflows." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Workflow Library</h2>
          <p className="text-sm text-slate-500">Manage automation graphs and execute runs.</p>
        </div>
        <button
          className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          onClick={handleCreate}
          disabled={createWorkflow.isPending}
        >
          {createWorkflow.isPending ? 'Creating...' : 'Create workflow'}
        </button>
      </div>
      <div className="grid gap-4">
        {workflowsQuery.data?.map((workflow) => (
          <div key={workflow.id} className="card flex items-center justify-between p-5">
            <div>
              <p className="text-base font-semibold text-slate-900">{workflow.name}</p>
              <p className="text-sm text-slate-500">{workflow.description || 'No description provided.'}</p>
              <p className="mt-1 text-xs text-slate-400">
                {workflow.nodes.length} nodes • {workflow.edges.length} edges
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/workflows/${workflow.id}`}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Open builder
              </Link>
              <button
                className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                onClick={() => handleDelete(workflow.id)}
                disabled={deleteWorkflow.isPending}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {workflowsQuery.data?.length === 0 ? (
          <div className="card p-6 text-sm text-slate-500">No workflows yet. Create one to get started.</div>
        ) : null}
      </div>
    </div>
  )
}

export default WorkflowsPage