import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface CodeEditorModalProps {
  isOpen: boolean
  toolName: string
  initialCode: string
  onClose: () => void
  onSave: (code: string) => Promise<void>
}

const CodeEditorModal = ({
  isOpen,
  toolName,
  initialCode,
  onClose,
  onSave,
}: CodeEditorModalProps) => {
  const [code, setCode] = useState(initialCode)
  const [isSaving, setIsSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setCode(initialCode)
    setHasChanges(false)
    setValidationError(null)
  }, [initialCode, isOpen])

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      setHasChanges(value !== initialCode)
      setValidationError(null)
    }
  }

  const validateCode = () => {
    // Basic Python syntax validation
    if (!code.trim()) {
      setValidationError('Code cannot be empty')
      return false
    }

    // Check for 'result' variable assignment
    if (!code.includes('result =')) {
      setValidationError(
        "Code must set a 'result' variable with the output (e.g., result = {...})"
      )
      return false
    }

    setValidationError(null)
    return true
  }

  const handleSave = async () => {
    if (!validateCode()) {
      return
    }

    setIsSaving(true)
    try {
      await onSave(code)
      setHasChanges(false)
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to save code')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to close without saving?'
        )
      ) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, code])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />

        {/* Modal */}
        <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Edit Tool Code</h2>
              <p className="text-sm text-slate-500 mt-1">
                {toolName}
                {hasChanges && <span className="ml-2 text-orange-600">• Unsaved changes</span>}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 hover:bg-slate-100 transition"
            >
              <XMarkIcon className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Editor */}
          <div className="p-6">
            {validationError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">Validation Error</h4>
                  <p className="text-sm text-red-700 mt-1">{validationError}</p>
                </div>
              </div>
            )}

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Editor
                height="60vh"
                defaultLanguage="python"
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on',
                }}
              />
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Code Requirements</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Access parameters via <code className="bg-blue-100 px-1 rounded">params</code> dict (e.g., <code className="bg-blue-100 px-1 rounded">params['name']</code>)</li>
                <li>• Set a <code className="bg-blue-100 px-1 rounded">result</code> variable with your output</li>
                <li>• Use only safe built-in functions (no file I/O, network access, or imports)</li>
                <li>• Keep execution under 30 seconds</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
            <div className="text-sm text-slate-600">
              Press <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs">Ctrl+S</kbd> or{' '}
              <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs">⌘+S</kbd> to save
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={validateCode}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
              >
                Validate
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Save & Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeEditorModal
