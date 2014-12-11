var aabb = require('../aabb');

module.exports = Shape;

function Shape() {
  this.id = Shape.createShapeId()
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
// returns scalar
Shape.prototype.evaluateVec3 = function evaluateVec3(vec) {
  return 0;
};

// TODO: evaluateRay(vec3 origin, vec3 direction)
