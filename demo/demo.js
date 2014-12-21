var mat4 = require('gl-mat4');
var mat3 = require('gl-mat3');
var vec3 = require('gl-vec3');

// expando the vec3 object with an unproject method
require('./util/vec3-unproject');

var createBuffer = require('gl-buffer');
var createTexture = require('gl-texture2d');
var createVAO = require('gl-vao');
var fs = require('fs');
var varargs = require('varargs');
var Scene = require('./scene')
var cmd = require('./commands')
var ndarray = require('ndarray');
var stats = new (require('./util/stats.min'))();
stats.setMode(1);
stats.domElement.style.position = 'absolute';
stats.domElement.style.zIndex = '100';
stats.domElement.style.left = '0px';
stats.domElement.style.bottom = '0px';
document.body.appendChild( stats.domElement );

var aabb = require('./util/aabb');
var mouse = {
  down: false,
  pos: [0, 0],
  far: [0, 0, 0],
  pick: [0, 0]
};
var eye = [0, 0, 0];

var camera = require('orbit-camera')(
  [0, 0, -2],
  [0, 0, 0],
  [0, 1, 0]
);

var vert = fs.readFileSync(__dirname + '/shader/vert.glsl', 'utf8');
var frag = fs.readFileSync(__dirname + '/shader/frag.glsl', 'utf8');

var model = mat4.create();;
var projection = mat4.create();
var view = mat4.create();
var worldToClip = mat4.create();
var clipToWorld = mat4.create();
var v3scratch = [0, 0, 0];
var m4scratch = mat4.create();

function getEye(out, view) {
  mat4.invert(m4scratch, view);
  out[0] = m4scratch[12];
  out[1] = m4scratch[13];
  out[2] = m4scratch[14]
  return out;
}


var clear = require('gl-clear')({
  color : [ 17/255, 17/255, 34/255]
});

var fc = require('fc');

var gl = fc(render, false, 3);

if (!gl) {
  throw new Error('could not initialize webgl');
}

//Create buffers for cube
// var cubeVerts = []
// var cubeFacets = []
// for(var i=0; i<8; ++i) {
//   for(var j=0; j<3; ++j) {
//     if(i & (1<<j)) {
//       cubeVerts.push( 1)
//     } else {
//       cubeVerts.push(-1)
//     }
//   }
// }
// for(var d=0; d<3; ++d) {
//   var u = 1<<((d + 1) % 3)
//   var v = 1<<((d + 2) % 3)
//   for(var s=0; s<2; ++s) {
//     var m = s << d
//     cubeFacets.push(m, m+v, m+u, m+u, m+v, m+u+v)
//     var t = u
//     u = v
//     v = t
//   }
// }

//Create cube VAO
// var faceBuf = createBuffer(gl, new Uint16Array(cubeFacets), gl.ELEMENT_ARRAY_BUFFER)
// var vertBuf = createBuffer(gl, new Float32Array(cubeVerts));
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
//   { "buffer": vertBuf,
//     "type": gl.FLOAT,
//     "size": 3,
//     "stride": 0,
//     "offset": 0,
//     "normalized": false
//   }
// ], faceBuf)

var scene = window.scene = new Scene(gl, vert, frag)

var sphere = cmd.sphere(0.5, 0.1,0.1,1.0).translate(0.0,0.0,0.0);
/*
var sphere2 = cmd.sphere(0.5, 0.1,0.5,0.9).translate(0.0, 2.5, 0.0);
var sphere3 = cmd.sphere(0.3, 0.6,0.1,0.3).translate( 0.40,3.0,0.0);
var sphere4 = cmd.sphere(0.3, 0.9,0.6,0.3).translate(-0.40,3.0,0.0);

var cyl = cmd.cylinder(0.5,0.0,0.10, 0.3,0.4,0.5).translate(0.0,5.5,0.0);*/
var box = cmd.cube(0.3, 0.5,0.6,0.7).translate(0.0,0.4,0.0);
var box2 = cmd.box(2.0,2.0,0.75, 1.0,0.1,0.1).translate(0.0,2.5,-0.25);
/*var tor = cmd.torus(0.3,0.1, 0.7,0.2,0.5).translate(0.9,0.5,0.4);

var cut1 = cmd.cut(cyl, box);
var cut2 = cmd.cut(sphere, box);

var mouseCut = sphere2.union([sphere3, sphere4]).cut(box2);
var isect = cmd.box(1, .25, 1).translate(0, 1, 0).intersect(
  cmd.sphere(0, .75, 0, .5)
);
*/
// scene.display([mouseCut, tor, cyl, box, isect]);

