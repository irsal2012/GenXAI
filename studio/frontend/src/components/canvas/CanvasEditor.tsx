import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Edge } from '@xyflow/react'
import ReactFlowCanvas from '../workflow/ReactFlowCanvas'
import BottomToolbar from './BottomToolbar'
import FloatingNodePalette from './FloatingNodePalette'
import QuickActionsPanel from './QuickActionsPanel'
import CanvasContextMenu from './CanvasContextMenu'
import CommandPalette from './CommandPalette'
import HamburgerMenu from './HamburgerMenu'
import type { ReactFlowEdge, ReactFlowNode } from '../../utils/workflowConverter'

interface CanvasEditorProps {
  workflowName: string
  nodes: ReactFlowNode[]
  edges: ReactFlowEdge[]
  onNodesChange?: (nodes: ReactFlowNode[]) => void
  onEdgesChange?: (edges: Edge[]) => void
  onSave: () => void
  onExport: () => void
  onRun: () => void
  isRunning?: boolean
  onNodeClick?: (node: ReactFlowNode) => void
  onNodeDoubleClick?: (node: ReactFlowNode) => void
}

const CanvasEditor = ({
  workflowName,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onSave,
  onExport,
  onRun,
  isRunning,
  onNodeClick,
  onNodeDoubleClick,
}: CanvasEditorProps) => {
  const [showMinimap, setShowMinimap] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [commandOpen, setCommandOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, open: false })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const reactFlowRef = useRef<
    {
      screenToFlowPosition: (point: { x: number; y: number }) => { x: number; y: number }
      fitView: (options?: { padding?: number; duration?: number }) => void
    } | null
  >(null)

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setContextMenu({ x: event.clientX, y: event.clientY, open: true })
  }, [])

  const handleFitView = useCallback(() => {
    reactFlowRef.current?.fitView({ padding: 0.2, duration: 300 })
  }, [])

  const handleAutoLayout = useCallback(() => {
    handleFitView()
  }, [handleFitView])

  const handleAddNode = useCallback((type: string) => {
    if (!reactFlowRef.current) return
    const position = reactFlowRef.current.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })

    const newNode: ReactFlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { label: type.charAt(0).toUpperCase() + type.slice(1), config: {} },
    }

    if (onNodesChange) {
      onNodesChange([...nodes, newNode])
    }
  }, [nodes, onNodesChange])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const overlayStats = useMemo(() => {
    return {
      nodes: nodes.length,
      edges: edges.length,
    }
  }, [nodes.length, edges.length])

  return (
    <div className="relative h-screen w-full bg-slate-100 text-slate-900" onContextMenu={handleContextMenu}>
      <HamburgerMenu isOpen={isMenuOpen} onToggle={() => setIsMenuOpen((prev) => !prev)} />
      <ReactFlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        showMiniMap={showMinimap}
        showGrid={showGrid}
        onInit={(instance) => {
          reactFlowRef.current = instance
        }}
      />
      <FloatingNodePalette />
      <QuickActionsPanel
        onFitView={handleFitView}
        onAutoLayout={handleAutoLayout}
        onToggleMinimap={() => setShowMinimap((prev) => !prev)}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
      />
      <BottomToolbar
        workflowName={workflowName}
        onSave={onSave}
        onExport={onExport}
        onRun={onRun}
        isRunning={isRunning}
      />
      <div className="absolute bottom-6 right-6 rounded-2xl border border-white/30 bg-white/80 px-4 py-2 text-xs text-slate-600 shadow-lg backdrop-blur">
        {overlayStats.nodes} nodes · {overlayStats.edges} edges
      </div>
      <CanvasContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isOpen={contextMenu.open}
        onClose={() => setContextMenu((prev) => ({ ...prev, open: false }))}
        onAddNode={() => {
          handleAddNode('agent')
          setContextMenu((prev) => ({ ...prev, open: false }))
        }}
        onFitView={() => {
          handleFitView()
          setContextMenu((prev) => ({ ...prev, open: false }))
        }}
      />
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onAddNode={(type) => handleAddNode(type)}
      />
      {!showGrid && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/60 via-transparent to-transparent" />
      )}
      {!showMinimap && (
        <div className="absolute right-6 top-20 rounded-xl border border-white/30 bg-white/80 px-3 py-2 text-[11px] text-slate-500 shadow-lg backdrop-blur">
          Minimap hidden
        </div>
      )}
    </div>
  )
}

export default CanvasEditor