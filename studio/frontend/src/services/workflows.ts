import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from './api'
import type { ExecutionResult, Workflow, WorkflowInput } from '../types/api'

export const workflowsKeys = {
  all: ['workflows'] as const,
  detail: (id: string) => ['workflows', id] as const,
}

export const useWorkflows = () => {
  return useQuery({
    queryKey: workflowsKeys.all,
    queryFn: async () => {
      const { data } = await api.get<Workflow[]>('/workflows')
      return data
    },
  })
}

export const useWorkflow = (workflowId?: string) => {
  return useQuery({
    queryKey: workflowId ? workflowsKeys.detail(workflowId) : workflowsKeys.detail('missing'),
    queryFn: async () => {
      const { data } = await api.get<Workflow>(`/workflows/${workflowId}`)
      return data
    },
    enabled: Boolean(workflowId),
  })
}

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: WorkflowInput) => {
      const { data } = await api.post<Workflow>('/workflows', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workflowsKeys.all }),
  })
}

export const useUpdateWorkflow = (workflowId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: WorkflowInput) => {
      const { data } = await api.put<Workflow>(`/workflows/${workflowId}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowsKeys.all })
      queryClient.invalidateQueries({ queryKey: workflowsKeys.detail(workflowId) })
    },
  })
}

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (workflowId: string) => {
      const { data } = await api.delete(`/workflows/${workflowId}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workflowsKeys.all }),
  })
}

export const useExecuteWorkflow = (workflowId: string) => {
  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const { data } = await api.post<ExecutionResult>(`/workflows/${workflowId}/execute`, input)
      return data
    },
  })
}