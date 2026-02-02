import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/workflows': 'Workflows',
  '/agents': 'Agents',
  '/tools': 'Tools',
  '/settings': 'Settings',
}

const AppShell = () => {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'Workflow Builder'

  const isWorkflowCanvas = pathname.startsWith('/workflows/')

  if (isWorkflowCanvas) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Build, iterate, and deploy agent workflows.</p>
        </header>
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell