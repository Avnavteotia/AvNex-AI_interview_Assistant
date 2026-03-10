import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Avatar } from './Avatar'
import SpeechService from '../services/speech'
import AIService from '../services/ai'

const InterviewRoom = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds
  const [timerActive, setTimerActive] = useState(false)

  // AI Speech state
  const [isSpeaking, setIsSpeaking] = useState(false)
  const synthRef = useRef(window.speechSynthesis)
  const timerIdRef = useRef(null)

  useEffect(() => {
    const savedQuestions = localStorage.getItem('interviewQuestions')
    console.log('🔍 InterviewRoom: Reading questions from localStorage')
    console.log('Saved questions string length:', savedQuestions?.length || 0)
    
    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions)
        console.log('✅ Questions parsed successfully, count:', parsed.length)
        console.log('Questions sample:', parsed.slice(0, 1))
        setQuestions(parsed)
      } catch (error) {
        console.error('❌ Error parsing questions from localStorage:', error)
        setQuestions([])
      }
    } else {
      console.warn('⚠️  No questions found in localStorage')
      setQuestions([])
    }
  }, [])

  useEffect(() => {
    startCamera()
    // Cleanup: stop camera when component unmounts
    return () => {
      stopCamera()
    }
  }, [])

  // Navigate to results after completion message is shown
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        navigate('/results')
      }, 3000) // Show completion message for 3 seconds
      return () => clearTimeout(timer)
    }
  }, [isCompleted, navigate])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      // Handle React StrictMode double invocation or unmounting before promise resolved
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      if (!videoRef.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }

      streamRef.current = stream
      videoRef.current.srcObject = stream
    } catch (error) {
      console.error('Camera access error:', error)
      alert('Please allow camera access to use the interview feature!')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const endInterview = async () => {
    console.log('🏁 endInterview called')
    console.log('Current state - Questions:', questions.length, 'Answers:', answers.length)
    console.log('Questions array:', questions)
    
    if (!questions || questions.length === 0) {
      console.error('❌ No questions loaded! Cannot evaluate interview.')
      alert('Error: Interview questions were not loaded properly. Please try again.')
      navigate('/')
      return
    }
    
    // Stop listening if still active
    if (isListening) {
      SpeechService.stopListening()
      setIsListening(false)
    }

    // Stop camera immediately so the light turns off right away
    stopCamera()

    // Include the current transcript as the answer for the current question if available
    const finalAnswers = [...answers]
    if (transcript.trim()) {
      finalAnswers[currentQuestion] = transcript
    }

    // Build Q&A pairs from whatever has been answered so far
    const qaPairs = questions.map((q, i) => ({
      question: getQuestionText(q),
      answer: finalAnswers[i] || 'No answer provided'
    }))
    
    console.log('🎬 Building Q&A pairs for evaluation:')
    console.log('Total questions:', questions.length)
    console.log('Total answers:', finalAnswers.length)
    console.log('Q&A pairs sample:', qaPairs.slice(0, 2))
    console.log('Full Q&A pairs:', JSON.stringify(qaPairs, null, 2))

    const role = localStorage.getItem('interviewRole') || 'General'
    const level = localStorage.getItem('interviewLevel') || 'fresher'
    const sessionMode = localStorage.getItem('sessionMode') || 'Technical'

    // Determine interview type: if there are both Technical and HR questions, mark as Combined
    const hasTechnical = questions.some(q => !q.type || q.type === 'Technical')
    const hasHR = questions.some(q => q.type === 'HR')
    const interviewType = (hasTechnical && hasHR) ? 'Combined' : (hasHR ? 'HR' : 'Technical')

    setIsEvaluating(true)

    try {
      const results = await AIService.evaluateInterview(qaPairs, role, level, interviewType)

      // Store results
      localStorage.setItem('interviewResults', JSON.stringify(results))
      localStorage.setItem('interviewAnswers', JSON.stringify(finalAnswers))

      // Show completion message and then navigate
      setIsCompleted(true)
    } catch (error) {
      console.error('Error evaluating interview:', error)
      alert('Error evaluating interview. Returning to dashboard.')
      navigate('/')
    } finally {
      setIsEvaluating(false)
    }
  }


  // Get question text helper
  const getQuestionText = (q) => {
    if (!q) return "Loading question..."
    return q.question || (typeof q === 'string' ? q : "Loading question...")
  }

  // Text to Speech
  const speakQuestion = (text) => {
    if (!synthRef.current) return;
    
    // Stop any current speech
    synthRef.current.cancel();

    // Small delay before speaking so it feels natural
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a good female English voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => 
        (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female')) && 
        v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        // Start timer when AI finishes speaking
        setTimerActive(true);
        setTimeLeft(180); // Reset to 3 minutes
      };
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }, 500);
  };

  // Speak question when it changes (and interview is active)
  useEffect(() => {
    if (isInterviewActive && questions.length > 0 && currentQuestion < questions.length) {
      speakQuestion(getQuestionText(questions[currentQuestion]));
    }
  }, [currentQuestion, isInterviewActive, questions]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0 && timerActive && isInterviewActive) {
        // Auto-submit when time runs out
        handleSkipQuestion(); // Skip to next question when timer ends
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerIdRef.current = interval;
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isInterviewActive]);

  const startInterview = () => {
    setIsInterviewActive(true)
  }

  // Submit answer and move to next question
  const submitAnswer = async () => {
    if (!transcript.trim()) {
      alert('Please record your answer first!')
      return
    }

    // Stop listening if still active
    if (isListening) {
      SpeechService.stopListening()
      setIsListening(false)
    }

    setIsSubmitting(true)
    
    // Save the answer
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = transcript
    setAnswers(newAnswers)
    setAnswerSubmitted(true)

    // Check if this is the last question
    if (currentQuestion >= questions.length - 1) {
      // Last question - stop camera immediately and evaluate
      stopCamera()
      setIsEvaluating(true)
      
      if (!questions || questions.length === 0) {
        console.error('❌ No questions loaded during evaluation!')
        alert('Error: Interview data is missing. Please start a new interview.')
        navigate('/')
        return
      }
      
      const qaPairs = questions.map((q, i) => ({
        question: getQuestionText(q),
        answer: newAnswers[i] || 'No answer provided'
      }))
      
      const role = localStorage.getItem('interviewRole') || 'General'
      const level = localStorage.getItem('interviewLevel') || 'fresher'
      
      // Determine interview type: if there are both Technical and HR questions, mark as Combined
      const hasTechnical = questions.some(q => !q.type || q.type === 'Technical')
      const hasHR = questions.some(q => q.type === 'HR')
      const interviewType = (hasTechnical && hasHR) ? 'Combined' : (hasHR ? 'HR' : 'Technical')
      
      try {
        console.log('📊 Last question evaluation - Q&A pairs:')
        console.log('Role:', role)
        console.log('Level:', level)
        console.log('Interview Type:', interviewType)
        console.log('Questions count:', questions.length)
        console.log('Answers count:', newAnswers.length)
        console.log('Q&A Pairs:', JSON.stringify(qaPairs, null, 2))
        
        const results = await AIService.evaluateInterview(qaPairs, role, level, interviewType)
        
        // Store results
        localStorage.setItem('interviewResults', JSON.stringify(results))
        localStorage.setItem('interviewAnswers', JSON.stringify(newAnswers))
        
        // Show completion message and then navigate
        setIsCompleted(true)
      } catch (error) {
        console.error('Error evaluating interview:', error)
        alert('Error evaluating interview. Please try again.')
      } finally {
        setIsEvaluating(false)
      }
    } else {
      // Move to next question after a brief delay
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setTranscript('')
        setAnswerSubmitted(false)
        setIsSubmitting(false)
        setTimerActive(false) // Stop timer
        setTimeLeft(180) // Reset timer
      }, 500)
    }
  }

  // Skip to next question without submitting
  const handleSkipQuestion = () => {
    if (isListening) {
      SpeechService.stopListening()
      setIsListening(false)
    }

    setTimerActive(false) // Stop timer

    // Save empty or current answer
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = transcript || 'Skipped'
    setAnswers(newAnswers)

    // Check if this is the last question
    if (currentQuestion >= questions.length - 1) {
      // Last question - evaluate
      submitAnswer();
    } else {
      // Move to next question
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setTranscript('')
        setAnswerSubmitted(false)
        setTimeLeft(180) // Reset timer
        setTimerActive(false)
      }, 300)
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Get timer color based on time left
  const getTimerColor = () => {
    if (timeLeft > 60) return 'text-emerald-400'; // Green
    if (timeLeft > 30) return 'text-amber-400'; // Yellow
    return 'text-rose-400'; // Red
  }

  // Start listening with SpeechService
  const startListening = () => {
    setAnswerSubmitted(false)
    const started = SpeechService.startListening(
      (finalText, displayText) => {
        // displayText contains ALL accumulated speech (final + interim)
        setTranscript(displayText || finalText)
      },
      () => {
        setIsListening(false)
      }
    )
    if (started) {
      setIsListening(true)
    }
  }

  // Stop listening
  const stopListening = () => {
    SpeechService.stopListening()
    setIsListening(false)
  }

  // Progress percentage
  const progress = questions.length > 0 
    ? Math.round(((currentQuestion + (answerSubmitted ? 1 : 0)) / questions.length) * 100) 
    : 0

  // Show loading screen while evaluating or after completion
  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="text-center z-10">
          {isCompleted ? (
            <>
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full mx-auto mb-8 flex items-center justify-center text-5xl animate-bounce shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                ✓
              </div>
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mb-3 tracking-tight">
                🎉 Interview Completed!
              </h2>
              <p className="text-slate-300 text-xl mb-2">Thank you for completing the interview</p>
              <p className="text-slate-400 text-sm">Loading your results...</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mx-auto mb-8 shadow-[0_0_30px_rgba(59,130,246,0.5)]"></div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3 tracking-tight">🧠 Analyzing Responses</h2>
              <p className="text-slate-400 text-lg">AI is evaluating your interview performance...</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden font-sans text-slate-200">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Video Section */}
      <div className="flex-1 relative p-6 flex flex-col">
        <div className="flex-1 relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-slate-900 flex flex-col justify-center items-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover absolute top-0 left-0"
          />
          
          {/* Overlay Controls */}
          <div className="absolute top-6 left-6 bg-slate-900/60 backdrop-blur-md border border-white/10 text-slate-200 p-4 rounded-xl shadow-lg z-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">Session #{id}</h3>
            </div>
            <p className="text-lg font-bold text-white">Question {currentQuestion + 1} <span className="text-slate-400 text-sm font-normal">of {questions.length || 0}</span></p>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <div className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg">
              <div className="flex justify-between text-slate-300 text-sm font-medium mb-2">
                <span>Interview Progress</span>
                <span className="text-blue-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700 relative" 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progressTicker_1s_linear_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Control Panel Sidebar */}
      <div className="w-[420px] bg-slate-900/80 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col overflow-y-auto z-10 shadow-2xl relative">
        <h2 className="text-2xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight text-center">AI Interviewer</h2>
        
        {/* AI Avatar Canvas */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full animate-pulse blur-xl opacity-30"></div>
          <div className="relative w-full h-full bg-slate-800 border-2 border-slate-700/50 rounded-full mx-auto overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[2, 2, 2]} intensity={2} />
              <Environment preset="city" />
              <Avatar isSpeaking={isSpeaking} />
              {/* Disable controls so user can't spin the avatar around awkwardly */}
              <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/2} minPolarAngle={Math.PI/2} />
            </Canvas>
          </div>
        </div>

        {!isInterviewActive ? (
          /* Pre-Interview Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center -mt-4">
            <h3 className="text-xl font-bold text-white mb-4">Ready to Begin?</h3>
            
            <div className="space-y-4 mb-8 w-full">
              <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-white/5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">📋</div>
                <span className="text-slate-300 text-sm">{questions.length} questions prepared</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-white/5">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">🎤</div>
                <span className="text-slate-300 text-sm">Speak clearly into microphone</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-white/5">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">⚡</div>
                <span className="text-slate-300 text-sm">Real-time AI evaluation</span>
              </div>
            </div>

            <button
              onClick={startInterview}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12"></div>
              <span className="relative flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Commence Interview
              </span>
            </button>
          </div>
        ) : (
          /* Active Interview UI */
          <div className="flex-1 flex flex-col h-full">
            {/* Current Question */}
            <div className="mb-6 relative">
              <div className="absolute -left-8 top-1 w-1 h-[calc(100%-8px)] bg-gradient-to-b from-blue-500 to-transparent rounded-r-md"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Question {currentQuestion + 1}
                  </h3>
                  {questions[currentQuestion]?.type && (
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                      questions[currentQuestion].type === 'Technical' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {questions[currentQuestion].type === 'Technical' ? '🔧 Technical' : '💼 HR'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* Timer Display */}
                  {timerActive && (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/50 border border-white/10 ${getTimerColor()}`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" />
                      </svg>
                      <span className={`font-bold text-sm ${getTimerColor()}`}>{formatTime(timeLeft)}</span>
                    </div>
                  )}
                  {questions[currentQuestion]?.difficulty && (
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                      questions[currentQuestion].difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      questions[currentQuestion].difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {questions[currentQuestion].difficulty.charAt(0).toUpperCase() + questions[currentQuestion].difficulty.slice(1)}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-white text-lg leading-relaxed font-medium">
                {getQuestionText(questions[currentQuestion])}
              </p>
            </div>

            {/* Speech Recognition Section */}
            <div className="mb-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Response</h3>
                {isListening && <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>}
              </div>
              
              <div className={`flex-1 bg-slate-800/50 backdrop-blur-sm border rounded-xl p-4 min-h-[120px] overflow-y-auto mb-4 transition-colors duration-300 ${isListening ? 'border-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/10'}`}>
                {transcript ? (
                  <p className="text-slate-200 text-base whitespace-pre-wrap leading-relaxed">
                    {transcript}
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                    <p className="text-sm">Ready to listen...</p>
                  </div>
                )}
              </div>
              
              {/* Recording Controls */}
              <div className="space-y-3">
                {!isListening ? (
                  <button
                    onClick={startListening}
                    disabled={answerSubmitted}
                    className="w-full relative group overflow-hidden bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md hover:border-slate-500 flex justify-center items-center gap-2"
                  >
                    {answerSubmitted ? (
                      <span className="flex items-center gap-2 text-emerald-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Answer Recorded</span>
                    ) : (
                      <><span className="text-red-400">🎙️</span> Start Recording</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="w-full relative overflow-hidden bg-red-500/10 text-red-400 border border-red-500/50 py-3 px-4 rounded-xl hover:bg-red-500/20 transition-all duration-300 font-medium flex justify-center items-center gap-2"
                  >
                    <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
                    Finish Recording
                  </button>
                )}
              </div>
            </div>
            
            {/* Submit & Controls */}
            <div className="space-y-3 mt-auto pt-4 border-t border-white/5">
              {/* Submit Answer Button - visible after recording */}
              <div className={`transition-all duration-500 overflow-hidden ${transcript.trim() && !answerSubmitted && !isListening ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <button
                  onClick={submitAnswer}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Parsing...</>
                  ) : currentQuestion >= questions.length - 1 ? (
                    <>🏁 Finalize Assessment</>
                  ) : (
                    <>Submit & Continue ➔</>
                  )}
                </button>
              </div>
              
              {/* Skip Question Button - always visible when not listening and not submitted */}
              <div className={`transition-all duration-500 overflow-hidden ${!answerSubmitted && !isListening ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                <button
                  onClick={handleSkipQuestion}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-slate-500/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  ⏭️ Skip Question
                </button>
              </div>

              {/* End Interview Early */}
              <button
                onClick={() => {
                  if (synthRef.current) synthRef.current.cancel();
                  endInterview();
                }}
                className="w-full bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-300 py-3 px-4 rounded-xl font-medium transition-all duration-300 text-sm border border-transparent hover:border-white/5"
              >
                Abort Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InterviewRoom
