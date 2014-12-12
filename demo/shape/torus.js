var inherits = require('inherits');
var vec3 = require('gl-vec3');
var printf = require('printf');

var Shape = require('../shape');

module.exports = Torus;

function Torus(center, radiusMajor, radiusMinor) {
  this.center = center;
  this.radiusMajor = radiusMajor;
  this.radiusMinor = radiusMinor;

  Shape.call(this);

  this.name = 'torus_' + this.id;
}

inherits(Torus, Shape);

Torus.prototype.evaluateVec3 = function torusCylinderEvaluateVec3(vec) {
  return 0; // vec3.distance(this.center, vec) - this.radius; // XXX: implement me!
};

Torus.prototype.computeAABB = function torusComputeAABB() {
  var hr = this.radiusMajor + this.radiusMinor; // horizontal radius (overall)
  this.bounds[0][0] = this.center[0] - hr
  this.bounds[0][1] = this.center[1] - this.radiusMinor;
  this.bounds[0][2] = this.center[2] - hr;

  this.bounds[1][0] = this.center[0] + hr;
  this.bounds[1][1] = this.center[1] + this.radiusMinor;
  this.bounds[1][2] = this.center[2] + hr;
};

Object.defineProperty(Torus.prototype, 'prefetchCode', {
  get: function getTorusPrefetchCode() {
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
      this.radiusMajor.position[0],
      this.radiusMajor.position[1])

    + printf(
      '  float rpf_%i = sample(%i, %i);\n',
      this.id,
      this.radiusMinor.position[0],
      this.radiusMinor.position[1])
  }
});

Object.defineProperty(Torus.prototype, 'code', {
  get: function getTorusCode() {
    return printf(
      '    float %s = solid_torus(position - vec3(Xpf_%i, Ypf_%i, Zpf_%i), vec2(Rpf_%i, rpf_%i) );\n',
      this.name,
      this.id,
      this.id,
      this.id,
      this.id,
      this.id
    );
  }
});