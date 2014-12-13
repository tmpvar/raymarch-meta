var inherits = require('inherits');
var vec3 = require('gl-vec3');
var vec2 = require('gl-vec2');
var printf = require('printf');

var Shape = require('../shape');

module.exports = CappedCylinder;

function CappedCylinder(center, radius, height) {
  this.center = center;
  this.radius = radius;
  this.height = height/2;

  Shape.call(this);

  this.name = 'cappedcylinder_' + this.id;
}

inherits(CappedCylinder, Shape);

var abs = function (out, a) {
  out[0] = Math.abs(a[0]);
  out[1] = Math.abs(a[1]);
  return out;
};

var min = Math.min;
var max = Math.max;

var v2height = [0, 0];
var v2scratch = [0, 0];
var zero = [0,0];

// check: scene.shapes[0].evaluateVec3([1, 1, 1])
CappedCylinder.prototype.evaluateVec3 = function cappedCylinderEvaluateVec3(vec) {
  // this order matters.
  v2height[0] = this.radius;
  v2height[1] = this.height;

  v2scratch[0] = vec2.length([vec[0], vec[2]]);
  v2scratch[1] = vec[1];

  vec2.subtract(v2scratch, abs(v2scratch, v2scratch), v2height);

  return min(
    max(v2scratch[0] ,v2scratch[1]), 0.0) +
    vec2.length(vec2.max(v2scratch, v2scratch, zero)
  );
};

/*
float solid_capped_cylinder(vec3 p, vec2 h) {
  vec2 d =
  abs(
    vec2(
      length(p.xz),
      p.y)
    ) - h;
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}
*/

CappedCylinder.prototype.computeAABB = function cuboidComputeAABB() {
  this.bounds[0][0] = this.center[0] - this.radius;
  this.bounds[0][1] = this.center[1] - this.height;
  this.bounds[0][2] = this.center[2] - this.radius;

  this.bounds[1][0] = this.center[0] + this.radius;
  this.bounds[1][1] = this.center[1] + this.height;
  this.bounds[1][2] = this.center[2] + this.radius;
};

Object.defineProperty(CappedCylinder.prototype, 'prefetchCode', {
  get: function getCappedCylinderPrefetchCode() {
    return printf(
      '  float Xpf_%i = sample(%i, %i);\n',
      this.id,
      this.center[0].position[0],
      this.center[0].position[1])

    + printf(
      '  float Ypf_%i = sample(%i, %i);\n',
      this.id,
      this.center[1].position[0],
      this.center[1].position[1])

    + printf(
      '  float Zpf_%i = sample(%i, %i);\n',
      this.id,
      this.center[2].position[0],
      this.center[2].position[1])


    + printf(
      '  float Rpf_%i = sample(%i, %i);\n',
      this.id,
      this.radius.position[0],
      this.radius.position[1])
    + printf(
      '  float Hpf_%i = sample(%i, %i);\n',
      this.id,
      this.height.position[0],
      this.height.position[1])
  }
});

Object.defineProperty(CappedCylinder.prototype, 'code', {
  get: function getCappedCylinderCode() {
    return printf(
      '    float %s = solid_capped_cylinder(position - vec3(Xpf_%i, Ypf_%i, Zpf_%i), vec2(Rpf_%i, Hpf_%i) );\n',
      this.name,
      this.id,
      this.id,
      this.id,
      this.id,
      this.id
    );
  }
});
