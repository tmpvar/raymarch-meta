var inherits = require('inherits');
var vec3 = require('gl-vec3');
var vec2 = require('gl-vec2');
var printf = require('printf');
var define = require('../util/define');

var Shape = require('../shape');
var v2scratch = [0, 0];
var v3pos = [0, 0, 0];
module.exports = Torus;

function Torus(radiusMajor, radiusMinor, r, g, b, selected) {
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
  this._dirty && this.tick();

  vec3.transformMat4(v3pos, vec, this.invertedModel);

  v2scratch[0] = v3pos[0];
  v2scratch[1] = v3pos[2];

  v2scratch[0] = vec2.length(v2scratch) - this.radiusMajor;
  v2scratch[1] = v3pos[1];

  return vec2.length(v2scratch) - this.radiusMinor;
};

Torus.prototype.computeAABB = function torusComputeAABB() {
  var h = this.radiusMinor;
  var w = this.radiusMajor + h; // horizontal radius (overall)

  return this.computeTransformedAABB(
    -w, -h, -w,
     w,  h,  w
  );
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
    return [
      this.invertedMatrixString(),
      printf(
        '  vec2 %s_dimensions = vec2(sample(%i, %i), sample(%i, %i));\n',
        this.name,
        this.radiusMajor.position[0],
        this.radiusMajor.position[1],
        this.radiusMinor.position[0],
        this.radiusMinor.position[1]
      )
    ].join('\n');
  }
});

Object.defineProperty(Torus.prototype, 'code', {
  get: function getTorusCode() {
    return printf(
      '    float %s = solid_torus(vec4(%s_inv * pos4).xyz, %s_dimensions );\n',
      this.name,
      this.name,
      this.name
    );
  }
});
