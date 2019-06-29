function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
        oldonload();
        func();
        }
    }
}

function addHandler(element, type, handler) {
    if (element.addEventListener){
        element.addEventListener(type, handler, false);
    } else if (element.attachEvent){
        element.attachEvent("on" + type, handler);
    } else {
        element["on" + type] = handler;
    }
}

function addURLParam(url, key, value) {
    url += (url.indexOf("?") == -1 ? "?" : "&");
    url += encodeURIComponent(key) + "=" + encodeURIComponent(value);
    return url;
}

function isMobile() {
    var info = navigator.userAgent;
    var agents = ['Android', 'iPhone', 'iPad', 'iPod', 'Windows Phone'];
    for (var i = 0; i < agents.length; i++) {
        if (info.indexOf(agents[i]) >= 0) {
            return true;
        }
    }

    return false;
}

function prepareJoystick() {
    var joystick = document.getElementById("joystick");   
    
    var click_handler = function(event) {
        var url = '/teleop';
    
        switch (event.target.id) {
            case 'forward':
                url = addURLParam(url, "opcode", "forward");
                break;
            
            case 'left':
                url = addURLParam(url, "opcode", "left");
                break;

            case 'stop':
                url = addURLParam(url, "opcode", "stop");
                break;

            case 'right':
                url = addURLParam(url, "opcode", "right");
                break;

            case 'backward':
                url = addURLParam(url, "opcode", "backward");
                break;
        }

        var speedDisplay = document.getElementById("maxLinearSpeedDisplay");
        var xhr = new XMLHttpRequest();
        url = addURLParam(url, "speed", speedDisplay.firstChild.nodeValue.toString())
        xhr.open("get", url, true);
        xhr.send(null);
    };

    var isMobileDev = isMobile();

    if (isMobileDev) {
        addHandler(joystick, 'touchstart', click_handler);
    
        addHandler(joystick, 'touchend', function(event) {
            var xhr = new XMLHttpRequest();
            var url = '/teleop';
            url = addURLParam(url, "opcode", "stop");
            xhr.open("get", url, true);
            xhr.send(null);
        });
    } else {
        addHandler(joystick, 'click', click_handler);
    }
}

function prepareSpeedInput() {
    var speed = document.getElementById("maxLinearSpeed");
    var speedDisplay = document.getElementById("maxLinearSpeedDisplay");
    speedDisplay.firstChild.nodeValue = speed.getAttribute("value");

    addHandler(speed, 'input', function(event) {
        var speedDisplay = document.getElementById("maxLinearSpeedDisplay");
        speedDisplay.firstChild.nodeValue = this.value;
    });
}

function prepareFanInput() {
    var fanSpeed = document.getElementById("maxFanSpeed");
    var fanDisplay = document.getElementById("maxFanSpeedDisplay");
    fanDisplay.firstChild.nodeValue = fanSpeed.getAttribute("value");

    addHandler(fanSpeed, 'input', function(event) {
        var fanDisplay = document.getElementById("maxFanSpeedDisplay");
        fanDisplay.firstChild.nodeValue = this.value;

        var xhr = new XMLHttpRequest();
        var url = '/fan/' + this.value.toString();
        
        xhr.open("get", url, true);
        xhr.send(null);
    });
}

function prepareWidgets() {
    var widget = document.getElementById("widget");

    addHandler(widget, 'click', function(event) {
        var url = '/';
        
        switch (event.target.id) {
            case 'camera':
                url = '/snapshot'
                break;

            case 'video':
                rec = document.getElementById("rec");
                if (!rec.getAttribute("class")) {
                    rec.setAttribute("class", "recording");
                    url = '/video/1';
                } else {
                    rec.removeAttribute("class");
                    url = '/video/0';
                }
                break;

            case 'voice':
                url = '/voice';
                break;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.send(null);

    });
}

function loadEvents() {
    prepareJoystick();

    prepareSpeedInput();

    prepareFanInput();

    prepareWidgets();
}

addLoadEvent(loadEvents);