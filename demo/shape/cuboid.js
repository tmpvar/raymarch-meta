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
module.exports = Cuboid;

function Cuboid(w, h, d) {
  define(this, 'width', w);
  define(this, 'height', h);
  define(this, 'depth', d);
  Shape.call(this);

  this.name = 'cuboid_' + this.id;
}

inherits(Cuboid, Shape);

var scaledDimensions = vec3.create();
var v3pos = vec3.create();
var temp = vec3.create();
Cuboid.prototype.evaluateVec3 = function cuboidEvaluateVec3(vec) {
  this._dirty && this.tick();

  v3pos[0] = 0;
  v3pos[1] = 0;
  v3pos[2] = 0;

  vec3.transformMat4(vec, vec, this.invertedModel);

  scaledDimensions[0] = this.width * .5;
  scaledDimensions[1] = this.height * .5;
  scaledDimensions[2] = this.depth * .5;

  vec3.subtract(v3pos, vec, v3pos);
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
  this.bounds = [
    [-w, -h, -d],
    [ w,  h,  d]
  ];

  this.computeTransformedAABB();

  return this.bounds;
};

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
    return [
      this.invertedMatrixString(),
      printf(
        '    float %s = signed_box_distance(vec4(%s_inv * pos4).xyz, %s_dimensions );\n',
        this.name,
        this.name,
        this.name
      )
    ].join('\n');
  }
});
