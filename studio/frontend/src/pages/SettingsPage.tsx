import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKeys } from '../contexts/ApiKeyContext'
import { EyeIcon, EyeSlashIcon, KeyIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { getDefaultLlmModel, setDefaultLlmModel } from '../utils/defaultModel'
import { testLLMConnection, type LLMConnectionStatus } from '../services/api'

const SettingsPage = () => {
  const navigate = useNavigate()
  const { apiKeys, setApiKey, clearApiKeys } = useApiKeys()
  const [showOpenAI, setShowOpenAI] = useState(false)
  const [showAnthropic, setShowAnthropic] = useState(false)
  const [saved, setSaved] = useState(false)
  const [defaultModel, setDefaultModel] = useState(getDefaultLlmModel())
  
  // Connection status states
  const [openaiStatus, setOpenaiStatus] = useState<LLMConnectionStatus | null>(null)
  const [anthropicStatus, setAnthropicStatus] = useState<LLMConnectionStatus | null>(null)
  const [testing, setTesting] = useState(false)

  const handleSave = () => {
    setDefaultLlmModel(defaultModel)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleCancel = () => {
    navigate(-1) // Go back to previous page
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all API keys? This action cannot be undone.')) {
      clearApiKeys()
      setOpenaiStatus(null)
      setAnthropicStatus(null)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const result = await testLLMConnection()
      setOpenaiStatus(result.openai)
      setAnthropicStatus(result.anthropic)
    } catch (error) {
      console.error('Failed to test connection:', error)
      setOpenaiStatus({
        status: 'error',
        message: 'Failed to test connection. Please check if the backend is running.',
      })
      setAnthropicStatus({
        status: 'error',
        message: 'Failed to test connection. Please check if the backend is running.',
      })
    } finally {
      setTesting(false)
    }
  }

  const renderConnectionStatus = (status: LLMConnectionStatus | null) => {
    if (!status) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          Not Tested
        </span>
      )
    }

    if (status.status === 'connected') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
          <CheckCircleIcon className="h-3.5 w-3.5" />
          Connected
        </span>
      )
    }

    if (status.status === 'no_key') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          <ExclamationCircleIcon className="h-3.5 w-3.5" />
          No Key
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        <XCircleIcon className="h-3.5 w-3.5" />
        Error
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure your API keys and preferences
        </p>
      </div>

      {/* API Keys Section */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyIcon className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">API Keys</h2>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                OpenAI API Key
              </label>
              {renderConnectionStatus(openaiStatus)}
            </div>
            <div className="relative">
              <input
                type={showOpenAI ? 'text' : 'password'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-950"
                value={apiKeys.openai}
                onChange={(e) => {
                  setApiKey('openai', e.target.value)
                  setOpenaiStatus(null) // Reset status when key changes
                }}
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
            {openaiStatus && openaiStatus.status !== 'connected' && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {openaiStatus.message}
              </p>
            )}
            {openaiStatus && openaiStatus.status === 'connected' && openaiStatus.model && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Connected to {openaiStatus.model}
              </p>
            )}
            {!openaiStatus && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
            )}
          </div>

          {/* Anthropic API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Anthropic API Key <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              {renderConnectionStatus(anthropicStatus)}
            </div>
            <div className="relative">
              <input
                type={showAnthropic ? 'text' : 'password'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-950"
                value={apiKeys.anthropic}
                onChange={(e) => {
                  setApiKey('anthropic', e.target.value)
                  setAnthropicStatus(null) // Reset status when key changes
                }}
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
            {anthropicStatus && anthropicStatus.status !== 'connected' && anthropicStatus.status !== 'no_key' && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {anthropicStatus.message}
              </p>
            )}
            {anthropicStatus && anthropicStatus.status === 'connected' && anthropicStatus.model && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Connected to {anthropicStatus.model}
              </p>
            )}
            {!anthropicStatus && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
            )}
          </div>

          {/* Test Connection Button */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="button"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleTestConnection}
              disabled={testing || (!apiKeys.openai && !apiKeys.anthropic)}
              title="Test connection to LLM providers"
            >
              {testing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Testing Connection...
                </span>
              ) : (
                'Test Connection'
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              onClick={handleClear}
              title="Clear all stored API keys"
            >
              Clear All Keys
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                onClick={handleCancel}
                title="Return to previous page"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                onClick={handleSave}
                title="Save API key settings"
              >
                {saved ? '✓ Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Default Model Section */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyIcon className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Default LLM Model</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          This model will be used as the default when creating new agents or adding agent nodes.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Default Model
          </label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-950"
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
          >
            <optgroup label="OpenAI Models">
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </optgroup>
            <optgroup label="Anthropic Models (Claude)">
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Latest)</option>
              <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
              <option value="claude-3-opus-20240229">Claude 3 Opus</option>
              <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Usage Information */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">How API Keys Are Used</h2>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
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
