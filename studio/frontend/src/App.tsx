import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './app/AppShell'
import DashboardPage from './pages/DashboardPage'
import WorkflowsPage from './pages/WorkflowsPage'
import WorkflowBuilderPage from './pages/WorkflowBuilderPage'
import AgentsPage from './pages/AgentsPage'
import ToolsPage from './pages/ToolsPage'
import TemplatesPage from './pages/TemplatesPage'
import ToolPlaygroundPage from './pages/ToolPlaygroundPage'

const App = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="workflows" element={<WorkflowsPage />} />
        <Route path="workflows/:workflowId" element={<WorkflowBuilderPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="playground" element={<ToolPlaygroundPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App