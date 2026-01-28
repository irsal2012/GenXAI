import { useState } from 'react'

interface Tool {
  id: string
  name: string
  category: string
  description: string
  installed: boolean
  version: string
  author: string
  rating: number
}

export default function ToolMarketplace() {
  const [tools, setTools] = useState<Tool[]>([
    {
      id: '1',
      name: 'Web Search',
      category: 'Research',
      description: 'Search the web for information using various search engines',
      installed: true,
      version: '1.2.0',
      author: 'GenXAI',
      rating: 4.8
    },
    {
      id: '2',
      name: 'File Reader',
      category: 'File Operations',
      description: 'Read and parse various file formats including PDF, DOCX, CSV',
      installed: true,
      version: '1.0.5',
      author: 'GenXAI',
      rating: 4.6
    },
    {
      id: '3',
      name: 'Calculator',
      category: 'Computation',
      description: 'Perform mathematical calculations and complex computations',
      installed: true,
      version: '2.1.0',
      author: 'GenXAI',
      rating: 4.9
    },
    {
      id: '4',
      name: 'Email Sender',
      category: 'Communication',
      description: 'Send emails with attachments and HTML formatting',
      installed: false,
      version: '1.3.2',
      author: 'GenXAI',
      rating: 4.5
    },
    {
      id: '5',
      name: 'Database Query',
      category: 'Data',
      description: 'Execute SQL queries on various database systems',
      installed: false,
      version: '1.1.0',
      author: 'GenXAI',
      rating: 4.7
    },
    {
      id: '6',
      name: 'API Caller',
      category: 'Integration',
      description: 'Make HTTP requests to external APIs with authentication',
      installed: true,
      version: '1.4.1',
      author: 'GenXAI',
      rating: 4.8
    },
    {
      id: '7',
      name: 'Image Generator',
      category: 'Media',
      description: 'Generate images using AI models like DALL-E and Stable Diffusion',
      installed: false,
      version: '0.9.0',
      author: 'Community',
      rating: 4.4
    },
    {
      id: '8',
      name: 'Text Analyzer',
      category: 'NLP',
      description: 'Analyze text for sentiment, entities, and key phrases',
      installed: true,
      version: '1.5.3',
      author: 'GenXAI',
      rating: 4.7
    },
    {
      id: '9',
      name: 'Data Transformer',
      category: 'Data',
      description: 'Transform and manipulate data between different formats',
      installed: false,
      version: '1.2.1',
      author: 'GenXAI',
      rating: 4.6
    },
    {
      id: '10',
      name: 'Code Generator',
      category: 'Development',
      description: 'Generate code in multiple programming languages',
      installed: false,
      version: '1.0.0',
      author: 'Community',
      rating: 4.3
    },
    {
      id: '11',
      name: 'Grammar Checker',
      category: 'Writing',
      description: 'Check and correct grammar, spelling, and style',
      installed: false,
      version: '2.0.0',
      author: 'GenXAI',
      rating: 4.8
    },
    {
      id: '12',
      name: 'Debugger',
      category: 'Development',
      description: 'Debug and analyze code for errors and performance issues',
      installed: false,
      version: '1.1.5',
      author: 'Community',
      rating: 4.5
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const categories = ['All', 'Research', 'File Operations', 'Computation', 'Communication', 'Data', 'Integration', 'Media', 'NLP', 'Development', 'Writing']

  const toggleInstall = (id: string) => {
    setTools(tools.map(t => t.id === id ? { ...t, installed: !t.installed } : t))
  }

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const selectedToolData = tools.find(t => t.id === selectedTool)

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
              Installed ({tools.filter(t => t.installed).length})
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-slate-800 transition">
              Not Installed ({tools.filter(t => !t.installed).length})
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
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`card-elevated card-hover rounded-2xl p-5 border cursor-pointer transition-all ${
                  selectedTool === tool.id
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
                  {tool.installed && (
                    <span className="badge-pill bg-green-500/20 text-green-400">
                      Installed
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">{tool.name}</h3>
                <p className="text-xs text-purple-400 mb-2">{tool.category}</p>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{tool.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {tool.rating}
                  </div>
                  <span>v{tool.version}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleInstall(tool.id)
                  }}
                  className={`w-full mt-4 py-2.5 rounded-xl font-semibold transition ${
                    tool.installed
                      ? 'bg-rose-500/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'btn-primary'
                  }`}
                >
                  {tool.installed ? 'Uninstall' : 'Install'}
                </button>
              </div>
            ))}
          </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Version</h4>
                <p className="text-sm text-white">{selectedToolData.version}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Author</h4>
                <p className="text-sm text-white">{selectedToolData.author}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-1">Rating</h4>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(selectedToolData.rating) ? 'text-yellow-500' : 'text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-white">{selectedToolData.rating}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleInstall(selectedToolData.id)}
            className={`w-full py-3 rounded-xl font-semibold transition mb-3 ${
              selectedToolData.installed
                ? 'bg-rose-500/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'btn-primary'
            }`}
          >
            {selectedToolData.installed ? 'Uninstall Tool' : 'Install Tool'}
          </button>

          <button className="w-full py-3 rounded-xl font-semibold btn-secondary transition">
            View Documentation
          </button>
        </div>
      )}
    </div>
  )
}
