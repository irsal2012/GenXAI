import { Navigate, Route, Routes } from 'react-router-dom'
import { ApiKeyProvider } from './contexts/ApiKeyContext'
import AppShell from './app/AppShell'
import DashboardPage from './pages/DashboardPage'
import WorkflowsPage from './pages/WorkflowsPage'
import WorkflowBuilderPage from './pages/WorkflowBuilderPage'
import AgentsPage from './pages/AgentsPage'
import AgentBuilderPage from './pages/AgentBuilderPage'
import ToolsPage from './pages/ToolsPage'
import TemplatesPage from './pages/TemplatesPage'
import ToolPlaygroundPage from './pages/ToolPlaygroundPage'
import SettingsPage from './pages/SettingsPage'

const App = () => {
  return (
    <ApiKeyProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="workflows/:workflowId" element={<WorkflowBuilderPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="agents/builder" element={<AgentBuilderPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="playground" element={<ToolPlaygroundPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ApiKeyProvider>
  )
}

export default App
