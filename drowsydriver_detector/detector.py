#!/usr/bin/env python
import math
from typing import Any, Tuple

import cv2
import dlib
import imutils
import numpy as np
from imutils import face_utils
from imutils.video import VideoStream
from scipy.spatial import distance as dist

frame_width = 1024
frame_height = 576


def initialize_detector_and_predictor() -> Tuple[Any, Any]:
    """
    Load the facial landmark predictor and return the detector and predictor objects.

    :return: A tuple containing the detector and predictor objects.
    """
    print("loading facial landmark predictor...")
    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor(
        './dlib_shape_predictor/shape_predictor_68_face_landmarks.dat')
    return detector, predictor


def initialize_video_stream():
    """
    Initializes the video stream from the camera.

    :return: The initialized video stream.
    :rtype: VideoStream
    """
    print("initializing camera...")
    return VideoStream(src=0).start()


def loop_video_stream(video_stream,
                      detector,
                      predictor,
                      ear_threshold,
                      consecutive_frames,
                      mar_threshold,
                      m_start,
                      m_end,
                      r_start, r_end,
                      l_start, l_end):
    """

    Loop through a video stream, detect faces, and compute aspect ratios of eyes and mouth.

    :param video_stream: Video stream to loop through.
    :param detector: Face detector object.
    :param predictor: Facial landmarks predictor object.
    :param ear_threshold: Threshold for eye aspect ratio.
    :param consecutive_frames: Number of consecutive frames for which the eye aspect ratio must be below the threshold to trigger an alert.
    :param mar_threshold: Threshold for mouth aspect ratio.
    :param m_start: Index of the start point for measuring mouth aspect ratio.
    :param m_end: Index of the end point for measuring mouth aspect ratio.
    :param r_start: Index of the start point for measuring right eye aspect ratio.
    :param r_end: Index of the end point for measuring right eye aspect ratio.
    :param l_start: Index of the start point for measuring left eye aspect ratio.
    :param l_end: Index of the end point for measuring left eye aspect ratio.
    :return: None

    """
    counter = 0
    image_points = get_image_points()
    frame_rate = 10
    while True:
        frame, gray = capture_frame(video_stream)
        frame, rects, num_faces = detect_faces_and_draw_on_frame(frame, gray, detector)

        if frame_rate == 0:
            frame, counter = compute_aspect_ratio(rects, frame, gray, predictor, ear_threshold, mar_threshold,
                                                  consecutive_frames,
                                                  counter, m_start,
                                                  m_end, image_points, r_start, r_end,
                                                  l_start, l_end)
            frame_rate = 10
        frame_rate -= 1
        cv2.imshow("Frame", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    cv2.destroyAllWindows()
    video_stream.stop()


def get_image_points():
    """
    Get the coordinates of facial landmark points in an image.

    :return: An Numpy array of shape (6, 2) containing the coordinates of the
             following facial landmark points:
             - Nose tip
             - Chin
             - Left eye left corner
             - Right eye right corner
             - Left mouth corner
             - Right mouth corner
    """
    return np.array([
        (359, 391),  # Nose tip 34
        (399, 561),  # Chin 9
        (337, 297),  # Left eye left corner 37
        (513, 301),  # Right eye right corne 46
        (345, 465),  # Left Mouth corner 49
        (453, 469)  # Right mouth corner 55
    ], dtype="double")


def capture_frame(video_stream):
    """
    Capture Frame

    Capture a frame from a video stream and convert it to grayscale.

    :param video_stream: The video stream from which to capture the frame.
    :return: A tuple containing the original frame and its grayscale version.
    """
    frame = imutils.resize(video_stream.read(), width=frame_width, height=frame_height)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return frame, gray


def detect_faces_and_draw_on_frame(frame, gray, detector) -> Tuple[Any, Any, int]:
    """
    Detect faces in a frame and draw bounding boxes around them.

    :param frame: The input frame in BGR format.
    :param gray: The grayscale version of the input frame.
    :param detector: The face detector object used to detect faces in the frame.
    :return: A tuple containing the modified frame with bounding boxes drawn around the faces,
             the list of rectangles representing the locations of the faces in the frame,
             and the number of faces detected.
    """
    rects = detector(gray, 0)
    num_faces = len(rects)
    if num_faces > 0:
        text = "{} face(s) found".format(num_faces)
        cv2.putText(frame, text, (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        # compute the bounding box of the face and draw it on the
        # frame

        for rect in rects:
            (bX, bY, bW, bH) = face_utils.rect_to_bb(rect)
            cv2.rectangle(frame, (bX, bY), (bX + bW, bY + bH), (0, 255, 0), 1)

    return frame, rects, num_faces


def compute_aspect_ratio(rects,
                         frame,
                         gray,
                         predictor,
                         ear_threshold,
                         mar_threshold,
                         consecutive_frames,
                         counter,
                         m_start,
                         m_end,
                         image_points,
                         rStart, rEnd,
                         lStart, lEnd) -> Tuple[Any, int]:
    """
    :param rects: List of rectangles representing the face detections
    :param frame: The input frame/image
    :param gray: Grayscale version of the input frame/image
    :param predictor: The dlib shape predictor
    :param ear_threshold: Threshold for the eye aspect ratio
    :param mar_threshold: Threshold for the mouth aspect ratio
    :param consecutive_frames: Number of consecutive frames for eye closure to trigger warning
    :param counter: Counter for the number of frames with eyes closed
    :param m_start: Start index of the mouth landmarks
    :param m_end: End index of the mouth landmarks
    :param image_points: List of image points for key facial landmarks
    :param rStart: Start index of the right eye landmarks
    :param rEnd: End index of the right eye landmarks
    :param lStart: Start index of the left eye landmarks
    :param lEnd: End index of the left eye landmarks
    :return: Tuple containing the processed frame and the updated counter

    """
    # loop over the face detections
    print(f'len(rects)={len(rects)}')
    for rect in rects:
        # determine the facial landmarks for the face region, then
        # convert the facial landmark (x, y)-coordinates to a NumPy
        # array
        shape = predictor(gray, rect)
        shape = face_utils.shape_to_np(shape)

        # extract the left and right eye coordinates, then use the
        # coordinates to compute the eye aspect ratio for both eyes
        left_eye = shape[lStart:lEnd]
        right_eye = shape[rStart:rEnd]
        left_ear = eye_aspect_ratio(left_eye)
        right_ear = eye_aspect_ratio(right_eye)
        # average the eye aspect ratio together for both eyes
        ear = (left_ear + right_ear) / 2.0

        cv2.putText(frame, "EAR: {:.2f}".format(ear), (650, 45),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # compute the convex hull for the left and right eye, then
        # visualize each of the eyes
        left_eye_hull = cv2.convexHull(left_eye)
        right_eye_hull = cv2.convexHull(right_eye)
        cv2.drawContours(frame, [left_eye_hull], -1, (0, 255, 0), 1)
        cv2.drawContours(frame, [right_eye_hull], -1, (0, 255, 0), 1)

        # check to see if the eye aspect ratio is below the blink
        # threshold, and if so, increment the blink frame counter
        if ear < ear_threshold:
            counter += 1
            # if the eyes were closed for a sufficient number of times
            # then show the warning
            if counter >= consecutive_frames:
                cv2.putText(frame, "Eyes Closed!", (500, 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            # otherwise, the eye aspect ratio is not below the blink
            # threshold, so reset the counter and alarm
        else:
            counter = 0

        mouth = shape[m_start:m_end]
        mar = mouth_aspect_ratio(mouth)
        # compute the convex hull for the mouth, then
        # visualize the mouth
        mouth_hull = cv2.convexHull(mouth)

        cv2.drawContours(frame, [mouth_hull], -1, (0, 255, 0), 1)
        cv2.putText(frame, "MAR: {:.2f}".format(mar), (650, 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Draw text if mouth is open
        if mar > mar_threshold:
            cv2.putText(frame, "Yawning!", (800, 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # loop over the (x, y)-coordinates for the facial landmarks
        # and draw each of them
        for (i, (x, y)) in enumerate(shape):
            if i == 33:
                image_points[0] = np.array([x, y], dtype='double')
                # write on frame in Green
                draw_circle(frame, i, x, y)
            elif i == 8:
                image_points[1] = np.array([x, y], dtype='double')
                # write on frame in Green
                draw_circle(frame, i, x, y)
            elif i == 36:
                image_points[2] = np.array([x, y], dtype='double')
                # write on frame in Green
                draw_circle(frame, i, x, y)
            elif i == 45:
                image_points[3] = np.array([x, y], dtype='double')
                # write on frame in Green
                draw_circle(frame, i, x, y)
            elif i == 48:
                image_points[4] = np.array([x, y], dtype='double')
                # write on frame in Green
                draw_circle(frame, i, x, y)
            elif i == 54:
                image_points[5] = np.array([x, y], dtype='double')
                # write on frame in Green
                draw_circle(frame, i, x, y)
            else:
                # everything to all other landmarks
                # write on frame in Red
                cv2.circle(frame, (x, y), 1, (0, 0, 255), -1)
                cv2.putText(frame, str(i + 1), (x - 10, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)

        # Draw the determinant image points onto the person's face
        for p in image_points:
            cv2.circle(frame, (int(p[0]), int(p[1])), 3, (0, 0, 255), -1)

        (head_tilt_degree, start_point, end_point,
         end_point_alt) = get_head_tilt_and_coords(gray.shape, image_points, frame_height)

        cv2.line(frame, start_point, end_point, (255, 0, 0), 2)
        cv2.line(frame, start_point, end_point_alt, (0, 0, 255), 2)

        if head_tilt_degree:
            cv2.putText(frame, 'Head Tilt Degree: ' + str(round(head_tilt_degree)), (170, 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
    return frame, counter


def draw_circle(frame, i, x, y):
    cv2.circle(frame, (x, y), 1, (0, 255, 0), -1)
    cv2.putText(frame, str(i + 1), (x - 10, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 0), 1)


def eye_aspect_ratio(eye):
    """

    eye_aspect_ratio(eye: Tuple[Tuple[int, int]], Any) -> float

    Calculate the eye aspect ratio (EAR) given the coordinates of the eye landmarks.

    Parameters:
        - eye: Tuple of tuples representing the (x, y) coordinates of the eye landmarks. The landmarks should be ordered clockwise or counter-clockwise starting from the top-left point.

    Returns:
        - ear: The eye aspect ratio, calculated as the average of the distances between the vertical eye landmarks divided by the distance between the horizontal eye landmark.

    """
    # compute the euclidean distances between the two sets of
    # vertical eye landmarks (x, y)-coordinates
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    # compute the euclidean distance between the horizontal
    # eye landmark (x, y)-coordinates
    C = dist.euclidean(eye[0], eye[3])
    # compute the eye aspect ratio
    ear = (A + B) / (2.0 * C)
    # return the eye aspect ratio
    return ear


MODEL_POINTS = np.array([
    (0.0, 0.0, 0.0),
    (0.0, -330.0, -65.0),
    (-225.0, 170.0, -135.0),
    (225.0, 170.0, -135.0),
    (-150.0, -150.0, -125.0),
    (150.0, -150.0, -125.0)
])

np.set_printoptions(precision=2, suppress=True)


def is_rotation_matrix(matrix: np.ndarray) -> bool:
    """
    Check if the given matrix is a rotation matrix.

    :param matrix: Matrix to be checked
    :return: True if the matrix is a rotation matrix, False otherwise

    """
    matrix_t = np.transpose(matrix)
    identity_should_be = np.dot(matrix_t, matrix)
    identity_matrix = np.identity(3, dtype=matrix.dtype)

    return np.linalg.norm(identity_matrix - identity_should_be) < 1e-6


def calculate_euler_angles(matrix: np.ndarray) -> np.ndarray:
    """
    :param matrix: A 3x3 numpy array representing a rotation matrix.
    :return: A 3-element numpy array representing the Euler angles corresponding to the rotation matrix.

    This method calculates the Euler angles (in radians) corresponding to a given rotation matrix. The rotation matrix must be a valid rotation matrix, meaning it must have orthonormal rows and columns.

    The method first checks if the given rotation matrix is valid by calling the is_rotation_matrix function. If the matrix is not valid, an AssertionError is raised.

    Then, the method calculates the Euler angles using the formulae depending on whether the matrix is singular or not. If the matrix is not singular, the x, y, and z angles are calculated using the atan2 function. If the matrix is singular, the x angle is calculated differently.

    Finally, the calculated Euler angles are returned as a numpy array.

    Example usage:

        rotation_matrix = np.array([[0.866, -0.5, 0],
                                    [0.5, 0.866, 0],
                                    [0, 0, 1]])
        euler_angles = calculate_euler_angles(rotation_matrix)
        print(euler_angles)
        # Output: [0.0, 0.0, 1.5707963267948966]
    """
    assert (is_rotation_matrix(matrix))
    sy = math.sqrt(matrix[0, 0] * matrix[0, 0] + matrix[1, 0] * matrix[1, 0])
    singular = sy < 1e-6

    if not singular:
        x_angle = math.atan2(matrix[2, 1], matrix[2, 2])
        y_angle = math.atan2(-matrix[2, 0], sy)
        z_angle = math.atan2(matrix[1, 0], matrix[0, 0])
    else:
        x_angle = math.atan2(-matrix[1, 2], matrix[1, 1])
        y_angle = math.atan2(-matrix[2, 0], sy)
        z_angle = 0

    return np.array([x_angle, y_angle, z_angle])


def get_head_tilt_and_coords(size: Tuple[int],
                             image_points: np.ndarray,
                             frame_height: int) -> tuple[
    float,
    tuple[int, ...],
    tuple[int, ...],
    tuple[int, int]]:
    """
    :param size: A tuple representing the size of the frame (width, height).
    :param image_points: A numpy array representing the 2D coordinates of specific points on the image.
    :param frame_height: An integer representing the height of the frame.
    :return: A tuple containing the head tilt degree, starting point coordinates, ending point coordinates, and alternate ending point coordinates.

    This method calculates the head tilt degree and the coordinates of specific points on the image using the given parameters.
    """
    focal_length = size[1]
    center = (size[1] / 2, size[0] / 2)
    camera_matrix = np.array(
        [[focal_length, 0, center[0]], [0, focal_length, center[1]], [0, 0, 1]],
        dtype="double"
    )
    dist_coeffs = np.zeros((4, 1))

    _, rotation_vector, translation_vector = cv2.solvePnP(
        MODEL_POINTS,
        np.array(image_points, dtype='double'),
        camera_matrix,
        dist_coeffs,
        flags=cv2.SOLVEPNP_ITERATIVE
    )

    nose_end_point_2D, _ = cv2.projectPoints(
        np.array([(0.0, 0.0, 1000.0)]),
        rotation_vector,
        translation_vector,
        camera_matrix,
        dist_coeffs
    )

    rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
    euler_angles = calculate_euler_angles(rotation_matrix)

    head_tilt_degree = abs(-180 - np.rad2deg(euler_angles[0]))

    starting_point = tuple(map(int, image_points[0]))
    ending_point = tuple(map(int, nose_end_point_2D[0][0]))
    ending_point_alternate = (ending_point[0], frame_height // 2)

    return head_tilt_degree, starting_point, ending_point, ending_point_alternate


def mouth_aspect_ratio(mouth):
    """
    :param mouth: List[Tuple[int, int]]
        The coordinates of the mouth landmarks. The list should contain 12 tuples,
        with each tuple representing the (x, y)-coordinates of a specific landmark.

    :return: float
        The mouth aspect ratio (MAR) calculated using the Euclidean distances of
        mouth landmarks.

    """
    # compute the euclidean distances between the two sets of
    # vertical mouth landmarks (x, y)-coordinates
    A = dist.euclidean(mouth[2], mouth[10])  # 51, 59
    B = dist.euclidean(mouth[4], mouth[8])  # 53, 57

    # compute the euclidean distance between the horizontal
    # mouth landmark (x, y)-coordinates
    C = dist.euclidean(mouth[0], mouth[6])  # 49, 55

    # compute the mouth aspect ratio
    mar = (A + B) / (2.0 * C)

    # return the mouth aspect ratio
    return mar


def is_yawning(detector, predictor, image: cv2.Mat | np.ndarray, threshold: float) -> bool:
    # Get face rects
    rects = detector(image, 0)
    print(f'len(rects)={len(rects)}')

    (m_start, m_end) = (49, 68)

    for rect in rects:
        # determine the facial landmarks for the face region, then
        # convert the facial landmark (x, y)-coordinates to a NumPy
        # array
        shape = predictor(image, rect)
        shape = face_utils.shape_to_np(shape)

        mouth = shape[m_start:m_end]
        mar = mouth_aspect_ratio(mouth)

        # Draw text if mouth is open
        if mar > threshold:
            return True

    return False


def main():
    """
    Main function to perform eye and mouth detection in a video stream.

    :return: None
    """
    detector, predictor = initialize_detector_and_predictor()
    video_stream = initialize_video_stream()

    (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
    (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]
    (mStart, mEnd) = (49, 68)

    EYE_AR_THRESH = 0.20
    MOUTH_AR_THRESH = 0.88
    EYE_AR_CONSEC_FRAMES = 3

    loop_video_stream(video_stream, detector, predictor, EYE_AR_THRESH, EYE_AR_CONSEC_FRAMES, MOUTH_AR_THRESH, mStart,
                      mEnd,
                      rStart, rEnd,
                      lStart, lEnd)


if __name__ == '__main__':
    main()
