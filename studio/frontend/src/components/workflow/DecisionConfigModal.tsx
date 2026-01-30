/**
 * Decision Node Configuration Modal
 * Allows users to configure decision/condition nodes with a visual interface
 */

import { useState, useEffect } from 'react'

interface DecisionConfigModalProps {
  isOpen: boolean
  onClose: () => void
  decisionData: {
    id: string
    label: string
    config: {
      condition?: string
      trueLabel?: string
      falseLabel?: string
    }
  }
  onSave: (updatedConfig: {
    label: string
    config: {
      condition: string
      trueLabel: string
      falseLabel: string
    }
  }) => void
}

const DecisionConfigModal = ({ isOpen, onClose, decisionData, onSave }: DecisionConfigModalProps) => {
  const [label, setLabel] = useState(decisionData.label || 'Decision')
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')
  
  // Simple mode fields
  const [leftOperand, setLeftOperand] = useState('')
  const [operator, setOperator] = useState('>')
  const [rightOperand, setRightOperand] = useState('')
  
  // Advanced mode field
  const [customCondition, setCustomCondition] = useState('')
  
  // Edge labels
  const [trueLabel, setTrueLabel] = useState('True')
  const [falseLabel, setFalseLabel] = useState('False')

  // Initialize from existing config
  useEffect(() => {
    if (decisionData.config?.condition) {
      const condition = decisionData.config.condition
      setCustomCondition(condition)
      
      // Try to parse simple conditions
      const simplePattern = /^\s*(\w+)\s*([><=!]+)\s*(.+)\s*$/
      const match = condition.match(simplePattern)
      
      if (match) {
        setLeftOperand(match[1].trim())
        setOperator(match[2].trim())
        setRightOperand(match[3].trim())
        setMode('simple')
      } else {
        setMode('advanced')
      }
    }
    
    setTrueLabel(decisionData.config?.trueLabel || 'True')
    setFalseLabel(decisionData.config?.falseLabel || 'False')
  }, [decisionData])

  // Build condition from simple mode
  const buildSimpleCondition = () => {
    if (!leftOperand || !operator || !rightOperand) return ''
    return `${leftOperand} ${operator} ${rightOperand}`
  }

  // Get the final condition based on mode
  const getFinalCondition = () => {
    if (mode === 'simple') {
      return buildSimpleCondition()
    }
    return customCondition
  }

  const handleSave = () => {
    const condition = getFinalCondition()
    
    if (!condition.trim()) {
      alert('Please enter a valid condition')
      return
    }

    onSave({
      label,
      config: {
        condition,
        trueLabel,
        falseLabel,
      },
    })
  }

  if (!isOpen) return null

  const operators = [
    { value: '>', label: '> (greater than)' },
    { value: '<', label: '< (less than)' },
    { value: '>=', label: '>= (greater or equal)' },
    { value: '<=', label: '<= (less or equal)' },
    { value: '==', label: '== (equal)' },
    { value: '!=', label: '!= (not equal)' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Configure Decision Node</h2>
            <p className="text-sm text-slate-500 mt-1">Set up conditional branching logic</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="text-xl text-slate-500">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Node Label */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Node Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="e.g., Quality Check, Priority Router"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1">A descriptive name for this decision point</p>
          </div>

          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Configuration Mode</label>
            <div className="flex gap-2">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
                  mode === 'simple'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                onClick={() => setMode('simple')}
              >
                Simple
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition ${
                  mode === 'advanced'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                onClick={() => setMode('advanced')}
              >
                Advanced
              </button>
            </div>
          </div>

          {/* Simple Mode */}
          {mode === 'simple' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Condition Builder
                </label>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  <div>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Left value (e.g., quality_score)"
                      value={leftOperand}
                      onChange={(e) => setLeftOperand(e.target.value)}
                    />
                  </div>
                  <div>
                    <select
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                    >
                      {operators.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Right value (e.g., threshold, 75)"
                      value={rightOperand}
                      onChange={(e) => setRightOperand(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Build a simple comparison condition. Use variable names from previous nodes.
                </p>
              </div>

              {/* Preview */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="text-xs font-medium text-slate-600 mb-1">Condition Preview:</div>
                <code className="text-sm text-slate-900 font-mono">
                  {buildSimpleCondition() || '(incomplete condition)'}
                </code>
              </div>
            </div>
          )}

          {/* Advanced Mode */}
          {mode === 'advanced' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Custom Condition Expression <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                rows={4}
                placeholder="e.g., (quality_score > threshold) && (priority == 'high')"
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-2">
                Write a custom boolean expression. Supports: &&, ||, !, (), comparison operators
              </p>
            </div>
          )}

          {/* Edge Labels */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Branch Labels</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  True Path Label
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., High Quality, Pass"
                  value={trueLabel}
                  onChange={(e) => setTrueLabel(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  False Path Label
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., Low Quality, Fail"
                  value={falseLabel}
                  onChange={(e) => setFalseLabel(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Labels for the edges that branch from this decision node
            </p>
          </div>

          {/* Examples */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-xs font-semibold text-blue-900 mb-2">💡 Example Conditions:</div>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <code className="bg-blue-100 px-1 rounded">quality_score &gt; threshold</code></li>
              <li>• <code className="bg-blue-100 px-1 rounded">priority == "urgent"</code></li>
              <li>• <code className="bg-blue-100 px-1 rounded">score &gt;= 80</code></li>
              <li>• <code className="bg-blue-100 px-1 rounded">(score &gt; 70) && (category == "premium")</code></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  )
}

export default DecisionConfigModal
