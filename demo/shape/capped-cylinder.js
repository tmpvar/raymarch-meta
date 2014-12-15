var inherits = require('inherits');
var vec3 = require('gl-vec3');
var vec2 = require('gl-vec2');
var printf = require('printf');

var Shape = require('../shape');
var define = require('../util/define');

require('../util/vec2-abs');

var min = Math.min;
var max = Math.max;

var v2height = [0, 0];
var v2scratch = [0, 0];
var v3scratch = [0, 0, 0];
var v3pos = [0, 0, 0];
var zero = [0, 0, 0];

module.exports = CappedCylinder;

function CappedCylinder(radius, height) {

  define(this, 'radius', radius);
  define(this, 'height', height);

  Shape.call(this);

  this.name = 'cappedcylinder_' + this.id;
}

inherits(CappedCylinder, Shape);

CappedCylinder.prototype.evaluateVec3 = function cappedCylinderEvaluateVec3(vec) {
  this._dirty && this.tick();

  v3pos[0] = 0;
  v3pos[1] = 0;
  v3pos[2] = 0;

  vec3.transformMat4(vec, vec, this.invertedModel);


  vec3.subtract(v3pos, vec, v3pos);

  // this order matters.
  v2height[0] = this.radius;

  // the algorithm below works on symmetry, so when we say
  // 1 unit tall, it thinks 1.0..-1.0.  By dividing it in
  // half we get back to sanity.
  v2height[1] = this.height * 0.5;

  v2scratch[0] = vec2.length([v3pos[0], v3pos[2]]);
  v2scratch[1] = v3pos[1];

  vec2.subtract(
    v2scratch,
    vec2.abs(v2scratch, v2scratch),
    v2height
  );

  return min(
    max(v2scratch[0] ,v2scratch[1]), 0.0) +
    vec2.length(vec2.max(v2scratch, v2scratch, zero)
  );
};

CappedCylinder.prototype.computeAABB = function cuboidComputeAABB() {
  var r = this.radius;
  var h = this.height * 0.5;

  return this.computeTransformedAABB(
    -r, -h, -r,
     r,  h,  r
  );
};

Object.defineProperty(CappedCylinder.prototype, 'prefetchCode', {
  get : function getCappedCylinderPrefetchCode() {
    return [
      this.invertedMatrixString(),
      printf(
        '  vec2 %s_dimensions = vec2(sample(%i, %i), sample(%i, %i));\n',
        this.name,
        this.radius.position[0],
        this.radius.position[1],
        this.height.position[0],
        this.height.position[1]
      )
    ].join('\n')
  }
});

Object.defineProperty(CappedCylinder.prototype, 'code', {
  get : function getCappedCylinderCode() {
    return printf(
      '    float %s = solid_capped_cylinder(vec4(%s_inv * pos4).xyz, %s_dimensions);\n',
      this.name,
      this.name,
      this.name
    );
  }
});
