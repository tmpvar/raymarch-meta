var inherits = require('inherits');
var vec3 = require('gl-vec3');
require('../util/vec3-unproject')
var printf = require('printf');
var define = require('../util/define');
var Shape = require('../shape');

var min = Math.min;
var max = Math.max;

var zero = [0,0,0];
module.exports = Cuboid;

function Cuboid(x, y, z, w, h, d, r, g, b, selected) {
  define(this, 'x', x);
  define(this, 'y', y);
  define(this, 'z', z);
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

var scaledDimensions = vec3.create();
var v3pos = vec3.create();
var temp = vec3.create();
Cuboid.prototype.evaluateVec3 = function cuboidEvaluateVec3(vec) {
  v3pos[0] = this.x;
  v3pos[1] = this.y;
  v3pos[2] = this.z;

  scaledDimensions[0] = this.width;
  scaledDimensions[1] = this.height;
  scaledDimensions[2] = this.depth;

  vec3.scale(scaledDimensions, scaledDimensions, 0.5);
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
  scaledDimensions[0] = this.width * 0.5;
  scaledDimensions[1] = this.height * 0.5;
  scaledDimensions[2] = this.depth * 0.5;

  this.bounds[0][0] = this.x - scaledDimensions[0];
  this.bounds[0][1] = this.y - scaledDimensions[1];
  this.bounds[0][2] = this.z - scaledDimensions[2];

  this.bounds[1][0] = this.x + scaledDimensions[0];
  this.bounds[1][1] = this.y + scaledDimensions[1];
  this.bounds[1][2] = this.z + scaledDimensions[2];
};

Object.defineProperty(Cuboid.prototype, 'colorCode', {
  get: function getColorCode() {
    return printf(


   '  float cuboid_%s_selected = sample(%i, %i);\n'
 + '  vec3 color_%s = vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i));\n',
      this.id,
      this.selected.position[0],
      this.selected.position[1],



//   '  vec3 color_%s = vec3(sample(%i, %i), sample(%i, %i), sample(%i, %i));\n',
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
      '  float Wpf_%i = sample(%i, %i);\n',
      this.id,
      this.width.position[0],
      this.width.position[1])

    + printf(
      '  float Hpf_%i = sample(%i, %i);\n',
      this.id,
      this.height.position[0],
      this.height.position[1])

    + printf(
      '  float Dpf_%i = sample(%i, %i);\n',
      this.id,
      this.depth.position[0],
      this.depth.position[1])
  }
});

Object.defineProperty(Cuboid.prototype, 'code', {
  get: function getCuboidCode() {
    return printf(
      '    float %s = signed_box_distance(position - vec3(Xpf_%i, Ypf_%i, Zpf_%i), vec3(Wpf_%i, Hpf_%i, Dpf_%i) );\n',
      this.name,
      this.id,
      this.id,
      this.id,
      this.id,
      this.id,
      this.id);
  }
});
