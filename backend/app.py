# backend/app.py - This is our main server file
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# ✅ CHANGE: Import pose analysis utility
from utils.pose_analysis import BodyLanguageAnalyzer

# Load environment variables from .env file
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend to connect to backend

# ✅ CHANGE: Create BodyLanguageAnalyzer instance
analyzer = BodyLanguageAnalyzer()

# Initialize OpenAI client with configurable base URL for NVIDIA NIM support
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    base_url=os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1')
)

# Get preferred model name
MODEL_NAME = os.getenv('LLM_MODEL', 'gpt-3.5-turbo')

# Test route to make sure our server is working
@app.route('/')
def home():
    return jsonify({
        "message": "🚀 AI Interview App Backend is Running!",
        "status": "success"
    })

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Backend is working perfectly!"
    })

# ✅ CHANGE: New API route for pose analysis
@app.route('/api/analyze-pose', methods=['POST'])
def analyze_pose():
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Analyze the pose using BodyLanguageAnalyzer
        result = analyzer.analyze_confidence(image_data)
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error in pose analysis: {e}")
        return jsonify({"error": "Analysis failed"}), 500

# Helper: extract JSON from LLM response (handles markdown wrapping)
import re

def extract_json(text):
    """Extract JSON from LLM response, handling markdown code blocks."""
    # Try direct parse first
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try extracting from markdown code block
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
    
    # Try finding JSON array or object pattern
    match = re.search(r'(\[[\s\S]*\]|\{[\s\S]*\})', text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    
    raise ValueError(f"Could not extract JSON from response: {text[:200]}")

# Generate interview questions using AI
@app.route('/api/generate-questions', methods=['POST'])
def generate_questions():
    try:
        data = request.get_json()
        role = data.get('role')
        level = data.get('level')
        count = data.get('count', 5)
        
        prompt = f"""You are an expert interviewer conducting a real interview for a {role} position.
Generate exactly {count} verbal interview questions that an interviewer would ASK OUT LOUD in a real interview.

Experience level: {level}
- If fresher/entry-level: Ask about fundamentals, learning ability, projects, and basic concepts
- If intermediate: Ask about practical experience, problem-solving, and real-world scenarios
- If senior: Ask about architecture decisions, leadership, mentoring, and complex system design

IMPORTANT RULES:
- Questions must be conversational and spoken naturally (not written/technical test style)
- Questions should be ones a candidate can ANSWER VERBALLY (not coding challenges)
- Include follow-up style questions like "Tell me about a time when..." or "How would you approach..."
- No questions requiring writing code, diagrams, or whiteboard work

You MUST respond with ONLY a valid JSON array. No extra text, no markdown.
Format: [{{"question": "your question here", "difficulty": "easy"}}]
Difficulty must be one of: "easy", "medium", "hard"
Generate exactly {count} questions."""
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a JSON generator. Respond with ONLY valid JSON arrays. No markdown, no explanation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        raw_content = response.choices[0].message.content
        print(f"Raw AI response: {raw_content[:300]}")
        questions = extract_json(raw_content)
        
        # Validate structure
        if not isinstance(questions, list):
            raise ValueError("Response is not a JSON array")
        
        return jsonify({"questions": questions})
    
    except Exception as e:
        print(f"Error generating questions: {e}")
        return jsonify({"error": str(e)}), 500

# Evaluate a single interview answer using AI
@app.route('/api/evaluate-answer', methods=['POST'])
def evaluate_answer():
    try:
        data = request.get_json()
        question = data.get('question')
        answer = data.get('answer')
        
        prompt = f"""You are a STRICT and FAIR interview evaluator. Evaluate this interview answer HONESTLY based on its actual quality.

Question: "{question}"
Candidate's Answer: "{answer}"

SCORING RUBRIC (follow this strictly):
- 1-2/10: Answer is completely irrelevant, nonsensical, gibberish, or shows zero understanding
- 3-4/10: Answer is vague, extremely short, lacks substance, has major factual errors, or barely addresses the question
- 5-6/10: Answer partially addresses the question but lacks depth, detail, or specific examples
- 7-8/10: Answer is good, relevant, shows clear understanding with some specific details or examples
- 9-10/10: Answer is excellent, comprehensive, well-structured with specific examples and deep insight

CRITICAL RULES:
- Do NOT give high scores to short or vague answers just because they mention the right topic
- An answer like "I work as a developer" with no elaboration should score 2-3, NOT 7-8
- Grammar issues, incomplete sentences, and unclear speech should LOWER the score
- Actually READ and UNDERSTAND the answer content before scoring
- Be STRICT. Most average answers should score 4-6, not 7-8

Respond with ONLY valid JSON, no markdown, no extra text.
JSON format:
{{"score": 5, "feedback": "detailed specific feedback explaining WHY this score was given", "strengths": ["strength1"], "improvements": ["improvement1"]}}"""
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a strict but fair interview evaluator that outputs ONLY valid JSON. You evaluate answers based on their ACTUAL quality and relevance, never inflating scores. A vague or one-line answer should NEVER score above 4/10."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        evaluation = extract_json(response.choices[0].message.content)
        return jsonify(evaluation)
    
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        return jsonify({"error": str(e)}), 500

# Evaluate entire interview - batch score all Q&A pairs
@app.route('/api/evaluate-interview', methods=['POST'])
def evaluate_interview():
    try:
        data = request.get_json()
        qa_pairs = data.get('qa_pairs', [])
        role = data.get('role', 'General')
        level = data.get('level', 'fresher')
        
        if not qa_pairs:
            return jsonify({"error": "No Q&A pairs provided"}), 400
        
        # Build Q&A text
        qa_text = ""
        for i, pair in enumerate(qa_pairs, 1):
            qa_text += f"\nQ{i}: {pair['question']}\nA{i}: {pair['answer']}\n"
        
        prompt = f"""You are a STRICT and FAIR expert interviewer evaluating a {role} candidate at {level} level.

Here are all the questions and answers from the interview:
{qa_text}

SCORING RUBRIC (follow this strictly for EACH answer):
- 1-2/10: Answer is completely irrelevant, nonsensical, gibberish, or shows zero understanding
- 3-4/10: Answer is vague, extremely short, lacks substance, has major factual errors, or barely addresses the question
- 5-6/10: Answer partially addresses the question but lacks depth, detail, or specific examples
- 7-8/10: Answer is good, relevant, shows clear understanding with some specific details or examples
- 9-10/10: Answer is excellent, comprehensive, well-structured with specific examples and deep insight

CRITICAL EVALUATION RULES:
- Do NOT inflate scores. Be HONEST and STRICT.
- A short, vague answer like "I am a developer" should score 2-3, NOT 7-8
- Grammar issues, incomplete sentences, and unclear speech should LOWER the score
- "No answer provided" MUST score 0-1
- Actually READ each answer carefully and evaluate its RELEVANCE, DEPTH, ACCURACY, and CLARITY
- Most average answers should score 4-6. Only truly impressive answers deserve 7+
- The overall_score should reflect the AVERAGE quality, not be generous

OVERALL RECOMMENDATION RULES:
- "Hire": Only if overall_score >= 8
- "Consider": Only if overall_score is 5-7
- "Needs Improvement": If overall_score < 5

Evaluate the entire interview. Respond with ONLY valid JSON, no markdown, no extra text.

JSON format:
{{
  "overall_score": 5,
  "overall_feedback": "Honest overall summary of the interview performance",
  "per_question": [
    {{
      "question_number": 1,
      "score": 4,
      "feedback": "Specific feedback explaining WHY this score was given"
    }}
  ],
  "strengths": ["strength1", "strength2"],
  "improvements": ["area to improve 1", "area to improve 2"],
  "recommendation": "Hire / Consider / Needs Improvement"
}}"""
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a strict but fair interview evaluator that outputs ONLY valid JSON. You evaluate answers based on their ACTUAL quality, relevance, depth, and accuracy. Never inflate scores. A vague or one-line answer should NEVER score above 4/10. Be honest."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        result = extract_json(response.choices[0].message.content)
        return jsonify(result)
    
    except Exception as e:
        print(f"Error evaluating interview: {e}")
        return jsonify({"error": str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=5000)
