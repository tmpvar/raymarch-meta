var inherits = require('inherits');
var printf = require('printf');

var Shape = require('../../shape');
var aabb = require('../../util/aabb');

var max = Math.max;

module.exports = Intersect;

function Intersect(shapes) {
  if (!Array.isArray(shapes)) {
    shapes = [shapes];
  }

  this.shapes = shapes;

  Shape.call(this);
}

inherits(Intersect, Shape);

Intersect.prototype.prefetchCode = '';

// TODO: add aabb.Intersect

Intersect.prototype.computeAABB = function intersectComputeAABB() {
  aabb.merge(this.shapes.map(function(shape) {
    return shape.bounds
  }).filter(Boolean), this.bounds);
};

Intersect.prototype.evaluateVec3 = function intersectEvaluateVec3(vec) {

  var r = -Infinity;
  var shapes = this.shapes;
  var l = shapes.length;

  for (var i=0; i<l; i++) {
    r = max(r, shapes[i].evaluateVec3(vec));
  }

  return r;
}

Object.defineProperty(Intersect.prototype, 'code', {
  get : function getIntersectShaderCode() {
    var shapes = this.shapes.filter(function(s) {
      return !!s.name;
    });

    var first = shapes.shift();
    var union = this;

    return '\n    ' + [
      printf('float %s = %s;', union.name, first.name),
    ].concat(
      shapes.map(function(shape) {
        return printf('%s = max(%s, %s);', union.name, union.name, shape.name);
      }).filter(Boolean)
    ).join('\n    ') + '\n'
  }
});

