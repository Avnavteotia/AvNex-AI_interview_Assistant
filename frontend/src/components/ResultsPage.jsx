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
    if (score >= 8) return 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]'
    if (score >= 5) return 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'
    return 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]'
  }

  const getScoreBg = (score) => {
    if (score >= 8) return 'bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_0_30px_rgba(16,185,129,0.1)]'
    if (score >= 5) return 'bg-amber-500/10 border-amber-500/30 shadow-[inset_0_0_30px_rgba(245,158,11,0.1)]'
    return 'bg-rose-500/10 border-rose-500/30 shadow-[inset_0_0_30px_rgba(225,29,72,0.1)]'
  }

  const getRecommendationStyle = (rec) => {
    if (!rec) return 'bg-slate-800/50 text-slate-400 border-white/10'
    const lower = rec.toLowerCase()
    if (lower.includes('hire')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
    if (lower.includes('consider')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_15px_rgba(225,29,72,0.2)]'
  }

  if (!results) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="text-center bg-slate-900/60 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl relative z-10 max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner border border-white/5">
            <span className="text-4xl opacity-50">📂</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">No Session Data</h2>
          <p className="text-slate-400 mb-8 text-lg">Your interview results will appear here once you complete a session.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full relative group overflow-hidden bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 border border-slate-600 hover:border-slate-500"
          >
            <span className="relative flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Return to Dashboard
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 relative">
      <div className="absolute top-20 right-20 w-80 h-80 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-slate-800/80 border border-white/10 text-slate-300 text-sm font-semibold tracking-wide shadow-sm">Assessment Complete</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight flex items-center justify-center gap-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Performance Report</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            AI Evaluation for <span className="text-white font-bold">{role}</span> Specialization
          </p>
        </div>

        {/* Overall Score Card */}
        <div className={`relative overflow-hidden rounded-3xl p-10 mx-auto max-w-3xl mb-12 border backdrop-blur-md ${getScoreBg(results.overall_score)}`}>
          <div className="relative z-10 text-center">
            <h2 className="text-xl font-bold text-slate-300 mb-4 tracking-wide uppercase">Aggregate Score</h2>
            <div className={`text-8xl font-black mb-6 tracking-tighter ${getScoreColor(results.overall_score)}`}>
              {results.overall_score}<span className="text-4xl text-slate-500/50">/10</span>
            </div>
            
            {results.recommendation && (
              <div className="mb-6">
                <span className={`inline-block px-6 py-2 rounded-full text-sm font-bold border tracking-wide uppercase ${getRecommendationStyle(results.recommendation)}`}>
                  AI Verdict: {results.recommendation}
                </span>
              </div>
            )}
            
            {results.overall_feedback && (
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 inline-block text-left w-full mt-2">
                <p className="text-slate-200 text-lg leading-relaxed font-medium">
                  {results.overall_feedback}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Strengths */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <span className="text-emerald-400 text-xl">💪</span>
                </div>
                <h3 className="text-xl font-bold text-emerald-400 tracking-tight">Key Strengths</h3>
              </div>
              
              {results.strengths && results.strengths.length > 0 ? (
                <ul className="space-y-4">
                  {results.strengths.map((s, i) => (
                    <li key={i} className="flex items-start bg-slate-800/30 p-4 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-colors">
                      <div className="mt-1 bg-emerald-500/20 p-1 rounded-full mr-4">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span className="text-slate-300 text-base font-medium leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-slate-800/30 p-6 rounded-xl border border-white/5 text-center text-slate-500 italic">No significant strengths detected.</div>
              )}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden relative group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-rose-500"></div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <span className="text-amber-400 text-xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-amber-400 tracking-tight">Growth Areas</h3>
              </div>

              {results.improvements && results.improvements.length > 0 ? (
                <ul className="space-y-4">
                  {results.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start bg-slate-800/30 p-4 rounded-xl border border-white/5 hover:border-amber-500/20 transition-colors">
                      <div className="mt-1 bg-amber-500/20 p-1 rounded-full mr-4">
                         <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </div>
                      <span className="text-slate-300 text-base font-medium leading-relaxed">{imp}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-slate-800/30 p-6 rounded-xl border border-white/5 text-center text-slate-500 italic">No major critical improvements noted.</div>
              )}
            </div>
          </div>
        </div>

        {/* Per-Question Breakdown */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm">📝</span>
            Detailed Query Analysis
          </h3>
          <div className="space-y-6">
            {questions.map((q, index) => {
              const perQ = results.per_question?.find(p => p.question_number === index + 1) || 
                          results.per_question?.[index]
              return (
                <div key={index} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-slate-700">
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                      <h4 className="font-bold text-white text-lg leading-relaxed flex-1 flex gap-3">
                        <span className="text-slate-500 font-mono text-base pt-0.5">Q{index + 1}.</span> 
                        {getQuestionText(q)}
                      </h4>
                      {perQ?.score !== undefined && (
                        <div className={`px-4 py-2 rounded-xl bg-slate-950/50 border font-bold text-xl whitespace-nowrap shadow-inner flex items-center gap-2 ${getScoreColor(perQ.score).split(' ')[0]} ${getScoreBg(perQ.score).split(' ')[1]}`}>
                          {perQ.score}<span className="text-sm text-slate-500 opacity-50 font-medium">/10</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {/* User's Answer */}
                      <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5 relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-500 rounded-l-xl opacity-50"></div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-sm font-bold tracking-wider text-slate-400 uppercase">Transcript</span>
                        </div>
                        <p className="text-base text-slate-300 leading-relaxed italic">
                          "{answers[index] || 'No verbal response recorded.'}"
                        </p>
                      </div>
                      
                      {/* AI Feedback */}
                      {perQ?.feedback && (
                        <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-500/20 relative">
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl opacity-80"></div>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-sm font-bold tracking-wider text-blue-400 uppercase">AI Evaluation</span>
                          </div>
                          <p className="text-base text-slate-300 leading-relaxed font-medium">
                            {perQ.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-16 relative z-10">
          <button
            onClick={() => navigate('/')}
            className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-5 px-10 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] flex items-center gap-3"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12"></div>
            <span className="relative z-10 text-2xl">🔄</span>
            <span className="relative z-10 tracking-wide">Initialize New Session</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
