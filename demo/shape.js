var aabb = require('./util/aabb');

module.exports = Shape;

// put these below the exports to avoid recursion

var Cut = require('./shape/op/cut');
var Intersect = require('./shape/op/intersect');
var Union = require('./shape/op/union');

var Mat4 = require('./util/ops-mat4');


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
Shape.prototype.model = null;

Shape.prototype.createModelMatrix = function shapeCreateModelMatrix(array) {
  this.model = new Mat4(array);
}

// test if this shape contains the passed vec
// vec is an array e.g. [1, 2, 3]
// return boolean
Shape.prototype.containsVec3 = function shapeContainsVec3(vec) {
  return aabb.contains(this.bounds, vec) &&
         this.evaluateVec3(vec) < 0;
};

Shape.prototype.cut = function shapeCutShapes(shapes) {
  return new Cut(this, shapes);
};

Shape.prototype.union = function shapeUnionShapes(shapes) {
  shapes = (Array.isArray(shapes)) ? shapes : [shapes];
  return new Union(shapes.concat(this));
};

Shape.prototype.intersect = function shapeIntersectShapes(shapes) {
  shapes = (Array.isArray(shapes)) ? shapes : [shapes];
  return new Intersect(shapes.concat(this));
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
