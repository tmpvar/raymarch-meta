var inherits = require('inherits');
var vec3 = require('gl-vec3');
var printf = require('printf');

var Shape = require('../shape');

module.exports = Cuboid;

function Cuboid(center, dimensions) {
  this.center = center;
  this.dimensions = dimensions;

  Shape.call(this);

  this.name = 'cuboid_' + this.id;
}

inherits(Cuboid, Shape);

Cuboid.prototype.evaluateVec3 = function cuboidEvaluateVec3(vec) {
  return 0; // vec3.distance(this.center, vec) - this.radius; // XXX: implement me!
};

Cuboid.prototype.computeAABB = function cuboidComputeAABB() {
  this.bounds[0][0] = this.center[0] - this.dimensions[0] / 2;
  this.bounds[0][1] = this.center[1] - this.dimensions[1] / 2;
  this.bounds[0][2] = this.center[2] - this.dimensions[2] / 2;

  this.bounds[1][0] = this.center[0] + this.dimensions[0] / 2;
  this.bounds[1][1] = this.center[1] + this.dimensions[1] / 2;
  this.bounds[1][2] = this.center[2] + this.dimensions[2] / 2;
};

Object.defineProperty(Cuboid.prototype, 'prefetchCode', {
  get: function getCuboidPrefetchCode() {
    return printf(
      '  float Xpf_%i = sample(%i, %i);\n',
      this.id,
      this.center[0].position[0],
      this.center[0].position[1])

    + printf(
      '  float Ypf_%i = sample(%i, %i);\n',
      this.id,
      this.center[1].position[0],
      this.center[1].position[1])

    + printf(
      '  float Zpf_%i = sample(%i, %i);\n',
      this.id,
      this.center[2].position[0],
      this.center[2].position[1])

    + printf(
      '  float Wpf_%i = sample(%i, %i);\n',
      this.id,
      this.dimensions[0].position[0],
      this.dimensions[0].position[1])

    + printf(
      '  float Hpf_%i = sample(%i, %i);\n',
      this.id,
      this.dimensions[1].position[0],
      this.dimensions[1].position[1])

    + printf(
      '  float Dpf_%i = sample(%i, %i);\n',
      this.id,
      this.dimensions[2].position[0],
      this.dimensions[2].position[1])
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

//
/*


Scene.prototype.createBox = function(x, y, z, width, height, depth, color) {
  var _x = this.alloc();
  var _y = this.alloc();
  var _z = this.alloc();
  var _w = this.alloc();
  var _h = this.alloc();
  var _d = this.alloc();

  // this will eat up 6 spaces in the ops buffer
  var box = {
    0: _x,
    1: _y,
    2: _z,
    3: _w,
    4: _h,
    5: _d
  };



  Object.defineProperty(box, 'name', {
    value: 'box_' + (this.shapeId++)
  });

  Object.defineProperty(box, 'bounds', {
    get: function() {
      var x = _x();
      var y = _y();
      var z = _z();
      var w = _w();
      var h = _h();
      var d = _d();

      return [
        [x, y, z],
        [x + w, y + h, z + d]
      ];
    }
  });



  _x(x);
  _y(y);
  _z(z);
  _w(width);
  _h(height);
  _d(depth);

  return box;
}

*/
//