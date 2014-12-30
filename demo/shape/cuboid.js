var inherits = require('inherits');
var vec3 = require('gl-vec3');
var mat4 = require('gl-mat4');
require('../util/vec3-unproject')
var printf = require('printf');
var define = require('../util/define');
var aabb = require('../util/aabb');
var Shape = require('../shape');

var min = Math.min;
var max = Math.max;

var zero = [0 , 0, 0];
var scaledDimensions = [0, 0, 0];
var v3pos = [0, 0, 0];
var temp = vec3.create();


module.exports = Cuboid;

function Cuboid(w, h, d, r, g, b, selected) {
  define(this, 'width', w);
  define(this, 'height', h);
  define(this, 'depth', d);
  define(this, 'r', r);
  define(this, 'g', g);
  define(this, 'b', b);
  define(this, 'selected', selected);

  Shape.call(this);

  this.name = 'cuboid_' + this.id;
}

inherits(Cuboid, Shape);

Cuboid.prototype.evaluateVec3 = function cuboidEvaluateVec3(vec) {
  this._dirty && this.tick();

  vec3.transformMat4(v3pos, vec, this.invertedModel);

  scaledDimensions[0] = this.width * .5;
  scaledDimensions[1] = this.height * .5;
  scaledDimensions[2] = this.depth * .5;

  vec3.subtract(v3pos, vec3.abs(v3pos), scaledDimensions);

  vec3.max(temp, v3pos, zero);
  return min(
    max(
      v3pos[0], max(
        v3pos[1],
        v3pos[2]
      )
    ), 0.0) + vec3.distance(temp, zero);
};

Cuboid.prototype.computeAABB = function cuboidComputeAABB() {
  var w = this.width * 0.5;
  var h = this.height * 0.5;
  var d = this.depth * 0.5;

  return this.computeTransformedAABB(
    -w, -h, -d,
     w,  h,  d
  );
};

Object.defineProperty(Cuboid.prototype, 'colorCode', {
  get: function getColorCode() {
    return printf(
   '  float cuboid_%s_selected = sample(%i, %i);\n'
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

Object.defineProperty(Cuboid.prototype, 'prefetchCode', {
  get: function getCuboidPrefetchCode() {
    return printf(
      '  vec3 %s_dimensions = vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i));\n',
      this.name,
      this.width.position[0],
      this.width.position[1],
      this.height.position[0],
      this.height.position[1],
      this.depth.position[0],
      this.depth.position[1]
    )
  }
});

Object.defineProperty(Cuboid.prototype, 'code', {
  get: function getCuboidCode() {
    return printf('\n    ' + [
      '// %s distance function',
      'vec3 %s_position = (%s_inv * pos4).xyz;',
      'vec3 %s_difference = abs(%s_position) - %s_dimensions;',
      'float %s = min(max(%s_difference.x, max(%s_difference.y, %s_difference.z)), 0.0);',
      '%s += length(max(%s_difference, 0.0));'
    ].join('\n    ') + '\n\n',
    this.name,
    this.name,
    this.name,
    this.name,
    this.name,
    this.name,
    this.name,
    this.name,
    this.name,
    this.name,
    this.name,
    this.name
    );
  }
});
