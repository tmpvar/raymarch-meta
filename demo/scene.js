var createShader = require('gl-shader-core');
var vec3 = require('gl-vec3');
var mat4 = require('gl-mat4');
var createTexture = require('gl-texture2d');
var printf = require('printf');
var aabb = require('./util/aabb');
var alloc = require('./util/allocator');

var min = Math.min;
var max = Math.max;

module.exports = Scene;

function Scene(gl, vert, frag) {
  this.vert = vert;
  this.frag = frag;

  this.gl = gl;

  this.raymarch = {
    CYCLES: 128
  };

  this.scale = [1,1,1];

  this.vertSource = vert;
  this.fragSource = frag;

  this._bounds = [[0, 0, 0], [0, 0, 0]];
  this.dirtyBounds = false;
  this.viewport = [0, 0, 300, 200];

  this.initGL(gl);

  this.displayedObjects = null;

  var scene = this;
  alloc.dirty(function(v, x, y) {
    scene.dirty();
  });
}


Scene.prototype._dirty = false;
Scene.prototype.dirty = function() {
  this.gl && this.gl.dirty();
  this._dirty = true;
}

Scene.prototype.initGL = function initializeGL(gl) {
  this.opsTexture = createTexture(gl, alloc.ops);
  this.shader = this.createShader();
}

var v3temp = [0, 0, 0];
Scene.prototype.march = function(rayOrigin, rayDirection) {
  if (!this.displayedObjects || !this.displayedObjects.length) {
    return;
  }

  var rayPosition = vec3.clone(rayOrigin);

  // attempt a march
  var dist = 0;

  var shapes = this.displayedObjects.filter(function(shape) {
    return !!shape.evaluateVec3
  });

  var l = shapes.length;
  var eps = 1/this.raymarch.CYCLES;
  for (var step = 0; step<this.raymarch.CYCLES; step++) {

    var h = Infinity;
    for (var i=0; i<l; i++) {
      h = min(h, shapes[i].evaluateVec3(rayPosition));

      if (h<eps) {
        break;
      }
    }

    if (h < eps) {
//      console.log('hit on shape %i (%f)', i, dist, shapes[i]);
//      break;
      //return shapes[i];
      return i;
    }

    dist += h;
    v3temp[0] = rayDirection[0] * dist;
    v3temp[1] = rayDirection[1] * dist;
    v3temp[2] = rayDirection[2] * dist;

    vec3.add(rayPosition, v3temp, rayOrigin);
  }

  return -1; // no shape found
}

Scene.prototype.createShader = function(frag) {
  if (!frag) {
    return;
  }

  this.dirty()
  if (this.shader) {
    this.shader.dispose();
  }

  try {
    this.shader = createShader(
      this.gl,
      this.vertSource,
      frag,
      [
        { name: 'worldToClip', type: 'mat4' },
        { name: 'clipToWorld', type: 'mat4' },
        { name: 'ops', type: 'sampler2D' },
        { name: 'camera_eye', type: 'vec3' },
        { name: 'resolution', type: 'vec2' },
        { name: 'time', type: 'float' },

      ],
      [{ name: 'position', type: 'vec3' }]
    );
  } catch (e) {
    console.log(frag);
    console.error(e.message);
  }

  return this.shader;
}

Scene.prototype.getAABB = function() {
  if (this.dirtyBounds) {
    var bounds = this._bounds;
    var shapes = this.shapes;
    aabb.initialize(bounds);

    for (var i=0; i<shapes.length; i++) {
      var sbounds = shapes[i].bounds;
      if (!sbounds) {
        continue;
      }
      aabb.update(bounds, sbounds[0]);
      aabb.update(bounds, sbounds[1]);
    }

    this.dirtyBounds = false;
  }
  return this._bounds;
}

Scene.prototype.display = function sceneDisplay(shapes) {
  if (!Array.isArray(shapes)) {
    shapes = [shapes];
  }

  this.displayedObjects = shapes;

  var shaderSource = this.generateFragShader(shapes.concat({
    get code() {
      // merge the results into h as a pseudo-union
      return '    ' + shapes.map(function(shape) {

        var x =
//        + printf('if (%s < h) { color = color_%s; }\n',
//          shape.name,
//          shape.id)

          printf('    if (%s < h) { color = perform_selection(color_%s, %s_selected); }\n',
          shape.name,
          shape.id,
          shape.name)

      + printf('    h = min(h, %s);\n', shape.name);


        return x;
      }).join('\n    ')
    }
  }));

  this.createShader(shaderSource);
}

Scene.prototype.generateFragShader = function(shapes) {
  var l = shapes.length;
  var colorStr = '';
  var shapeStr = '';
  var prefetchStr = '';
  aabb.initialize(this._bounds);

  this.activeShapes = [];

  var handledChildren = {};
  var seenIds = {};
  var stack = shapes.slice().reverse();
  while(stack.length) {
    var last = stack.length-1;
    if (!stack[last]) {
      stack.pop();
      continue;
    }

    if (stack[last].shapes && !handledChildren[stack[last].id]) {
      handledChildren[stack[last].id] = true;
      stack.push.apply(stack, stack[last].shapes.slice().reverse());
    } else {
      var shape = stack.pop();

      if (!shape) {
        continue;
      }
      // let's keep track of the active shapes
      this.activeShapes.push(shape);
      if (!seenIds[shape.id]) {
        colorStr += shape.colorCode || '';
        prefetchStr += shape.prefetchCode || '';
        shapeStr += shape.code || '';

        shape.bounds && aabb.merge([shape.bounds], this._bounds);
        seenIds[shape.id] = true;
      }
    }
  }

  var frag = this.fragSource.replace('/* RAYMARCH_COLOR */', colorStr);
  frag = frag.replace('/* RAYMARCH_SETUP */', prefetchStr);
  frag = frag.replace('/* RAYMARCH_OPS */', shapeStr);
  frag = frag.replace(/\/\* OPS_SIZE \*\//g, alloc.variableMapSize.toFixed(1));

  var raymarchDefines = this.raymarch;
  Object.keys(raymarchDefines).forEach(function(key) {
    var exp = new RegExp('\\/\\* RAYMARCH_' + key + ' \\*\\/', 'g');
    frag = frag.replace(exp, raymarchDefines[key]);
  });

  console.log('frag:', frag);

  return frag;
}

Scene.prototype.render = function renderScene() {

  if (true || this._dirty) {

    // run through the active shapes and give them
    // some time to do last chance processing
    var shapes = this.activeShapes;
    var l = shapes.length;

    for (var i = 0; i<l; i++) {
      if (shapes[i].tick) {
        shapes[i].tick();
      }
    }

    // TODO: only upload changes
    this.opsTexture.setPixels(alloc.ops);
    this._dirty = false;
  }
}
