var mat4 = require('gl-mat4');
var aabb = require('./util/aabb');
var printf = require('printf');
var Mat4 = require('./util/ops-mat4');

module.exports = Shape;

// put these below the exports to avoid recursion

var Cut = require('./shape/op/cut');
var Intersect = require('./shape/op/intersect');
var Union = require('./shape/op/union');



function Shape() {
  this.id = Shape.createShapeId()
  this.model = mat4.create();
  this.invertedModel = mat4.create();
  this.computeAABB();
}

Shape.id = 0;
Shape.createShapeId = function createShapeId() {
  return Shape.id++;
}

Shape.prototype.id = 0;
Shape.prototype.model = null;

Shape.prototype._dirty = true;
Shape.prototype.dirty = function() {
  this._dirty = true;
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

Shape.prototype.tick = function() {
  this.invertedModel && mat4.invert(this.invertedModel, this.model);
  this._dirty = false;
}

Shape.prototype.rotate = function shapeRotate(xrads, yrads, zrads) {
  mat4.rotateX(this.model, this.model, xrads);
  mat4.rotateY(this.model, this.model, yrads);
  mat4.rotateZ(this.model, this.model, zrads);

  this.dirty();

  return this;
}

var v3scratch = [0, 0, 0]

Shape.prototype.scale = function shapeScale(x, y, z) {
  v3scratch[0] = x;
  v3scratch[1] = y;
  v3scratch[2] = z;

  mat4.scale(this.model, this.model, v3scratch);

  this.dirty();

  return this;
};

Shape.prototype.translate = function shapeTranslate(x, y, z) {
  v3scratch[0] = x;
  v3scratch[1] = y;
  v3scratch[2] = z;

  mat4.translate(this.model, this.model, v3scratch);

  this.dirty();

  return this;
};

Shape.prototype.invertedMatrixString = function shapeInvertedMatrixStr() {
  var m = this.invertedModel;

  // TODO: gracefully degrade back to the old behavior
  if (!m) {
    return '';
  }

  return '    ' + printf([
      'mat4 %s_inv = mat4(',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i),',
      '  sample(%i, %i)',
      ');'
    ].join('\n    '),
    this.name,
    m[0].position[0],
    m[0].position[1],
    m[1].position[0],
    m[1].position[1],
    m[2].position[0],
    m[2].position[1],
    m[3].position[0],
    m[3].position[1],
    m[4].position[0],
    m[4].position[1],
    m[5].position[0],
    m[5].position[1],
    m[6].position[0],
    m[6].position[1],
    m[7].position[0],
    m[7].position[1],
    m[8].position[0],
    m[8].position[1],
    m[9].position[0],
    m[9].position[1],
    m[10].position[0],
    m[10].position[1],
    m[11].position[0],
    m[11].position[1],
    m[12].position[0],
    m[12].position[1],
    m[13].position[0],
    m[13].position[1],
    m[14].position[0],
    m[14].position[1],
    m[15].position[0],
    m[15].position[1]
  );
}

// evaluate the shape's equation (signed distance field) at vec
// returns scalar (<0 inside, 0 on boundary, >0 outside)
Shape.prototype.evaluateVec3 = notImplemented;

// the Shape constructor will initialize an infinite bounding box
// in instantiation (located at this.bounds)
Shape.prototype.computeAABB = notImplemented;

function notImplemented() {
  throw new Error('not implemented');
}
