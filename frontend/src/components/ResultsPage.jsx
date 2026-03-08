// frontend/src/components/ResultsPage.jsx - Interview Results
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ResultsPage = () => {
  const navigate = useNavigate()
  const [results, setResults] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const role = localStorage.getItem('interviewRole') || 'General'

  useEffect(() => {
    const savedResults = localStorage.getItem('interviewResults')
    const savedQuestions = localStorage.getItem('interviewQuestions')
    const savedAnswers = localStorage.getItem('interviewAnswers')

    if (savedResults) setResults(JSON.parse(savedResults))
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions))
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers))
  }, [])

  const getQuestionText = (q) => {
    if (!q) return "N/A"
    return q.question || (typeof q === 'string' ? q : "N/A")
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score) => {
    if (score >= 8) return 'bg-green-100 border-green-300'
    if (score >= 5) return 'bg-yellow-100 border-yellow-300'
    return 'bg-red-100 border-red-300'
  }

  const getRecommendationStyle = (rec) => {
    if (!rec) return 'bg-gray-100 text-gray-700'
    const lower = rec.toLowerCase()
    if (lower.includes('hire')) return 'bg-green-100 text-green-800'
    if (lower.includes('consider')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No results found</h2>
          <p className="text-gray-500 mb-6">Please complete an interview first.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Interview Results
          </h1>
          <p className="text-gray-600">
            AI-powered evaluation of your {role} interview
          </p>
        </div>

        {/* Overall Score Card */}
        <div className={`rounded-xl p-8 mb-8 border-2 text-center ${getScoreBg(results.overall_score)}`}>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Overall Score</h2>
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(results.overall_score)}`}>
            {results.overall_score}/10
          </div>
          {results.recommendation && (
            <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${getRecommendationStyle(results.recommendation)}`}>
              {results.recommendation}
            </span>
          )}
          {results.overall_feedback && (
            <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
              {results.overall_feedback}
            </p>
          )}
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-green-700 mb-3">💪 Strengths</h3>
            {results.strengths && results.strengths.length > 0 ? (
              <ul className="space-y-2">
                {results.strengths.map((s, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span className="text-gray-700 text-sm">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No strengths noted</p>
            )}
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-orange-700 mb-3">📈 Areas for Improvement</h3>
            {results.improvements && results.improvements.length > 0 ? (
              <ul className="space-y-2">
                {results.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-orange-500 mr-2 mt-0.5">→</span>
                    <span className="text-gray-700 text-sm">{imp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No improvements noted</p>
            )}
          </div>
        </div>

        {/* Per-Question Breakdown */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Question-by-Question Breakdown</h3>
          <div className="space-y-4">
            {questions.map((q, index) => {
              const perQ = results.per_question?.find(p => p.question_number === index + 1) || 
                          results.per_question?.[index]
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800 text-sm flex-1">
                      Q{index + 1}: {getQuestionText(q)}
                    </h4>
                    {perQ?.score !== undefined && (
                      <span className={`ml-3 text-lg font-bold ${getScoreColor(perQ.score)}`}>
                        {perQ.score}/10
                      </span>
                    )}
                  </div>
                  
                  {/* User's Answer */}
                  <div className="bg-blue-50 p-3 rounded mb-2">
                    <p className="text-xs font-medium text-blue-600 mb-1">Your Answer:</p>
                    <p className="text-sm text-gray-700">
                      {answers[index] || 'No answer provided'}
                    </p>
                  </div>
                  
                  {/* AI Feedback */}
                  {perQ?.feedback && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs font-medium text-gray-500 mb-1">AI Feedback:</p>
                      <p className="text-sm text-gray-700">{perQ.feedback}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-600"
          >
            🔄 Start New Interview
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
