var inherits = require('inherits');
var vec3 = require('gl-vec3');
var printf = require('printf');

var define = require('../util/define')
var Shape = require('../shape');
var v3pos = [0, 0, 0];

module.exports = Sphere;

function Sphere(radius, r, g, b, selected) {
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
  this._dirty && this.tick();

  vec3.transformMat4(vec, vec, this.invertedModel);

  v3pos[0] = this.x;
  v3pos[1] = this.y;
  v3pos[2] = this.z;

  return vec3.length(vec) - this.radius;
};

Sphere.prototype.computeAABB = function sphereComputeAABB() {
  var r = this.radius;
  return this.computeTransformedAABB(-r, -r, -r, r, r, r);
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
    return [
      this.invertedMatrixString(),
      printf(
        '  float %s_radius = sample(%i, %i);\n',
        this.name,
        this.radius.position[0],
        this.radius.position[1]
      )
    ].join('\n');
  }
});

Object.defineProperty(Sphere.prototype, 'code', {
  get: function getSphereCode() {
    return printf(
      '    float %s = solid_sphere(vec4(%s_inv * pos4).xyz, %s_radius);\n',
      this.name,
      this.name,
      this.name
    );
  }
});
