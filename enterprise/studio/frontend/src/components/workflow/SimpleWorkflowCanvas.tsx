/**
 * Simplified Workflow Canvas without ReactFlow dependency
 * This provides a basic visual representation until ReactFlow is installed
 */

import { useMemo } from 'react'
import type { ReactFlowNode, ReactFlowEdge } from '../../utils/workflowConverter'

interface SimpleWorkflowCanvasProps {
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
}

const SimpleWorkflowCanvas = ({ nodes, edges }: SimpleWorkflowCanvasProps) => {
  const nodeColors: Record<string, string> = {
    start: '#10b981',
    end: '#ef4444',
    agent: '#3b82f6',
    tool: '#8b5cf6',
    decision: '#f59e0b',
    default: '#6b7280',
  }

  const getNodeColor = (type: string) => nodeColors[type] || nodeColors.default

  // Calculate canvas bounds
  const bounds = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 }

    const positions = nodes.map((n) => n.position)
    return {
      minX: Math.min(...positions.map((p) => p.x)) - 50,
      minY: Math.min(...positions.map((p) => p.y)) - 50,
      maxX: Math.max(...positions.map((p) => p.x)) + 200,
      maxY: Math.max(...positions.map((p) => p.y)) + 150,
    }
  }, [nodes])

  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-xl border border-slate-200 overflow-auto">
      <svg
        width={width}
        height={height}
        className="absolute top-0 left-0"
        style={{ minWidth: '100%', minHeight: '100%' }}
      >
        {/* Grid pattern */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Edges */}
        <g>
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source)
            const targetNode = nodes.find((n) => n.id === edge.target)

            if (!sourceNode || !targetNode) return null

            const x1 = sourceNode.position.x - bounds.minX + 90
            const y1 = sourceNode.position.y - bounds.minY + 80
            const x2 = targetNode.position.x - bounds.minX + 90
            const y2 = targetNode.position.y - bounds.minY + 40

            return (
              <g key={edge.id}>
                <path
                  d={`M ${x1} ${y1} L ${x2} ${y2}`}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
                {edge.data?.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 5}
                    textAnchor="middle"
                    className="text-xs fill-slate-600"
                  >
                    {edge.data.label}
                  </text>
                )}
              </g>
            )
          })}
        </g>

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Nodes */}
        <g>
          {nodes.map((node) => {
            const x = node.position.x - bounds.minX
            const y = node.position.y - bounds.minY
            const color = getNodeColor(node.type)

            return (
              <g key={node.id}>
                <rect
                  x={x}
                  y={y}
                  width="180"
                  height="80"
                  rx="12"
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                  className="shadow-md"
                />
                <text
                  x={x + 90}
                  y={y + 35}
                  textAnchor="middle"
                  className="text-sm font-semibold fill-slate-900"
                >
                  {node.data.label}
                </text>
                <text
                  x={x + 90}
                  y={y + 55}
                  textAnchor="middle"
                  className="text-xs fill-slate-500"
                >
                  {node.type}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <p className="text-sm">No nodes in workflow</p>
            <p className="text-xs mt-1">Add nodes using the JSON editor below</p>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="absolute top-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> This is a simplified visualization. For full interactive editing with
          drag-and-drop, install ReactFlow: <code className="bg-blue-100 px-1 rounded">npm install @xyflow/react dagre</code>
        </p>
      </div>
    </div>
  )
}

export default SimpleWorkflowCanvas
