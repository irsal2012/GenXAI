import { useState } from 'react'
import { useApiKeys } from '../contexts/ApiKeyContext'
import { XMarkIcon, KeyIcon } from '@heroicons/react/24/outline'

interface ApiKeyPromptProps {
  onClose: () => void
}

const ApiKeyPrompt = ({ onClose }: ApiKeyPromptProps) => {
  const { apiKeys, setApiKey } = useApiKeys()
  const [localOpenAI, setLocalOpenAI] = useState(apiKeys.openai)
  const [localAnthropic, setLocalAnthropic] = useState(apiKeys.anthropic)

  const handleContinue = () => {
    if (localOpenAI) {
      setApiKey('openai', localOpenAI)
    }
    if (localAnthropic) {
      setApiKey('anthropic', localAnthropic)
    }
    onClose()
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <KeyIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Welcome to GenXAI Studio!</h2>
              <p className="text-sm text-slate-500">Configure your API keys to get started</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">Why do I need API keys?</h3>
                <p className="mt-1 text-sm text-blue-700">
                  GenXAI Studio uses your own API keys to communicate with LLM providers like OpenAI and
                  Anthropic. Your keys are stored locally in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          </div>

          {/* OpenAI API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              OpenAI API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={localOpenAI}
              onChange={(e) => setLocalOpenAI(e.target.value)}
              placeholder="sk-..."
            />
            <p className="mt-1 text-xs text-slate-500">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          {/* Anthropic API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Anthropic API Key <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={localAnthropic}
              onChange={(e) => setLocalAnthropic(e.target.value)}
              placeholder="sk-ant-..."
            />
            <p className="mt-1 text-xs text-slate-500">
              Required for Claude models. Get your key from{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Anthropic Console
              </a>
            </p>
          </div>

          {/* Security Notice */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-900">Security Reminder</h3>
                <p className="mt-1 text-sm text-amber-700">
                  Do not use this application on shared or public computers. You can update or clear your
                  API keys anytime in Settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <button
            onClick={handleSkip}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white"
          >
            Skip for now
          </button>
          <button
            onClick={handleContinue}
            disabled={!localOpenAI}
            className="rounded-xl bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApiKeyPrompt
