import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from './api'
import type { Agent, AgentInput } from '../types/api'

export const agentsKeys = {
  all: ['agents'] as const,
  detail: (id: string) => ['agents', id] as const,
}

export const useAgents = () => {
  return useQuery({
    queryKey: agentsKeys.all,
    queryFn: async () => {
      const { data } = await api.get<Agent[]>('/agents')
      return data
    },
  })
}

export const useAgent = (agentId?: string) => {
  return useQuery({
    queryKey: agentId ? agentsKeys.detail(agentId) : agentsKeys.detail('missing'),
    queryFn: async () => {
      const { data } = await api.get<Agent>(`/agents/${agentId}`)
      return data
    },
    enabled: Boolean(agentId),
  })
}

export const useCreateAgent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AgentInput) => {
      const { data } = await api.post<Agent>('/agents', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agentsKeys.all }),
  })
}

export const useUpdateAgent = (agentId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AgentInput) => {
      const { data } = await api.put<Agent>(`/agents/${agentId}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentsKeys.all })
      queryClient.invalidateQueries({ queryKey: agentsKeys.detail(agentId) })
    },
  })
}

export const useDeleteAgent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (agentId: string) => {
      const { data } = await api.delete(`/agents/${agentId}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agentsKeys.all }),
  })
}