/**
 * Node Palette - Draggable node types sidebar for workflow builder
 * Provides drag-and-drop interface for adding nodes to the canvas
 */

import { useAgents } from '../../services/agents'

interface NodeType {
  type: string
  label: string
  icon: string
  color: string
  description: string
}

interface NodePaletteProps {
  className?: string
}

const nodeTypes: NodeType[] = [
  {
    type: 'start',
    label: 'Start',
    icon: '▶️',
    color: '#10b981',
    description: 'Workflow entry point',
  },
  {
    type: 'decision',
    label: 'Decision',
    icon: '❓',
    color: '#f59e0b',
    description: 'Conditional branching',
  },
  {
    type: 'end',
    label: 'End',
    icon: '⏹️',
    color: '#ef4444',
    description: 'Workflow exit point',
  },
]

const NodePalette = ({ className }: NodePaletteProps) => {
  const { data: agents, isLoading } = useAgents()

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className={`w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto dark:bg-slate-950 dark:border-slate-800 ${className || ''}`}>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Node Types</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Drag nodes onto the canvas to build your workflow</p>
      </div>

      <div className="space-y-3">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm cursor-move transition-all dark:border-slate-700 dark:bg-slate-900"
            style={{ borderLeftColor: node.color, borderLeftWidth: '4px' }}
            title={`Drag to add a ${node.label} node`}
          >
            <div className="text-2xl">{node.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-100">{node.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{node.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Available Agents Section */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Available Agents</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {isLoading ? 'Loading agents...' : `${agents?.length || 0} agents available`}
        </p>

        {!isLoading && agents && agents.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {agents.map((agent) => (
              <div
                key={agent.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'agent')
                  e.dataTransfer.setData('agentId', agent.id)
                  e.dataTransfer.setData('agentName', agent.role)
                  e.dataTransfer.setData('agentGoal', agent.goal)
                  e.dataTransfer.setData('agentTools', JSON.stringify(agent.tools || []))
                  e.dataTransfer.effectAllowed = 'move'
                }}
                className="flex flex-col gap-1 p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 cursor-move transition-all dark:border-slate-700 dark:bg-slate-900"
                title={`Drag to add agent: ${agent.role}`}
              >
                <div className="flex items-center gap-2">
                  <div className="text-lg">🤖</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-100 truncate">{agent.role}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{agent.goal}</div>
                  </div>
                </div>
                {agent.tools && agent.tools.length > 0 && (
                  <div className="flex items-center gap-1 pl-7">
                    <div className="text-[10px]">🔧</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400">
                      {agent.tools.length} tool{agent.tools.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!agents || agents.length === 0) && (
          <div className="text-xs text-slate-400 dark:text-slate-500 italic">No agents available. Create agents first.</div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Quick Tips</h3>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <li>• Drag nodes onto canvas</li>
          <li>• Click nodes to configure</li>
          <li>• Connect nodes by dragging edges</li>
          <li>• Delete with Backspace/Delete key</li>
        </ul>
      </div>
    </div>
  )
}

export default NodePalette
