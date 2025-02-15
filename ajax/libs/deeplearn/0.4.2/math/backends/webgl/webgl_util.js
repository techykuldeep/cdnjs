"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MAX_TEXTURE_SIZE = null;
var util = require("../../../util");
var environment_1 = require("../../../environment");
function createWebGLRenderingContext(attributes) {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return createWebGLRenderingContextFromCanvas(canvas, attributes);
}
exports.createWebGLRenderingContext = createWebGLRenderingContext;
function createWebGLRenderingContextFromCanvas(canvas, attributes) {
    var gl;
    var webglVersion = environment_1.ENV.get('WEBGL_VERSION');
    if (webglVersion === 2) {
        gl = canvas.getContext('webgl2', attributes);
    }
    else if (webglVersion === 1) {
        gl = (canvas.getContext('webgl', attributes) ||
            canvas.getContext('experimental-webgl', attributes));
    }
    if (webglVersion === 0 || gl == null) {
        throw new Error('This browser does not support WebGL.');
    }
    return gl;
}
exports.createWebGLRenderingContextFromCanvas = createWebGLRenderingContextFromCanvas;
function callAndCheck(gl, func) {
    var returnValue = func();
    checkWebGLError(gl);
    return returnValue;
}
exports.callAndCheck = callAndCheck;
var webGLDebugErrorCheckingEnabled = false;
function enableDebugWebGLErrorChecking(enabled) {
    webGLDebugErrorCheckingEnabled = enabled;
}
exports.enableDebugWebGLErrorChecking = enableDebugWebGLErrorChecking;
function checkWebGLError(gl) {
    if (webGLDebugErrorCheckingEnabled) {
        var error = gl.getError();
        if (error !== gl.NO_ERROR) {
            throw new Error('WebGL Error: ' + getWebGLErrorMessage(gl, error));
        }
    }
}
exports.checkWebGLError = checkWebGLError;
function getWebGLErrorMessage(gl, status) {
    switch (status) {
        case gl.NO_ERROR:
            return 'NO_ERROR';
        case gl.INVALID_ENUM:
            return 'INVALID_ENUM';
        case gl.INVALID_VALUE:
            return 'INVALID_VALUE';
        case gl.INVALID_OPERATION:
            return 'INVALID_OPERATION';
        case gl.INVALID_FRAMEBUFFER_OPERATION:
            return 'INVALID_FRAMEBUFFER_OPERATION';
        case gl.OUT_OF_MEMORY:
            return 'OUT_OF_MEMORY';
        case gl.CONTEXT_LOST_WEBGL:
            return 'CONTEXT_LOST_WEBGL';
        default:
            return "Unknown error code " + status;
    }
}
exports.getWebGLErrorMessage = getWebGLErrorMessage;
function getExtensionOrThrow(gl, extensionName) {
    return throwIfNull(gl, function () { return gl.getExtension(extensionName); }, 'Extension "' + extensionName + '" not supported on this browser.');
}
exports.getExtensionOrThrow = getExtensionOrThrow;
function createVertexShader(gl, vertexShaderSource) {
    var vertexShader = throwIfNull(gl, function () { return gl.createShader(gl.VERTEX_SHADER); }, 'Unable to create vertex WebGLShader.');
    callAndCheck(gl, function () { return gl.shaderSource(vertexShader, vertexShaderSource); });
    callAndCheck(gl, function () { return gl.compileShader(vertexShader); });
    if (gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) === false) {
        console.log(gl.getShaderInfoLog(vertexShader));
        throw new Error('Failed to compile vertex shader.');
    }
    return vertexShader;
}
exports.createVertexShader = createVertexShader;
function createFragmentShader(gl, fragmentShaderSource) {
    var fragmentShader = throwIfNull(gl, function () { return gl.createShader(gl.FRAGMENT_SHADER); }, 'Unable to create fragment WebGLShader.');
    callAndCheck(gl, function () { return gl.shaderSource(fragmentShader, fragmentShaderSource); });
    callAndCheck(gl, function () { return gl.compileShader(fragmentShader); });
    if (gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS) === false) {
        logShaderSourceAndInfoLog(fragmentShaderSource, gl.getShaderInfoLog(fragmentShader));
        throw new Error('Failed to compile fragment shader.');
    }
    return fragmentShader;
}
exports.createFragmentShader = createFragmentShader;
var lineNumberRegex = /ERROR: [0-9]+:([0-9]+):/g;
function logShaderSourceAndInfoLog(shaderSource, shaderInfoLog) {
    var lineNumberRegexResult = lineNumberRegex.exec(shaderInfoLog);
    if (lineNumberRegexResult == null) {
        console.log("Couldn't parse line number in error: " + shaderInfoLog);
        console.log(shaderSource);
        return;
    }
    var lineNumber = +lineNumberRegexResult[1];
    var shaderLines = shaderSource.split('\n');
    var pad = shaderLines.length.toString().length + 2;
    var linesWithLineNumbers = shaderLines.map(function (line, lineNumber) {
        return util.rightPad((lineNumber + 1).toString(), pad) + line;
    });
    var maxLineLength = 0;
    for (var i = 0; i < linesWithLineNumbers.length; i++) {
        maxLineLength = Math.max(linesWithLineNumbers[i].length, maxLineLength);
    }
    var beforeErrorLines = linesWithLineNumbers.slice(0, lineNumber - 1);
    var errorLine = linesWithLineNumbers.slice(lineNumber - 1, lineNumber);
    var afterErrorLines = linesWithLineNumbers.slice(lineNumber);
    console.log(beforeErrorLines.join('\n'));
    console.log(shaderInfoLog.split('\n')[0]);
    console.log("%c " + util.rightPad(errorLine[0], maxLineLength), 'border:1px solid red; background-color:#e3d2d2; color:#a61717');
    console.log(afterErrorLines.join('\n'));
}
function createProgram(gl) {
    return throwIfNull(gl, function () { return gl.createProgram(); }, 'Unable to create WebGLProgram.');
}
exports.createProgram = createProgram;
function linkProgram(gl, program) {
    callAndCheck(gl, function () { return gl.linkProgram(program); });
    if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
        console.log(gl.getProgramInfoLog(program));
        throw new Error('Failed to link vertex and fragment shaders.');
    }
}
exports.linkProgram = linkProgram;
function validateProgram(gl, program) {
    callAndCheck(gl, function () { return gl.validateProgram(program); });
    if (gl.getProgramParameter(program, gl.VALIDATE_STATUS) === false) {
        console.log(gl.getProgramInfoLog(program));
        throw new Error('Shader program validation failed.');
    }
}
exports.validateProgram = validateProgram;
function createStaticVertexBuffer(gl, data) {
    var buffer = throwIfNull(gl, function () { return gl.createBuffer(); }, 'Unable to create WebGLBuffer');
    callAndCheck(gl, function () { return gl.bindBuffer(gl.ARRAY_BUFFER, buffer); });
    callAndCheck(gl, function () { return gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); });
    return buffer;
}
exports.createStaticVertexBuffer = createStaticVertexBuffer;
function createStaticIndexBuffer(gl, data) {
    var buffer = throwIfNull(gl, function () { return gl.createBuffer(); }, 'Unable to create WebGLBuffer');
    callAndCheck(gl, function () { return gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer); });
    callAndCheck(gl, function () { return gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW); });
    return buffer;
}
exports.createStaticIndexBuffer = createStaticIndexBuffer;
function queryMaxTextureSize(gl) {
    if (MAX_TEXTURE_SIZE != null) {
        return MAX_TEXTURE_SIZE;
    }
    MAX_TEXTURE_SIZE =
        callAndCheck(gl, function () { return gl.getParameter(gl.MAX_TEXTURE_SIZE); });
    return MAX_TEXTURE_SIZE;
}
exports.queryMaxTextureSize = queryMaxTextureSize;
function getChannelsPerTexture() {
    if (!environment_1.ENV.get('WEBGL_FLOAT_TEXTURE_ENABLED')) {
        return 4;
    }
    if (environment_1.ENV.get('WEBGL_VERSION') === 2) {
        return 1;
    }
    return 4;
}
exports.getChannelsPerTexture = getChannelsPerTexture;
function createTexture(gl) {
    return throwIfNull(gl, function () { return gl.createTexture(); }, 'Unable to create WebGLTexture.');
}
exports.createTexture = createTexture;
function validateTextureSize(gl, width, height) {
    var maxTextureSize = queryMaxTextureSize(gl);
    if ((width <= 0) || (height <= 0)) {
        var requested = "[" + width + "x" + height + "]";
        throw new Error('Requested texture size ' + requested + ' is invalid.');
    }
    if ((width > maxTextureSize) || (height > maxTextureSize)) {
        var requested = "[" + width + "x" + height + "]";
        var max = "[" + maxTextureSize + "x" + maxTextureSize + "]";
        throw new Error('Requested texture size ' + requested +
            ' greater than WebGL maximum on this browser / GPU ' + max + '.');
    }
}
exports.validateTextureSize = validateTextureSize;
function createFramebuffer(gl) {
    return throwIfNull(gl, function () { return gl.createFramebuffer(); }, 'Unable to create WebGLFramebuffer.');
}
exports.createFramebuffer = createFramebuffer;
function bindVertexBufferToProgramAttribute(gl, program, attribute, buffer, arrayEntriesPerItem, itemStrideInBytes, itemOffsetInBytes, attribLocations) {
    var loc = -1;
    if ((attribLocations != null) && (attribute in attribLocations)) {
        loc = attribLocations[attribute];
    }
    else {
        loc = gl.getAttribLocation(program, attribute);
    }
    if (loc === -1) {
        return;
    }
    callAndCheck(gl, function () { return gl.bindBuffer(gl.ARRAY_BUFFER, buffer); });
    callAndCheck(gl, function () { return gl.vertexAttribPointer(loc, arrayEntriesPerItem, gl.FLOAT, false, itemStrideInBytes, itemOffsetInBytes); });
    callAndCheck(gl, function () { return gl.enableVertexAttribArray(loc); });
}
exports.bindVertexBufferToProgramAttribute = bindVertexBufferToProgramAttribute;
function bindTextureUnit(gl, texture, textureUnit) {
    validateTextureUnit(gl, textureUnit);
    callAndCheck(gl, function () { return gl.activeTexture(gl.TEXTURE0 + textureUnit); });
    callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, texture); });
}
exports.bindTextureUnit = bindTextureUnit;
function unbindTextureUnit(gl, textureUnit) {
    validateTextureUnit(gl, textureUnit);
    callAndCheck(gl, function () { return gl.activeTexture(gl.TEXTURE0 + textureUnit); });
    callAndCheck(gl, function () { return gl.bindTexture(gl.TEXTURE_2D, null); });
}
exports.unbindTextureUnit = unbindTextureUnit;
function getProgramUniformLocationOrThrow(gl, program, uniformName) {
    return throwIfNull(gl, function () { return gl.getUniformLocation(program, uniformName); }, 'uniform "' + uniformName + '" not present in program.');
}
exports.getProgramUniformLocationOrThrow = getProgramUniformLocationOrThrow;
function bindTextureToProgramUniformSampler(gl, program, texture, uniformSamplerLocation, textureUnit) {
    callAndCheck(gl, function () { return bindTextureUnit(gl, texture, textureUnit); });
    callAndCheck(gl, function () { return gl.uniform1i(uniformSamplerLocation, textureUnit); });
}
exports.bindTextureToProgramUniformSampler = bindTextureToProgramUniformSampler;
function bindCanvasToFramebuffer(gl) {
    callAndCheck(gl, function () { return gl.bindFramebuffer(gl.FRAMEBUFFER, null); });
    callAndCheck(gl, function () { return gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); });
    callAndCheck(gl, function () { return gl.scissor(0, 0, gl.canvas.width, gl.canvas.height); });
}
exports.bindCanvasToFramebuffer = bindCanvasToFramebuffer;
function bindColorTextureToFramebuffer(gl, texture, framebuffer) {
    callAndCheck(gl, function () { return gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); });
    callAndCheck(gl, function () { return gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0); });
}
exports.bindColorTextureToFramebuffer = bindColorTextureToFramebuffer;
function unbindColorTextureFromFramebuffer(gl, framebuffer) {
    callAndCheck(gl, function () { return gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); });
    callAndCheck(gl, function () { return gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0); });
}
exports.unbindColorTextureFromFramebuffer = unbindColorTextureFromFramebuffer;
function validateFramebuffer(gl) {
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error('Error binding framebuffer: ' + getFramebufferErrorMessage(gl, status));
    }
}
exports.validateFramebuffer = validateFramebuffer;
function getFramebufferErrorMessage(gl, status) {
    switch (status) {
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            return 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT';
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            return 'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT';
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            return 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS';
        case gl.FRAMEBUFFER_UNSUPPORTED:
            return 'FRAMEBUFFER_UNSUPPORTED';
        default:
            return "unknown error " + status;
    }
}
exports.getFramebufferErrorMessage = getFramebufferErrorMessage;
function throwIfNull(gl, returnTOrNull, failureMessage) {
    var tOrNull = callAndCheck(gl, function () { return returnTOrNull(); });
    if (tOrNull == null) {
        throw new Error(failureMessage);
    }
    return tOrNull;
}
function validateTextureUnit(gl, textureUnit) {
    var maxTextureUnit = gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS - 1;
    var glTextureUnit = textureUnit + gl.TEXTURE0;
    if (glTextureUnit < gl.TEXTURE0 || glTextureUnit > maxTextureUnit) {
        var textureUnitRange = "[gl.TEXTURE0, gl.TEXTURE" + maxTextureUnit + "]";
        throw new Error("textureUnit must be in " + textureUnitRange + ".");
    }
}
function getTextureShapeFromLogicalShape(gl, logShape) {
    if (logShape.length !== 2) {
        var squeezeResult = util.squeezeShape(logShape);
        logShape = squeezeResult.newShape;
    }
    var maxTexSize = queryMaxTextureSize(gl);
    var size = util.sizeFromShape(logShape);
    if (logShape.length <= 1 && size <= maxTexSize) {
        return [size, 1];
    }
    else if (logShape.length === 2 && logShape[0] <= maxTexSize &&
        logShape[1] <= maxTexSize) {
        return logShape;
    }
    else if (logShape.length === 3 && logShape[0] <= maxTexSize &&
        logShape[1] * logShape[2] <= maxTexSize) {
        return [logShape[0], logShape[1] * logShape[2]];
    }
    else if (logShape.length === 4 && logShape[0] <= maxTexSize &&
        logShape[1] * logShape[2] * logShape[3] <= maxTexSize) {
        return [logShape[0], logShape[1] * logShape[2] * logShape[3]];
    }
    else {
        return util.sizeToSquarishShape(size);
    }
}
exports.getTextureShapeFromLogicalShape = getTextureShapeFromLogicalShape;
