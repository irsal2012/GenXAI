/**
 * Interactive Workflow Canvas using ReactFlow
 * Provides full drag-and-drop editing capabilities
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import type { ReactFlowNode, ReactFlowEdge } from '../../utils/workflowConverter'

interface ReactFlowCanvasProps {
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
}

// Auto-layout using dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 80 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 40,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

const ReactFlowCanvas = ({ nodes: initialNodes, edges: initialEdges, onNodesChange, onEdgesChange }: ReactFlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  
  // Apply auto-layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  )

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(
    layoutedEdges.map((edge) => ({
      ...edge,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }))
  )

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges)
      setEdges(newEdges)
      onEdgesChange?.(newEdges)
    },
    [edges, setEdges, onEdgesChange]
  )

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes)
      onNodesChange?.(nodes)
    },
    [onNodesChangeInternal, onNodesChange, nodes]
  )

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes)
      onEdgesChange?.(edges)
    },
    [onEdgesChangeInternal, onEdgesChange, edges]
  )

  // Node colors based on type
  const nodeColors: Record<string, string> = {
    start: '#10b981',
    end: '#ef4444',
    agent: '#3b82f6',
    tool: '#8b5cf6',
    decision: '#f59e0b',
    default: '#6b7280',
  }

  // Custom node styles
  const nodesWithStyles = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        style: {
          background: 'white',
          border: `2px solid ${nodeColors[node.type || 'default'] || nodeColors.default}`,
          borderRadius: '12px',
          padding: '10px',
          width: 180,
          fontSize: '14px',
          fontWeight: 600,
        },
      })),
    [nodes]
  )

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowInstance) return

      const type = event.dataTransfer.getData('application/reactflow')
      const agentId = event.dataTransfer.getData('agentId')
      const agentName = event.dataTransfer.getData('agentName')

      if (!type) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: agentName || type.charAt(0).toUpperCase() + type.slice(1),
          ...(agentId && { agentId }),
        },
      }

      setNodes((nds) => nds.concat(newNode))
      onNodesChange?.([...nodes, newNode])
    },
    [reactFlowInstance, setNodes, nodes, onNodesChange]
  )

  return (
    <div ref={reactFlowWrapper} className="w-full h-full bg-slate-50 rounded-xl border border-slate-200">
      <ReactFlow
        nodes={nodesWithStyles}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => nodeColors[node.type || 'default'] || nodeColors.default}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
      
      {/* Success banner */}
      <div className="absolute top-4 left-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-xs text-green-700">
          <strong>✓ ReactFlow Active:</strong> Full interactive editing enabled. Drag nodes, create connections, and zoom/pan the canvas.
        </p>
      </div>
    </div>
  )
}

export default ReactFlowCanvas
