// frontend/src/components/Dashboard.jsx - Main dashboard
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ✅ CHANGE: Import AIService
import AIService from '../services/ai' 

const Dashboard = () => {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('fresher')

  // ✅ CHANGE: New state for question generation loading
  const [isGenerating, setIsGenerating] = useState(false)

  // Job roles available for interviews
  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'ML Engineer',
    'Cloud Engineer',
    'DevOps Engineer',
    'Data Scientist',
    'Cybersecurity Specialist'
  ]

  // ✅ CHANGE: Updated startInterview to generate AI questions
  const startInterview = async () => {
    if (!selectedRole) {
      alert('Please select a job role first!')
      return
    }

    setIsGenerating(true) // ✅ CHANGE: start loading

    try {
      // ✅ CHANGE: Generate AI questions from backend
      const questions = await AIService.generateQuestions(selectedRole, selectedLevel, 10)

      // ✅ CHANGE: Store data in localStorage for later use
      localStorage.setItem('interviewQuestions', JSON.stringify(questions))
      localStorage.setItem('interviewRole', selectedRole)
      localStorage.setItem('interviewLevel', selectedLevel)

      // Generate unique interview ID
      const interviewId = Date.now()
      navigate(`/interview/${interviewId}`)
    } catch (error) {
      console.error('Error generating questions:', error)
      alert('Error generating questions. Please try again.')
    } finally {
      setIsGenerating(false) // ✅ CHANGE: stop loading
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AI Interview Practice
          </h1>
          <p className="text-xl text-gray-600">
            Practice interviews with AI-powered analysis and get instant feedback
          </p>
        </div>

        {/* Interview Setup Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Start New Interview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choose your role...</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="fresher">Fresher (0-2 years)</option>
                <option value="intermediate">Intermediate (2-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
              </select>
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-6">
            {/* ✅ CHANGE: Added loading state in button */}
            <button
              onClick={startInterview}
              disabled={!selectedRole || isGenerating}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isGenerating ? '🧠 Generating Questions...' : '🚀 Start AI Interview'}
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Smart Questions</h3>
            <p className="text-gray-600">AI generates questions based on your role and experience level</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
            <p className="text-gray-600">Get instant feedback on body language and confidence</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-4">🎤</div>
            <h3 className="text-lg font-semibold mb-2">Speech Recognition</h3>
            <p className="text-gray-600">AI listens and evaluates your spoken answers</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
