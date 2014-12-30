var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var getEye = require('./util/get-eye');

// expando the vec3 object with an unproject method
require('./util/vec3-unproject');

var fs = require('fs');
var varargs = require('varargs');
var Scene = require('./scene')
var cmd = require('./commands')
var ndarray = require('ndarray');
var stats = new (require('./util/stats.min'))();
var createRayMarcher = require('./pyramid-march');
var createFBO = require('gl-fbo');

stats.setMode(1);
stats.domElement.style.position = 'absolute';
stats.domElement.style.zIndex = '100';
stats.domElement.style.right = '0px';
stats.domElement.style.bottom = '0px';
document.body.appendChild( stats.domElement );

var model = mat4.create();
var projection = mat4.create();


var aabb = require('./util/aabb');
var mouse = {
  down: false,
  pos: [0, 0],
  far: [0, 0, 0],
  pick: [0, 0]
};

var eye = [0, 0, 0];

var camera = require('orbit-camera')(
  [0, 0, -6],
  [0, 0, 0],
  [0, 1, 0]
);

var vert = fs.readFileSync(__dirname + '/shader/vert.glsl', 'utf8');
var frag = fs.readFileSync(__dirname + '/shader/frag.glsl', 'utf8');
var fragDepth = fs.readFileSync(__dirname + '/shader/depth.frag.glsl', 'utf8');
var fragDebug = fs.readFileSync(__dirname + '/shader/debug.frag.glsl', 'utf8');
var fragInit = fs.readFileSync(__dirname + '/shader/init.frag.glsl', 'utf8');

var fc = require('fc');

var gl = fc(render, false, 3);

if (!gl) {
  throw new Error('could not initialize webgl');
}

var scene = window.scene = new Scene(gl, vert);

var sphere = cmd.sphere(0.5, 0.1,0.1,1.0).translate(0.0,0.0,0.0);
/*
var sphere2 = cmd.sphere(0.5, 0.1,0.5,0.9).translate(0.0, 2.5, 0.0);
var sphere3 = cmd.sphere(0.3, 0.6,0.1,0.3).translate( 0.40,3.0,0.0);
var sphere4 = cmd.sphere(0.3, 0.9,0.6,0.3).translate(-0.40,3.0,0.0);
*/
var cyl = cmd.cylinder(1.0,0.5,0.5, 0.3,0.4,0.5).translate(0.0,5.5,0.0);
var box = cmd.cube(0.3, 0.5,0.6,0.7).translate(0.0,0.4,0.0);
var box2 = cmd.box(2.0,2.0,0.75, 1.0,0.1,0.1).translate(0.0,2.5,-0.25);
var tor = cmd.torus(0.3,0.1, 0.7,0.2,0.5).translate(0.9,0.5,0.4);

// var cut1 = cmd.cut(cyl, box);
// var cut2 = cmd.cut(sphere, box);

// var mouseCut = sphere2.union([sphere3, sphere4]).cut(box2);
// var isect = cmd.box(1, .25, 1).translate(0, 1, 0).intersect(
//   cmd.sphere(0, .75, 0, .5)
// );

// scene.display([mouseCut, tor, cyl, box, isect]);

scene.display([sphere, /*sphere2, sphere3, sphere4,*/ tor, cyl, box, box2]);
//scene.display([sphere, tor]);

window.camera = camera;

var viewport = [0, 0, 0, 0];

var bounds = scene.getAABB();

camera.center[0] = bounds[0][0] + (bounds[1][0] - bounds[0][0])/2;
camera.center[1] = bounds[0][1] + (bounds[1][1] - bounds[0][1])/2;
camera.center[2] = bounds[0][2] + (bounds[1][2] - bounds[0][2])/2;

var rayMarch = createRayMarcher(gl);

var debugShader = scene.createShader(scene.generateFragShader(null, fragDebug));
var initShader = scene.createShader(scene.generateFragShader(null, fragInit));
var depthShader = scene.createShader(scene.generateFragShader(null, fragDepth));
var fragShader = scene.createShader(scene.generateFragShader(null, frag));

gl.start();
viewport[2] = gl.canvas.width = window.innerWidth;
viewport[3] = gl.canvas.height = window.innerHeight;


var start = Date.now();
var v2scratch = [0, 0];
function createStage(viewport, scale, scene, camera, shader, renderToScreen) {
  return [
    createFBO(gl, [
      Math.ceil((viewport[2] - viewport[0]) * scale),
      Math.ceil((viewport[3] - viewport[1]) * scale)
    ], {
      float: true,
      depth: false,
    }),
    viewport, scale, scene, camera, shader, renderToScreen
  ];
}

var stage = 0;
var stages = [
 // comment this out and it works......
 // createStage(viewport, 1/2, scene, camera, initShader),
 // createStage(viewport, 1/16, scene, camera, depthShader),
 // createStage(viewport, 1/100, scene, camera, depthShader),
 // createStage(viewport, 1/128, scene, camera, depthShader),
 createStage(viewport, 1/64, scene, camera, depthShader),
 createStage(viewport, 1/32, scene, camera, depthShader),
 createStage(viewport, 1/16, scene, camera, depthShader),
 createStage(viewport, 1/8, scene, camera, depthShader),
 createStage(viewport, 1/4, scene, camera, depthShader),
 createStage(viewport, 1/2, scene, camera, depthShader),
 // createStage(viewport, 1, scene, camera, depthShader, true),

 createStage(viewport, 1, scene, camera, fragShader),
 createStage(viewport, 1, scene, camera, debugShader, true),
];

function render() {

  viewport[2] = gl.canvas.width;
  viewport[3] = gl.canvas.height;

  stats.end();
  stats.begin();

  var fbo = null;
  stages.forEach(function(s) {
    s[5].bind();
    scene.render(s[5]);

    fbo = rayMarch.apply(null, s);
  });

  // gl.stop();
}


function handleMouse(e) {

  // gl.start();
  //scene.dirty();

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

        scene.dirty();
      }
      //scene.dirty();

      mouse.pos[0] = x;
      mouse.pos[1] = y;

return;
      camera.view(view);

      eye = getEye(eye, view);

      mouse.pick = [x, gl.canvas.height - y];

      mat4.perspective(
        projection,
        Math.PI/4.0,
        gl.canvas.width/gl.canvas.height,
        0.1,
        1000.0
      );

      var rayDirection = vec3.unproject(
        mouse.far,
        mouse.pick,
        1,
        view,
        projection,
        viewport
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
      scene.dirty();
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
