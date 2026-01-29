import { useQuery } from '@tanstack/react-query'
import api from './api'
import type { ToolStats, ToolSummary } from '../types/api'

export const toolsKeys = {
  all: ['tools'] as const,
  categories: ['tools', 'categories'] as const,
  stats: ['tools', 'stats'] as const,
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