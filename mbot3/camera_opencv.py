import cv2
from base_camera import BaseCamera


class Camera(BaseCamera):
    video_source = 0
    cap = None
    out = None

    @staticmethod
    def set_video_source(source):
        Camera.video_source = source

    @staticmethod
    def start_recording(file_path):
        if Camera.out is None:
            Camera.out = cv2.VideoWriter(file_path, 
                                         cv2.VideoWriter_fourcc(*'MJPG'), 
                                         Camera.cap.get(cv2.CAP_PROP_FPS), 
                                         (int(Camera.cap.get(cv2.CAP_PROP_FRAME_WIDTH)), 
                                         int(Camera.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))))

    @staticmethod
    def stop_recording():
        if Camera.out is not None:
            Camera.out.release()
            Camera.out = None

    @staticmethod
    def frames():
        Camera.cap = cv2.VideoCapture(Camera.video_source)
        if not Camera.cap.isOpened():
            raise RuntimeError('Could not start camera.')

        while True:
            # read current frame
            _, img = Camera.cap.read()

            if Camera.out:
                Camera.out.write(img)

            # encode as a jpeg image and return it
            yield cv2.imencode('.jpg', img)[1].tobytes()
