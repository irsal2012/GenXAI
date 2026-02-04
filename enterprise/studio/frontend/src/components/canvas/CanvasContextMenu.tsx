interface CanvasContextMenuProps {
  x: number
  y: number
  isOpen: boolean
  onClose: () => void
  onAddNode: () => void
  onFitView: () => void
}

const CanvasContextMenu = ({ x, y, isOpen, onClose, onAddNode, onFitView }: CanvasContextMenuProps) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
      onContextMenu={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div
        className="absolute w-48 rounded-xl border border-white/20 bg-white/95 p-2 text-sm text-slate-700 shadow-2xl backdrop-blur-xl dark:bg-slate-950/90 dark:text-slate-100"
        style={{ left: x, top: y }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
          onClick={onAddNode}
        >
          + Add node
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
          onClick={onFitView}
        >
          Fit view
        </button>
      </div>
    </div>
  )
}

export default CanvasContextMenu