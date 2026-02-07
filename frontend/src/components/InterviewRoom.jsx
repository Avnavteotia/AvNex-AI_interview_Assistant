// frontend/src/components/InterviewRoom.jsx - Interview interface
import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SpeechService from '../services/speech'
import AIService from '../services/ai'
import { useAnalysis } from '../hooks/useAnalysis'

const InterviewRoom = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const { confidenceScore, feedback, isAnalyzing, startAnalysis, stopAnalysis } = useAnalysis()
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  useEffect(() => {
    const savedQuestions = localStorage.getItem('interviewQuestions')
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions))
    }
  }, [])

  useEffect(() => {
    startCamera()
  }, [])
  useEffect(() => {
    return () => {
      stopAnalysis()
    }
  }, [stopAnalysis])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera access error:', error)
      alert('Please allow camera access to use the interview feature!')
    }
  }

  const startInterview = () => {
    setIsInterviewActive(true)
    startAnalysis(videoRef.current)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTranscript('')
    } else {
      // Interview completed
      alert('Interview completed! Redirecting to results...')
      navigate('/')
    }
  }

  // ✅ CHANGE: Start listening with SpeechService
  const startListening = () => {
    const started = SpeechService.startListening(
      (finalText, interimText) => {
        setTranscript(finalText || interimText)
      },
      () => {
        setIsListening(false)
      }
    )
    if (started) {
      setIsListening(true)
    }
  }

  // ✅ CHANGE: Stop listening and save answer
  const stopListening = () => {
    SpeechService.stopListening()
    setIsListening(false)
    if (transcript.trim()) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = transcript
      setAnswers(newAnswers)
    }
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
        
        {/* Confidence Score */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
          <h3 className="text-lg font-bold">Confidence Score</h3>
          <div className="text-3xl font-bold text-green-400">
            {confidenceScore}/10
          </div>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="w-96 bg-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">AI Interview Assistant</h2>
        
        {/* AI Avatar Placeholder */}
        <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-4xl">🤖</span>
        </div>
        
        {/* Current Question */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Current Question:</h3>
          <p className="text-gray-700 bg-gray-100 p-4 rounded">
            {questions[currentQuestion] || "Loading question..."}
          </p>
        </div>

        {/* ✅ CHANGE: Live Feedback Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Live Feedback:</h3>
          <div className="bg-gray-100 p-3 rounded max-h-32 overflow-y-auto">
            {feedback.length > 0 ? (
              feedback.map((item, index) => (
                <p key={index} className="text-sm text-gray-700 mb-1">
                  {item}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                {isAnalyzing ? "Analyzing..." : "Start interview to get feedback"}
              </p>
            )}
          </div>
        </div>

        {/* ✅ CHANGE: Speech Recognition Section */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Your Answer:</h3>
          <div className="bg-gray-100 p-4 rounded min-h-[100px]">
            <p className="text-gray-700">
              {transcript || "Click 'Start Recording' to begin speaking..."}
            </p>
          </div>
          
          <div className="mt-3 space-y-2">
            {!isListening ? (
              <button
                onClick={startListening}
                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                🎤 Start Recording
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
        
        {/* Controls */}
        <div className="space-y-3 mt-auto">
          {!isInterviewActive ? (
            <button
              onClick={startInterview}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600"
            >
              🎯 Start Interview
            </button>
          ) : (
            <>
              <button
                onClick={nextQuestion}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600"
              >
                ➡️ Next Question
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600"
              >
                🏠 End Interview
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default InterviewRoom
