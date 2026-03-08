// frontend/src/App.jsx - Main app component
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import InterviewRoom from './components/InterviewRoom'
import ResultsPage from './components/ResultsPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200 relative">
        {/* Global UI ambient light */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

        {/* Navigation Header */}
        <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                  <span className="text-white text-lg">🧬</span>
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  AvNex
                </h1>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10 w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/interview/:id" element={<InterviewRoom />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
