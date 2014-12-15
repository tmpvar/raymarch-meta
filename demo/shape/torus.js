var inherits = require('inherits');
var vec3 = require('gl-vec3');
var vec2 = require('gl-vec2');
var printf = require('printf');
var define = require('../util/define');

var Shape = require('../shape');
var v2scratch = [0, 0];
module.exports = Torus;

function Torus(x, y, z, radiusMajor, radiusMinor, r, g, b, selected) {
  define(this, 'x', x);
  define(this, 'y', y);
  define(this, 'z', z);
  define(this, 'radiusMajor', radiusMajor);
  define(this, 'radiusMinor', radiusMinor);
  define(this, 'r', r);
  define(this, 'g', g);
  define(this, 'b', b);
  define(this, 'selected', selected);

  Shape.call(this);

  this.name = 'torus_' + this.id;
}

inherits(Torus, Shape);

Torus.prototype.evaluateVec3 = function torusCylinderEvaluateVec3(vec) {
  v2scratch[0] = this.x - vec[0];
  v2scratch[1] = this.z - vec[2];

  v2scratch[0] = vec2.length(v2scratch) - this.radiusMajor;
  v2scratch[1] = this.y - vec[1];

  return vec2.length(v2scratch) - this.radiusMinor;
};

Torus.prototype.computeAABB = function torusComputeAABB() {
  var hr = this.radiusMajor + this.radiusMinor; // horizontal radius (overall)
  this.bounds[0][0] = this.x - hr
  this.bounds[0][1] = this.y - this.radiusMinor;
  this.bounds[0][2] = this.z - hr;

  this.bounds[1][0] = this.x + hr;
  this.bounds[1][1] = this.y + this.radiusMinor;
  this.bounds[1][2] = this.z + hr;
};

Object.defineProperty(Torus.prototype, 'colorCode', {
  get: function getColorCode() {
    return printf(
   '  float torus_%s_selected = sample(%i, %i);\n'
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

Object.defineProperty(Torus.prototype, 'prefetchCode', {
  get: function getTorusPrefetchCode() {
    return printf(
      '  float Xpf_%i = sample(%i, %i);\n',
      this.id,
      this.x.position[0],
      this.x.position[1])

    + printf(
      '  float Ypf_%i = sample(%i, %i);\n',
      this.id,
      this.y.position[0],
      this.y.position[1])

    + printf(
      '  float Zpf_%i = sample(%i, %i);\n',
      this.id,
      this.z.position[0],
      this.z.position[1])

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
