// frontend/src/App.jsx - Main app component
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import InterviewRoom from './components/InterviewRoom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  🤖 AI Interview Pro
                </h1>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/interview/:id" element={<InterviewRoom />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
