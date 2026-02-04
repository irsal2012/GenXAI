import { useEffect } from 'react'
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline'
import Sidebar from '../Sidebar'

interface HamburgerMenuProps {
  isOpen: boolean
  onToggle: () => void
}

const HamburgerMenu = ({ isOpen, onToggle }: HamburgerMenuProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onToggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onToggle])

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="absolute left-4 top-4 z-40 flex items-center justify-center rounded-full border border-white/40 bg-slate-900/70 p-2 text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
        title="Open navigation"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onToggle} />
          <div className="relative z-50 h-full">
            <Sidebar />
            <button
              type="button"
              onClick={onToggle}
              className="absolute right-4 top-4 rounded-full border border-white/40 bg-slate-900/70 p-2 text-white shadow-lg backdrop-blur transition hover:bg-slate-900"
              title="Close navigation"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default HamburgerMenu