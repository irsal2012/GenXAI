import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            GenXAI Studio
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            No-Code Agentic AI Workflow Builder
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to GenXAI Studio
              </h2>
              <p className="text-gray-600 mb-6">
                Build powerful AI agent workflows without code
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Graph Editor</h3>
                  <p className="text-gray-600 text-sm">
                    Drag-and-drop workflow builder with visual graph editing
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Agent Designer</h3>
                  <p className="text-gray-600 text-sm">
                    Configure intelligent agents with roles, goals, and tools
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Tool Marketplace</h3>
                  <p className="text-gray-600 text-sm">
                    Browse and integrate 50+ built-in tools
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setCount((count) => count + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Click count: {count}
                </button>
              </div>

              <div className="mt-8 text-sm text-gray-500">
                <p>Phase 3: No-Code Studio - React Frontend</p>
                <p className="mt-2">
                  Backend API: <code className="bg-gray-200 px-2 py-1 rounded">http://localhost:8000</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
