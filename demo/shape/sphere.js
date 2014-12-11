var inherits = require('inherits');
var vec3 = require('gl-vec3');

var Shape = require('../shape');

module.exports = Shere;

function Sphere(center, radius) {
  this.center = center;
  this.radius = radius;

  Shape.call(this);
}

inherits(Sphere, Shape);

Sphere.prototype.evaluateVec3 = function sphereEvaluateVec3(vec) {
  return this.radius - vec3.distance(this.center, vec3)
};

Sphere.prototype.computeAABB = function sphereComputeAABB() {
  this.bounds[0][0] = this.center[0] - this.radius;
  this.bounds[0][1] = this.center[1] - this.radius;
  this.bounds[0][2] = this.center[2] - this.radius;

  this.bounds[0][0] = this.center[0] - this.radius;
  this.bounds[0][1] = this.center[1] - this.radius;
  this.bounds[0][2] = this.center[2] - this.radius;
}
