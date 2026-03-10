// frontend/src/services/ai.js - AI service using backend API
import axios from 'axios';

const API_URL = 'http://localhost:5000';

class AIService {
  async generateQuestions(role, level, interviewType, count = 5) {
    try {
      console.log('🤖 API: Generating questions...', { role, level, interviewType, count });
      const response = await axios.post(`${API_URL}/api/generate-questions`, {
        role,
        level,
        interviewType,
        count
      });
      const questions = response.data.questions || response.data;
      console.log('✅ API: Questions generated successfully, count:', questions?.length || 0);
      return questions || [];
    } catch (error) {
      console.error('❌ AI Question Generation Error:', error.message);
      console.log('📌 Using fallback questions for', role, interviewType);
      const fallback = this.getFallbackQuestions(role, level, interviewType);
      console.log('📌 Fallback questions count:', fallback?.length || 0);
      return fallback;
    }
  }

  async generateCombinedQuestions(role, level, technicalCount = 3, hrCount = 2) {
    try {
      console.log('🤖 API: Generating combined questions...', { role, level, technicalCount, hrCount });
      const response = await axios.post(`${API_URL}/api/generate-combined-questions`, {
        role,
        level,
        technicalCount,
        hrCount
      });
      const result = response.data;
      console.log('✅ API: Combined questions generated, total:', result?.questions?.length || 0);
      return result;
    } catch (error) {
      console.error('❌ AI Combined Question Generation Error:', error.message);
      console.log('📌 Using fallback questions for Panel mode');
      // Return fallback with both technical and HR questions
      const technicalQuestions = this.getFallbackQuestions(role, level, 'Technical').slice(0, technicalCount);
      const hrQuestions = this.getFallbackQuestions(role, level, 'HR').slice(0, hrCount);
      
      // Add type field
      technicalQuestions.forEach(q => q.type = 'Technical');
      hrQuestions.forEach(q => q.type = 'HR');
      
      const fallbackResult = {
        questions: [...technicalQuestions, ...hrQuestions],
        technical_count: technicalQuestions.length,
        hr_count: hrQuestions.length,
        total_count: technicalQuestions.length + hrQuestions.length
      };
      console.log('📌 Fallback questions count:', fallbackResult.total_count);
      return fallbackResult;
    }
  }

