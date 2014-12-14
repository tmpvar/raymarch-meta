var inherits = require('inherits');
var printf = require('printf');

var Shape = require('../../shape');
var aabb = require('../../util/aabb');

var max = Math.max;

module.exports = Cut;

function Cut(target, cutters) {
  var shapes = [target];

  if (cutters) {
    if (!Array.isArray(cutters)) {
      cutters = [cutters];
    }

    shapes.push.apply(shapes, cutters);
  }

  this.target = target;
  this.cutters = cutters;
  this.shapes = shapes;

  Shape.call(this);

  this.name = 'cut_' + this.id;
}

inherits(Cut, Shape);

Cut.prototype.prefetchCode = '';

Cut.prototype.computeAABB = function unionComputeAABB() {
  // noop for now, consider implementing cut in aabb.js
};

Cut.prototype.evaluateVec3 = function unionEvaluateVec3(vec) {
  var r = this.target.evaluateVec3(vec);

  // pass through if there is nothing to cut with
  if (!this.cutters) {
    return r;
  }

  var shapes = this.cutters;
  var l = shapes.length;

  for (var i=0; i<l; i++) {
    r = max(r, -shapes[i].evaluateVec3(vec));
  }

  return r;
};

Object.defineProperty(Cut.prototype, 'code', {
  get : function getCutShaderCoder() {
    return [
      printf('float %s = %s;', cut.name, first.name)
    ].concat(

      shapes.map(function(shape) {
        if (!shape.name) { return false}
        return printf(
          '%s = max(-%s, %s);',
          cut.name,
          cut.name,
          shape.name
        );
      }).filter(Boolean)

    ).join('\n    ') + '\n'
  }
});

Object.defineProperty(Cut.prototype, 'bounds', {
  get : function getCutShaderCoder() {
    return this.target.bounds
  },
  set : function() {}
});

