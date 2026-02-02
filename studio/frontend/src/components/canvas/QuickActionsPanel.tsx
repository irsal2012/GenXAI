import { ArrowsPointingOutIcon, ArrowPathIcon, Squares2X2Icon, ViewfinderCircleIcon } from '@heroicons/react/24/outline'

interface QuickActionsPanelProps {
  onFitView: () => void
  onAutoLayout: () => void
  onToggleMinimap: () => void
  onToggleGrid: () => void
}

const QuickActionsPanel = ({ onFitView, onAutoLayout, onToggleMinimap, onToggleGrid }: QuickActionsPanelProps) => {
  return (
    <div className="group absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
      <div className="h-2 w-2 rounded-full bg-slate-900/40" />
      <div className="pointer-events-none translate-y-2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex flex-col gap-2 rounded-2xl border border-white/20 bg-white/90 p-3 shadow-2xl backdrop-blur-xl dark:bg-slate-950/80">
          <button
            type="button"
            onClick={onFitView}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <ViewfinderCircleIcon className="h-4 w-4" />
            Fit view
          </button>
          <button
            type="button"
            onClick={onAutoLayout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Auto layout
          </button>
          <button
            type="button"
            onClick={onToggleMinimap}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Squares2X2Icon className="h-4 w-4" />
            Minimap
          </button>
          <button
            type="button"
            onClick={onToggleGrid}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <ArrowsPointingOutIcon className="h-4 w-4" />
            Grid
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuickActionsPanel