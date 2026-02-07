// frontend/src/hooks/useAnalysis.js - Real-time analysis hook
import { useState, useRef, useCallback } from 'react'

export const useAnalysis = () => {
  const [confidenceScore, setConfidenceScore] = useState(5)
  const [feedback, setFeedback] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const intervalRef = useRef(null)

  const startAnalysis = useCallback((videoElement) => {
    if (!videoElement) return

    setIsAnalyzing(true)
    
    intervalRef.current = setInterval(async () => {
      try {
        // Capture frame from video
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        
        // Send to backend for analysis
        const response = await fetch('http://localhost:5000/api/analyze-pose', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageData })
        })
        
        const result = await response.json()
        
        if (result.confidence_score) {
          setConfidenceScore(result.confidence_score)
          setFeedback(result.feedback || [])
        }
        
      } catch (error) {
        console.error('Analysis error:', error)
      }
    }, 3000) // Analyze every 3 seconds
    
  }, [])

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  return {
    confidenceScore,
    feedback,
    isAnalyzing,
    startAnalysis,
    stopAnalysis
  }
}
