import { useAgents } from '../services/agents'
import { useTools, useToolStats } from '../services/tools'
import { useWorkflows } from '../services/workflows'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatCard from '../components/StatCard'

const DashboardPage = () => {
  const workflowsQuery = useWorkflows()
  const agentsQuery = useAgents()
  const toolsQuery = useTools()
  const toolStatsQuery = useToolStats()

  if (workflowsQuery.isLoading || agentsQuery.isLoading || toolsQuery.isLoading || toolStatsQuery.isLoading) {
    return <LoadingState message="Loading studio metrics..." />
  }

  if (workflowsQuery.isError || agentsQuery.isError || toolsQuery.isError || toolStatsQuery.isError) {
    return <ErrorState message="Unable to load dashboard data." />
  }

  const workflowCount = workflowsQuery.data?.length ?? 0
  const agentCount = agentsQuery.data?.length ?? 0
  const toolCount = toolsQuery.data?.length ?? 0
  const stats = toolStatsQuery.data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Workflows" value={workflowCount} helper="Visual automations" />
        <StatCard label="Agents" value={agentCount} helper="Reusable agent profiles" />
        <StatCard label="Tools" value={toolCount} helper="Registered capabilities" />
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-semibold">Tool coverage</h2>
        <p className="mt-2 text-sm text-slate-500">
          {stats ? `${stats.total_tools} tools across ${Object.keys(stats.categories).length} categories.` : 'Loading tool stats...'}
        </p>
        {stats ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium text-slate-700">{category}</p>
                <p className="text-sm text-slate-500">{count} tools</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default DashboardPage