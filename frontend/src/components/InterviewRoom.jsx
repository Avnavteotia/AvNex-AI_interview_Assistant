// frontend/src/components/InterviewRoom.jsx - Interview interface
import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  const [answerSubmitted, setAnswerSubmitted] = useState(false)

  useEffect(() => {
    const savedQuestions = localStorage.getItem('interviewQuestions')
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions))
    }
  }, [])

  useEffect(() => {
    startCamera()
    // Cleanup: stop camera when component unmounts
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
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

    const role = localStorage.getItem('interviewRole') || 'General'
    const level = localStorage.getItem('interviewLevel') || 'fresher'

    setIsEvaluating(true)

    try {
      const results = await AIService.evaluateInterview(qaPairs, role, level)

      // Store results and navigate to results page
      localStorage.setItem('interviewResults', JSON.stringify(results))
      localStorage.setItem('interviewAnswers', JSON.stringify(finalAnswers))

      navigate('/results')
    } catch (error) {
      console.error('Error evaluating interview:', error)
      alert('Error evaluating interview. Returning to dashboard.')
      navigate('/')
    } finally {
      setIsEvaluating(false)
    }
  }


  const startInterview = () => {
    setIsInterviewActive(true)
  }

  // Get question text helper
  const getQuestionText = (q) => {
    if (!q) return "Loading question..."
    return q.question || (typeof q === 'string' ? q : "Loading question...")
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
      
      const qaPairs = questions.map((q, i) => ({
        question: getQuestionText(q),
        answer: newAnswers[i] || 'No answer provided'
      }))
      
      const role = localStorage.getItem('interviewRole') || 'General'
      const level = localStorage.getItem('interviewLevel') || 'fresher'
      
      try {
        const results = await AIService.evaluateInterview(qaPairs, role, level)
        
        // Store results and navigate
        localStorage.setItem('interviewResults', JSON.stringify(results))
        localStorage.setItem('interviewAnswers', JSON.stringify(newAnswers))
        
        navigate('/results')
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
      }, 500)
    }
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

  // Show loading screen while evaluating
  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">🧠 AI is Evaluating Your Interview...</h2>
          <p className="text-gray-400">Analyzing your answers and generating scores</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Video Section */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Controls */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
          <h3 className="text-lg font-bold">Interview Session #{id}</h3>
          <p>Question {currentQuestion + 1} of {questions.length || 0}</p>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black bg-opacity-50 rounded-lg p-3">
            <div className="flex justify-between text-white text-sm mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="w-96 bg-white p-6 flex flex-col overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">AI Interview Assistant</h2>
        
        {/* AI Avatar */}
        <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">🤖</span>
        </div>

        {!isInterviewActive ? (
          /* Pre-Interview Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Ready for your Interview?</h3>
            <p className="text-gray-500 text-sm mb-2">📋 {questions.length} questions prepared</p>
            <p className="text-gray-500 text-sm mb-2">🎤 Answer by speaking into your microphone</p>
            <p className="text-gray-500 text-sm mb-6">📊 AI will evaluate your responses</p>
            <button
              onClick={startInterview}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 text-lg"
            >
              🎯 Start Interview
            </button>
          </div>
        ) : (
          /* Active Interview UI */
          <>
            {/* Current Question */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">
                Question {currentQuestion + 1}:
                {questions[currentQuestion]?.difficulty && (
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    questions[currentQuestion].difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    questions[currentQuestion].difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {questions[currentQuestion].difficulty}
                  </span>
                )}
              </h3>
              <p className="text-gray-700 bg-gray-100 p-4 rounded text-sm">
                {getQuestionText(questions[currentQuestion])}
              </p>
            </div>

            {/* Speech Recognition Section */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Your Answer:</h3>
              <div className="bg-gray-100 p-4 rounded min-h-[80px] max-h-[200px] overflow-y-auto">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {transcript || "Click 'Start Recording' to begin speaking..."}
                </p>
              </div>
              
              {/* Recording Controls */}
              <div className="mt-3 space-y-2">
                {!isListening ? (
                  <button
                    onClick={startListening}
                    disabled={answerSubmitted}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🎤 {answerSubmitted ? 'Answer Submitted' : 'Start Recording'}
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 animate-pulse"
                  >
                    ⏹️ Stop Recording
                  </button>
                )}
              </div>
            </div>
            
            {/* Submit & Controls */}
            <div className="space-y-3 mt-auto">
              {/* Submit Answer Button - visible after recording */}
              {transcript.trim() && !answerSubmitted && !isListening && (
                <button
                  onClick={submitAnswer}
                  disabled={isSubmitting}
                  className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? '⏳ Submitting...' 
                    : currentQuestion >= questions.length - 1 
                      ? '🏁 Submit & Finish Interview' 
                      : '✅ Submit Answer & Next'}
                </button>
              )}

              {/* End Interview Early */}
              <button
                onClick={endInterview}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 text-sm"
              >
                🏠 End Interview
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default InterviewRoom
