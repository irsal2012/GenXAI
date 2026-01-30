import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './api'
import type { ToolStats, ToolSummary } from '../types/api'

export const toolsKeys = {
  all: ['tools'] as const,
  categories: ['tools', 'categories'] as const,
  stats: ['tools', 'stats'] as const,
  templates: ['tools', 'templates'] as const,
}

export const useTools = () => {
  return useQuery({
    queryKey: toolsKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ToolSummary[]>('/tools')
      return data
    },
  })
}

export const useToolCategories = () => {
  return useQuery({
    queryKey: toolsKeys.categories,
    queryFn: async () => {
      const { data } = await api.get<string[]>('/tools/categories')
      return data
    },
  })
}

export const useToolStats = () => {
  return useQuery({
    queryKey: toolsKeys.stats,
    queryFn: async () => {
      const { data } = await api.get<ToolStats>('/tools/stats')
      return data
    },
  })
}

export const useToolSearch = (query: string, category?: string) => {
  return useQuery({
    queryKey: ['tools', 'search', query, category ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get<ToolSummary[]>('/tools/search', {
        params: { query, category },
      })
      return data
    },
    enabled: Boolean(query),
  })
}

export const useToolTemplates = () => {
  return useQuery({
    queryKey: toolsKeys.templates,
    queryFn: async () => {
      const { data } = await api.get<any[]>('/tools/templates/list')
      return data
    },
  })
}

export const useCreateTool = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (toolData: any) => {
      const { data } = await api.post('/tools', toolData)
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch tools
      queryClient.invalidateQueries({ queryKey: toolsKeys.all })
      queryClient.invalidateQueries({ queryKey: toolsKeys.stats })
    },
  })
}

export const useDeleteTool = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (toolName: string) => {
      const { data } = await api.delete(`/tools/${toolName}`)
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch tools
      queryClient.invalidateQueries({ queryKey: toolsKeys.all })
      queryClient.invalidateQueries({ queryKey: toolsKeys.stats })
    },
  })
}

export const useExecuteTool = () => {
  return useMutation({
    mutationFn: async ({
      toolName,
      parameters,
    }: {
      toolName: string
      parameters: Record<string, any>
    }) => {
      const { data } = await api.post(`/tools/${toolName}/execute`, parameters)
      return data
    },
  })
}