  async evaluateAnswer(question, answer, interviewType = 'Technical') {
    try {
      const response = await axios.post(`${API_URL}/api/evaluate-answer`, {
        question,
        answer,
        interviewType
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

  async evaluateInterview(qaPairs, role, level, interviewType = 'Technical') {
    try {
      console.log('📤 Sending interview evaluation:', {
        qaPairsCount: qaPairs?.length,
        role,
        level,
        interviewType,
        firstQuestion: qaPairs?.[0]?.question?.substring(0, 50)
      });
      
      const response = await axios.post(`${API_URL}/api/evaluate-interview`, {
        qa_pairs: qaPairs,
        role,
        level,
        interviewType
      });
      
      console.log('✅ Interview evaluation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AI Interview Evaluation Error:', error.response?.data || error.message);
      console.error('Full error:', error);
      // Return a safe fallback response
      return {
        overall_score: 5,
        overall_feedback: "Could not evaluate the interview due to a temporary error. Please check the backend logs.",
        per_question: [],
        strengths: ["Attempted interview completion"],
        improvements: ["Review backend for detailed feedback"],
        recommendation: "Consider",
        error_occurred: true,
        error_message: error.response?.data?.error || error.message
      };
    }
  }

  getFallbackQuestions(role, level, interviewType) {
    if (interviewType === 'HR') {
      return [
        { question: "Tell me about yourself and your professional background.", difficulty: "easy" },
        { question: "Why do you want to work for our company?", difficulty: "easy" },
        { question: "Describe a challenging project you worked on and how you overcame the obstacles.", difficulty: "medium" },
        { question: "Tell me about a time you had to work in a team with conflicting opinions. How did you handle it?", difficulty: "medium" },
        { question: "Where do you see yourself in 5 years and what steps are you taking to get there?", difficulty: "hard" }
      ];
    }
    
    const fallbackQuestions = {
      'Frontend Developer': [
        { question: "Explain the difference between let, const, and var in JavaScript and when you would use each.", difficulty: "medium" },
        { question: "Walk me through how you would optimize the performance of a slow web application. What tools would you use?", difficulty: "hard" },
        { question: "Describe your approach to building a responsive and accessible user interface.", difficulty: "medium" },
        { question: "Tell me about a complex UI component you built. How did you handle state management?", difficulty: "hard" },
        { question: "How do you stay updated with new frontend technologies and frameworks?", difficulty: "easy" }
      ],
      'Backend Developer': [
        { question: "Explain REST API principles and describe how you would design a RESTful API for a social media platform.", difficulty: "medium" },
        { question: "Walk me through your approach to database optimization and indexing strategies.", difficulty: "hard" },
        { question: "How do you handle authentication and authorization in web applications? Describe the process.", difficulty: "hard" },
        { question: "Design a simple recommendation system using collaborative filtering. Describe the steps you would take to implement it and discuss its advantages and limitations.", difficulty: "hard" },
        { question: "Tell me about a backend system you designed. What were the main challenges and how did you solve them?", difficulty: "hard" }
      ],
      'Full Stack Developer': [
        { question: "Walk me through the full development lifecycle of a web application you've built from start to finish.", difficulty: "hard" },
        { question: "How do you ensure data security across both frontend and backend of an application?", difficulty: "hard" },
        { question: "Explain microservices architecture and describe when you would use it over monolithic architecture.", difficulty: "hard" },
        { question: "Describe how you would handle deployment and scaling of a full stack application.", difficulty: "hard" },
        { question: "Tell me about a time you had to debug a complex issue that spanned both frontend and backend. Walk me through your debugging process.", difficulty: "hard" }
      ],
      'ML Engineer': [
        { question: "Explain the difference between supervised and unsupervised learning. Can you describe a real-world use case for each?", difficulty: "medium" },
        { question: "How would you approach building a recommendation system for an e-commerce platform? Walk me through your methodology.", difficulty: "hard" },
        { question: "Describe your process for handling imbalanced datasets in classification problems. What techniques would you use?", difficulty: "hard" },
        { question: "Tell me about a machine learning model you built. How did you evaluate its performance and handle overfitting?", difficulty: "hard" },
        { question: "Explain the trade-offs between model accuracy and interpretability. When would you prioritize one over the other?", difficulty: "hard" }
      ],
      'Data Scientist': [
        { question: "Walk me through your approach to exploratory data analysis. What are the key steps you would follow?", difficulty: "medium" },
        { question: "Describe a time when you had to deal with missing data in a dataset. What strategies did you employ?", difficulty: "medium" },
        { question: "How do you approach feature engineering? Can you give examples of features you've created?", difficulty: "hard" },
        { question: "Explain how you would validate that your data analysis findings are statistically significant.", difficulty: "hard" },
        { question: "Tell me about a complex data problem you solved. How did you communicate your findings to non-technical stakeholders?", difficulty: "hard" }
      ],
      'Cloud Engineer': [
        { question: "Describe the key differences between Infrastructure as Code (IaC) and traditional infrastructure management.", difficulty: "medium" },
        { question: "How would you design a scalable and highly available cloud architecture for a web application?", difficulty: "hard" },
        { question: "Explain your approach to cloud cost optimization. What strategies would you implement?", difficulty: "hard" },
        { question: "Tell me about a cloud migration project you worked on. What were the challenges and how did you overcome them?", difficulty: "hard" },
        { question: "How do you approach disaster recovery and business continuity planning in the cloud?", difficulty: "hard" }
      ],
      'DevOps Engineer': [
        { question: "Describe your experience with containerization technologies like Docker. How do you use them in your workflow?", difficulty: "medium" },
        { question: "Explain continuous integration and continuous deployment (CI/CD). How would you set up a pipeline from scratch?", difficulty: "hard" },
        { question: "How do you approach monitoring and alerting in production environments?", difficulty: "hard" },
        { question: "Tell me about a production incident you responded to. How did you troubleshoot and what did you learn?", difficulty: "hard" },
        { question: "Describe your approach to infrastructure automation and configuration management.", difficulty: "hard" }
      ],
      'Cybersecurity Specialist': [
        { question: "Explain the difference between penetration testing and vulnerability assessment. When would you use each?", difficulty: "medium" },
        { question: "Describe a security vulnerability you discovered. How did you identify it and what was your remediation plan?", difficulty: "hard" },
        { question: "How would you approach securing a microservices architecture? What are the key considerations?", difficulty: "hard" },
        { question: "Explain your understanding of the OWASP Top 10 vulnerabilities and how you would prevent them.", difficulty: "hard" },
        { question: "Tell me about your approach to incident response and threat handling in an organization.", difficulty: "hard" }
      ]
    };

    return fallbackQuestions[role] || fallbackQuestions['Frontend Developer'];
  }


}

export default new AIService();
