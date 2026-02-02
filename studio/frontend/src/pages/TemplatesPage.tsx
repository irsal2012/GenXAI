import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateTemplate, useCreateWorkflow, useDeleteTemplate, useTemplates } from '../services/workflows'
import { getAllTemplates, getCategories, searchTemplates, type WorkflowTemplate } from '../data/workflowTemplates'

const TemplatesPage = () => {
  const navigate = useNavigate()
  const createWorkflow = useCreateWorkflow()
  const templatesQuery = useTemplates()
  const createTemplate = useCreateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')

  const allTemplates = getAllTemplates()
  const categories = getCategories()

  const savedTemplates = templatesQuery.data || []

  // Filter templates
  const combinedTemplates = [
    ...allTemplates,
    ...savedTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty as WorkflowTemplate['difficulty'],
      tags: template.tags,
      workflow: {
        name: template.name,
        description: template.description,
        nodes: template.nodes,
        edges: template.edges,
        metadata: template.metadata || {},
      },
    })),
  ]

  const filteredTemplates = combinedTemplates.filter((template) => {
    // Search filter
    if (searchQuery) {
      const matchesSearch = searchTemplates(searchQuery).some((t) => t.id === template.id)
      if (!matchesSearch) return false
    }

    // Category filter
    if (selectedCategory && template.category !== selectedCategory) {
      return false
    }

    // Difficulty filter
    if (selectedDifficulty && template.difficulty !== selectedDifficulty) {
      return false
    }

    return true
  })

  const handleUseTemplate = async (template: WorkflowTemplate) => {
    try {
      const workflow = await createWorkflow.mutateAsync({
        ...template.workflow,
        name: `${template.workflow.name} (Copy)`,
      })
      navigate(`/workflows/${workflow.id}`)
    } catch (error) {
      console.error('Failed to create workflow from template:', error)
    }
  }

  const handleSaveAsTemplate = async () => {
    const name = window.prompt('Template name')
    if (!name) return
    const description = window.prompt('Template description') || ''
    const category = window.prompt('Template category', 'General') || 'General'
    const difficulty = window.prompt('Difficulty (beginner/intermediate/advanced)', 'intermediate') || 'intermediate'
    const tagsInput = window.prompt('Comma-separated tags', '') || ''
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    const defaultWorkflow = allTemplates[0]?.workflow
    if (!defaultWorkflow) return

    await createTemplate.mutateAsync({
      name,
      description,
      category,
      difficulty,
      tags,
      nodes: defaultWorkflow.nodes,
      edges: defaultWorkflow.edges,
      metadata: defaultWorkflow.metadata,
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700'
      case 'advanced':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Workflow Templates</h2>
        <p className="text-sm text-slate-500">
          Start with pre-built templates to quickly create workflows
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          onClick={handleSaveAsTemplate}
          disabled={createTemplate.isPending}
        >
          {createTemplate.isPending ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium uppercase text-slate-500">Search</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-slate-500">Category</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase text-slate-500">Difficulty</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="card p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900">{template.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{template.category}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${getDifficultyColor(
                  template.difficulty
                )}`}
              >
                {template.difficulty}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-4 flex-1">{template.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {template.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary-50 px-2 py-1 text-xs text-primary-700"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  +{template.tags.length - 3} more
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 mb-3">
              {template.workflow.nodes.length} nodes • {template.workflow.edges.length} edges
            </div>

            <div className="space-y-2">
              <button
                className="w-full rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                onClick={() => handleUseTemplate(template)}
                disabled={createWorkflow.isPending}
              >
                {createWorkflow.isPending ? 'Creating...' : 'Use Template'}
              </button>
              {savedTemplates.find((saved) => saved.id === template.id) && (
                <button
                  className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => deleteTemplate.mutateAsync(template.id)}
                  disabled={deleteTemplate.isPending}
                >
                  {deleteTemplate.isPending ? 'Deleting...' : 'Delete Template'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="card p-6 text-center text-sm text-slate-500">
          No templates match your filters. Try adjusting your search criteria.
        </div>
      )}
    </div>
  )
}

export default TemplatesPage
