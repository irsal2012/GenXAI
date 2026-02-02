import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Squares2X2Icon,
  PlayCircleIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  DocumentDuplicateIcon,
  BeakerIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const links = [
  { to: '/', label: 'Dashboard', icon: Squares2X2Icon },
  { to: '/tools', label: 'Tools', icon: WrenchScrewdriverIcon },
  { to: '/agents', label: 'Agents', icon: UserCircleIcon },
  { to: '/workflows', label: 'Workflows', icon: PlayCircleIcon },
  { to: '/executions', label: 'Executions', icon: ClockIcon },
  { to: '/templates', label: 'Templates', icon: DocumentDuplicateIcon },
  { to: '/playground', label: 'Playground', icon: BeakerIcon },
]

const Sidebar = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('studio-dark-mode') === 'true'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    localStorage.setItem('studio-dark-mode', String(isDarkMode))
  }, [isDarkMode])

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-950 text-white dark:bg-slate-900">
      <div className="px-6 py-6">
        <p className="text-xl font-semibold">GenXAI Studio</p>
        <p className="text-sm text-slate-300">No-code builder</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            <span className="truncate">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Settings and theme toggle at bottom */}
      <div className="px-3 pb-3 space-y-2">
        <button
          type="button"
          onClick={() => setIsDarkMode((prev) => !prev)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          {isDarkMode ? 'Light mode' : 'Dark mode'}
        </button>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
              isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`
          }
          title="Settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
          Settings
        </NavLink>
      </div>
      
      <div className="px-6 py-4 text-xs text-slate-400">API: http://localhost:8000</div>
    </aside>
  )
}

export default Sidebar
