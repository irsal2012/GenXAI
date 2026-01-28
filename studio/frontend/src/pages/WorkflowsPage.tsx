import { useEffect, useState } from 'react'
import { apiService, Workflow } from '../services/api'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import { useToast } from '../components/Toast'

const emptyForm = {
  name: '',
  description: '',
  nodes: [] as any[],
  edges: [] as any[],
  metadata: {} as Record<string, any>,
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nodesJson, setNodesJson] = useState('[]')
  const [edgesJson, setEdgesJson] = useState('[]')
  const { showToast } = useToast()

  const refreshWorkflows = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.getWorkflows()
      setWorkflows(response)
    } catch (err) {
      showToast('Unable to load workflows', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshWorkflows()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const nodes = JSON.parse(nodesJson)
      const edges = JSON.parse(edgesJson)

      const payload = {
        ...form,
        nodes,
        edges,
        metadata: form.metadata || {},
      }

      if (editingId) {
        await apiService.updateWorkflow(editingId, payload)
        showToast('Workflow updated successfully', 'success')
      } else {
        await apiService.createWorkflow(payload)
        showToast('Workflow created successfully', 'success')
      }
      
      setForm(emptyForm)
      setNodesJson('[]')
      setEdgesJson('[]')
      setEditingId(null)
      await refreshWorkflows()
    } catch (err) {
      showToast('Invalid JSON or missing required fields', 'error')
    }
  }

  const startEdit = (workflow: Workflow) => {
    setEditingId(workflow.id)
    setForm({
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
      metadata: workflow.metadata || {},
    })
    setNodesJson(JSON.stringify(workflow.nodes || [], null, 2))
    setEdgesJson(JSON.stringify(workflow.edges || [], null, 2))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setNodesJson('[]')
    setEdgesJson('[]')
  }

  const handleDelete = async (workflowId: string) => {
    try {
      await apiService.deleteWorkflow(workflowId)
      showToast('Workflow deleted', 'success')
      await refreshWorkflows()
    } catch (err) {
      showToast('Unable to delete workflow', 'error')
    }
  }

  const runWorkflow = async (workflowId: string) => {
    try {
      const execution = await apiService.executeWorkflow(workflowId)
      showToast(`Execution ${execution.id} - Status: ${execution.status}`, 'success')
    } catch (err) {
      showToast('Unable to execute workflow', 'error')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Workflows</h2>
                <p className="text-sm text-slate-400">Orchestrate multi-agent workflows</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">Total Workflows</div>
              <div className="text-2xl font-bold text-white">{workflows.length}</div>
            </div>
            <Button size="sm" onClick={refreshWorkflows}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Form Section */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-1">
            {editingId ? 'Edit Workflow' : 'Create New Workflow'}
          </h3>
          <p className="text-sm text-slate-400">Define workflow metadata and graph structure</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Workflow Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Customer Support Pipeline"
              required
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the workflow"
            />
          </div>

          <Textarea
            label="Nodes (JSON)"
            value={nodesJson}
            onChange={(e) => setNodesJson(e.target.value)}
            rows={6}
            placeholder='[{"id": "node1", "type": "agent", "data": {...}}]'
            helperText="Define workflow nodes in JSON format"
          />

          <Textarea
            label="Edges (JSON)"
            value={edgesJson}
            onChange={(e) => setEdgesJson(e.target.value)}
            rows={6}
            placeholder='[{"source": "node1", "target": "node2"}]'
            helperText="Define connections between nodes"
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit">
              {editingId ? 'Update Workflow' : 'Create Workflow'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Workflows List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Existing Workflows</h3>
        {isLoading ? (
          <Card className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading workflows...
            </div>
          </Card>
        ) : workflows.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">No workflows yet</h4>
              <p className="text-sm text-slate-400">Create your first workflow to get started with multi-agent orchestration.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.id} hover className="p-5">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-semibold text-lg">{workflow.name}</h4>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg font-medium">
                        {workflow.id.slice(0, 8)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{workflow.description || 'No description provided'}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      {workflow.nodes?.length || 0} nodes
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {workflow.edges?.length || 0} edges
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(workflow)} className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => runWorkflow(workflow.id)} className="flex-1">
                      Run
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(workflow.id)}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
