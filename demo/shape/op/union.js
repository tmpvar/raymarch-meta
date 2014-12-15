var inherits = require('inherits');
var vec3 = require('gl-vec3');
var printf = require('printf');

var Shape = require('../../shape');
var aabb = require('../../util/aabb');

var min = Math.min;

module.exports = Union;

function Union(shapes) {

  if (!Array.isArray(shapes)) {
    shapes = [shapes];
  }

  this.shapes = shapes;

  Shape.call(this);

  this.name = 'union_' + this.id;
}

inherits(Union, Shape);

Union.prototype.prefetchCode = '';

Union.prototype.computeAABB = function unionComputeAABB() {
  aabb.merge(this.shapes.map(function(shape) {
    return shape.bounds
  }).filter(Boolean), this.bounds);

  return this.computeTransformedAABB(
    this.bounds[0][0], this.bounds[0][1], this.bounds[0][2],
    this.bounds[1][0], this.bounds[1][1], this.bounds[1][2]
  );
};

Union.prototype.evaluateVec3 = function unionEvaluateVec3(vec) {
  this._dirty && this.tick();

  vec3.transformMat4(vec, vec, this.invertedModel);

  var r = Infinity;
  var shapes = this.shapes;
  var l = shapes.length;

  for (var i=0; i<l; i++) {
    r = min(r, shapes[i].evaluateVec3(vec));
  }

  return r;
};

Object.defineProperty(Union.prototype, 'code', {
  get : function getUnionShaderCode() {
    var shapes = this.shapes.filter(function(s) {
      return !!s.name;
    });

    var first = shapes.shift();
    var union = this;

    return '\n    ' + [
      printf('float %s = %s;', union.name, first.name),
    ].concat(
      shapes.map(function(shape) {
        return printf('%s = min(%s, %s);', union.name, union.name, shape.name);
      }).filter(Boolean)
    ).join('\n    ') + '\n'
  }
});
