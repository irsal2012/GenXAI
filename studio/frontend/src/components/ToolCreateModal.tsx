import { Fragment, useState } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import Editor from '@monaco-editor/react'

interface ToolParameter {
  name: string
  type: string
  description: string
  required: boolean
  default?: any
  enum?: string[]
}

interface ToolCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: any) => Promise<void>
  isCreating: boolean
  templates: any[]
}

const ToolCreateModal = ({ isOpen, onClose, onCreate, isCreating, templates }: ToolCreateModalProps) => {
  const [activeTab, setActiveTab] = useState(0)
  
  // Common fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('custom')
  const [tags, setTags] = useState('')
  const [version, setVersion] = useState('1.0.0')
  const [author, setAuthor] = useState('GenXAI User')

  // Code-based fields
  const [code, setCode] = useState(`# Access parameters via 'params' dict
# Example: value = params.get('input_value')

# Your tool logic here
result = {
    "message": "Hello from custom tool!",
    "data": params
}

# Set 'result' variable with your output
`)
  const [parameters, setParameters] = useState<ToolParameter[]>([
    { name: 'input', type: 'string', description: 'Input parameter', required: true }
  ])

  // Template-based fields
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [templateConfig, setTemplateConfig] = useState<Record<string, any>>({})

  const handleAddParameter = () => {
    setParameters([
      ...parameters,
      { name: '', type: 'string', description: '', required: true }
    ])
  }

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index))
  }

  const handleParameterChange = (index: number, field: keyof ToolParameter, value: any) => {
    const newParams = [...parameters]
    newParams[index] = { ...newParams[index], [field]: value }
    setParameters(newParams)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const toolData = {
      name,
      description,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      version,
      author,
      ...(activeTab === 0
        ? { code, parameters }
        : { template: selectedTemplate, template_config: templateConfig }
      )
    }

    await onCreate(toolData)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setCategory('custom')
    setTags('')
    setVersion('1.0.0')
    setAuthor('GenXAI User')
    setCode(`# Access parameters via 'params' dict
# Example: value = params.get('input_value')

# Your tool logic here
result = {
    "message": "Hello from custom tool!",
    "data": params
}

# Set 'result' variable with your output
`)
    setParameters([{ name: 'input', type: 'string', description: 'Input parameter', required: true }])
    setSelectedTemplate('')
    setTemplateConfig({})
  }

  const handleClose = () => {
    if (!isCreating) {
      onClose()
    }
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      // Initialize config with defaults
      const config: Record<string, any> = {}
      Object.entries(template.config_schema || {}).forEach(([key, schema]: [string, any]) => {
        if (schema.default !== undefined) {
          config[key] = schema.default
        }
      })
      setTemplateConfig(config)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-slate-900">
                    Create New Tool
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-lg p-1 hover:bg-slate-100"
                    onClick={handleClose}
                    disabled={isCreating}
                  >
                    <XMarkIcon className="h-5 w-5 text-slate-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Common Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tool Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., my_custom_tool"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="custom">Custom</option>
                        <option value="web">Web</option>
                        <option value="database">Database</option>
                        <option value="file">File</option>
                        <option value="computation">Computation</option>
                        <option value="communication">Communication</option>
                        <option value="ai">AI</option>
                        <option value="data_processing">Data Processing</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What does this tool do?"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Version</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tabs for Code vs Template */}
                  <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                    <Tab.List className="flex space-x-1 rounded-xl bg-slate-100 p-1">
                      <Tab
                        className={({ selected }) =>
                          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                          ${selected
                            ? 'bg-white text-primary-700 shadow'
                            : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-900'
                          }`
                        }
                      >
                        Code Editor
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                          ${selected
                            ? 'bg-white text-primary-700 shadow'
                            : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-900'
                          }`
                        }
                      >
                        From Template
                      </Tab>
                    </Tab.List>
                    <Tab.Panels className="mt-4">
                      {/* Code Editor Tab */}
                      <Tab.Panel className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Parameters
                          </label>
                          <div className="space-y-2">
                            {parameters.map((param, index) => (
                              <div key={index} className="flex gap-2 items-start">
                                <input
                                  type="text"
                                  placeholder="Name"
                                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                  value={param.name}
                                  onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                                />
                                <select
                                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                  value={param.type}
                                  onChange={(e) => handleParameterChange(index, 'type', e.target.value)}
                                >
                                  <option value="string">String</option>
                                  <option value="number">Number</option>
                                  <option value="boolean">Boolean</option>
                                  <option value="array">Array</option>
                                  <option value="object">Object</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="Description"
                                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                  value={param.description}
                                  onChange={(e) => handleParameterChange(index, 'description', e.target.value)}
                                />
                                <label className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={param.required}
                                    onChange={(e) => handleParameterChange(index, 'required', e.target.checked)}
                                  />
                                  Required
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveParameter(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={handleAddParameter}
                            className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                          >
                            <PlusIcon className="h-4 w-4" />
                            Add Parameter
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Python Code <span className="text-red-500">*</span>
                          </label>
                          <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <Editor
                              height="300px"
                              defaultLanguage="python"
                              value={code}
                              onChange={(value: string | undefined) => setCode(value || '')}
                              theme="vs-light"
                              options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                              }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Access parameters via <code className="bg-slate-100 px-1 rounded">params</code> dict. 
                            Set <code className="bg-slate-100 px-1 rounded">result</code> variable with output.
                          </p>
                        </div>
                      </Tab.Panel>

                      {/* Template Tab */}
                      <Tab.Panel className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Select Template <span className="text-red-500">*</span>
                          </label>
                          <select
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={selectedTemplate}
                            onChange={(e) => handleTemplateChange(e.target.value)}
                          >
                            <option value="">Choose a template...</option>
                            {templates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>
                          {selectedTemplate && (
                            <p className="mt-2 text-sm text-slate-600">
                              {templates.find(t => t.id === selectedTemplate)?.description}
                            </p>
                          )}
                        </div>

                        {selectedTemplate && (
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700">
                              Template Configuration
                            </label>
                            {Object.entries(
                              templates.find(t => t.id === selectedTemplate)?.config_schema || {}
                            ).map(([key, schema]: [string, any]) => (
                              <div key={key}>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  {key} {schema.required && <span className="text-red-500">*</span>}
                                </label>
                                {schema.enum ? (
                                  <select
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    value={templateConfig[key] || ''}
                                    onChange={(e) => setTemplateConfig({ ...templateConfig, [key]: e.target.value })}
                                    required={schema.required}
                                  >
                                    <option value="">Select...</option>
                                    {schema.enum.map((opt: string) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : schema.type === 'object' ? (
                                  <textarea
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                                    placeholder='{"key": "value"}'
                                    value={JSON.stringify(templateConfig[key] || {}, null, 2)}
                                    onChange={(e) => {
                                      try {
                                        setTemplateConfig({ ...templateConfig, [key]: JSON.parse(e.target.value) })
                                      } catch {}
                                    }}
                                    rows={3}
                                  />
                                ) : (
                                  <input
                                    type={schema.type === 'number' ? 'number' : 'text'}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                    value={templateConfig[key] || ''}
                                    onChange={(e) => setTemplateConfig({ 
                                      ...templateConfig, 
                                      [key]: schema.type === 'number' ? Number(e.target.value) : e.target.value 
                                    })}
                                    required={schema.required}
                                    placeholder={schema.description}
                                  />
                                )}
                                {schema.description && (
                                  <p className="mt-1 text-xs text-slate-500">{schema.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      onClick={handleClose}
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create Tool'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ToolCreateModal
