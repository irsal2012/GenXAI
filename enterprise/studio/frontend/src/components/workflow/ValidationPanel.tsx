interface ValidationPanelProps {
  errors: string[]
  onClose: () => void
}

const ValidationPanel = ({ errors, onClose }: ValidationPanelProps) => {
  if (errors.length === 0) return null

  return (
    <div className="absolute left-6 top-24 z-30 w-80 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Validation Issues</div>
        <button
          className="text-xs text-red-500 hover:text-red-700"
          onClick={onClose}
        >
          Dismiss
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {errors.map((error) => (
          <li key={error} className="rounded-lg bg-white/60 p-2">
            {error}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ValidationPanel