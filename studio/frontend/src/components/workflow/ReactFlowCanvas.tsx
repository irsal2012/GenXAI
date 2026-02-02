/**
 * Interactive Workflow Canvas using ReactFlow
 * Provides full drag-and-drop editing capabilities
 */

import { useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import type { ReactFlowNode, ReactFlowEdge } from '../../utils/workflowConverter'
import AgentNode from './nodes/AgentNode'
import StartNode from './nodes/StartNode'
import EndNode from './nodes/EndNode'
import DecisionNode from './nodes/DecisionNode'

interface ReactFlowCanvasProps {
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
  onNodesChange?: (nodes: ReactFlowNode[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  onNodeClick?: (node: ReactFlowNode) => void
  onNodeDoubleClick?: (node: ReactFlowNode) => void
  showMiniMap?: boolean
  showGrid?: boolean
  onInit?: (instance: {
    screenToFlowPosition: (point: { x: number; y: number }) => { x: number; y: number }
    fitView: (options?: { padding?: number; duration?: number }) => void
  }) => void
}

type StyledEdge = Edge & {
  type: string
  animated: boolean
  style: {
    strokeDasharray: string
    stroke: string
    strokeWidth: number
  }
  markerEnd: {
    type: MarkerType
    color: string
  }
}

// Auto-layout using dagre
const getLayoutedElements = (nodes: ReactFlowNode[], edges: ReactFlowEdge[]) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 80 })

  nodes.forEach((node) => {
    // Agent nodes are more compact (to match the palette cards)
    const size = node.type === 'agent' ? { width: 160, height: 44 } : { width: 180, height: 80 }
    dagreGraph.setNode(node.id, size)
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
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

// Custom Node Component with connection handles
const CustomNode = ({ data, type }: NodeProps) => {
  const nodeColors: Record<string, string> = {
    start: '#10b981',
    end: '#ef4444',
    agent: '#3b82f6',
    tool: '#8b5cf6',
    decision: '#f59e0b',
    default: '#6b7280',
  }

  const color = nodeColors[type || 'default'] || nodeColors.default

  return (
    <div
      style={{
        background: 'white',
        border: `2px solid ${color}`,
        borderRadius: '12px',
        padding: '10px',
        minWidth: '150px',
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div style={{ textAlign: 'center' }}>{String(data.label)}</div>
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </div>
  )
}

// Node types mapping
const nodeTypes = {
  start: StartNode,
  agent: AgentNode,
  tool: CustomNode,
  decision: DecisionNode,
  end: EndNode,
  default: CustomNode,
}

const ReactFlowCanvas = ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDoubleClick,
  showMiniMap = true,
  showGrid = true,
  onInit,
}: ReactFlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<
    {
      screenToFlowPosition: (point: { x: number; y: number }) => { x: number; y: number }
      fitView: (options?: { padding?: number; duration?: number }) => void
    } | null
  >(null)
  
  // Apply auto-layout
  const { nodes: layoutedNodes, edges: layoutedEdges} = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  )

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<ReactFlowNode>(layoutedNodes)
  
  // Update nodes when initialNodes change (e.g., when config is updated)
  useMemo(() => {
    setNodes(layoutedNodes)
  }, [layoutedNodes, setNodes])
  const styledEdges = useMemo(
    () =>
      layoutedEdges.map((edge) => ({
        ...edge,
        type: 'smoothstep',
        animated: true,
        style: {
          strokeDasharray: '5,5',
          stroke: '#94a3b8',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      })),
    [layoutedEdges]
  )

  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<StyledEdge>(styledEdges)

  // Update edges when layoutedEdges change
  useMemo(() => {
    setEdges(styledEdges)
  }, [styledEdges, setEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: StyledEdge = {
        id: `${params.source}-${params.target}-${Date.now()}`,
        ...params,
        type: 'smoothstep',
        animated: true,
        style: {
          strokeDasharray: '5,5',
          stroke: '#94a3b8',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      }
      const newEdges = addEdge<StyledEdge>(newEdge, edges)
      setEdges(newEdges.map((edge) => ({
        ...edge,
        type: edge.type || 'smoothstep',
        animated: true,
        style: {
          strokeDasharray: '5,5',
          stroke: '#94a3b8',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      })))
      onEdgesChange?.(newEdges)
    },
    [edges, setEdges, onEdgesChange]
  )

  const handleNodesChange = useCallback(
    (changes: NodeChange<ReactFlowNode>[]) => {
      onNodesChangeInternal(changes)
      onNodesChange?.(nodes)
    },
    [onNodesChangeInternal, onNodesChange, nodes]
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<StyledEdge>[]) => {
      onEdgesChangeInternal(changes)
      onEdgesChange?.(edges)
    },
    [onEdgesChangeInternal, onEdgesChange, edges]
  )

  // Node colors based on type
  const nodeColors = useMemo<Record<string, string>>(
    () => ({
      start: '#10b981',
      end: '#ef4444',
      agent: '#3b82f6',
      tool: '#8b5cf6',
      decision: '#f59e0b',
      default: '#6b7280',
    }),
    []
  )

  // Custom node styles: keep styling for non-custom component nodes only.
  // Agent, Start, End, and Decision nodes are rendered by their own components.
  const nodesWithStyles = useMemo(
    () =>
      nodes.map((node) => {
        if (node.type === 'agent' || node.type === 'start' || node.type === 'end' || node.type === 'decision') return node

        return {
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
        }
      }),
    [nodes, nodeColors]
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

      if (!reactFlowInstance.current) return

      const type = event.dataTransfer.getData('application/reactflow')
      const agentId = event.dataTransfer.getData('agentId')
      const agentName = event.dataTransfer.getData('agentName')
      const agentGoal = event.dataTransfer.getData('agentGoal')
      const agentToolsStr = event.dataTransfer.getData('agentTools')

      if (!type) return

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      // Parse tools if available
      let tools: string[] = []
      if (agentToolsStr) {
        try {
          tools = JSON.parse(agentToolsStr)
        } catch (e) {
          console.error('Failed to parse agent tools:', e)
        }
      }

      const newNode: ReactFlowNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: agentName || type.charAt(0).toUpperCase() + type.slice(1),
          config: {
            ...(agentGoal ? { goal: agentGoal } : null),
            ...(tools.length > 0 ? { tools } : null),
          },
          ...(agentId && { agentId }),
        },
      }

      setNodes((nds) => nds.concat(newNode))
      onNodesChange?.([...nodes, newNode])
    },
    [setNodes, nodes, onNodesChange]
  )

  return (
    <div ref={reactFlowWrapper} className="w-full h-full bg-slate-50 rounded-xl border border-slate-200">
      <ReactFlow
        nodes={nodesWithStyles}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => {
          reactFlowInstance.current = instance
          onInit?.(instance)
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => onNodeClick?.(node as ReactFlowNode)}
        onNodeDoubleClick={(_, node) => onNodeDoubleClick?.(node as ReactFlowNode)}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
      >
        {showGrid && <Background color="#e2e8f0" gap={20} />}
        <Controls />
        {showMiniMap && (
          <MiniMap
            nodeColor={(node) => nodeColors[node.type || 'default'] || nodeColors.default}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        )}
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
