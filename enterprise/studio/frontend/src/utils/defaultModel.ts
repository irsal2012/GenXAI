export const DEFAULT_LLM_MODEL_KEY = 'genxai_default_llm_model'
export const getWorkflowOverrideKey = (workflowId: string) => `genxai_workflow_model_override_${workflowId}`

export const getDefaultLlmModel = () => {
  if (typeof window === 'undefined') {
    return 'gpt-4'
  }
  return localStorage.getItem(DEFAULT_LLM_MODEL_KEY) || 'gpt-4'
}

export const setDefaultLlmModel = (model: string) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEFAULT_LLM_MODEL_KEY, model)
}

export const getWorkflowModelOverride = (workflowId: string) => {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(getWorkflowOverrideKey(workflowId)) || ''
}

export const setWorkflowModelOverride = (workflowId: string, model: string) => {
  if (typeof window === 'undefined') return
  const storageKey = getWorkflowOverrideKey(workflowId)
  if (!model) {
    localStorage.removeItem(storageKey)
    return
  }
  localStorage.setItem(storageKey, model)
}