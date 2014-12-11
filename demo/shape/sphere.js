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
