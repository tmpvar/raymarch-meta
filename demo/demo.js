var mat4 = require('gl-mat4');
var mat3 = require('gl-mat3');
var createBuffer = require('gl-buffer');
var createTexture = require('gl-texture2d');
var createVAO = require('gl-vao');
var fs = require('fs');
var varargs = require('varargs');
var Scene = require('./scene')
var ndarray = require('ndarray');
var getEye = require('eye-vector');
var eye = [0, 0];

var camera = require('orbit-camera')(
  [0, 0, -2],
  [0, 0, 0],
  [0, 1, 0]
);

var vert = fs.readFileSync(__dirname + '/vert.glsl', 'utf8');
var frag = fs.readFileSync(__dirname + '/frag.glsl', 'utf8');

var model = mat4.create();;
var projection = mat4.create();
var view = mat4.create();
var worldToClip = mat4.create();
var clipToWorld = mat4.create();


var clear = require('gl-clear')({
  color : [ 17/255, 17/255, 34/255]
});

var fc = require('fc');

var gl = fc(render, false, 3);

if (!gl) {
  throw new Error('could not initialize webgl');
}

//Create buffers for cube
var cubeVerts = []
var cubeFacets = []
for(var i=0; i<8; ++i) {
  for(var j=0; j<3; ++j) {
    if(i & (1<<j)) {
      cubeVerts.push( 1)
    } else {
      cubeVerts.push(-1)
    }
  }
}
for(var d=0; d<3; ++d) {
  var u = 1<<((d + 1) % 3)
  var v = 1<<((d + 2) % 3)
  for(var s=0; s<2; ++s) {
    var m = s << d
    cubeFacets.push(m, m+v, m+u, m+u, m+v, m+u+v)
    var t = u
    u = v
    v = t
  }
}

//Create cube VAO
var faceBuf = createBuffer(gl, new Uint16Array(cubeFacets), gl.ELEMENT_ARRAY_BUFFER)
var vertBuf = createBuffer(gl, new Float32Array(cubeVerts))
var vao = createVAO(gl, [
  { "buffer": vertBuf,
    "type": gl.FLOAT,
    "size": 3,
    "stride": 0,
    "offset": 0,
    "normalized": false
  }
], faceBuf)

var scene = window.scene = new Scene(gl, vert, frag)
var sphere = scene.createSphere(0.1,0.1,0.2,0.3,0.1);
var sphere2 = scene.createSphere(0.1,0.5,.5,0.5,0.1);
var sphere3 = scene.createSphere(0.5,0.5,0.0,0.5,0.1);

var boxy = scene.createBox(-0.2, -0.1, 0.2,             0.6, 0.2, 0.4,      0.1);

var union = scene.createUnion([sphere3, sphere2]);
var cut = scene.createCut([union, boxy]);
scene.add(sphere);
scene.add(sphere2);
scene.add(sphere3);
scene.add(boxy);
scene.add(union);
scene.add(cut);
scene.add(scene.createDisplay(cut));

window.camera = camera;

var resolution = [0, 0];

gl.start();
var start = Date.now();
function render() {



  clear(gl);
  scene.shader.bind();
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  mat4.identity(model);

  mat4.perspective(
    projection,
    Math.PI/4.0,
    gl.canvas.width/gl.canvas.height,
    0.1,
    1000.0
  );

  //Calculate camera matrices
  camera.view(view);
  mat4.multiply(worldToClip, view, model);
  mat4.multiply(worldToClip, projection, worldToClip);

  mat4.invert(clipToWorld, worldToClip)

  var w = clipToWorld[11];

  //Set up shader
  scene.shader.uniforms.worldToClip = worldToClip;
    scene.shader.uniforms.clipToWorld = clipToWorld;

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  // TODO: compare the camera eye with the bounding box
  if (camera.distance > 2.0) {
    gl.depthMask(false)
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)
    gl.frontFace(gl.CCW)
  }

  resolution[0] = gl.canvas.width;
  resolution[1] = gl.canvas.height;
  scene.shader.uniforms.resolution = resolution;
  scene.shader.uniforms.ops = scene.opsTexture.bind();
  scene.shader.uniforms.time = Date.now() - start;

  scene.render();

  vao.bind();
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)
  vao.unbind();
  gl.stop();
}


var mouse = {
  down: false,
  pos: [0, 0]
};

function handleMouse(e) {
  gl.start();
  switch (e.type) {
    case 'mousedown':
      mouse.down=true;
    break;

    case 'mouseup':
      mouse.down = false;
    break;

    case 'mousemove':
      var x = e.clientX;
      var y = e.clientY;

      if (mouse.down) {
        // fc ensures that the canvas is fullscreen
        // you'll want to get the offset of the canvas
        // element if you don't use fc.

        var w = gl.canvas.width;
        var h = gl.canvas.height;
        var l = mouse.pos;
        camera.rotate(
          [x/w - .5, y/h - .5,],
          [l[0]/w - .5, l[1]/h - .5]
        )

      }
      mouse.pos = [x, y];

    break;

    case 'mousewheel':
      camera.zoom(e.wheelDeltaY * -.001);
      e.preventDefault();
    break;

    case 'keydown' :
      var panSpeed = .01;
      switch (e.keyCode) {
        case 37:
          camera.pan([-panSpeed, 0, 0]);
        break;

        case 38:
          camera.pan([0, -panSpeed, 0]);
        break;

        case 39:
          camera.pan([panSpeed, 0, 0]);
        break;

        case 40:
          camera.pan([0, panSpeed, 0]);
        break;
      }
    break;
  }
}

['mousedown', 'mouseup', 'mousemove', 'mousewheel', 'keydown'].forEach(function(name) {
  document.addEventListener(name, handleMouse);
});

