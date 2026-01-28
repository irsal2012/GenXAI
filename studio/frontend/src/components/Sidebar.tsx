import { useState } from 'react'

interface NavItem {
  id: string
  label: string
  description: string
  icon: JSX.Element
}

interface SidebarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  navItems: NavItem[]
}

export default function Sidebar({ activeTab, onTabChange, navItems }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`flex flex-col border-r border-slate-700/50 bg-slate-900/40 backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-80'
      }`}
    >
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold text-white">GenXAI Studio</h1>
                <p className="text-xs text-slate-400">AI Agent Platform</p>
              </div>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="mt-4 w-full p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Expand sidebar"
          >
            <svg className="w-5 h-5 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="p-6 border-b border-slate-700/50">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-700/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-300 font-medium">Online</span>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              <div className="flex justify-between py-1">
                <span>Backend</span>
                <span className="text-slate-300">localhost:8000</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Environment</span>
                <span className="text-slate-300">Development</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className={`flex-1 p-4 space-y-2 overflow-y-auto ${isCollapsed ? 'px-2' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full text-left rounded-xl px-4 py-3 transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 text-white shadow-lg shadow-purple-500/20'
                : 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
            } ${isCollapsed ? 'px-0 flex justify-center' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            {isCollapsed ? (
              <div className="w-full flex justify-center">{item.icon}</div>
            ) : (
              <div className="flex items-center gap-3">
                <div className={activeTab === item.id ? 'text-purple-400' : 'text-slate-500'}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                </div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="p-6 border-t border-slate-700/50">
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Quick Tips</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use workflows to orchestrate multi-agent tasks and monitor execution in real-time.
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
