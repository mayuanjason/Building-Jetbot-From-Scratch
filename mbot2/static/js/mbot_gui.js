// Are we on a touch device?
var isTouchDevice = 'ontouchstart' in document.documentElement;

// Key modifiers
var shiftKey = false;

// Configurable options
var options = {
    maxLinearSpeed: 1.0,
    maxAngularSpeed: 0.5,
};

// The global linear and angular speed variables
var vx = 0;
var vy = 0;

// A flag to indicate when the mouse is down
var mouseDown = false;

// Begin KineticJS scripts and parameters
var basePadWidth = 300;
var basePadHeight = 300;

var baseLayer = new Kinetic.Layer();
var baseMarkerLayer = new Kinetic.Layer();
var baseMessageLayer = new Kinetic.Layer();

var baseStage = new Kinetic.Stage({
    container: "baseContainer",
    //x: 0,
    //y: 0,
    draggable: false,
    width: basePadWidth,
    height: basePadHeight
});

// The base control trackpad
var basePad = new Kinetic.Rect({
    //x: 0,
    //y: 0,
    width: basePadWidth,
    height: basePadHeight,
    //offset: [0, 0],
    fill: "#00D2FF",
    stroke: "black",
    strokeWidth: 1
});

// A vertical line down the middle of the base pad
var basePadVerticalLine = new Kinetic.Line({
    points: [basePadWidth/2, 0, basePadWidth/2, basePadHeight],
    stroke: "black",
    strokeWidth: 1,
    listening: false
});

// A horizontal line across the middle of the base pad
var basePadHorizontalLine = new Kinetic.Line({
    points: [0, basePadHeight/2, basePadWidth, basePadHeight/2],
    stroke: "black",
    strokeWidth: 1,
    listening: false
});

// A circular base pad marker to grab onto with the mouse
var basePadMarker = new Kinetic.Circle({
    x: basePadWidth/2,
    y: basePadHeight/2,
    radius: 40	,
    listening: false,
    fill: "yellow",
    stroke: "black",
    strokeWidth: 1
});

// Define event actions for the base trackpad
basePad.on("mousedown", function() {
    mouseDown = true;
    baseStage.draw();
});

basePad.on("mousemove touchmove", function() {
    if (! isTouchDevice && ! mouseDown) { return; }
    var mousePos = baseStage.getPointerPosition();
    var x = (mousePos.x - basePad.getX()) - basePadWidth / 2;
    var y = basePadHeight / 2 - (mousePos.y - basePad.getY());

    x /= (basePadWidth / 2);
    y /= (basePadHeight / 2);
    vx = x * options['maxAngularSpeed'];
    vy = y * options['maxLinearSpeed'];

    updateBasePadMarker(vx, vy);
    writeMessageById("baseMessages", " vx: " + Math.round(y * 100)/100 + ", vz: " + Math.round(x*100)/100, "green");
    pubCmdVel();
});

basePad.on("touchend mouseup dblclick", function() {
    mouseDown = false;
    // stopRobot();
    basePadMarker.setX(basePadWidth/2);
    basePadMarker.setY(basePadHeight/2);
    baseMarkerLayer.drawScene();
    writeMessageById("baseMessages", "Stopping robot");
});

baseLayer.add(basePad);
baseLayer.add(basePadVerticalLine);
baseLayer.add(basePadHorizontalLine);
baseMarkerLayer.add(basePadMarker)

baseStage.add(baseLayer);
baseStage.add(baseMarkerLayer);
baseStage.add(baseMessageLayer);

function updateBasePadMarker(vx, vy) {
    markerX = vx / options['maxAngularSpeed'];
    markerY = -vy / options['maxLinearSpeed'];
        
    markerX *= basePadWidth / 2;
    markerX = basePad.getX() + basePadWidth / 2 + markerX;
    markerY *= basePadHeight / 2;
    markerY = basePad.getY() + basePadHeight / 2 + markerY;

    basePadMarker.setX(markerX);
    basePadMarker.setY(markerY);
    baseMarkerLayer.draw();

    pubCmdVel()
}

function writeMessageById(id, message, color) {
    color = typeof color !== 'undefined' ? color: "#006600";
    element = document.getElementById(id);
    element.innerHTML = message;
    element.style.font = "18pt Calibri";
    element.style.color = color;
}

function pubCmdVel() {
    leftSpeed = rightSpeed = vy;
    leftSpeed += vx;
    rightSpeed -= vx;

    leftSpeed = Math.min(Math.abs(leftSpeed), options['maxLinearSpeed']) * sign(leftSpeed);
    rightSpeed = Math.min(Math.abs(rightSpeed), options['maxLinearSpeed']) * sign(rightSpeed);

    $.ajax({
        url: '/set_motors/' + leftSpeed.toString() + '/' + rightSpeed.toString(),
        type: 'get',
    })

    writeMessageById("baseMessages", " leftSpeed: " + Math.round(leftSpeed*100)/100 + ", rightSpeed: " + Math.round(rightSpeed*100)/100);
}

function stopRobot() {
    vx = vy = 0;
    pubCmdVel();
}

function sign(x)
{
    if (x < 0) { return -1; }
    if (x > 0) { return 1; }
    return 0;
}

function setMaxLinearSpeed(spd) {
    options['maxLinearSpeed'] = spd;
}

function setMaxAngularSpeed(spd) {
    options['maxAngularSpeed'] = spd;
}