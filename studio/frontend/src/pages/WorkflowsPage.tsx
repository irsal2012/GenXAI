import { Link } from 'react-router-dom'
import { useCreateWorkflow, useDeleteWorkflow, useDownloadWorkflowCode, useWorkflows } from '../services/workflows'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import type { WorkflowInput } from '../types/api'

const emptyWorkflow: WorkflowInput = {
  name: 'New Workflow',
  description: 'Describe your workflow goals',
  nodes: [
    {
      id: 'start',
      type: 'start',
      position: { x: 250, y: 50 },
      label: 'Start',
      config: {},
    },
    {
      id: 'end',
      type: 'end',
      position: { x: 250, y: 250 },
      label: 'End',
      config: {},
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'start',
      target: 'end',
    },
  ],
  metadata: {},
}

const WorkflowsPage = () => {
  const workflowsQuery = useWorkflows()
  const createWorkflow = useCreateWorkflow()
  const deleteWorkflow = useDeleteWorkflow()
  const downloadWorkflow = useDownloadWorkflowCode()

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

  const handleDownload = async (workflowId: string) => {
    try {
      const response = await downloadWorkflow.mutateAsync(workflowId)
      const blob = new Blob([response.data], { type: 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${workflowId}.zip`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
      alert('Download started')
    } catch (error) {
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage automation graphs and execute runs.</p>
        </div>
        <button
          className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          onClick={handleCreate}
          disabled={createWorkflow.isPending}
          title="Create a new workflow"
        >
          {createWorkflow.isPending ? 'Creating...' : 'Create workflow'}
        </button>
      </div>
      <div className="grid gap-4">
        {workflowsQuery.data?.map((workflow) => (
          <div key={workflow.id} className="card flex items-center justify-between p-5">
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{workflow.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {workflow.description || 'No description provided.'}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {workflow.nodes.length} nodes • {workflow.edges.length} edges
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/workflows/${workflow.id}`}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                title="Open workflow builder"
              >
                Open builder
              </Link>
              <button
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => handleDownload(workflow.id)}
                title="Download workflow code"
              >
                Download code
              </button>
              <button
                className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                onClick={() => handleDelete(workflow.id)}
                disabled={deleteWorkflow.isPending}
                title="Delete workflow"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {workflowsQuery.data?.length === 0 ? (
          <div className="card p-6 text-sm text-slate-500 dark:text-slate-400">
            No workflows yet. Create one to get started.
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default WorkflowsPage