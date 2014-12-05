var mat4 = require('gl-mat4');
var createBuffer = require('gl-buffer');
var createTexture = require('gl-texture2d');
var createVAO = require('gl-vao');
var fs = require('fs');
var varargs = require('varargs');
var Scene = require('./scene')
var ndarray = require('ndarray');

var camera = require('orbit-camera')(
  [0, 0, 5],
  [0, 0, 0],
  [0, 1, 0]
);

var vert = fs.readFileSync(__dirname + '/vert.glsl', 'utf8');
var frag = fs.readFileSync(__dirname + '/frag.glsl', 'utf8');

var m4scratch = mat4.create();

var clear = require('gl-clear')({
  color : [ 17/255, 127/255, 34/255]
});

var fc = require('fc');

var gl = fc(render, false, 3);

if (!gl) {
  throw new Error('could not initialize webgl');
}

var vao = createVAO(gl, [{

  buffer: createBuffer(gl, [
    -1,  1, 0,
     1,  1, 0,
     1, -1, 0,

    -1,  1, 0,
     1, -1, 0,
    -1, -1, 0
  ]),
  size: 3
}]);

var scene = window.scene = new Scene(gl, vert, frag)
// scene.add(scene.createCircle(.1, .1, .1));
// scene.add(scene.createCircle(-.1, -.1, .1));
window.shapes = scene.shapes;


gl.start();
function render() {

  clear(gl);
  scene.shader.bind();
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  mat4.identity(m4scratch);
  scene.shader.uniforms.model = m4scratch;
  scene.shader.uniforms.projection = mat4.perspective(
    m4scratch,
    Math.PI/4.0,
    gl.canvas.width/gl.canvas.height,
    0.1,
    1000.0
  );
  scene.shader.uniforms.view = camera.view(m4scratch);

  scene.render();
  scene.shader.uniforms.ops = scene.opsTexture.bind();

  vao.bind();
  vao.draw(gl.TRIANGLES, 6);
  vao.unbind();
}


var mouse = {
  down: false,
  pos: [0, 0]
};

function handleMouse(e) {
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
      camera.zoom(e.wheelDeltaY * -.01);
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

