var mat4 = require('gl-mat4');
var vec3 = require('gl-vec3');
var aabb = require('./util/aabb');
var printf = require('printf');
var Mat4 = require('./util/ops-mat4');

module.exports = Shape;

// put these below the exports to avoid recursion

var Cut = require('./shape/op/cut');
var Intersect = require('./shape/op/intersect');
var Union = require('./shape/op/union');

var hi = [0, 0, 0];
var lo = [0, 0, 0];
var v3scratch = [0, 0, 0]

function Shape() {
  this.id = Shape.createShapeId()
  this.model = mat4.create();
  this.invertedModel = mat4.create();
  this.bounds = aabb.create();
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
  mat4.invert(this.invertedModel, this.model);
  this._dirty = false;
}

Shape.prototype.rotate = function shapeRotate(xrads, yrads, zrads) {
  mat4.rotateX(this.model, this.model, xrads);
  mat4.rotateY(this.model, this.model, yrads);
  mat4.rotateZ(this.model, this.model, zrads);

  this.dirty();

  return this;
}

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

// evaluate the shape's equation (signed distance field) at vec
// returns scalar (<0 inside, 0 on boundary, >0 outside)
Shape.prototype.evaluateVec3 = notImplemented;

// the Shape constructor will initialize an infinite bounding box
// in instantiation (located at this.bounds)
Shape.prototype.computeAABB = notImplemented;

Shape.prototype.computeTransformedAABB = function shapeComputeTransformedAABB(a,b,c,d,e,f) {
  if (!this.bounds) {
    throw new Error('shape does not implement computeAABB:' + this.name);
  }

  lo[0] = a;
  lo[1] = b;
  lo[2] = c;

  hi[0] = d;
  hi[1] = e;
  hi[2] = f;

  // reset the aabb
  aabb.initialize(this.bounds);

  vec3.transformMat4(lo, lo, this.model);
  vec3.transformMat4(hi, hi, this.model);

  aabb.update(this.bounds, lo);
  aabb.update(this.bounds, hi);
  return this.bounds;
};

function notImplemented() {
  throw new Error('not implemented');
}


Object.defineProperty(Shape.prototype, 'shapeColorCode', {
  get: function getShapeColor() {
    return printf(
    '    float q_%i = float(h == %s);\n',
      this.id,
      this.name
    ) + printf('    color = mix(color, color_%i, q_%i);\n',
      this.id,
      this.id
    );
  }
});
