// frontend/src/services/speech.js - Speech recognition service
class SpeechService {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.onResult = null
    this.onEnd = null
  }

  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  }

  startListening(onResult, onEnd) {
    if (!this.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return false
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'

      this.recognition.onstart = () => {
        this.isListening = true
        console.log('Speech recognition started')
      }

      this.recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (onResult) {
          onResult(finalTranscript, interimTranscript)
        }
      }

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        this.isListening = false
      }

      this.recognition.onend = () => {
        this.isListening = false
        if (onEnd) onEnd()
      }

      this.recognition.start()
      return true
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      return false
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  getCurrentStatus() {
    return this.isListening
  }
}

export default new SpeechService()
