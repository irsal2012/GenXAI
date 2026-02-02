import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onAddNode: (type: string) => void
}

const nodeOptions = [
  { type: 'start', label: 'Start node' },
  { type: 'agent', label: 'Agent node' },
  { type: 'decision', label: 'Decision node' },
  { type: 'tool', label: 'Tool node' },
  { type: 'end', label: 'End node' },
]

const CommandPalette = ({ isOpen, onClose, onAddNode }: CommandPaletteProps) => {
  const [query, setQuery] = useState('')

  if (!isOpen) return null

  const filtered = nodeOptions.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl dark:bg-slate-950/90"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search nodes to add"
            className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-slate-100"
          />
        </div>
        <div className="max-h-72 overflow-auto p-2">
          {filtered.map((option) => (
            <button
              key={option.type}
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
              onClick={() => {
                onAddNode(option.type)
                onClose()
              }}
            >
              {option.label}
              <span className="text-xs text-slate-400">Add</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-slate-400">No matching nodes</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette