// frontend/src/services/ai.js - AI service using backend API
import axios from 'axios';

const API_URL = 'http://localhost:5000';

class AIService {
  async generateQuestions(role, level, count = 5) {
    try {
      const response = await axios.post(`${API_URL}/api/generate-questions`, {
        role,
        level,
        count
      });
      return response.data.questions;
    } catch (error) {
      console.error('AI Question Generation Error:', error);
      return this.getFallbackQuestions(role, level);
    }
  }

  async evaluateAnswer(question, answer) {
    try {
      const response = await axios.post(`${API_URL}/api/evaluate-answer`, {
        question,
        answer
      });
      return response.data;
    } catch (error) {
      console.error('AI Answer Evaluation Error:', error);
      return {
        score: 7,
        feedback: "Answer received. Please continue to the next question.",
        strengths: ["Good communication"],
        improvements: ["Provide more specific examples"]
      };
    }
  }

  async evaluateInterview(qaPairs, role, level) {
    try {
      const response = await axios.post(`${API_URL}/api/evaluate-interview`, {
        qa_pairs: qaPairs,
        role,
        level
      });
      return response.data;
    } catch (error) {
      console.error('AI Interview Evaluation Error:', error);
      return {
        overall_score: 0,
        overall_feedback: "Could not evaluate the interview. Please try again.",
        per_question: [],
        strengths: [],
        improvements: [],
        recommendation: "Error"
      };
    }
  }

  getFallbackQuestions(role, level) {
    const fallbackQuestions = {
      'Frontend Developer': [
        { question: "Explain the difference between let, const, and var in JavaScript.", difficulty: "medium" },
        { question: "What is the virtual DOM in React?", difficulty: "medium" },
        { question: "How do you optimize a website's performance?", difficulty: "hard" }
      ],
      'Backend Developer': [
        { question: "Explain REST API principles.", difficulty: "medium" },
        { question: "What is database indexing?", difficulty: "medium" },
        { question: "How do you handle authentication in web applications?", difficulty: "hard" }
      ],
      'Full Stack Developer': [
        { question: "Describe the full development lifecycle of a web application.", difficulty: "hard" },
        { question: "How do you ensure data security?", difficulty: "hard" },
        { question: "Explain microservices architecture.", difficulty: "hard" }
      ]
    };

    return fallbackQuestions[role] || [
      { question: "Tell me about yourself.", difficulty: "easy" },
      { question: "What are your strengths?", difficulty: "easy" },
      { question: "Why do you want this job?", difficulty: "easy" }
    ];
  }
}

export default new AIService();
