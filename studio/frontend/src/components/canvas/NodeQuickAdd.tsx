import { PlusIcon } from '@heroicons/react/24/outline'

interface NodeQuickAddProps {
  onClick: () => void
}

const NodeQuickAdd = ({ onClick }: NodeQuickAddProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:bg-primary-600 hover:text-white"
      title="Quick add"
    >
      <PlusIcon className="h-4 w-4" />
    </button>
  )
}

export default NodeQuickAdd