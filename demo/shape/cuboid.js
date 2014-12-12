var inherits = require('inherits');
var vec3 = require('gl-vec3');
var printf = require('printf');

var Shape = require('../shape');

module.exports = Cuboid;

function Cuboid(center, dimensions) {
  this.center = center;
  this.dimensions = dimensions;

  Shape.call(this);

  this.name = 'cuboid_' + this.id;
}

inherits(Cuboid, Shape);

Cuboid.prototype.evaluateVec3 = function cuboidEvaluateVec3(vec) {
  return 0; // vec3.distance(this.center, vec) - this.radius; // XXX: implement me!
};

Cuboid.prototype.computeAABB = function cuboidComputeAABB() {
  this.bounds[0][0] = this.center[0];
  this.bounds[0][1] = this.center[1];
  this.bounds[0][2] = this.center[2];

  this.bounds[1][0] = this.center[0] + this.dimensions[0];
  this.bounds[1][1] = this.center[1] + this.dimensions[1];
  this.bounds[1][2] = this.center[2] + this.dimensions[2];
};

Object.defineProperty(Cuboid.prototype, 'prefetchCode', {
  get: function getCuboidPrefetchCode() {
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
      '  float Wpf_%i = sample(%i, %i);\n',
      this.id,
      this.dimensions[0].position[0],
      this.dimensions[0].position[1])

    + printf(
      '  float Hpf_%i = sample(%i, %i);\n',
      this.id,
      this.dimensions[1].position[0],
      this.dimensions[1].position[1])

    + printf(
      '  float Dpf_%i = sample(%i, %i);\n',
      this.id,
      this.dimensions[2].position[0],
      this.dimensions[2].position[1])
  }
});

Object.defineProperty(Cuboid.prototype, 'code', {
  get: function getCuboidCode() {
    return printf(
      '    float %s = signed_box_distance(position - vec3(Xpf_%i, Ypf_%i, Zpf_%i), vec3(Wpf_%i, Hpf_%i, Dpf_%i) );\n',
      this.name,
      this.id,
      this.id,
      this.id,
      this.id,
      this.id,
      this.id
    );
  }
});