scene.display([sphere, /*sphere2, sphere3, sphere4, cyl, tor,*/ box, box2]);
//scene.display([sphere, tor]);

window.camera = camera;

var resolution = [0, 0];

var bounds = scene.getAABB();

camera.center[0] = bounds[0][0] + (bounds[1][0] - bounds[0][0])/2;
camera.center[1] = bounds[0][1] + (bounds[1][1] - bounds[0][1])/2;
camera.center[2] = bounds[0][2] + (bounds[1][2] - bounds[0][2])/2;

// TODO: this is a very mechanical way of doing things and I'm sure
//       there is a better way!
// var w = 0;
// for(var i=0; i<8; ++i) {
//   for(var j=0; j<3; ++j) {
//     var v;
//     if(i & (1<<j)) {
//       v = 1;
//     } else {
//       v = -1;
//     }
//     var pos = v === -1 ? 0 : 1;

//     cubeVerts[w] = bounds[pos][j];
//     w++;
//   }
// }
// vertBuf.update(cubeVerts);


gl.start();
var start = Date.now();
function render() {
  stats.end();
  stats.begin();
  if (!scene.shader) {
    console.error('not rendering - no shader');
    gl.stop();
    return;
  }

  clear(gl);
  scene.shader.bind();
  scene.viewport[2] = gl.canvas.width;
  scene.viewport[3] = gl.canvas.height;

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

  mat4.invert(clipToWorld, worldToClip);
  mat4.multiply(clipToWorld, clipToWorld, projection);

  // TODO: pre-divide to avoid doing it in frag.glsl:main
//  var w = clipToWorld[11];

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  // gl.depthMask(false);
  // gl.frontFace(gl.CW);
  // gl.enable(gl.CULL_FACE);
  // gl.enable(gl.DEPTH_TEST)

  //Set up shader
  scene.shader.uniforms.worldToClip = worldToClip;
  scene.shader.uniforms.clipToWorld = clipToWorld;
  scene.shader.uniforms.camera_distance = camera.distance;
  scene.shader.uniforms.camera_eye = getEye(eye, clipToWorld);

  resolution[0] = gl.canvas.width;
  resolution[1] = gl.canvas.height;
  scene.shader.uniforms.resolution = resolution;
  scene.shader.uniforms.ops = scene.opsTexture.bind();
  scene.shader.uniforms.time = Date.now() - start;

  scene.render();

  vao.bind();
  vao.draw(gl.TRIANGLES, 6);
  vao.unbind();
  gl.stop();
}

function handleMouse(e) {

  gl.start();

  switch (e.type) {
    case 'mousedown':
      mouse.down = true;
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
        // TODO: pre-allocate these vectors to avoid gc hickups
        camera.rotate(
          [x/w - .5, y/h - .5],
          [l[0]/w - .5, l[1]/h - .5]
        )
      }

      camera.view(view);

      eye = getEye(eye, view);

      mouse.pos[0] = x;
      mouse.pos[1] = y;
      mouse.pick = [x, gl.canvas.height - y];

      var rayDirection = vec3.unproject(
        mouse.far,
        mouse.pick,
        1,
        view,
        projection,
        scene.viewport
      );

      for (var i = 0; i < scene.displayedObjects.length; i++) {
        scene.displayedObjects[i].selected = false;
      }

      vec3.normalize(rayDirection, rayDirection)
      var shapeIndex = scene.march(eye, rayDirection, 64);
      if (-1 !== shapeIndex) {
        scene.displayedObjects[shapeIndex].selected = true;
      }

      scene.dirty();
    break;

    case 'mousewheel':
      var worldBounds = scene.getAABB();
      var d = 1.0 / vec3.distance(worldBounds[0], worldBounds[1]);
      camera.zoom(e.wheelDeltaY * -.001 / d);
      e.preventDefault();
    break;

    // TODO: eliminate new array creation below
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
