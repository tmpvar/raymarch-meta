var inherits = require('inherits');
var vec3 = require('gl-vec3');
var printf = require('printf');

var define = require('../util/define')
var Shape = require('../shape');
var v3pos = [0, 0, 0];

module.exports = Sphere;

function Sphere(x, y, z, radius, r, g, b, selected) {
  define(this, 'x', x);
  define(this, 'y', y);
  define(this, 'z', z);
  define(this, 'radius', radius);
  define(this, 'r', r);
  define(this, 'g', g);
  define(this, 'b', b);
  define(this, 'selected', selected);

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

Object.defineProperty(Sphere.prototype, 'colorCode', {
  get: function getColorCode() {
    return printf(
   '  float sphere_%s_selected = sample(%i, %i);\n'
 + '  vec3 color_%s = vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i));\n',
      this.id,
      this.selected.position[0],
      this.selected.position[1],
      this.id,
      this.r.position[0],
      this.r.position[1],
      this.g.position[0],
      this.g.position[1],
      this.b.position[0],
      this.b.position[1]);
  }
});

Object.defineProperty(Sphere.prototype, 'prefetchCode', {
  get: function getSpherePrefetchCode() {
    return printf(
      '  vec3 sphere_center_%s = vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i));\n',
      this.id,
      this.x.position[0],
      this.x.position[1],
      this.y.position[0],
      this.y.position[1],
      this.z.position[0],
      this.z.position[1])

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
      '    float %s = solid_sphere(position - sphere_center_%i, Rpf_%i);\n',
      this.name,
      this.id,
      this.id,
      this.id,
      this.id
    )
  }
});
