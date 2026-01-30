import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Add request interceptor to include API keys from localStorage
api.interceptors.request.use((config) => {
  // Get API keys from localStorage
  const openaiKey = localStorage.getItem('genxai_openai_api_key')
  const anthropicKey = localStorage.getItem('genxai_anthropic_api_key')

  // Add API keys to request headers if they exist
  if (openaiKey) {
    config.headers['X-OpenAI-API-Key'] = openaiKey
  }
  if (anthropicKey) {
    config.headers['X-Anthropic-API-Key'] = anthropicKey
  }

  return config
})

export default api
