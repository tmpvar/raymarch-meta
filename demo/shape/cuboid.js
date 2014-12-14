var inherits = require('inherits');
var vec3 = require('gl-vec3');
require('../util/vec3-unproject');
var printf = require('printf');

var Shape = require('../shape');

var min = Math.min;
var max = Math.max;

var zero = [0,0,0];
module.exports = Cuboid;

function Cuboid(center, dimensions) {
  this.center = center;
  this.dimensions = dimensions;

  Shape.call(this);

  this.name = 'cuboid_' + this.id;
}

inherits(Cuboid, Shape);

Cuboid.prototype.evaluateVec3 = function cuboidEvaluateVec3(vec) {
  var d = vec3.create();
  var scaledDimensions = vec3.create();
  vec3.scale(scaledDimensions, this.dimensions, 0.5);
  vec3.subtract(d, vec3.abs(vec), scaledDimensions);

  var temp = vec3.create();
  vec3.max(temp, d, zero);
  return min(max(d[0], max(d[1], d[2])), 0.0) + vec3.distance(temp, zero);
};

/*
float signed_box_distance(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) +
         length(max(d,0.0));
}
*/

Cuboid.prototype.computeAABB = function cuboidComputeAABB() {
  var halfDimensions = vec3.create();
  vec3.scale(halfDimensions, this.dimensions, 0.5);

  this.bounds[0][0] = this.center[0] - halfDimensions[0];
  this.bounds[0][1] = this.center[1] - halfDimensions[1];
  this.bounds[0][2] = this.center[2] - halfDimensions[2];

  this.bounds[1][0] = this.center[0] + halfDimensions[0];
  this.bounds[1][1] = this.center[1] + halfDimensions[1];
  this.bounds[1][2] = this.center[2] + halfDimensions[2];
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