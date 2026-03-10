// frontend/src/components/Dashboard.jsx - Main dashboard
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ✅ CHANGE: Import AIService
import AIService from '../services/ai' 

const Dashboard = () => {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('fresher')
  const [sessionMode, setSessionMode] = useState('Technical')
  const [questionCount, setQuestionCount] = useState(5)
  const [technicalCount, setTechnicalCount] = useState(3)
  const [hrCount, setHrCount] = useState(2)

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
    console.log('🚀 Starting interview with:', { selectedRole, selectedLevel, sessionMode })

    try {
      // ✅ CHANGE: Generate AI questions from backend based on mode
      let generatedData
      
      if (sessionMode === 'Panel') {
        // Panel: custom counts
        console.log('📋 Panel mode - generating', technicalCount, 'technical +', hrCount, 'HR questions')
        generatedData = await AIService.generateCombinedQuestions(
          selectedRole, 
          selectedLevel, 
          technicalCount, 
          hrCount
        )
        generatedData.questions = generatedData.questions || []
        console.log('✅ Panel questions received:', generatedData.questions.length)
      } else {
        // Single type (Technical or HR)
        console.log('📋 Single mode -', sessionMode, 'generating', questionCount, 'questions')
        const singleResponse = await AIService.generateQuestions(
          selectedRole, 
          selectedLevel, 
          sessionMode, 
          questionCount
        )
        console.log('📝 Single mode response:', { type: typeof singleResponse, isArray: Array.isArray(singleResponse), length: singleResponse?.length })
        generatedData = { questions: Array.isArray(singleResponse) ? singleResponse : (singleResponse?.questions || []) }
        console.log('✅ Final questions count:', generatedData.questions?.length || 0)
      }

      // Validate we have questions
      if (!generatedData.questions || generatedData.questions.length === 0) {
        console.error('❌ No questions generated!')
        alert('Error: No questions were generated. Please try again.')
        setIsGenerating(false)
        return
      }

      // ✅ CHANGE: Store data in localStorage for later use
      console.log('📝 Dashboard: Storing interview config')
      console.log('Questions count:', generatedData.questions?.length || 0)
      console.log('Questions sample:', generatedData.questions?.slice(0, 1))
      
      localStorage.setItem('interviewQuestions', JSON.stringify(generatedData.questions))
      localStorage.setItem('interviewRole', selectedRole)
      localStorage.setItem('interviewLevel', selectedLevel)
      localStorage.setItem('sessionMode', sessionMode)
      
      console.log('✅ localStorage updated with questions, navigating to interview...')

      // Generate unique interview ID
      const interviewId = Date.now()
      navigate(`/interview/${interviewId}`)
    } catch (error) {
      console.error('❌ Error generating questions:', error)
      alert('Error generating questions. Please try again.')
    } finally {
      setIsGenerating(false) // ✅ CHANGE: stop loading
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Orbs specific to dashboard */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Welcome Section */}
      <div className="text-center mb-16 relative z-10">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide uppercase shadow-[0_0_15px_rgba(59,130,246,0.15)]">Next-Gen Assessment Platform</div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Master Your Next <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Technical Interview
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Practice in realistic, AI-driven environments tailored to your role. Get immediate, actionable feedback on your technical skills and communication.
        </p>
      </div>

      {/* Interview Setup Card */}
      <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] rounded-2xl p-8 md:p-10 mb-16 mx-auto max-w-3xl">
        <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Configure Session</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Job Role Selection */}
          <div className="relative group">
            <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
              Target Role
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-800/80 text-white p-4 pr-10 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-600"
              >
                <option value="" disabled className="text-slate-500">Select specialization...</option>
                {roles.map(role => (
                  <option key={role} value={role} className="bg-slate-900 text-slate-200">{role}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Experience Level */}
          <div className="relative group">
            <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
              Experience
            </label>
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-slate-800/80 text-white p-4 pr-10 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-600"
              >
                <option value="fresher" className="bg-slate-900 text-slate-200">Fresher (0-2 years)</option>
                <option value="intermediate" className="bg-slate-900 text-slate-200">Intermediate (2-5 years)</option>
                <option value="senior" className="bg-slate-900 text-slate-200">Senior (5+ years)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Session Mode */}
          <div className="relative group">
            <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
              Session Mode
            </label>
            <div className="relative">
              <select
                value={sessionMode}
                onChange={(e) => setSessionMode(e.target.value)}
                className="w-full bg-slate-800/80 text-white p-4 pr-10 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer group-hover:border-slate-600"
              >
                <option value="Technical" className="bg-slate-900 text-slate-200"> Technical </option>
                <option value="HR" className="bg-slate-900 text-slate-200">Behavioral</option>
                <option value="Panel" className="bg-slate-900 text-slate-200">Panel</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {sessionMode === 'Panel' && 'Customize the number of technical vs HR questions'}
              {sessionMode === 'Technical' && 'Focus on technical concepts and problem-solving'}
              {sessionMode === 'HR' && 'Focus on behavioral and soft skills'}
            </p>
          </div>

        {/* Question Count (for Technical/HR only) */}
          {sessionMode !== 'Panel' && (
            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.min(15, Math.max(1, Number(e.target.value) || 1)))}
                className="w-full bg-slate-800/80 text-white p-4 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all group-hover:border-slate-600"
              />
            </div>
          )}
        </div>

        {/* Panel Configuration (shown only in Panel mode) */}
        {sessionMode === 'Panel' && (
          <div className="mt-8 pt-8 border-t border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-indigo-400">⚙️</span> Customize Your Panel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Technical Questions Count */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase">
                  🔧 Technical Questions
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={technicalCount}
                    onChange={(e) => setTechnicalCount(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="w-16 bg-slate-800/80 text-white text-center py-2 px-3 border border-blue-500/30 rounded-lg font-semibold text-lg">
                    {technicalCount}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Focus on problem-solving and technical depth</p>
              </div>

              {/* HR Questions Count */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase">
                  💼 HR Questions
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={hrCount}
                    onChange={(e) => setHrCount(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="w-16 bg-slate-800/80 text-white text-center py-2 px-3 border border-indigo-500/30 rounded-lg font-semibold text-lg">
                    {hrCount}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Assess soft skills and cultural fit</p>
              </div>
            </div>

            {/* Total Questions Summary - Minimal display */}
            <div className="mt-6 p-3 bg-slate-700/30 rounded-lg border border-slate-700/30">
              <p className="text-xs text-slate-400">
                <span className="font-medium text-slate-300">Interview Composition: </span>
                {technicalCount} technical + {hrCount} behavioral = {technicalCount + hrCount} total
              </p>
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="mt-10">
          <button
            onClick={startInterview}
            disabled={!selectedRole || isGenerating}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="tracking-wide">Initializing AI Environment...</span>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12"></div>
                <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span className="relative z-10 tracking-wide">Launch Interview Simulator</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:bg-slate-800/60 transition-colors duration-300 group">
          <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-3xl mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]">🧠</div>
          <h3 className="text-xl font-bold text-white mb-3">Adaptive Intelligence</h3>
          <p className="text-slate-400 leading-relaxed font-medium">Dynamic query generation based on your target specialization and expertise level, mirroring FAANG interviews.</p>
        </div>
        
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:bg-slate-800/60 transition-colors duration-300 group">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center text-3xl mb-6 border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]">📊</div>
          <h3 className="text-xl font-bold text-white mb-3">Holistic Metrics</h3>
          <p className="text-slate-400 leading-relaxed font-medium">Get microscopic insights into your technical accuracy, communication clarity, and problem-solving approach.</p>
        </div>
        
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:bg-slate-800/60 transition-colors duration-300 group">
          <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-3xl mb-6 border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]">🎙️</div>
          <h3 className="text-xl font-bold text-white mb-3">Natural Interaction</h3>
          <p className="text-slate-400 leading-relaxed font-medium">Advanced speech-to-text integration allows for seamless, conversation-driven interview simulations.</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
