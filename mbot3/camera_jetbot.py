import cv2
from base_camera import BaseCamera


class Camera(BaseCamera):
    # config
    width=640
    height=480
    fps=21
    capture_width=3280
    capture_height=2464
    out = None

    @staticmethod
    def set_video_source(width=640, height=480, fps=21, capture_width=3280, capture_height=2464):
        Camera.width = width
        Camera.height = height
        Camera.fps = fps
        Camera.capture_width = capture_width
        Camera.capture_height = capture_height

    @staticmethod
    def _gst_str():
        return 'nvarguscamerasrc ! video/x-raw(memory:NVMM), width=%d, height=%d, format=(string)NV12, framerate=(fraction)%d/1 ! nvvidconv ! video/x-raw, width=(int)%d, height=(int)%d, format=(string)BGRx ! videoconvert ! appsink' % (
                Camera.capture_width, Camera.capture_height, Camera.fps, Camera.width, Camera.height)

    @staticmethod
    def start_recording(file_path):
        if Camera.out is None:
            Camera.out = cv2.VideoWriter(file_path, cv2.VideoWriter_fourcc(*'MJPG'), 
                                         Camera.fps, (Camera.width, Camera.height))
    
    @staticmethod
    def stop_recording():
        if Camera.out is not None:
            Camera.out.release()
            Camera.out = None

    @staticmethod
    def frames():
        cap = cv2.VideoCapture(Camera._gst_str(), cv2.CAP_GSTREAMER)
        if not cap.isOpened():
            raise RuntimeError('Could not start camera.')

        while True:
            # read current frame
            _, img = cap.read()

            if Camera.out:
                Camera.out.write(img)

            # encode as a jpeg image and return it
            yield cv2.imencode('.jpg', img)[1].tobytes()
