import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface ApiKeys {
  openai: string
  anthropic: string
}

interface ApiKeyContextType {
  apiKeys: ApiKeys
  setApiKey: (provider: keyof ApiKeys, key: string) => void
  clearApiKeys: () => void
  hasApiKeys: () => boolean
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined)

export const ApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    // Load from localStorage on initialization
    return {
      openai: localStorage.getItem('genxai_openai_api_key') || '',
      anthropic: localStorage.getItem('genxai_anthropic_api_key') || '',
    }
  })

  const setApiKey = (provider: keyof ApiKeys, key: string) => {
    // Save to localStorage
    localStorage.setItem(`genxai_${provider}_api_key`, key)
    // Update state
    setApiKeys((prev) => ({ ...prev, [provider]: key }))
  }

  const clearApiKeys = () => {
    // Clear from localStorage
    localStorage.removeItem('genxai_openai_api_key')
    localStorage.removeItem('genxai_anthropic_api_key')
    // Clear state
    setApiKeys({ openai: '', anthropic: '' })
  }

  const hasApiKeys = () => {
    return apiKeys.openai.length > 0 || apiKeys.anthropic.length > 0
  }

  return (
    <ApiKeyContext.Provider value={{ apiKeys, setApiKey, clearApiKeys, hasApiKeys }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export const useApiKeys = () => {
  const context = useContext(ApiKeyContext)
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider')
  }
  return context
}
