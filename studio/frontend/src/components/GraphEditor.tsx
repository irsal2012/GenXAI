import { useState, useCallback } from 'react'

interface Node {
  id: string
  type: string
  label: string
  x: number
  y: number
}

interface Connection {
  from: string
  to: string
}

export default function GraphEditor() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'start', label: 'Start', x: 100, y: 100 },
    { id: '2', type: 'agent', label: 'Research Agent', x: 300, y: 100 },
    { id: '3', type: 'agent', label: 'Writer Agent', x: 500, y: 100 },
    { id: '4', type: 'end', label: 'End', x: 700, y: 100 },
  ])
  const [connections, setConnections] = useState<Connection[]>([
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '3', to: '4' },
  ])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)

  const nodeTypes = [
    { type: 'start', label: 'Start Node', color: 'from-green-500 to-emerald-500' },
    { type: 'agent', label: 'Agent Node', color: 'from-blue-500 to-cyan-500' },
    { type: 'tool', label: 'Tool Node', color: 'from-purple-500 to-pink-500' },
    { type: 'condition', label: 'Condition Node', color: 'from-yellow-500 to-orange-500' },
    { type: 'end', label: 'End Node', color: 'from-red-500 to-pink-500' },
  ]

  const addNode = (type: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      type,
      label: `New ${type}`,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    }
    setNodes([...nodes, newNode])
  }

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id))
    setConnections(connections.filter(c => c.from !== id && c.to !== id))
    setSelectedNode(null)
  }

  const handleNodeDragStart = (id: string) => {
    setDraggedNode(id)
  }

  const handleNodeDrag = useCallback((id: string, e: React.MouseEvent) => {
    if (draggedNode === id) {
      const canvas = e.currentTarget.parentElement
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n))
      }
    }
  }, [draggedNode])

  const handleNodeDragEnd = () => {
    setDraggedNode(null)
  }

  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type)
    return nodeType?.color || 'from-gray-500 to-gray-600'
  }

  return (
    <div className="h-full flex text-slate-200">
      {/* Sidebar - Node Palette */}
      <div className="w-72 bg-slate-900/60 border-r border-white/10 p-5 overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Node Palette</h3>
        <div className="space-y-2">
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => addNode(nodeType.type)}
              className={`w-full bg-gradient-to-r ${nodeType.color} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-between shadow-lg shadow-black/30`}
            >
              <span>{nodeType.label}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
          <button className="w-full btn-primary py-2.5 px-4 rounded-xl transition mb-2">
            Save Workflow
          </button>
          <button className="w-full bg-emerald-500/90 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl transition mb-2 shadow-lg shadow-emerald-500/20">
            Run Workflow
          </button>
          <button className="w-full btn-secondary py-2.5 px-4 rounded-xl transition">
            Clear Canvas
          </button>
        </div>

        {selectedNode && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Node Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Node ID</label>
                <input
                  type="text"
                  value={selectedNode}
                  disabled
                  className="w-full input-field px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Label</label>
                <input
                  type="text"
                  value={nodes.find(n => n.id === selectedNode)?.label || ''}
                  onChange={(e) => {
                    setNodes(nodes.map(n => n.id === selectedNode ? { ...n, label: e.target.value } : n))
                  }}
                  className="w-full input-field px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => deleteNode(selectedNode)}
                className="w-full bg-rose-500/90 hover:bg-rose-500 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow-lg shadow-rose-500/20"
              >
                Delete Node
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-slate-950/40 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.12) 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from)
              const toNode = nodes.find(n => n.id === conn.to)
              if (!fromNode || !toNode) return null
              return (
                <line
                  key={idx}
                  x1={fromNode.x + 60}
                  y1={fromNode.y + 30}
                  x2={toNode.x}
                  y2={toNode.y + 30}
                  stroke="rgba(99, 102, 241, 0.6)"
                  strokeWidth="2.5"
                  markerEnd="url(#arrowhead)"
                />
              )
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="rgba(99, 102, 241, 0.6)" />
              </marker>
            </defs>
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute cursor-move ${selectedNode === node.id ? 'ring-2 ring-purple-400 shadow-2xl shadow-purple-500/40' : ''}`}
              style={{ left: node.x, top: node.y }}
              onMouseDown={() => {
                setSelectedNode(node.id)
                handleNodeDragStart(node.id)
              }}
              onMouseMove={(e) => handleNodeDrag(node.id, e)}
              onMouseUp={handleNodeDragEnd}
            >
              <div className={`bg-gradient-to-r ${getNodeColor(node.type)} rounded-2xl p-4 shadow-xl min-w-[140px] border border-white/30`}>
                <div className="text-white font-semibold text-sm text-center">{node.label}</div>
                <div className="text-white/80 text-xs text-center mt-1 capitalize">{node.type}</div>
              </div>
            </div>
          ))}
        </div>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Empty Canvas</h3>
              <p className="text-slate-400">Add nodes from the palette to start building your workflow</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
