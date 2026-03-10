# backend/app.py - This is our main server file
# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json
from dotenv import load_dotenv
from openai import OpenAI
from rubric import get_rubric, get_recommendation

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

# ✅ CHANGE: Import pose analysis utility
# from utils.pose_analysis import BodyLanguageAnalyzer

# Load environment variables from .env file
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend to connect to backend

# ✅ CHANGE: Create BodyLanguageAnalyzer instance
analyzer = None # BodyLanguageAnalyzer()

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

# Get evaluation rubric
@app.route('/api/rubric', methods=['GET'])
def get_evaluation_rubric():
    return jsonify(get_rubric())

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
    text = text.strip()
    
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Remove markdown code blocks
    text = re.sub(r'```(?:json)?\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    
    # Try again after removing markdown
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Find JSON array or object
    match = re.search(r'(\[[\s\S]*\]|\{[\s\S]*\})', text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    
    raise ValueError(f"Could not extract JSON from: {text[:300]}")

# Generate interview questions using AI
@app.route('/api/generate-questions', methods=['POST'])
def generate_questions():
    try:
        data = request.get_json()
        role = data.get('role')
        level = data.get('level')
        interview_type = data.get('interviewType', 'Technical')
        count = data.get('count', 5)
        
        print(f"\n=== Generating {count} {interview_type} questions for {role} ({level}) ===")
        
        if interview_type == 'HR':
            prompt = f"""Generate {count} UNIQUE and DIFFERENT HR interview questions for a {role} position at {level} level.

IMPORTANT: These are VERBAL questions for a voice-based interview. Candidates will SPEAK their answers.

Requirements:
- Each question must be DISTINCT and VARIED from others
- Do NOT repeat similar questions
- Cover different aspects: leadership, teamwork, conflict, growth, communication, failures, achievements
- Make questions thought-provoking and diverse

Focus on:
- Behavioral questions ("Tell me about a time when...")
- Situational questions ("How would you handle...")
- Soft skills, teamwork, conflict resolution
- Career goals and motivation
- Company culture fit
- Communication and presentation skills

Return ONLY a JSON array:
[{{"question":"Tell me about yourself and your professional background","difficulty":"easy"}}]

Generate {count} UNIQUE HR questions now:"""
        else:
            prompt = f"""Generate {count} UNIQUE and DIFFERENT technical interview questions for a {role} position at {level} level.

IMPORTANT: These are VERBAL questions for a voice-based interview. Candidates will SPEAK their answers, NOT write code.
Questions should be about:
- Explaining concepts verbally
- Discussing architecture and design decisions
- Describing approaches and problem-solving methods
- Sharing past project experiences
- DO NOT ask for live coding or complex calculations

Requirements:
- Each question must be DISTINCT and VARIED from others
- Do NOT repeat similar questions or topics
- Cover different domains, technologies, and problem areas relevant to {role}
- Make questions diverse across different technical areas

Focus on:
- Technical concepts and fundamentals (explain the concept)
- System design and architecture
- Best practices and design patterns
- Real-world application experience
- Problem-solving approach and methodology

Return ONLY a JSON array:
[{{"question":"Explain how you would design a scalable database for an e-commerce application","difficulty":"medium"}}]

Generate {count} UNIQUE technical questions now:"""
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You generate JSON arrays of interview questions. Each call should generate DIVERSE and DIFFERENT questions. Never repeat similar topics. Return only valid JSON, no markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=1.0,
            max_tokens=2000
        )
        
        raw_content = response.choices[0].message.content.strip()
        print(f"Raw response: {raw_content[:500]}")
        
        questions = extract_json(raw_content)
        
        if not isinstance(questions, list) or len(questions) == 0:
            print(f"⚠️  Warning: Questions not a list or empty. Type: {type(questions)}, Content: {questions}")
            raise ValueError("Invalid response format")
        
        print(f"✓ Generated {len(questions)} questions")
        print(f"Sample question: {questions[0] if questions else 'N/A'}")
        return jsonify({"questions": questions})
    
    except Exception as e:
        print(f"✗ Error generating questions: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "type": type(e).__name__}), 500

# Generate combined technical and HR questions (for combined or panel mode)
@app.route('/api/generate-combined-questions', methods=['POST'])
def generate_combined_questions():
    try:
        data = request.get_json()
        role = data.get('role')
        level = data.get('level')
        technical_count = data.get('technicalCount', 3)
        hr_count = data.get('hrCount', 2)
        
        print(f"\n=== Generating {technical_count} technical + {hr_count} HR questions for {role} ({level}) ===")
        
        # Generate technical questions
        tech_prompt = f"""Generate {technical_count} technical interview questions for a {role} position at {level} level.

IMPORTANT: These are VERBAL questions for a voice-based interview. Candidates will SPEAK their answers, NOT write code.
Questions should be about:
- Explaining concepts verbally
- Discussing architecture and design decisions
- Describing approaches and problem-solving methods
- Sharing past project experiences
- DO NOT ask for live coding or complex calculations

Focus on:
- Technical concepts and fundamentals (explain the concept)
- System design and architecture
- Best practices and design patterns
- Real-world application experience
- Problem-solving approach and methodology

Return ONLY a JSON array with 'type': 'Technical':
[{{"question":"Explain how you would design a scalable database for an e-commerce application","difficulty":"medium","type":"Technical"}}]

Generate {technical_count} technical questions now:"""
        
        tech_response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You generate JSON arrays of interview questions. Each call should generate DIVERSE and DIFFERENT questions. Never repeat similar topics. Return only valid JSON, no markdown."},
                {"role": "user", "content": tech_prompt}
            ],
            temperature=1.0,
            max_tokens=2000
        )
        
        tech_questions = extract_json(tech_response.choices[0].message.content.strip())
        # Ensure type is set
        for q in tech_questions:
            q['type'] = 'Technical'
        
        # Generate HR questions
        hr_prompt = f"""Generate {hr_count} UNIQUE and DIFFERENT HR interview questions for a {role} position at {level} level.

IMPORTANT: These are VERBAL questions for a voice-based interview. Candidates will SPEAK their answers.

Requirements:
- Each question must be DISTINCT and VARIED from others
- Do NOT repeat similar questions
- Cover different aspects: leadership, teamwork, conflict, growth, communication, failures, achievements

Focus on:
- Behavioral questions ("Tell me about a time when...")
- Situational questions ("How would you handle...")
- Soft skills, teamwork, conflict resolution
- Career goals and motivation
- Company culture fit
- Communication and presentation skills

Return ONLY a JSON array with 'type': 'HR':
[{{"question":"Tell me about yourself and your professional background","difficulty":"easy","type":"HR"}}]

Generate {hr_count} UNIQUE HR questions now:"""
        
        hr_response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You generate JSON arrays of interview questions. Each call should generate DIVERSE and DIFFERENT questions. Never repeat similar topics. Return only valid JSON, no markdown."},
                {"role": "user", "content": hr_prompt}
            ],
            temperature=1.0,
            max_tokens=2000
        )
        
        hr_questions = extract_json(hr_response.choices[0].message.content.strip())
        # Ensure type is set
        for q in hr_questions:
            q['type'] = 'HR'
        
        # Combine questions
        all_questions = tech_questions + hr_questions
        
        if not isinstance(all_questions, list) or len(all_questions) == 0:
            raise ValueError("Invalid response format")
        
        print(f"✓ Generated {len(tech_questions)} technical + {len(hr_questions)} HR questions")
        return jsonify({
            "questions": all_questions,
            "technical_count": len(tech_questions),
            "hr_count": len(hr_questions),
            "total_count": len(all_questions)
        })
    
    except Exception as e:
        print(f"✗ Error generating combined questions: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Evaluate a single interview answer using AI
@app.route('/api/evaluate-answer', methods=['POST'])
def evaluate_answer():
    try:
        data = request.get_json()
        question = data.get('question')
        answer = data.get('answer')
        interview_type = data.get('interviewType', 'Technical')
        
        # Different guidance based on interview type
        if interview_type == 'HR':
            type_guidance = """
FOR HR INTERVIEWS: Look for:
- STAR method usage (Situation, Task, Action, Result)
- Evidence of self-awareness and reflection
- Clear learning from experiences
- Soft skills: communication, teamwork, conflict resolution, adaptability
- Alignment with company values
- Growth mindset and willingness to learn
"""
        else:
            type_guidance = """
FOR TECHNICAL INTERVIEWS: Look for:
- Correct technical understanding
- Specific implementation details and code logic
- Edge case handling and error management
- Complexity analysis (time/space trade-offs)
- Clear, logical explanation
- Code examples or algorithmic thinking
"""
        
        prompt = f"""You are a STRICT and FAIR interview evaluator. Evaluate this interview answer HONESTLY based on its actual quality.

Interview Type: {interview_type}
Question: "{question}"
Candidate's Answer: "{answer}"
{type_guidance}

SCORING RUBRIC (follow this EXACTLY):
- 0-1/10: "I don't know", "Not sure", "No answer", silence, or completely irrelevant gibberish
- 2-3/10: Vague, shows minimal effort, barely addresses question, completely wrong direction
- 4-5/10: Partially addresses question but lacks depth, mostly shallow or incomplete
- 6-7/10: Good answer, mostly correct, some specific details or examples
- 8-9/10: Excellent answer, comprehensive, well-structured, good examples, deep understanding
- 10/10: Perfect answer, exceptional insight, best possible response

CRITICAL RULES:
- "I don't know" or admission of lack of knowledge = 1/10 ALWAYS (NEVER 4, 5, or 6)
- Do NOT curve scores upward - score based on ACTUAL merit only
- Incomplete sentences, stuttering, pauses = LOWER the score by 1 point
- Be BRUTALLY HONEST. If answer is weak, give weak score
- If answer shows zero understanding → score should be 1-3/10 maximum

Respond with ONLY valid JSON, no markdown, no extra text.
JSON format:
{{"score": 5, "feedback": "Why exactly does this answer deserve this score?", "strengths": ["what worked"], "improvements": ["what's missing"]}}"""
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a BRUTALLY STRICT interview evaluator. Your ONLY job is honest evaluation based on actual merit. NEVER inflate scores. 'I don't know' is 1/10, not 5/10. Vague one-liners are 2-3/10. Only give 7+ scores for genuinely good answers with specific details or examples."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        
        evaluation = extract_json(response.choices[0].message.content)
        
        # Add rubric reference and score description
        from rubric import get_score_description
        evaluation['score_range_description'] = get_score_description(evaluation.get('score', 5))
        
        return jsonify(evaluation)
    
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        return jsonify({"error": str(e)}), 500

# Evaluate entire interview - batch score all Q&A pairs
@app.route('/api/evaluate-interview', methods=['OPTIONS', 'POST'])
def evaluate_interview():
    # Handle OPTIONS preflight requests for CORS
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        
        # Enhanced error logging
        print(f"\n=== Evaluate Interview Request ===")
        print(f"Received data keys: {data.keys() if data else 'None'}")
        
        if not data:
            print("Error: No JSON data received")
            return jsonify({"error": "No JSON data received", "debug": "request.get_json() returned None"}), 400
        
        qa_pairs = data.get('qa_pairs', [])
        role = data.get('role', 'General')
        level = data.get('level', 'fresher')
        interview_type = data.get('interviewType', 'Technical')
        
        print(f"Extracted - QA Pairs: {len(qa_pairs)}, Role: {role}, Level: {level}, Type: {interview_type}")
        print(f"QA Pairs sample: {str(qa_pairs[:1]) if qa_pairs else 'EMPTY'}")
        
        if not qa_pairs or len(qa_pairs) == 0:
            print("⚠️  WARNING: No Q&A pairs provided")
            print(f"  qa_pairs value: {qa_pairs}")
            print(f"  qa_pairs type: {type(qa_pairs)}")
            print(f"  qa_pairs length: {len(qa_pairs) if isinstance(qa_pairs, (list, dict)) else 'N/A'}")
            print(f"  Attempting to return generic evaluation...")
            
            # Return a generic response instead of failing
            return jsonify({
                "overall_score": 0,
                "overall_feedback": "No answers were recorded for evaluation",
                "per_question": [],
                "strengths": ["Attempted to complete interview"],
                "improvements": ["Answer more questions to get accurate feedback"],
                "recommendation": "Needs Improvement"
            }), 200
        
        # Validate qa_pairs structure
        for i, pair in enumerate(qa_pairs):
            if not isinstance(pair, dict) or 'question' not in pair or 'answer' not in pair:
                print(f"Error: Invalid Q&A pair at index {i}: {pair}")
                return jsonify({"error": f"Invalid Q&A pair at index {i}. Expected dict with 'question' and 'answer' keys", "pair_received": str(pair)}), 400
        
        # Different evaluation focus based on interview type
        if interview_type == 'HR':
            type_focus = """
EVALUATION FOCUS FOR HR INTERVIEW:
- Look for STAR method (Situation, Task, Action, Result) in responses
- Assess soft skills: communication, teamwork, conflict resolution, adaptability
- Evaluate emotional intelligence and self-awareness
- Check for growth mindset and learning from experiences
- Assess cultural fit and values alignment
- Look for evidence of handling challenges and learning from them
"""
        else:
            type_focus = """
EVALUATION FOCUS FOR TECHNICAL INTERVIEW:
- Assess correctness of technical concepts
- Evaluate depth of understanding and implementation details
- Look for edge case handling and error management
- Assess algorithmic thinking and complexity analysis
- Evaluate code quality and best practices
- Look for problem-solving approach and reasoning
"""
        
        # Build Q&A text
        qa_text = ""
        for i, pair in enumerate(qa_pairs, 1):
            qa_text += f"\nQ{i}: {pair['question']}\nA{i}: {pair['answer']}\n"
        
        prompt = f"""You are a STRICT and FAIR expert interviewer evaluating a {role} candidate at {level} level for a {interview_type} interview.

Here are all the questions and answers from the interview:
{qa_text}

{type_focus}

SCORING RUBRIC (apply this rubric STRICTLY to EACH answer):
- 0-1/10: "I don't know", "Not sure", no answer, or completely irrelevant
- 2-3/10: Vague, shows minimal effort, barely addresses question, mostly wrong
- 4-5/10: Partially addresses question but lacks depth, mostly shallow
- 6-7/10: Good answer, mostly correct, some specific details/examples
- 8-9/10: Excellent answer, comprehensive, well-structured, great examples
- 10/10: Perfect answer, exceptional insight, best possible response

CRITICAL RULES FOR STRICT EVALUATION:
- "I don't know" answers = 1/10 ALWAYS (NEVER higher due to curve)
- Vague placeholders = 2-3/10 maximum (NEVER 5-6 just for mentioning topic)
- Grammar/speech issues = LOWER score by 1 point each
- Incomplete sentences = penalty of 1-2 points
- Only give 7+ scores for genuinely impressive answers with specific details
- overall_score = AVERAGE of all individual scores (DO NOT inflate or curve)
- After calculating average, round to nearest integer and DO NOT adjust upward

RECOMMENDATION RULES (strict):
- "Hire": ONLY if overall_score >= 8
- "Consider": ONLY if 5 <= overall_score < 8
- "Needs Improvement": If overall_score < 5

EXAMPLE SCORING:
- 5 answers averaging 4, 3, 2, 5, 1 → overall = 3 → "Needs Improvement" (CORRECT)
- Do NOT inflate "3" to "5" just because one answer was decent

Evaluate the entire interview. Respond with ONLY valid JSON, no markdown.
JSON format:
{{
  "overall_score": 5,
  "overall_feedback": "Summary of performance based on actual quality of answers",
  "per_question": [
    {{
      "question_number": 1,
      "score": 4,
      "feedback": "Why this score based on actual answer quality"
    }}
  ],
  "strengths": ["actual strength1"],
  "improvements": ["actual gap1"],
  "recommendation": "Hire / Consider / Needs Improvement"
}}"""
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a BRUTALLY STRICT interview evaluator. Score based on ACTUAL merit only. 'I don't know' = 1/10 ALWAYS. Average all scores fairly - NO inflation or curving. Output ONLY valid JSON. Be honest above all else."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        
        result = extract_json(response.choices[0].message.content)
        
        # Validate result structure
        if not result or not isinstance(result, dict):
            print(f"Error: Invalid JSON response from AI: {response.choices[0].message.content[:200]}")
            return jsonify({"error": "Failed to parse AI evaluation response"}), 500
        
        # Add rubric reference to the result
        result['rubric'] = get_rubric()
        result['interview_type'] = interview_type
        
        print(f"✓ Interview evaluated successfully")
        return jsonify(result)
    
    except Exception as e:
        print(f"✗ Error evaluating interview: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "type": type(e).__name__}), 500

# Run the app
if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 AI Interview Assistant Backend Starting...")
    print(f"📡 API: {os.getenv('OPENAI_BASE_URL', 'OpenAI')}")
    print(f"🤖 Model: {MODEL_NAME}")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)
