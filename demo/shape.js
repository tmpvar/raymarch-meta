var aabb = require('../aabb');

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
  // return true if the vec3

  return this.bounds.contains(vecArray) &&
         this.evaluate(vecArray) < 0;
};

// evaluate the shape's equation (signed distance field) at vec
// returns scalar (<0 inside, 0 on boundary, >0 outside)
Shape.prototype.evaluateVec3 = notImplemented;

// the Shape constructor will initialize an infinite bounding box
// in instantiation (located at this.bounds)
Shape.prototype.computeAABB = notImplemented;

// args: vec3 origin, vec3 direction
// returns vec3 (e.g. [1, 2, 3])
Shape.prototype.containsRay = notImplemented;

function notImplemented() {
  throw new Error('not implemented');
}
