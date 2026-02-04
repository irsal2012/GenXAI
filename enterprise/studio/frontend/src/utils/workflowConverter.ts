/**
 * Utility functions to convert between backend JSON format and ReactFlow format
 */

import type { Workflow } from '../types/api'

export interface ReactFlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    config: Record<string, unknown>
  }
}

export interface ReactFlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  data?: {
    condition?: string
    label?: string
  }
}

/**
 * Convert backend workflow format to ReactFlow format
 */
export function convertToReactFlow(workflow: Workflow): {
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
} {
  const nodes: ReactFlowNode[] = []
  const edges: ReactFlowEdge[] = []

  // Convert nodes
  if (Array.isArray(workflow.nodes)) {
    workflow.nodes.forEach((node: Record<string, unknown>, index: number) => {
      const nodeData = node as Record<string, unknown>
      const position = nodeData.position as { x?: number; y?: number } | undefined
      const config = (nodeData.config || nodeData.data || {}) as Record<string, unknown>
      nodes.push({
        id: (nodeData.id as string) || `node-${index}`,
        type: (nodeData.type as string) || 'default',
        position: position?.x !== undefined && position?.y !== undefined
          ? { x: position.x, y: position.y }
          : { x: 100 + index * 200, y: 100 },
        data: {
          label: (nodeData.label as string) || (nodeData.name as string) || `Node ${index + 1}`,
          config,
        },
      })
    })
  }

  // Convert edges
  if (Array.isArray(workflow.edges)) {
    workflow.edges.forEach((edge: Record<string, unknown>, index: number) => {
      const edgeData = edge as Record<string, unknown>
      edges.push({
        id: (edgeData.id as string) || `edge-${index}`,
        source: (edgeData.source as string) || (edgeData.from as string),
        target: (edgeData.target as string) || (edgeData.to as string),
        sourceHandle: edgeData.sourceHandle as string | undefined,
        targetHandle: edgeData.targetHandle as string | undefined,
        data: {
          condition: edgeData.condition as string | undefined,
          label: edgeData.label as string | undefined,
        },
      })
    })
  }

  return { nodes, edges }
}

/**
 * Convert ReactFlow format back to backend workflow format
 */
export function convertFromReactFlow(
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[]
): { nodes: Record<string, unknown>[]; edges: Record<string, unknown>[] } {
  const backendNodes = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    label: node.data.label,
    config: node.data.config,
  }))

  const backendEdges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    condition: edge.data?.condition,
    label: edge.data?.label,
  }))

  return { nodes: backendNodes, edges: backendEdges }
}

/**
 * Apply auto-layout to nodes using a simple grid layout
 * (Dagre integration can be added later for more sophisticated layouts)
 */
export function applyAutoLayout(nodes: ReactFlowNode[]): ReactFlowNode[] {
  const HORIZONTAL_SPACING = 250
  const VERTICAL_SPACING = 150

  return nodes.map((node, index) => {
    const row = Math.floor(index / 3)
    const col = index % 3

    return {
      ...node,
      position: {
        x: 100 + col * HORIZONTAL_SPACING,
        y: 100 + row * VERTICAL_SPACING,
      },
    }
  })
}

/**
 * Validate workflow structure
 */
export function validateWorkflow(
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for at least one node
  if (nodes.length === 0) {
    errors.push('Workflow must have at least one node')
  }

  // Check for unique node IDs
  const nodeIds = new Set(nodes.map((n) => n.id))
  if (nodeIds.size !== nodes.length) {
    errors.push('All nodes must have unique IDs')
  }

  // Check that all edges reference valid nodes
  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} references invalid source node: ${edge.source}`)
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} references invalid target node: ${edge.target}`)
    }
  })

  // Check for start node
  const hasStartNode = nodes.some((n) => n.type === 'start')
  if (!hasStartNode && nodes.length > 0) {
    errors.push('Workflow should have a start node')
  }

  // Check for end node
  const hasEndNode = nodes.some((n) => n.type === 'end')
  if (!hasEndNode && nodes.length > 0) {
    errors.push('Workflow should have an end node')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
