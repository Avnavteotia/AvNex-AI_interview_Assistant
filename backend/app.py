# backend/app.py - This is our main server file
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# ✅ CHANGE: Import pose analysis utility
from utils.pose_analysis import BodyLanguageAnalyzer

# Load environment variables from .env file
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend to connect to backend

# ✅ CHANGE: Create BodyLanguageAnalyzer instance
analyzer = BodyLanguageAnalyzer()

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

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=5000)
