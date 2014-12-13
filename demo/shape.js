var aabb = require('./util/aabb');

var vec3 = require('gl-vec3');
var vec2 = require('gl-vec2');

module.exports = Shape;

function Shape() {
  this.id = Shape.createShapeId()
  this.bounds = aabb.create();
  this.computeAABB();
}

Shape.id = 0;
Shape.createShapeId = function createShapeId() {
  return Shape.id++;
}

Shape.prototype.id = 0;

// test if this shape contains the passed vec
// vec is an array e.g. [1, 2, 3]
// return boolean
Shape.prototype.containsVec3 = function shapeContainsVec3(vec) {
  return aabb.contains(this.bounds, vec) &&
         this.evaluateVec3(vec) < 0;
};

Shape.prototype.abs3 = function (a) { // XXX: not the right place for this - maybe extend vec3?
  var tmp = vec3.create();
  tmp[0] = Math.abs(a[0]);
  tmp[1] = Math.abs(a[1]);
  tmp[2] = Math.abs(a[2]);

  return tmp;
};

Shape.prototype.abs2 = function (a) {
  var tmp = vec2.create();
  tmp[0] = Math.abs(a[0]);
  tmp[1] = Math.abs(a[1]);

  return tmp;
};

// evaluate the shape's equation (signed distance field) at vec
// returns scalar (<0 inside, 0 on boundary, >0 outside)
Shape.prototype.evaluateVec3 = notImplemented;

// the Shape constructor will initialize an infinite bounding box
// in instantiation (located at this.bounds)
Shape.prototype.computeAABB = notImplemented;

function notImplemented() {
  throw new Error('not implemented');
}
