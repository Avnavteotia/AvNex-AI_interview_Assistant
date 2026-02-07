// frontend/src/services/ai.js - AI service using Puter.js
class AIService {
  async generateQuestions(role, level, count = 10) {
    const prompt = `Generate ${count} interview questions for a ${role} position at ${level} level. 
    Return as a JSON array of objects with format: 
    [{"question": "question text", "difficulty": "easy|medium|hard"}]
    
    Role: ${role}
    Level: ${level}
    
    Make questions relevant to the role and appropriate for the experience level.`;

    try {
      const response = await puter.ai.chat(prompt, { model: 'gpt-4o' });
      const questions = JSON.parse(response.text);
      return questions;
    } catch (error) {
      console.error('AI Question Generation Error:', error);
      // Fallback questions if AI fails
      return this.getFallbackQuestions(role, level);
    }
  }

  async evaluateAnswer(question, answer) {
    const prompt = `Evaluate this interview answer and provide feedback:
    
    Question: "${question}"
    Answer: "${answer}"
    
    Provide evaluation as JSON:
    {
      "score": number (1-10),
      "feedback": "detailed feedback",
      "strengths": ["strength1", "strength2"],
      "improvements": ["improvement1", "improvement2"]
    }`;

    try {
      const response = await puter.ai.chat(prompt, { model: 'gpt-4o' });
      return JSON.parse(response.text);
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
