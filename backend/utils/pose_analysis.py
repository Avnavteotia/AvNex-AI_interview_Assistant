# backend/utils/pose_analysis.py - Body language analysis
import cv2
import mediapipe as mp
import numpy as np
import base64
import io
from PIL import Image

class BodyLanguageAnalyzer:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils

    def analyze_confidence(self, image_data):
        """
        Analyze body language and return confidence score
        image_data: base64 encoded image string
        """
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[41])
            image = Image.open(io.BytesIO(image_bytes))
            image_np = np.array(image)
            
            # Convert RGB to BGR for OpenCV
            image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
            image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
            
            # Process the image
            results = self.pose.process(image_rgb)
            
            confidence_score = 5  # Base score
            feedback = []
            
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                
                # Analyze posture
                confidence_score += self._analyze_posture(landmarks, feedback)
                
                # Analyze head position (simulated eye contact)
                confidence_score += self._analyze_head_position(landmarks, feedback)
                
                # Analyze body openness
                confidence_score += self._analyze_body_openness(landmarks, feedback)
            else:
                feedback.append("Unable to detect pose. Please ensure you're visible in the camera.")
                confidence_score = 3
            
            return {
                "confidence_score": max(1, min(10, confidence_score)),
                "feedback": feedback,
                "has_pose": results.pose_landmarks is not None
            }
            
        except Exception as e:
            print(f"Error in pose analysis: {e}")
            return {
                "confidence_score": 5,
                "feedback": ["Analysis temporarily unavailable"],
                "has_pose": False
            }
    
    def _analyze_posture(self, landmarks, feedback):
        """Analyze shoulder alignment and posture"""
        try:
            left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
            
            # Check if shoulders are level
            shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
            
            if shoulder_diff < 0.05:
                feedback.append("✅ Good posture - shoulders are level")
                return 2
            elif shoulder_diff < 0.1:
                feedback.append("⚠️ Slightly uneven shoulders - try to sit straighter")
                return 1
            else:
                feedback.append("❌ Poor posture - significant shoulder tilt detected")
                return 0
        except:
            return 0
    
    def _analyze_head_position(self, landmarks, feedback):
        """Analyze head position for eye contact simulation"""
        try:
            nose = landmarks[self.mp_pose.PoseLandmark.NOSE.value]
            left_eye = landmarks[self.mp_pose.PoseLandmark.LEFT_EYE.value]
            right_eye = landmarks[self.mp_pose.PoseLandmark.RIGHT_EYE.value]
            
            # Calculate head center
            head_center_x = (left_eye.x + right_eye.x) / 2
            
            # Check if head is centered (simulating eye contact)
            head_deviation = abs(nose.x - head_center_x)
            
            if head_deviation < 0.03:
                feedback.append("✅ Great eye contact - head positioned well")
                return 2
            elif head_deviation < 0.06:
                feedback.append("⚠️ Look more directly at the camera")
                return 1
            else:
                feedback.append("❌ Poor eye contact - head turned away")
                return 0
        except:
            return 0
    
    def _analyze_body_openness(self, landmarks, feedback):
        """Analyze body openness and confidence indicators"""
        try:
            left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
            
            # Calculate shoulder width (indicates openness)
            shoulder_width = abs(left_shoulder.x - right_shoulder.x)
            
            if shoulder_width > 0.25:
                feedback.append("✅ Open body language - confident posture")
                return 1
            elif shoulder_width > 0.2:
                feedback.append("⚠️ Moderately open posture")
                return 0
            else:
                feedback.append("❌ Closed body language - try to open up your posture")
                return -1
        except:
            return 0
