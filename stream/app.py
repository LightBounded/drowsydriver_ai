import base64
from typing import Dict, Any

import cv2
import imutils
import numpy as np
from flask import Flask, request, jsonify, Response

from drowsydriver_detector.detector import initialize_detector_and_predictor, is_yawning

frame_width = 1024
frame_height = 576

# Define the types for Flask app and request
app: Flask = Flask(__name__)
detector: Any | None
predictor: Any | None


@app.route('/is_drowsy', methods=['POST'])
def base64_to_opencv() -> tuple[Response, int]:
    try:
        # Get the JSON data from the POST request
        data: Dict[str, Any] = request.get_json()

        # Check if the 'base64_image' key is present in the JSON data
        if 'base64_image' not in data:
            return jsonify({'error': 'Missing base64_image key in JSON data'}), 400

        # Decode the base64 encoded image to bytes
        base64_image: str = data['base64_image']
        image_bytes: bytes = base64.b64decode(base64_image)

        # Convert the bytes to a NumPy array
        image_np_array: np.ndarray = np.frombuffer(image_bytes, dtype=np.uint8)

        # Decode the NumPy array into an OpenCV image
        opencv_image: np.ndarray = cv2.imdecode(image_np_array, flags=cv2.IMREAD_COLOR)

        # Perform yawning detection on the image
        is_yawning: bool = detect_yawning(opencv_image)

        if is_yawning:
            return jsonify({'is_yawning': 'true'}), 200
        else:
            return jsonify({'is_yawning': 'false'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def preprocess_image_for_yawning_detection(image: np.ndarray):
    frame = imutils.resize(image, width=frame_width, height=frame_height)
    gray: np.ndarray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    return gray


def detect_yawning(image: np.ndarray) -> bool:
    # Preprocess the image as needed (resize, normalize, etc.)
    processed_image: np.ndarray = preprocess_image_for_yawning_detection(image)

    # Run the yawning detection model
    prediction: bool = is_yawning(detector, predictor, processed_image, 0.88)

    # You can adjust this threshold based on your model's output
    threshold: float = 0.5

    # Check if the prediction indicates yawning
    if prediction > threshold:
        return True
    else:
        return False


if __name__ == '__main__':
    app.run(debug=True)

    detector, predictor = initialize_detector_and_predictor()
