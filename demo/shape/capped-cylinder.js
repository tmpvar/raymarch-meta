var inherits = require('inherits');
var vec3 = require('gl-vec3');
var vec2 = require('gl-vec2');
var printf = require('printf');

var Shape = require('../shape');

module.exports = CappedCylinder;

function CappedCylinder(center, radius, height) {
  this.center = center;
  this.radius = radius;
  this.height = height;

  Shape.call(this);

  this.name = 'cappedcylinder_' + this.id;
}

inherits(CappedCylinder, Shape);

var abs = function (a) {
  return vec2.create( Math.abs(a[0]), Math.abs(a[1]) );
};

CappedCylinder.prototype.evaluateVec3 = function cappedCylinderEvaluateVec3(vec) {
  var d = vec2.create();

  vec2.subtract(d,
    abs(
      vec2.create(
        vec2.distance(this.center[0], this.center[2]),
        this.center[1])),
      this.height);

  var tempy = vec2.create();
  var home = vec2.create();

  vec2.max(tempy, d,
    vec2.create()
  );
  return Math.min(Math.max(d[0], d[1]), 0.0) + vec2.distance(tempy, home);
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