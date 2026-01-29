import { useState } from 'react'
import { useCreateAgent, useDeleteAgent, useUpdateAgent, useAgents } from '../services/agents'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import AgentEditModal from '../components/AgentEditModal'
import AgentCreateModal from '../components/AgentCreateModal'
import type { Agent, AgentInput } from '../types/api'

const AgentsPage = () => {
  const agentsQuery = useAgents()
  const createAgent = useCreateAgent()
  const deleteAgent = useDeleteAgent()
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const updateAgent = useUpdateAgent(editingAgent?.id ?? '')

  const handleCreate = async (data: AgentInput) => {
    await createAgent.mutateAsync(data)
  }

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (agentId: string) => {
    if (!window.confirm('Delete this agent?')) return
    await deleteAgent.mutateAsync(agentId)
  }

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setIsEditModalOpen(true)
  }

  const handleSave = async (data: AgentInput) => {
    if (editingAgent) {
      await updateAgent.mutateAsync(data)
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingAgent(null)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Agent Catalog</h2>
          <p className="text-sm text-slate-500">Define reusable agents for workflows.</p>
        </div>
        <button
          className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          onClick={handleOpenCreateModal}
        >
          Create agent
        </button>
      </div>

      {agentsQuery.isLoading ? (
        <LoadingState message="Loading agents..." />
      ) : agentsQuery.isError ? (
        <ErrorState message="Unable to load agents." />
      ) : (
        <div className="grid gap-4">
          {agentsQuery.data?.map((agent) => (
            <div key={agent.id} className="card flex items-center justify-between p-5">
              <div>
                <p className="text-base font-semibold text-slate-900">{agent.role}</p>
                <p className="text-sm text-slate-500">{agent.goal}</p>
                <p className="mt-1 text-xs text-slate-400">Model: {agent.llm_model}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => handleEdit(agent)}
                >
                  Edit
                </button>
                <button
                  className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(agent.id)}
                  disabled={deleteAgent.isPending}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {agentsQuery.data?.length === 0 ? (
            <div className="card p-6 text-sm text-slate-500">No agents yet. Create one to get started.</div>
          ) : null}
        </div>
      )}

      <AgentCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreate={handleCreate}
        isCreating={createAgent.isPending}
      />

      <AgentEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSave}
        agent={editingAgent}
        isSaving={updateAgent.isPending}
      />
    </div>
  )
}

export default AgentsPage
