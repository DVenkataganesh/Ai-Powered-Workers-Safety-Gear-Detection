from flask import Flask, request, jsonify, Response
import cv2
from ultralytics import YOLO
import threading
import pyttsx3
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Load YOLO Model
model = YOLO("backend/best (1).pt")  # Ensure this file exists

# Initialize global camera object
camera = None

def speak_alert(message):
    """ Speak alert in a separate thread """
    engine = pyttsx3.init()
    engine.say(message)
    engine.runAndWait()

def trigger_voice_alert(missing_items):
    """ Generate and play a voice alert """
    if not missing_items:
        return "All safety equipment detected."

    message = ", ".join(missing_items) + " missing! Please wear it."
    threading.Thread(target=speak_alert, args=(message,), daemon=True).start()
    return message

@app.route('/video_feed')
def video_feed():
    """ Stream video frames from camera """
    global camera
    if camera is None:
        return jsonify({"error": "Camera is off"}), 404

    def generate_frames():
        conf_threshold = 0.3
        while True:
            success, frame = camera.read()
            if not success:
                break
            results = model(frame, conf=conf_threshold)

            detected_objects = [model.names[int(box[-1])] for box in results[0].boxes.data.cpu().numpy()]
            required_items = ["Hardhat", "Mask", "Safety Vest"]
            missing_items = [item for item in required_items if f"NO-{item}" in detected_objects]

            if missing_items:
                trigger_voice_alert(missing_items)

            frame = results[0].plot()
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/toggle_camera', methods=['POST'])
def toggle_camera():
    """ Turn camera ON/OFF """
    global camera
    data = request.get_json(force=True)  # <-- Added force=True to ensure JSON data is read correctly

    action = data.get("action")
    if action == "on":
        if camera is None:
            camera = cv2.VideoCapture(0)
    elif action == "off":
        if camera is not None:
            camera.release()
            camera = None

    return jsonify({"message": f"Camera turned {action}"}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7755, debug=True)
