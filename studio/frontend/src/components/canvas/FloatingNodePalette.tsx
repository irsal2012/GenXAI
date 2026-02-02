import { useState } from 'react'
import { MagnifyingGlassIcon, SquaresPlusIcon } from '@heroicons/react/24/outline'
import NodePalette from '../workflow/NodePalette'

const FloatingNodePalette = () => {
  const [search, setSearch] = useState('')

  return (
    <div className="group absolute left-0 top-0 z-20 flex h-full items-center">
      <div className="h-32 w-2 rounded-r-full bg-slate-900/40 transition group-hover:w-3" />

      <div className="pointer-events-none absolute left-0 top-0 h-full w-72 -translate-x-full opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100">
        <div className="h-full rounded-r-3xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl dark:bg-slate-950/80">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-100">
            <span className="flex items-center gap-2">
              <SquaresPlusIcon className="h-5 w-5" />
              Add nodes
            </span>
            <span className="text-xs text-slate-500">Drag & drop</span>
          </div>
          <div className="px-4 pt-3">
            <label className="relative block">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search nodes"
                className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-xs text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
          </div>
          <NodePalette className="border-0 bg-transparent px-4 pb-6 pt-4" />
        </div>
      </div>
    </div>
  )
}

export default FloatingNodePalette