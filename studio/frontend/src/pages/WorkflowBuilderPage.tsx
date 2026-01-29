import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useExecuteWorkflow, useUpdateWorkflow, useWorkflow } from '../services/workflows'
import { useBuilderStore } from '../store/builderStore'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import ReactFlowCanvas from '../components/workflow/ReactFlowCanvas'
import NodePalette from '../components/workflow/NodePalette'
import AgentConfigModal from '../components/workflow/AgentConfigModal'
import AgentDetailsPanel from '../components/workflow/AgentDetailsPanel'
import { convertToReactFlow } from '../utils/workflowConverter'
import type { Node } from '@xyflow/react'

const WorkflowBuilderPage = () => {
  const { workflowId } = useParams<{ workflowId: string }>()
  const workflowQuery = useWorkflow(workflowId)
  const updateWorkflow = useUpdateWorkflow(workflowId ?? '')
  const executeWorkflow = useExecuteWorkflow(workflowId ?? '')
  const [executionResult, setExecutionResult] = useState<string>('')
  const { draftNodes, draftEdges, draftMetadata, resetDrafts, setDraftNodes, setDraftEdges, setDraftMetadata } =
    useBuilderStore()

  useEffect(() => {
    if (workflowQuery.data) {
      resetDrafts(
        JSON.stringify(workflowQuery.data.nodes, null, 2),
        JSON.stringify(workflowQuery.data.edges, null, 2),
        JSON.stringify(workflowQuery.data.metadata ?? {}, null, 2),
      )
    }
  }, [workflowQuery.data, resetDrafts])

  const workflowSnapshot = useMemo(() => {
    return {
      nodes: workflowQuery.data?.nodes ?? [],
      edges: workflowQuery.data?.edges ?? [],
    }
  }, [workflowQuery.data])

  const visualWorkflow = useMemo(() => {
    if (!workflowQuery.data) return { nodes: [], edges: [] }
    return convertToReactFlow(workflowQuery.data)
  }, [workflowQuery.data])

  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [configModalNode, setConfigModalNode] = useState<any>(null)

  const handleSave = async () => {
    if (!workflowQuery.data || !workflowId) return
    const payload = {
      name: workflowQuery.data.name,
      description: workflowQuery.data.description,
      nodes: JSON.parse(draftNodes || '[]'),
      edges: JSON.parse(draftEdges || '[]'),
      metadata: JSON.parse(draftMetadata || '{}'),
    }
    await updateWorkflow.mutateAsync(payload)
  }

  const handleExecute = async () => {
    if (!workflowId) return
    const result = await executeWorkflow.mutateAsync({ input: 'demo payload' })
    setExecutionResult(JSON.stringify(result, null, 2))
  }

  if (workflowQuery.isLoading) {
    return <LoadingState message="Loading workflow..." />
  }

  if (workflowQuery.isError || !workflowQuery.data) {
    return <ErrorState message="Unable to load workflow builder." />
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{workflowQuery.data.name}</h2>
            <p className="text-sm text-slate-500">{workflowQuery.data.description || 'No description provided.'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={handleSave}
              disabled={updateWorkflow.isPending}
            >
              {updateWorkflow.isPending ? 'Saving...' : 'Save workflow'}
            </button>
            <button
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              onClick={handleExecute}
              disabled={executeWorkflow.isPending}
            >
              {executeWorkflow.isPending ? 'Running...' : 'Run workflow'}
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[5fr_1fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Workflow Editor</h3>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  viewMode === 'visual'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                onClick={() => setViewMode('visual')}
              >
                Visual
              </button>
              <button
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  viewMode === 'json'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                onClick={() => setViewMode('json')}
              >
                JSON
              </button>
            </div>
          </div>

          {viewMode === 'visual' ? (
            <div className="h-[700px] flex gap-4">
              <NodePalette />
              <div className="flex-1">
                <ReactFlowCanvas 
                  nodes={visualWorkflow.nodes} 
                  edges={visualWorkflow.edges}
                  onNodeClick={(node) => setSelectedNode(node)}
                  onNodeDoubleClick={(node) => {
                    if (node.type === 'agent') {
                      setConfigModalNode(node)
                      setConfigModalOpen(true)
                    }
                  }}
                />
              </div>
              {selectedNode && selectedNode.type === 'agent' && (
                <div className="w-80 h-full">
                  <AgentDetailsPanel
                    selectedNode={selectedNode}
                    onClose={() => setSelectedNode(null)}
                    onConfigure={(node) => {
                      setConfigModalNode(node)
                      setConfigModalOpen(true)
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
          <div className="mt-4 space-y-4 text-sm">
            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">Nodes</span>
              <textarea
                className="mt-2 h-40 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                value={draftNodes}
                onChange={(event) => setDraftNodes(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">Edges</span>
              <textarea
                className="mt-2 h-40 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                value={draftEdges}
                onChange={(event) => setDraftEdges(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">Metadata</span>
              <textarea
                className="mt-2 h-32 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                value={draftMetadata}
                onChange={(event) => setDraftMetadata(event.target.value)}
              />
            </label>
          </div>
            </>
          )}
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-base font-semibold">Current graph summary</h3>
            <p className="mt-2 text-sm text-slate-500">
              {workflowSnapshot.nodes.length} nodes · {workflowSnapshot.edges.length} edges
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-base font-semibold">Execution output</h3>
            <p className="mt-2 text-sm text-slate-500">Run the workflow to see the execution response.</p>
            <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
              {executionResult || 'No execution yet.'}
            </pre>
          </div>
        </div>
      </div>

      {/* Agent Configuration Modal */}
      {configModalOpen && configModalNode && (
        <AgentConfigModal
          isOpen={configModalOpen}
          onClose={() => {
            setConfigModalOpen(false)
            setConfigModalNode(null)
          }}
          agentData={{
            id: configModalNode.id,
            label: configModalNode.data.label || 'Agent',
            config: configModalNode.data.config || {},
          }}
          onSave={(updatedConfig) => {
            // Update the node's config in the workflow
            console.log('Updated config:', updatedConfig)
            // TODO: Implement actual node update logic
            setConfigModalOpen(false)
            setConfigModalNode(null)
          }}
        />
      )}
    </div>
  )
}

export default WorkflowBuilderPage
