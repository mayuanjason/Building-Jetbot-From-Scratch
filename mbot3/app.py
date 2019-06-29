# -*- coding: utf-8 -*-
from importlib import import_module
import os
import subprocess
from uuid import uuid1
import cv2
from flask import Flask, render_template, request, Response
from robot import Robot

# import camera driver
if os.environ.get('CAMERA'):
    Camera = import_module('camera_' + os.environ['CAMERA']).Camera
else:
    from camera import Camera

# Raspberry Pi camera module (requires picamera package)
# from camera_pi import Camera


snapshot_dir = 'dataset/snapshot'
video_dir = 'dataset/video'


try:
    os.makedirs(snapshot_dir)
    os.makedirs(video_dir)
except FileExistsError:
    print('Directories not created becasue they already exist')


app = Flask(__name__)

robot = Robot()


@app.route('/')
def mbot_gui():
    return render_template('mbot_gui.html')


@app.route('/teleop')
def teleop():
    opcode = request.args.get('opcode', 'stop')
    speed = float(request.args.get('speed', 0.8))

    if opcode == 'forward':
        robot.forward(speed)
    elif opcode == 'backward':
        robot.backward(speed)
    elif opcode == 'left':
        robot.left(speed)
    elif opcode == 'right':
        robot.right(speed)
    elif opcode == 'stop':
        robot.stop()

    return '', 204


@app.route('/fan/<int:speed>')
def fan(speed):
    cmd = 'sudo echo %s > /sys/devices/pwm-fan/target_pwm' % speed
    try:
        subprocess.check_output(cmd, shell=True)
    except subprocess.CalledProcessError:
        pass

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

@app.route('/snapshot')
def snapshot():
    frame = Camera().get_frame()
    image_path = os.path.join(snapshot_dir, str(uuid1()) + '.jpg')
    with open(image_path, 'wb') as f:
        f.write(frame)

    return '', 204


@app.route('/video/<int:is_recording>')
def video(is_recording):
    return '', 204


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)

