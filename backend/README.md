# 🔧 Backend - AI Interview Assistant

Flask-based backend server with AI-powered body language analysis and interview feedback.

## 🛠️ Tech Stack

- **Flask**: Web framework
- **MediaPipe**: Pose detection and body language analysis
- **OpenCV**: Image processing
- **OpenAI API**: AI-powered feedback (optional)
- **Python 3.11**: Runtime environment

## 📦 Installation

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 🔑 Environment Setup

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

## 🚀 Running the Server

```bash
python app.py
```

The server will start at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── utils/
│   └── pose_analysis.py    # Body language analyzer
├── app.py                  # Main Flask application
├── procfile                # Heroku deployment config
├── runtime.txt             # Python version specification
└── .env                    # Environment variables (create this)
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "message": "Backend is working perfectly!"
}
```

### Analyze Pose
```
POST /api/analyze-pose
```

Request Body:
```json
{
  "image": "base64_encoded_image_data"
}
```

Response:
```json
{
  "confidence_score": 85,
  "posture": "good",
  "feedback": "Maintain eye contact and keep shoulders relaxed"
}
```

## 🧪 Testing

Test the server is running:

```bash
curl http://localhost:5000/api/health
```

## 📝 Dependencies

Core dependencies:
- `flask` - Web framework
- `flask-cors` - CORS support
- `python-dotenv` - Environment variable management
- `mediapipe` - Pose detection
- `opencv-python` - Image processing
- `numpy` - Numerical operations

## 🚀 Deployment

### Heroku

1. Create `Procfile`:
```
web: gunicorn app:app
```

2. Create `runtime.txt`:
```
python-3.11.0
```

3. Deploy:
```bash
git push heroku main
```

## 🔒 Security Notes

- Never commit `.env` file to version control
- Keep API keys secure
- Use environment variables for sensitive data
- Enable CORS only for trusted origins in production

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Module Not Found
```bash
pip install -r requirements.txt
```

## 📚 Learn More

- [Flask Documentation](https://flask.palletsprojects.com/)
- [MediaPipe Documentation](https://google.github.io/mediapipe/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
