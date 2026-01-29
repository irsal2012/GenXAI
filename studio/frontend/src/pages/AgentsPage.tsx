import { useCreateAgent, useDeleteAgent, useAgents } from '../services/agents'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import type { AgentInput } from '../types/api'

const defaultAgent: AgentInput = {
  role: 'Research Assistant',
  goal: 'Help uncover insights quickly',
  backstory: 'Seasoned analyst with a knack for synthesis.',
  llm_model: 'gpt-4',
  tools: [],
  metadata: {},
}

const AgentsPage = () => {
  const agentsQuery = useAgents()
  const createAgent = useCreateAgent()
  const deleteAgent = useDeleteAgent()

  const handleCreate = async () => {
    await createAgent.mutateAsync({
      ...defaultAgent,
      role: `Agent ${Date.now()}`,
    })
  }

  const handleDelete = async (agentId: string) => {
    if (!window.confirm('Delete this agent?')) return
    await deleteAgent.mutateAsync(agentId)
  }

  if (agentsQuery.isLoading) {
    return <LoadingState message="Loading agents..." />
  }

  if (agentsQuery.isError) {
    return <ErrorState message="Unable to load agents." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Agent Catalog</h2>
          <p className="text-sm text-slate-500">Define reusable agents for workflows.</p>
        </div>
        <button
          className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          onClick={handleCreate}
          disabled={createAgent.isPending}
        >
          {createAgent.isPending ? 'Creating...' : 'Create agent'}
        </button>
      </div>
      <div className="grid gap-4">
        {agentsQuery.data?.map((agent) => (
          <div key={agent.id} className="card flex items-center justify-between p-5">
            <div>
              <p className="text-base font-semibold text-slate-900">{agent.role}</p>
              <p className="text-sm text-slate-500">{agent.goal}</p>
              <p className="mt-1 text-xs text-slate-400">Model: {agent.llm_model}</p>
            </div>
            <button
              className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(agent.id)}
              disabled={deleteAgent.isPending}
            >
              Delete
            </button>
          </div>
        ))}
        {agentsQuery.data?.length === 0 ? (
          <div className="card p-6 text-sm text-slate-500">No agents yet. Create one to get started.</div>
        ) : null}
      </div>
    </div>
  )
}

export default AgentsPage