import { useEffect, useMemo, useState } from 'react'
import { apiService, Tool } from '../services/api'

export default function ToolMarketplace() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  useEffect(() => {
    const loadTools = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiService.getTools()
        setTools(data)
      } catch (err) {
        setError('Unable to load tools')
      } finally {
        setIsLoading(false)
      }
    }

    loadTools()
  }, [])

  const categories = useMemo(() => {
    const unique = new Set<string>(['All'])
    tools.forEach(tool => unique.add(tool.category))
    return Array.from(unique)
  }, [tools])

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const selectedToolData = tools.find(t => t.name === selectedTool)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Research': 'from-blue-500 to-cyan-500',
      'File Operations': 'from-green-500 to-emerald-500',
      'Computation': 'from-purple-500 to-pink-500',
      'Communication': 'from-yellow-500 to-orange-500',
      'Data': 'from-indigo-500 to-purple-500',
      'Integration': 'from-pink-500 to-red-500',
      'Media': 'from-orange-500 to-red-500',
      'NLP': 'from-teal-500 to-cyan-500',
      'Development': 'from-gray-500 to-slate-500',
      'Writing': 'from-violet-500 to-purple-500'
    }
    return colors[category] || 'from-gray-500 to-gray-600'
  }

  return (
    <div className="h-full flex text-slate-200">
      {/* Sidebar - Filters */}
      <div className="w-64 bg-slate-900/60 border-r border-white/10 p-5 overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${
                selectedCategory === category
                  ? 'bg-white/15 text-white shadow-md shadow-purple-500/20'
                  : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              {category}
              {category !== 'All' && (
                <span className="float-right text-xs opacity-70">
                  {tools.filter(t => t.category === category).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Filter</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-slate-800 transition">
              Registry ({tools.length})
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-slate-800 transition">
              Top Rated
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="p-6 bg-slate-900/40 border-b border-white/10">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full input-field pl-12 pr-4 py-3"
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <div
                key={tool.name}
                onClick={() => setSelectedTool(tool.name)}
                className={`card-elevated card-hover rounded-2xl p-5 border cursor-pointer transition-all ${
                  selectedTool === tool.name
                    ? 'border-purple-500/80 shadow-lg shadow-purple-500/20'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(tool.category)} rounded-lg flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="badge-pill bg-white/10 text-slate-200">Registry</span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">{tool.name}</h3>
                <p className="text-xs text-purple-400 mb-2">{tool.category}</p>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{tool.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="text-slate-400">{tool.tags?.length || 0} tags</span>
                  <span>Schema</span>
                </div>
              </div>
            ))}
          </div>

          {(isLoading || error) && (
            <div className="mt-6 text-xs text-slate-400">
              {isLoading ? 'Loading tools...' : error}
            </div>
          )}

          {filteredTools.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">No Tools Found</h3>
                <p className="text-slate-400">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tool Details Panel */}
      {selectedToolData && (
        <div className="w-96 bg-slate-900/60 border-l border-white/10 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Tool Details</h3>
            <button
              onClick={() => setSelectedTool(null)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className={`w-16 h-16 bg-gradient-to-r ${getCategoryColor(selectedToolData.category)} rounded-lg flex items-center justify-center mb-4`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{selectedToolData.name}</h2>
          <p className="text-purple-400 mb-4">{selectedToolData.category}</p>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-1">Description</h4>
              <p className="text-sm text-gray-400">{selectedToolData.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-1">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedToolData.tags || []).length > 0 ? (
                  selectedToolData.tags?.map(tag => (
                    <span key={tag} className="badge-pill bg-white/10 text-slate-200">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No tags listed</span>
                )}
              </div>
            </div>
          </div>

          <button className="w-full py-3 rounded-xl font-semibold btn-secondary transition">
            View Documentation
          </button>
        </div>
      )}
    </div>
  )
}
