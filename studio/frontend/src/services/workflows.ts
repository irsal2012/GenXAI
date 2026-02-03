import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from './api'
import type { ExecutionResult, Workflow, WorkflowExecuteInput, WorkflowExport, WorkflowInput, WorkflowTemplate } from '../types/api'

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
    mutationFn: async (input: WorkflowExecuteInput) => {
      const { data } = await api.post<ExecutionResult>(`/workflows/${workflowId}/execute`, input)
      return data
    },
  })
}

export const createWorkflowExecutionStream = (
  workflowId: string,
  payload: WorkflowExecuteInput,
  onMessage: (event: { type: string; payload: any }) => void,
  onError?: (error: Event) => void,
) => {
  const params = new URLSearchParams()
  const inputValue = typeof payload.input === 'string' ? payload.input : JSON.stringify(payload.input)
  params.set('input', inputValue)
  if (payload.model_override) {
    params.set('model_override', payload.model_override)
  }
  const openaiKey = localStorage.getItem('genxai_openai_api_key')
  const anthropicKey = localStorage.getItem('genxai_anthropic_api_key')
  if (openaiKey) {
    params.set('openai_api_key', openaiKey)
  }
  if (anthropicKey) {
    params.set('anthropic_api_key', anthropicKey)
  }

  const source = new EventSource(`/api/workflows/${workflowId}/execute-stream?${params.toString()}`)
  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (err) {
      console.error('Failed to parse workflow stream message', err)
    }
  }
  source.onerror = (event) => {
    onError?.(event)
  }

  return source
}

export const useExportWorkflowCode = () => {
  return useMutation({
    mutationFn: async (workflowId: string) => {
      const { data } = await api.post<WorkflowExport>(`/workflows/${workflowId}/export-code`)
      return data
    },
  })
}

export const useDownloadWorkflowCode = () => {
  return useMutation({
    mutationFn: async (workflowId: string) => {
      const response = await api.get(`/workflows/${workflowId}/download-code`, {
        responseType: 'blob',
      })
      return response
    },
  })
}

export const useExecutions = () => {
  return useQuery({
    queryKey: ['executions'],
    queryFn: async () => {
      const { data } = await api.get<ExecutionResult[]>('/executions')
      return data
    },
  })
}

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await api.get<WorkflowTemplate[]>('/templates')
      return data
    },
  })
}

export const useCreateTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data } = await api.post<WorkflowTemplate>('/templates', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (templateId: string) => {
      const { data } = await api.delete(`/templates/${templateId}`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}