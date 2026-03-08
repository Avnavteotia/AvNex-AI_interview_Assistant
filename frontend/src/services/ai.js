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
        { question: "What is the virtual DOM in React and why is it useful?", difficulty: "medium" },
        { question: "How do you optimize a modern web application's performance?", difficulty: "hard" },
        { question: "Can you explain CSS Flexbox and Grid, and when you'd use each?", difficulty: "medium" },
        { question: "What are React Hooks and what problems do they solve?", difficulty: "medium" }
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

    return fallbackQuestions[role] || fallbackQuestions['Frontend Developer'];
  }


}

export default new AIService();
