# -*- coding: utf-8 -*-
from importlib import import_module
import os
from flask import Flask, render_template, Response
from robot import Robot

# import camera driver
if os.environ.get('CAMERA'):
    Camera = import_module('camera_' + os.environ['CAMERA']).Camera
else:
    from camera import Camera

# Raspberry Pi camera module (requires picamera package)
# from camera_pi import Camera


app = Flask(__name__)

robot = Robot()


@app.route('/')
def mbot_gui():
    return render_template('mbot_gui.html')


@app.route('/set_motors/<left_speed>/<right_speed>')
def set_motors(left_speed, right_speed):
    robot.set_motors(float(left_speed), float(right_speed))
    return '', 204
   

def gen(camera):
    """Video streaming generator function."""
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen(Camera()),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
