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

  vec3.transformMat4(v3pos, vec, this.invertedModel);

  return vec3.length(v3pos) - this.radius;
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
    return printf(
      '  float %s_radius = sample(%i, %i);\n',
      this.name,
      this.radius.position[0],
      this.radius.position[1]
    )
  }
});

Object.defineProperty(Sphere.prototype, 'code', {
  get: function getSphereCode() {
    return printf('\n    ' + [
        '// %s distance function',
        'float %s = length((%s_inv * pos4).xyz) - %s_radius;',
      ].join('\n    ') + '\n\n',
      this.name,
      this.name,
      this.name,
      this.name
    );
  }
});
