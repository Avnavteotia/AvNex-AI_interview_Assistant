// frontend/src/services/speech.js - Speech recognition service
class SpeechService {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.onResult = null
    this.onEnd = null
    this.fullTranscript = '' // Accumulated finalized text
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

      // Reset accumulated transcript when starting a new recording
      this.fullTranscript = ''

      this.recognition.onstart = () => {
        this.isListening = true
        console.log('Speech recognition started')
      }

      this.recognition.onresult = (event) => {
        // Build the full transcript from ALL results, not just the latest ones
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        // The full text is all finalized segments + current interim text
        const fullText = finalTranscript.trim()
        const displayText = fullText + (interimTranscript ? ' ' + interimTranscript : '')

        if (onResult) {
          onResult(fullText, displayText)
        }
      }

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        // Don't stop on "no-speech" errors, just keep listening
        if (event.error !== 'no-speech') {
          this.isListening = false
        }
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
