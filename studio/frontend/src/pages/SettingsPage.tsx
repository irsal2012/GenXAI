import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKeys } from '../contexts/ApiKeyContext'
import { EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline'

const SettingsPage = () => {
  const navigate = useNavigate()
  const { apiKeys, setApiKey, clearApiKeys } = useApiKeys()
  const [showOpenAI, setShowOpenAI] = useState(false)
  const [showAnthropic, setShowAnthropic] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleCancel = () => {
    navigate(-1) // Go back to previous page
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all API keys? This action cannot be undone.')) {
      clearApiKeys()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure your API keys and preferences
        </p>
      </div>

      {/* API Keys Section */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyIcon className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-900">API Keys</h2>
        </div>

        <div className="space-y-6">
          {/* Security Notice */}
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
                <h3 className="text-sm font-medium text-blue-900">Security Notice</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Your API keys are stored locally in your browser and are never sent to our servers.
                  They are only used to make requests directly to the LLM providers.
                </p>
                <p className="mt-2 text-sm text-blue-700">
                  <strong>Important:</strong> Do not use this application on shared or public computers.
                </p>
              </div>
            </div>
          </div>

          {/* OpenAI API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showOpenAI ? 'text' : 'password'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={apiKeys.openai}
                onChange={(e) => setApiKey('openai', e.target.value)}
                placeholder="sk-..."
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
                onClick={() => setShowOpenAI(!showOpenAI)}
              >
                {showOpenAI ? (
                  <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-slate-400" />
                )}
              </button>
            </div>
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
            <div className="relative">
              <input
                type={showAnthropic ? 'text' : 'password'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={apiKeys.anthropic}
                onChange={(e) => setApiKey('anthropic', e.target.value)}
                placeholder="sk-ant-..."
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
                onClick={() => setShowAnthropic(!showAnthropic)}
              >
                {showAnthropic ? (
                  <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-slate-400" />
                )}
              </button>
            </div>
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              onClick={handleClear}
            >
              Clear All Keys
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                onClick={handleSave}
              >
                {saved ? '✓ Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Information */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">How API Keys Are Used</h2>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex gap-3">
            <span className="flex-shrink-0 text-primary-600">1.</span>
            <p>
              When you create or run agents and workflows, your API keys are sent directly to the LLM
              providers (OpenAI, Anthropic, etc.)
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 text-primary-600">2.</span>
            <p>
              The GenXAI backend server receives your keys temporarily to initialize the LLM providers,
              but never stores them
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 text-primary-600">3.</span>
            <p>
              You are responsible for your own API usage and costs. Monitor your usage on the provider's
              platform
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 text-primary-600">4.</span>
            <p>
              To remove your keys, click "Clear All Keys" above or clear your browser's localStorage
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
