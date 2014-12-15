// shapes
var Sphere = require('./shape/sphere');
var Cuboid = require('./shape/cuboid');
var CappedCylinder = require('./shape/capped-cylinder');
var Torus = require('./shape/torus');

// ops
var Intersect = require('./shape/op/intersect');
var Union = require('./shape/op/union');
var Cut = require('./shape/op/cut');

// utils
var alloc = require('./util/allocator');
var mat4 = require('gl-mat4')

// helper method to allocate an array of
// tracked memory that is shared with the
// gpu
function allocArray(length, d) {
  var ret = Array(length);

  for (var i=0; i<length; i++) {
    ret[i] = alloc(d[i]);
  }

  return ret;
}

var commands = module.exports = {};
var m4default = mat4.create();

commands.sphere = function createSphere(x, y, z, radius, r, g, b, selected) {
  var s = new Sphere(
    alloc(x),
    alloc(y),
    alloc(z),
    alloc(radius),
    alloc(r),
    alloc(g),
    alloc(b),
    alloc(selected)
  );

  s.invertedModel = allocArray(16);

  return s;
};

commands.box = function createCuboid(x, y, z, width, height, depth, r, g, b, selected) {
  var s = new Cuboid(
    alloc(x),
    alloc(y),
    alloc(z),
    alloc(width, 0.5),
    alloc(height, 0.5),
    alloc(depth, 0.5),
    alloc(r),
    alloc(g),
    alloc(b),
    alloc(selected)
  );

  s.invertedModel = allocArray(16);

  return s;
};

commands.cube = function createCuboid(x, y, z, radius, r, g, b, selected) {
  var s = new Cuboid(
    alloc(x),
    alloc(y),
    alloc(z),
    alloc(radius, 0.5),
    alloc(radius, 0.5),
    alloc(radius, 0.5),
    alloc(r),
    alloc(g),
    alloc(b),
    alloc(selected)
  );

  s.invertedModel = allocArray(16);

  return s;
};

commands.cylinder = function(x, y, z, radius, height, r, g, b, selected) {
  var s = new CappedCylinder(
    alloc(x),
    alloc(y),
    alloc(z),
    alloc(radius),
    alloc(height),
    alloc(r),
    alloc(g),
    alloc(b),
    alloc(selected)
  );

  s.invertedModel = allocArray(16);

  return s;
};

commands.torus = function(x, y, z, radiusMajor, radiusMinor, r, g, b, selected) {
  var s = new Torus(
    alloc(x),
    alloc(y),
    alloc(z),
    alloc(radiusMajor),
    alloc(radiusMinor),
    alloc(r),
    alloc(g),
    alloc(b),
    alloc(selected)
  );

  s.invertedModel = allocArray(16);

  return s;
};

/*
  for boolean operators the main concern is how does
  the shader represent transforms after the fact.

  Taking some advice from livecad, every operation
  should return a shape.

  Now, the definition of a shape is quite lax and
  could be thought of as a unit of work on the gpu.

  When running evaluateVec3 on a Union object there
  should be no disparity. It needs to work exactly
  like a normal shape. To do this we invert the
  model matrix when performing child based
  evaluateVec3 calls. easy.

  In the shader however, the result of a boolean op
  is a float. Which means we need to duplicate the
  shapes involved before performing the actual
  boolean operation.

  It might be worth generating a new function per
  boolean operation in the shader generator code
  to account for this
*/

// TODO: what does a transform on a union look like?
commands.union = function(shapes) {
  return new Union(shapes);
}

// TODO: what does a transform on a cut look like?
commands.cut = function(target, cutters) {
  return new Cut(target, cutters);
};
