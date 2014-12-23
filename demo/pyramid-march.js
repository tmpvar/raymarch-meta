module.exports = createRenderer;

var _createFBO = require('gl-fbo');
var createVAO = require('gl-vao');
var createBuffer = require('gl-buffer')
var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var getEye = require('./util/get-eye');

var fboId = 0;
function createFBO() {
  var fbo = _createFBO.apply(null, arguments);
  fbo._id = fboId++;
  return fbo;
}

var clear = require('gl-clear')({
  color : [ 17/255, 17/255, 34/255]
});


var model = mat4.create();
var projection = mat4.create();
var view = mat4.create();
var worldToClip = mat4.create();
var clipToWorld = mat4.create();
var v3scratch = [0, 0, 0];
var m4scratch = mat4.create();
var uvmatrix = mat4.create();


var v4scratch = [0, 0, 0, 0];
var location = 0;
var lastResolution = [0, 0];
function createRenderer(gl) {

  var vao = createVAO(gl, [{
    buffer: createBuffer(gl, [
      -1,  1,  0,
       1,  1,  0,
       1, -1,  0,

      -1,  1,  0,
       1, -1,  0,
      -1, -1,  0
    ]),
    size: 3
  }]);

  var resolution = [1, 1];

  resolution[0] = gl.canvas.width;
  resolution[1] = gl.canvas.height;

  var lastFBO = null;
  var oldFBOS = [];

clear(gl);
  function render(viewport, scale, scene, camera, shader, renderToScreen) {

    while(oldFBOS.length) {
      oldFBOS.pop().dispose();
    }


    // shader.bind();
    resolution[0] = Math.ceil((viewport[2] - viewport[0]) * scale);
    resolution[1] = Math.ceil((viewport[3] - viewport[1]) * scale);

    gl.viewport(
      viewport[0] * scale,
      viewport[1] * scale,
      viewport[2] * scale,
      viewport[3] * scale
    );

    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.depthMask(false);
    // gl.frontFace(gl.CW);
    // gl.enable(gl.CULL_FACE);
    // gl.enable(gl.DEPTH_TEST)

    mat4.identity(view);
    mat4.identity(model);
    mat4.identity(uvmatrix);
    mat4.identity(worldToClip);
    mat4.identity(clipToWorld);


    mat4.perspective(
      projection,
      Math.PI/4.0,
      resolution[0]/resolution[1],
      0.1,
      1000.0
    );


    //Calculate camera matrices
    camera.view(view);
    mat4.multiply(worldToClip, view, model);
    mat4.copy(uvmatrix, worldToClip);
    mat4.multiply(worldToClip, projection, worldToClip);
    mat4.invert(clipToWorld, worldToClip);
    mat4.multiply(clipToWorld, clipToWorld, projection);

    //Set up shader

    shader.bind();
    shader.uniforms.clipToWorld = clipToWorld;
    shader.uniforms.uvmatrix = uvmatrix;
    shader.uniforms.ops = scene.opsTexture.bind();

console.log('lastFBO valid?', !!(lastFBO && lastFBO.color[0]), lastFBO && lastFBO._id)
    var currentFBO = null;
    if (lastFBO && lastFBO.color[0]) {
      shader.uniforms.fbo = lastFBO.color[0].bind();
      shader.uniforms.resolution = lastFBO.shape;
    } else {
      shader.uniforms.resolution = resolution;
    }

    if (renderToScreen) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      console.log('render to screen w/ fbo:' + lastFBO._id)

    } else {
      currentFBO = createFBO(gl, resolution);
      currentFBO.bind();

      console.log('render into fbo:%s w/ fbo:%s', currentFBO._id, lastFBO && lastFBO._id)

    }


    vao.bind();
    vao.draw(gl.TRIANGLES, 6);
    vao.unbind();
    if (lastFBO) {
      oldFBOS.push(lastFBO);
    }

    lastFBO = currentFBO;
  }

  return render;
}
