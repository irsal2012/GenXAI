import { useState, useMemo } from 'react'
import AgentsPage from './pages/AgentsPage'
import ToolsPage from './pages/ToolsPage'
import WorkflowsPage from './pages/WorkflowsPage'
import Sidebar from './components/Sidebar'
import { ToastProvider } from './components/Toast'

function App() {
  const [activeTab, setActiveTab] = useState('workflows')

  const navItems = useMemo(
    () => [
      {
        id: 'workflows',
        label: 'Workflows',
        description: 'Orchestrate multi-agent tasks',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
      {
        id: 'agents',
        label: 'Agents',
        description: 'Configure AI agents',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        id: 'tools',
        label: 'Tools',
        description: 'Browse available tools',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        ),
      },
    ],
    []
  )

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        {/* Animated background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex min-h-screen">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} navItems={navItems} />

          <main className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'workflows' && <WorkflowsPage />}
            {activeTab === 'agents' && <AgentsPage />}
            {activeTab === 'tools' && <ToolsPage />}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}

export default App
