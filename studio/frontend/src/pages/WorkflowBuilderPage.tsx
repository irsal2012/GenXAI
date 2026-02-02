import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDownloadWorkflowCode, useExecuteWorkflow, useExportWorkflowCode, useUpdateWorkflow, useWorkflow } from '../services/workflows'
import { useBuilderStore } from '../store/builderStore'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import CanvasEditor from '../components/canvas/CanvasEditor'
import ExecutionResultsPanel from '../components/workflow/ExecutionResultsPanel'
import AgentConfigModal from '../components/workflow/AgentConfigModal'
import DecisionConfigModal from '../components/workflow/DecisionConfigModal'
import AgentDetailsPanel from '../components/workflow/AgentDetailsPanel'
import { convertToReactFlow } from '../utils/workflowConverter'
import type { ExecutionResult } from '../types/api'
import type { ReactFlowNode } from '../utils/workflowConverter'

const WorkflowBuilderPage = () => {
  const { workflowId } = useParams<{ workflowId: string }>()
  const workflowQuery = useWorkflow(workflowId)
  const updateWorkflow = useUpdateWorkflow(workflowId ?? '')
  const executeWorkflow = useExecuteWorkflow(workflowId ?? '')
  const exportWorkflow = useExportWorkflowCode()
  const downloadWorkflow = useDownloadWorkflowCode()
  const { draftNodes, draftEdges, draftMetadata, resetDrafts, setDraftNodes } = useBuilderStore()

  useEffect(() => {
    if (workflowQuery.data) {
      resetDrafts(
        JSON.stringify(workflowQuery.data.nodes, null, 2),
        JSON.stringify(workflowQuery.data.edges, null, 2),
        JSON.stringify(workflowQuery.data.metadata ?? {}, null, 2),
      )
    }
  }, [workflowQuery.data, resetDrafts])


  const visualWorkflow = useMemo(() => {
    try {
      const nodes = JSON.parse(draftNodes || '[]')
      const edges = JSON.parse(draftEdges || '[]')
      const metadata = JSON.parse(draftMetadata || '{}')
      return convertToReactFlow({
        id: workflowQuery.data?.id || '',
        name: workflowQuery.data?.name || '',
        description: workflowQuery.data?.description || '',
        nodes,
        edges,
        metadata,
      })
    } catch {
      if (!workflowQuery.data) return { nodes: [], edges: [] }
      return convertToReactFlow(workflowQuery.data)
    }
  }, [draftNodes, draftEdges, draftMetadata, workflowQuery.data])

  const [selectedNode, setSelectedNode] = useState<ReactFlowNode | null>(null)
  const [agentConfigModalOpen, setAgentConfigModalOpen] = useState(false)
  const [agentConfigModalNode, setAgentConfigModalNode] = useState<ReactFlowNode | null>(null)
  const [decisionConfigModalOpen, setDecisionConfigModalOpen] = useState(false)
  const [decisionConfigModalNode, setDecisionConfigModalNode] = useState<ReactFlowNode | null>(null)
  const [copyStatus, setCopyStatus] = useState<string>('')

  const handleSave = useCallback(async () => {
    if (!workflowQuery.data || !workflowId) return
    const payload = {
      name: workflowQuery.data.name,
      description: workflowQuery.data.description,
      nodes: JSON.parse(draftNodes || '[]') as Record<string, unknown>[],
      edges: JSON.parse(draftEdges || '[]') as Record<string, unknown>[],
      metadata: JSON.parse(draftMetadata || '{}') as Record<string, unknown>,
    }
    await updateWorkflow.mutateAsync(payload)
  }, [workflowQuery.data, workflowId, draftNodes, draftEdges, draftMetadata, updateWorkflow])

  const handleExportJson = useCallback(async () => {
    try {
      const exportPayload = {
        id: workflowQuery.data?.id,
        name: workflowQuery.data?.name,
        description: workflowQuery.data?.description,
        nodes: JSON.parse(draftNodes || '[]') as Record<string, unknown>[],
        edges: JSON.parse(draftEdges || '[]') as Record<string, unknown>[],
        metadata: JSON.parse(draftMetadata || '{}') as Record<string, unknown>,
        exportedAt: new Date().toISOString(),
      }
      const formatted = JSON.stringify(exportPayload, null, 2)
      await navigator.clipboard.writeText(formatted)
      setCopyStatus('Copied JSON to clipboard')
    } catch {
      setCopyStatus('Failed to export JSON')
    } finally {
      setTimeout(() => setCopyStatus(''), 2500)
    }
  }, [workflowQuery.data, draftNodes, draftEdges, draftMetadata])

  const handleExportCode = useCallback(async () => {
    if (!workflowId) return
    try {
      const result = await exportWorkflow.mutateAsync(workflowId)
      setCopyStatus(`Exported code to ${result.export_path}`)
    } catch (error) {
      setCopyStatus(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTimeout(() => setCopyStatus(''), 3500)
    }
  }, [workflowId, exportWorkflow])

  const handleDownloadCode = useCallback(async () => {
    if (!workflowId) return
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
      setCopyStatus('Download started')
    } catch (error) {
      setCopyStatus(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTimeout(() => setCopyStatus(''), 3500)
    }
  }, [workflowId, downloadWorkflow])

  const [nodeStatuses, setNodeStatuses] = useState<
    Record<string, 'running' | 'completed' | 'failed' | 'pending'>
  >({})
  const [lastEvent, setLastEvent] = useState<{ node_id: string; status: string; timestamp: number } | undefined>()
  const [executionResult, setExecutionResult] = useState<ExecutionResult | undefined>()

  const handleExecute = useCallback(async () => {
    if (!workflowId) return
    setNodeStatuses({})
    setLastEvent(undefined)
    setExecutionResult(undefined)
    const result = await executeWorkflow.mutateAsync({ input: 'demo payload' })
    setExecutionResult(result)
    if (result?.node_events) {
      const statuses: Record<string, 'running' | 'completed' | 'failed' | 'pending'> = {}
      result.node_events.forEach((event) => {
        if (event.status === 'running' || event.status === 'completed' || event.status === 'failed') {
          statuses[event.node_id] = event.status
          setLastEvent({ node_id: event.node_id, status: event.status, timestamp: event.timestamp })
        }
      })
      setNodeStatuses(statuses)
    }
  }, [workflowId, executeWorkflow])

  const nodeLabels = useMemo(() => {
    const labels: Record<string, string> = {}
    visualWorkflow.nodes.forEach((node) => {
      labels[node.id] = node.data.label || node.id
    })
    return labels
  }, [visualWorkflow.nodes])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target && (event.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void handleSave()
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'e') {
        event.preventDefault()
        void handleExportJson()
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'r') {
        event.preventDefault()
        void handleExecute()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, handleExportJson, handleExecute])

  if (workflowQuery.isLoading) {
    return <LoadingState message="Loading workflow..." />
  }

  if (workflowQuery.isError || !workflowQuery.data) {
    return <ErrorState message="Unable to load workflow builder." />
  }

  return (
    <div className="relative">
      {copyStatus && (
        <div className="absolute left-6 top-6 z-40 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {copyStatus}
        </div>
      )}
      <CanvasEditor
        workflowName={workflowQuery.data.name}
        nodes={visualWorkflow.nodes}
        edges={visualWorkflow.edges}
        onSave={handleSave}
        onExport={handleDownloadCode}
        onRun={handleExecute}
        isRunning={executeWorkflow.isPending}
        onNodeClick={(node) => setSelectedNode(node)}
        onNodeDoubleClick={(node) => {
          if (node.type === 'agent') {
            setAgentConfigModalNode(node)
            setAgentConfigModalOpen(true)
          } else if (node.type === 'decision') {
            setDecisionConfigModalNode(node)
            setDecisionConfigModalOpen(true)
          }
        }}
        nodeStatuses={nodeStatuses}
        lastEvent={lastEvent}
      />
      {executionResult && (
        <ExecutionResultsPanel
          execution={executionResult}
          onClose={() => setExecutionResult(undefined)}
          nodeLabels={nodeLabels}
        />
      )}
      {selectedNode && selectedNode.type === 'agent' && (
        <div className="absolute right-6 top-24 z-30 h-[70vh] w-80">
          <AgentDetailsPanel
            selectedNode={selectedNode}
            onClose={() => setSelectedNode(null)}
            onConfigure={(node) => {
              setAgentConfigModalNode(node)
              setAgentConfigModalOpen(true)
            }}
          />
        </div>
      )}

      {/* Agent Configuration Modal */}
      {agentConfigModalOpen && agentConfigModalNode && (
        <AgentConfigModal
          isOpen={agentConfigModalOpen}
          onClose={() => {
            setAgentConfigModalOpen(false)
            setAgentConfigModalNode(null)
          }}
          agentData={{
            id: agentConfigModalNode.id,
            label: agentConfigModalNode.data.label || 'Agent',
            config: agentConfigModalNode.data.config || {},
          }}
          onSave={(updatedConfig) => {
            // Update the node's config in the workflow
            try {
              const nodes = JSON.parse(draftNodes || '[]') as Record<string, unknown>[]
              const nodeIndex = nodes.findIndex(
                (node) => typeof node.id === 'string' && node.id === agentConfigModalNode.id
              )
              if (nodeIndex !== -1) {
                nodes[nodeIndex] = {
                  ...nodes[nodeIndex],
                  config: updatedConfig as Record<string, unknown>,
                }
                setDraftNodes(JSON.stringify(nodes, null, 2))
                
                // Update selectedNode if it's the same node we just configured
                if (selectedNode && selectedNode.id === agentConfigModalNode.id) {
                  setSelectedNode({
                    ...selectedNode,
                    data: {
                      ...selectedNode.data,
                      config: updatedConfig as Record<string, unknown>,
                    },
                  })
                }
              }
            } catch (e) {
              console.error('Failed to update node config:', e)
            }
            setAgentConfigModalOpen(false)
            setAgentConfigModalNode(null)
          }}
        />
      )}

      {/* Decision Configuration Modal */}
      {decisionConfigModalOpen && decisionConfigModalNode && (
        <DecisionConfigModal
          isOpen={decisionConfigModalOpen}
          onClose={() => {
            setDecisionConfigModalOpen(false)
            setDecisionConfigModalNode(null)
          }}
          decisionData={{
            id: decisionConfigModalNode.id,
            label: decisionConfigModalNode.data.label || 'Decision',
            config: decisionConfigModalNode.data.config || {},
          }}
          onSave={(updatedConfig) => {
            // Update the node's config in the workflow
            console.log('Updated decision config:', updatedConfig)
            // TODO: Implement actual node update logic
            setDecisionConfigModalOpen(false)
            setDecisionConfigModalNode(null)
          }}
        />
      )}
    </div>
  )
}

export default WorkflowBuilderPage
