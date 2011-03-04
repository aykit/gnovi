/* Thanks to Modernizr.com for their great effort */


var errormsg = "";
var error = false;

if (!Modernizr.canvas) {
    errormsg = errormsg + "canvas";    
    error = true;
}

if (!Modernizr.canvastext) {
    errormsg = errormsg + "canvastext";
    error = true;
    }

if (!Modernizr.rgba) {
    errormsg = errormsg + "rgba";
    error = true;
}

if (!Modernizr.hsla) {
    errormsg = errormsg + "hsla";
    error = true;
}

if (!Modernizr.borderradius) {
    errormsg = errormsg + "borderradius";
    error = true;
}

if (!Modernizr.opacity) {
    errormsg = errormsg + "opacity";
    error = true;
}

if (!Modernizr.csscolumns) {
    errormsg = errormsg + "csscolumns";
}

if (error) {
    window.location = "html5";
}

/* throw(errormsg); */