/**
 * Tool Palette - Draggable tools sidebar for agent builder
 * Provides drag-and-drop interface for adding tools to agents
 */

import { useState } from 'react'
import { useTools, useToolCategories } from '../../services/tools'

const ToolPalette = () => {
  const { data: tools, isLoading: toolsLoading } = useTools()
  const { data: categories, isLoading: categoriesLoading } = useToolCategories()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const onDragStart = (event: React.DragEvent, toolName: string, toolData: any) => {
    event.dataTransfer.setData('application/tool', JSON.stringify(toolData))
    event.dataTransfer.effectAllowed = 'copy'
  }

  // Filter tools based on category and search
  const filteredTools = tools?.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    const matchesSearch = 
      searchQuery === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Color mapping for categories
  const categoryColors: Record<string, string> = {
    computation: '#8b5cf6',
    file: '#3b82f6',
    web: '#10b981',
    database: '#f59e0b',
    api: '#ef4444',
    default: '#6b7280',
  }

  const getCategoryColor = (category: string) => {
    return categoryColors[category.toLowerCase()] || categoryColors.default
  }

  // Icon mapping for categories
  const categoryIcons: Record<string, string> = {
    computation: '🧮',
    file: '📁',
    web: '🌐',
    database: '🗄️',
    api: '🔌',
    default: '🔧',
  }

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category.toLowerCase()] || categoryIcons.default
  }

  return (
    <div className="w-80 bg-white border-r border-slate-200 p-4 overflow-y-auto flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Tool Library</h3>
        <p className="text-xs text-slate-500 mb-4">
          Drag tools to add them to your agent
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-600 mb-2 block">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {categoriesLoading ? (
            <option disabled>Loading...</option>
          ) : (
            categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto">
        {toolsLoading ? (
          <div className="text-sm text-slate-500 text-center py-4">Loading tools...</div>
        ) : filteredTools && filteredTools.length > 0 ? (
          <div className="space-y-2">
            {filteredTools.map((tool) => (
              <div
                key={tool.name}
                draggable
                onDragStart={(e) => onDragStart(e, tool.name, tool)}
                className="flex items-start gap-3 p-3 rounded-lg border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm cursor-move transition-all"
                style={{ 
                  borderLeftColor: getCategoryColor(tool.category), 
                  borderLeftWidth: '4px' 
                }}
              >
                <div className="text-2xl flex-shrink-0">
                  {getCategoryIcon(tool.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">
                    {tool.name}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {tool.description}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: getCategoryColor(tool.category) }}
                    >
                      {tool.category}
                    </span>
                    {tool.tags && tool.tags.length > 0 && (
                      <span className="text-xs text-slate-400">
                        +{tool.tags.length} tags
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-400 text-center py-4 italic">
            No tools found matching your criteria
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Quick Tips</h3>
        <ul className="text-xs text-slate-600 space-y-1">
          <li>• Drag tools to the canvas</li>
          <li>• Search or filter by category</li>
          <li>• Remove tools by clicking X</li>
          <li>• Configure agent details above</li>
        </ul>
      </div>
    </div>
  )
}

export default ToolPalette
