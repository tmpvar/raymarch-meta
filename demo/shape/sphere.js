var inherits = require('inherits');
var vec3 = require('gl-vec3');
var printf = require('printf');

var define = require('../util/define')
var Shape = require('../shape');
var v3pos = [0, 0, 0];

module.exports = Sphere;

function Sphere(x, y, z, radius) {
  define(this, 'x', x);
  define(this, 'y', y);
  define(this, 'z', z);
  define(this, 'radius', radius);

  Shape.call(this);

  this.name = 'sphere_' + this.id;
}

inherits(Sphere, Shape);

Sphere.prototype.evaluateVec3 = function sphereEvaluateVec3(vec) {
  v3pos[0] = this.x;
  v3pos[1] = this.y;
  v3pos[2] = this.z;

  return vec3.distance(v3pos, vec) - this.radius;
};

Sphere.prototype.computeAABB = function sphereComputeAABB() {
  this.bounds[0][0] = this.x - this.radius;
  this.bounds[0][1] = this.y - this.radius;
  this.bounds[0][2] = this.z - this.radius;

  this.bounds[1][0] = this.x + this.radius;
  this.bounds[1][1] = this.y + this.radius;
  this.bounds[1][2] = this.z + this.radius;
}

Object.defineProperty(Sphere.prototype, 'prefetchCode', {
  get: function getSpherePrefetchCode() {
    return printf(
      '  float Xpf_%s = sample(%i, %i);\n',
      this.id,
      this.center[0].position[0],
      this.center[0].position[1])

    + printf(
      '  float Ypf_%s = sample(%i, %i);\n',
      this.id,
      this.center[1].position[0],
      this.center[1].position[1])

    + printf(
      '  float Zpf_%s = sample(%i, %i);\n',
      this.id,
      this.center[2].position[0],
      this.center[2].position[1])

    + printf(
      '  float Rpf_%s = sample(%i, %i);\n',
      this.id,
      this.radius.position[0],
      this.radius.position[1])
  }
});

Object.defineProperty(Sphere.prototype, 'code', {
  get: function getSphereCode() {
    return printf(
      '    float %s = solid_sphere(position - vec3(Xpf_%i, Ypf_%i, Zpf_%i), Rpf_%i);\n',
      this.name,
      this.id,
      this.id,
      this.id,
      this.id
    )
  }
});
