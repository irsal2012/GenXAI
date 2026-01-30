import { NavLink } from 'react-router-dom'
import { 
  Squares2X2Icon, 
  PlayCircleIcon, 
  UserCircleIcon, 
  WrenchScrewdriverIcon,
  DocumentDuplicateIcon,
  BeakerIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const links = [
  { to: '/', label: 'Dashboard', icon: Squares2X2Icon },
  { to: '/tools', label: 'Tools', icon: WrenchScrewdriverIcon },
  { to: '/agents', label: 'Agents', icon: UserCircleIcon },
  { to: '/workflows', label: 'Workflows', icon: PlayCircleIcon },
  { to: '/templates', label: 'Templates', icon: DocumentDuplicateIcon },
  { to: '/playground', label: 'Playground', icon: BeakerIcon },
]

const Sidebar = () => {
  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-950 text-white">
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
            {link.label}
          </NavLink>
        ))}
      </nav>
      
      {/* Settings at bottom - icon only, left-aligned */}
      <div className="px-3 pb-3">
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
        </NavLink>
      </div>
      
      <div className="px-6 py-4 text-xs text-slate-400">API: http://localhost:8000</div>
    </aside>
  )
}

export default Sidebar
