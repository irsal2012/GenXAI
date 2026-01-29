import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { AgentInput } from '../types/api'

interface AgentCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: AgentInput) => Promise<void>
  isCreating: boolean
}

const AgentCreateModal = ({ isOpen, onClose, onCreate, isCreating }: AgentCreateModalProps) => {
  const [formData, setFormData] = useState<AgentInput>({
    role: '',
    goal: '',
    backstory: '',
    llm_model: 'gpt-4',
    tools: [],
    metadata: {},
  })

  const [toolsInput, setToolsInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tools = toolsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    await onCreate({ ...formData, tools })
    
    // Reset form
    setFormData({
      role: '',
      goal: '',
      backstory: '',
      llm_model: 'gpt-4',
      tools: [],
      metadata: {},
    })
    setToolsInput('')
    onClose()
  }

  const handleClose = () => {
    if (!isCreating) {
      onClose()
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-slate-900">
                    Create New Agent
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g., Research Assistant"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Goal <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      placeholder="What is this agent's primary objective?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Backstory
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={formData.backstory}
                      onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                      placeholder="Provide context about the agent's expertise and personality"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      LLM Model
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={formData.llm_model}
                      onChange={(e) => setFormData({ ...formData, llm_model: e.target.value })}
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tools
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={toolsInput}
                      onChange={(e) => setToolsInput(e.target.value)}
                      placeholder="e.g., calculator, file_reader, web_search (comma-separated)"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Enter tool names separated by commas
                    </p>
                  </div>

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
                      {isCreating ? 'Creating...' : 'Create Agent'}
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

export default AgentCreateModal
