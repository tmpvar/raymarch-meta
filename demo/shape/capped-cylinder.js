var inherits = require('inherits');
var vec3 = require('gl-vec3');
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

CappedCylinder.prototype.evaluateVec3 = function cappedCylinderEvaluateVec3(vec) {
  return 0; // vec3.distance(this.center, vec) - this.radius; // XXX: implement me!
};

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