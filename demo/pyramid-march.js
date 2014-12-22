module.exports = createRenderer;

var createFBO = require('gl-fbo');
var createVAO = require('gl-vao');
var createBuffer = require('gl-buffer')
var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var getEye = require('./util/get-eye');

var model = mat4.create();
var projection = mat4.create();
var view = mat4.create();
var worldToClip = mat4.create();
var clipToWorld = mat4.create();
var v3scratch = [0, 0, 0];
var m4scratch = mat4.create();
var uvmatrix = mat4.create();



var clear = require('gl-clear')({
  color : [ 17/255, 17/255, 34/255]
});


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

  var fboPair = [
    createFBO(gl, resolution),
    createFBO(gl, resolution)
  ];

  clear(gl);
  function render(viewport, scale, scene, camera, shader, renderToScreen) {

    shader.bind();
    resolution[0] = Math.ceil((viewport[2] - viewport[0]) * scale);
    resolution[1] = Math.ceil((viewport[3] - viewport[1]) * scale);

    gl.viewport(
      viewport[0] * scale,
      viewport[1] * scale,
      viewport[2] * scale,
      viewport[3] * scale
    );

    mat4.identity(model);

    mat4.perspective(
      projection,
      Math.PI/4.0,
      viewport[2]/viewport[3],
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


    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.depthMask(false);
    // gl.frontFace(gl.CW);
    // gl.enable(gl.CULL_FACE);
    // gl.enable(gl.DEPTH_TEST)

    //Set up shader
    shader.uniforms.clipToWorld = clipToWorld;
    shader.uniforms.uvmatrix = uvmatrix;

    shader.uniforms.ops = scene.opsTexture.bind();

    scene.render();

    if (fboPair[location].populated) {
      console.log(fboPair[location].color)
      shader.uniforms.fbo = fboPair[location].color[0].bind();
    }

    shader.uniforms.resolution = resolution;

    if (renderToScreen) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      console.log('render to screen', resolution);
    } else {
      console.log('render to fbo', resolution);
      var currentFBO = fboPair[location ^= 1]
      currentFBO.shape = resolution;
      currentFBO.bind();
      currentFBO.populated = true;
    }



    vao.bind();
    vao.draw(gl.TRIANGLES, 6);
    vao.unbind();
  }

  return render;
}
