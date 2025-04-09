from flask import Flask, request, jsonify, Response
import cv2
from ultralytics import YOLO
import threading
import pyttsx3
import numpy as np
import os
import queue
from flask_cors import CORS
from datetime import datetime
import pymysql

app = Flask(__name__)
CORS(app)

# MySQL Database Connection
db = pymysql.connect(
    host="localhost",
    user="root",
    password="1682",
    database="projectyolo"
)
cursor = db.cursor()

# Load YOLO Model
model = YOLO("best (1).pt")  # Ensure the model file exists

# Global Variables
camera = None  
camera_status = {"machine": False, "gate": False}  
camera_lock = threading.Lock()  
alert_queue = queue.Queue()  
last_alert = None  

# Directory for saving captured images
violation_dir = "violations"
os.makedirs(violation_dir, exist_ok=True)

def speak_alert(message):
    """ Speak alert using pyttsx3 """
    try:
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')
        engine.setProperty('voice', voices[1].id)  
        engine.setProperty('rate', 150)  
        engine.setProperty('volume', 1.0)  
        engine.say(message)
        engine.runAndWait()
        engine.stop()
    except Exception as e:
        print(f"Error in speak_alert: {e}")

def process_alerts():
    """ Continuously process alerts """
    while True:
        message = alert_queue.get()
        speak_alert(message)
        alert_queue.task_done()

# Start alert processing thread
threading.Thread(target=process_alerts, daemon=True).start()

def trigger_voice_alert(missing_items):
    """ Add alerts to queue only if missing items change """
    global last_alert

    if not missing_items:
        return  

    message = "Warning! " + " and ".join(missing_items) + " are missing. Please wear them immediately!"

    if message == last_alert:
        return  

    last_alert = message  
    alert_queue.put(message)  

# Store the last detected violation per camera
last_violation_time = {"machine": None, "gate": None}
cooldown_seconds = 5  # Prevent duplicate logging for 5 seconds

def capture_violation(frame, camera_type, detected_items, missing_items):
    """ Capture and log safety violations in MySQL with cooldown to prevent duplicate logs """
    global last_violation_time

    timestamp = datetime.now()

    # Prevent duplicate logging if last violation was within cooldown period
    if last_violation_time[camera_type] and (timestamp - last_violation_time[camera_type]).total_seconds() < cooldown_seconds:
        return  

    last_violation_time[camera_type] = timestamp  # Update last recorded violation time

    # Save violation image
    filename = f"{camera_type}_violation_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg"
    filepath = os.path.join(violation_dir, filename)
    cv2.imwrite(filepath, frame)
    print(f"Violation Captured: {filepath}")

    # Insert into MySQL database
    try:
        query = """
        INSERT INTO safety_violations (camera_location, detected_gear, missing_gear, timestamp)
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (camera_type, ", ".join(detected_items), ", ".join(missing_items), timestamp))
        db.commit()
        print("Violation logged in database.")
    except pymysql.MySQLError as err:
        print(f"Error logging violation: {err}")


@app.route('/video_feed/<camera_type>')
def video_feed(camera_type):
    """ Stream video frames from the camera for the selected section """
    global camera, camera_status

    if camera is None or not camera_status[camera_type]:
        return jsonify({"error": f"Camera for {camera_type} is off"}), 404

    def generate_frames():
        conf_threshold = 0.3
        while camera and camera.isOpened():
            success, frame = camera.read()
            if not success:
                break

            results = model(frame, conf=conf_threshold)

            detected_objects = [model.names[int(box[-1])] for box in results[0].boxes.data.cpu().numpy()]
            required_items = ["Hardhat", "Mask", "Safety Vest"]
            missing_items = [item for item in required_items if f"NO-{item}" in detected_objects]

            if missing_items:
                trigger_voice_alert(missing_items)
                capture_violation(frame, camera_type, detected_objects, missing_items)  # Log in DB

            frame = results[0].plot()
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/toggle_camera', methods=['POST'])
def toggle_camera():
    """ Turn ON/OFF the camera for the selected section """
    global camera, camera_status, last_alert

    data = request.get_json()
    camera_type = data.get("camera_type")
    action = data.get("action")

    if camera_type not in camera_status:
        return jsonify({"error": "Invalid camera type"}), 400

    with camera_lock:
        if action == "on":
            if not any(camera_status.values()):  
                camera = cv2.VideoCapture(0)  # Removed cv2.CAP_DSHOW for better compatibility
                if not camera.isOpened():
                    return jsonify({"error": f"Failed to open {camera_type} camera"}), 500
                camera_status[camera_type] = True
                return jsonify({"message": f"{camera_type} camera turned on"}), 200
            else:
                return jsonify({"error": "Camera is already in use by another section"}), 409

        elif action == "off":
            if camera_status[camera_type]:
                if camera and camera.isOpened():
                    camera.release()
                camera = None
                camera_status[camera_type] = False
                last_alert = None  
                while not alert_queue.empty():  
                    alert_queue.get()
                    alert_queue.task_done()
                return jsonify({"message": f"{camera_type} camera turned off"}), 200
            else:
                return jsonify({"message": f"{camera_type} camera is already off"}), 200

    return jsonify({"error": "Invalid action"}), 400

@app.route('/get-violations', methods=['GET'])
def get_violations():
    """ Fetch all safety violations from MySQL """
    try:
        cursor.execute("SELECT * FROM safety_violations ORDER BY timestamp DESC")
        violations = cursor.fetchall()

        results = []
        for row in violations:
            results.append({
                "id": row[0],
                "camera_location": row[1],
                "detected_gear": row[2],
                "missing_gear": row[3],
                "timestamp": row[4].strftime("%Y-%m-%d %H:%M:%S")
            })

        return jsonify(results)
    except pymysql.MySQLError as err:
        return jsonify({"error": f"Database error: {err}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7755, debug=True)
