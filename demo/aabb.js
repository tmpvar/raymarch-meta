var vec3 = require('gl-vec3');
var aabb = module.exports = {};
var min = Math.min;
var max = Math.max;

aabb.contains = function aabbContainsVec3(box, vec3) {
  return vec3[0] > box[0][0] && vec3[0] < box[1][0] &&
         vec3[1] > box[0][1] && vec3[1] < box[1][1] &&
         vec3[2] > box[0][2] && vec3[2] < box[1][2];
};

aabb.merge = function aabbMerge(array, out) {
  out = out || [[0,0,0], [0,0,0]];
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
      out[0][0] = min(item[0][0], out[0][0]);
      out[0][1] = min(item[0][1], out[0][1]);
      out[0][2] = min(item[0][2], out[0][2]);

      out[1][0] = max(item[1][0], item[1][0]);
      out[1][1] = max(item[1][1], item[1][1]);
      out[1][2] = max(item[1][2], item[1][2]);
  }
  return out;
};

aabb.create = function aabbCreate() {
  return [
    [Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity]
  ];
};
window.aabb = aabb;

var vec3scratch = [0, 0, 0];

aabb.intersectRay = function aabbIntersectRay(box, origin, direction) {

  vec3.negate(direction, direction);

  var tx1 = (box[0][0] - origin[0])*direction[0];
  var tx2 = (box[1][0] - origin[0])*direction[0];

  var tmin = min(tx1, tx2);
  var tmax = max(tx1, tx2);

  var ty1 = (box[0][1] - origin[1])*direction[1];
  var ty2 = (box[1][1] - origin[1])*direction[1];

  tmin = max(tmin, min(ty1, ty2));
  tmax = min(tmax, max(ty1, ty2));

  var tz1 = (box[0][2] - origin[2])*direction[2];
  var tz2 = (box[1][2] - origin[2])*direction[2];

  tmin = max(tmin, min(tz1, tz2));
  tmax = min(tmax, max(tz1, tz2));

  return tmax >= tmin || tmax < 0;
};

