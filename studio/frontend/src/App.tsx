import { useState } from 'react'
import './App.css'
import GraphEditor from './components/GraphEditor'
import AgentDesigner from './components/AgentDesigner'
import ToolMarketplace from './components/ToolMarketplace'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-white font-bold">GX</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    GenXAI Studio
                  </h1>
                  <p className="text-xs text-slate-400">No-Code AI Workflow Builder</p>
                </div>
              </div>
              <div className="hidden lg:block ml-12">
                <div className="flex items-baseline space-x-4">
                  <button
                    onClick={() => setActiveTab('home')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      activeTab === 'home'
                        ? 'bg-white/15 text-white shadow-md shadow-purple-500/30'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setActiveTab('workflows')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      activeTab === 'workflows'
                        ? 'bg-white/15 text-white shadow-md shadow-purple-500/30'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Workflows
                  </button>
                  <button
                    onClick={() => setActiveTab('agents')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      activeTab === 'agents'
                        ? 'bg-white/15 text-white shadow-md shadow-purple-500/30'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Agents
                  </button>
                  <button
                    onClick={() => setActiveTab('tools')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      activeTab === 'tools'
                        ? 'bg-white/15 text-white shadow-md shadow-purple-500/30'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Tools
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden md:block text-xs text-slate-400">Backend: http://localhost:8000</span>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-200">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-6 lg:px-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-5 glass-panel rounded-3xl px-8 py-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10" />
              <div className="relative">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 text-sm text-purple-200 border border-white/10">
                  Launching GenXAI Studio v1.0
                </span>
                <h2 className="text-4xl md:text-5xl font-semibold text-white mt-5">
                  Build premium AI agent workflows in minutes
                </h2>
                <p className="text-lg text-slate-300 max-w-3xl mx-auto mt-4">
                  Design, connect, and deploy intelligent agents with a modern visual builder. No code required—just craft, test, and scale.
                </p>
              </div>
              <div className="relative flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setActiveTab('workflows')}
                  className="btn-primary px-8 py-3 rounded-full text-sm sm:text-base"
                >
                  Create Workflow
                </button>
                <button className="btn-secondary px-8 py-3 rounded-full text-sm sm:text-base">
                  View Documentation
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {/* Graph Editor Card */}
              <div className="card-elevated card-hover rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/40">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Graph Editor</h3>
                <p className="text-slate-300 mb-4">
                  Visual drag-and-drop workflow builder with intuitive graph editing. Connect nodes, define logic, and build complex workflows effortlessly.
                </p>
                <button
                  onClick={() => setActiveTab('workflows')}
                  className="text-purple-300 hover:text-purple-200 font-semibold text-sm flex items-center"
                >
                  Open Editor
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Agent Designer Card */}
              <div className="card-elevated card-hover rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Agent Designer</h3>
                <p className="text-slate-300 mb-4">
                  Configure intelligent agents with custom roles, goals, and capabilities. Define agent behavior and assign specialized tools.
                </p>
                <button
                  onClick={() => setActiveTab('agents')}
                  className="text-blue-300 hover:text-blue-200 font-semibold text-sm flex items-center"
                >
                  Design Agents
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Tool Marketplace Card */}
              <div className="card-elevated card-hover rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Tool Marketplace</h3>
                <p className="text-slate-300 mb-4">
                  Browse and integrate 50+ built-in tools including web search, file operations, calculations, and custom integrations.
                </p>
                <button
                  onClick={() => setActiveTab('tools')}
                  className="text-emerald-300 hover:text-emerald-200 font-semibold text-sm flex items-center"
                >
                  Browse Tools
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Memory Management Card */}
              <div className="card-elevated card-hover rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Memory Management</h3>
                <p className="text-slate-300 mb-4">
                  Advanced memory systems for context retention, knowledge graphs, and persistent agent state across conversations.
                </p>
                <button className="text-orange-300 hover:text-orange-200 font-semibold text-sm flex items-center">
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Real-time Monitoring Card */}
              <div className="card-elevated card-hover rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Real-time Monitoring</h3>
                <p className="text-slate-300 mb-4">
                  Track workflow execution, monitor agent performance, and debug issues with comprehensive logging and metrics.
                </p>
                <button className="text-yellow-300 hover:text-yellow-200 font-semibold text-sm flex items-center">
                  View Dashboard
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* API Integration Card */}
              <div className="card-elevated card-hover rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">API Integration</h3>
                <p className="text-slate-300 mb-4">
                  RESTful API for programmatic access. Integrate GenXAI workflows into your existing applications seamlessly.
                </p>
                <button className="text-indigo-300 hover:text-indigo-200 font-semibold text-sm flex items-center">
                  API Docs
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="card-elevated rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-purple-300 mb-2">50+</div>
                <div className="text-slate-400 text-sm">Built-in Tools</div>
              </div>
              <div className="card-elevated rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-blue-300 mb-2">∞</div>
                <div className="text-slate-400 text-sm">Custom Workflows</div>
              </div>
              <div className="card-elevated rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-emerald-300 mb-2">100%</div>
                <div className="text-slate-400 text-sm">No-Code</div>
              </div>
              <div className="card-elevated rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-pink-300 mb-2">24/7</div>
                <div className="text-slate-400 text-sm">Agent Runtime</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="h-[calc(100vh-12rem)] glass-panel rounded-2xl overflow-hidden">
            <GraphEditor />
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="h-[calc(100vh-12rem)] glass-panel rounded-2xl overflow-hidden">
            <AgentDesigner />
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="h-[calc(100vh-12rem)] glass-panel rounded-2xl overflow-hidden">
            <ToolMarketplace />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/70 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto py-6 px-6 lg:px-8">
          <div className="text-center text-slate-400 text-sm">
            <p>GenXAI Studio - Phase 3: No-Code Studio</p>
            <p className="mt-2">Powered by GenXAI Framework</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
