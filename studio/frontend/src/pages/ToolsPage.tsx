import { useMemo, useState } from 'react'
import { useToolCategories, useToolSearch, useTools } from '../services/tools'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'

const ToolsPage = () => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const toolsQuery = useTools()
  const categoriesQuery = useToolCategories()
  const searchQuery = useToolSearch(query, category || undefined)

  const tools = useMemo(() => {
    if (query) return searchQuery.data ?? []
    return toolsQuery.data ?? []
  }, [query, searchQuery.data, toolsQuery.data])

  if (toolsQuery.isLoading) {
    return <LoadingState message="Loading tools..." />
  }

  if (toolsQuery.isError) {
    return <ErrorState message="Unable to load tools." />
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-medium uppercase text-slate-500">Search</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Search by name or description"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-slate-500">Category</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All categories</option>
              {categoriesQuery.data?.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => {
                setQuery('')
                setCategory('')
              }}
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        {tools.map((tool) => (
          <div key={tool.name} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">{tool.name}</p>
                <p className="text-sm text-slate-500">{tool.description}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {tool.category}
              </span>
            </div>
            {tool.tags?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {tools.length === 0 ? (
          <div className="card p-6 text-sm text-slate-500">No tools matched your filters.</div>
        ) : null}
      </div>
    </div>
  )
}

export default ToolsPage