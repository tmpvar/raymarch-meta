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

function Cuboid(x, y, z, w, h, d) {
  define(this, 'x', x);
  define(this, 'y', y);
  define(this, 'z', z);
  define(this, 'w', w);
  define(this, 'd', h);
  define(this, 'h', d);
  Shape.call(this);

  this.name = 'cuboid_' + this.id;
}

inherits(Cuboid, Shape);

var scaledDimensions = vec3.create();
var v3pos = vec3.create();
var temp = vec3.create();
Cuboid.prototype.evaluateVec3 = function cuboidEvaluateVec3(vec) {

  scaledDimensions[0] = this.w;
  scaledDimensions[1] = this.h;
  scaledDimensions[2] = this.d;

  vec3.scale(scaledDimensions, scaledDimensions, 0.5);
  vec3.subtract(v3pos, vec3.abs(vec), scaledDimensions);


  vec3.max(temp, v3pos, zero);
  return min(
    max(
      v3pos[0], max(
        v3pos[1],
        v3pos[2]
      )
    ), 0.0) + vec3.distance(temp, zero);
};

/*
float signed_box_distance(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) +
         length(max(d,0.0));
}
*/

Cuboid.prototype.computeAABB = function cuboidComputeAABB() {
  scaledDimensions[0] = this.w;
  scaledDimensions[1] = this.h;
  scaledDimensions[2] = this.d;

  vec3.scale(scaledDimensions, scaledDimensions, 0.5);

  this.bounds[0][0] = this.x - scaledDimensions[0];
  this.bounds[0][1] = this.y - scaledDimensions[1];
  this.bounds[0][2] = this.z - scaledDimensions[2];

  this.bounds[1][0] = this.x + scaledDimensions[0];
  this.bounds[1][1] = this.y + scaledDimensions[1];
  this.bounds[1][2] = this.z + scaledDimensions[2];
};

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
      this.w.position[0],
      this.w.position[1])

    + printf(
      '  float Hpf_%i = sample(%i, %i);\n',
      this.id,
      this.h.position[0],
      this.h.position[1])

    + printf(
      '  float Dpf_%i = sample(%i, %i);\n',
      this.id,
      this.d.position[0],
      this.d.position[1])
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
      this.id
    );
  }
});
