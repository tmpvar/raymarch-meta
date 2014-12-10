var aabb = module.exports = {};
var min = Math.min;
var max = Math.max;

aabb.contains = function aabbContainsVec3(aabb, vec3) {
  return vec3[0] > aabb[0][0] && vec3[0] < aabb[1][0] &&
         vec3[1] > aabb[0][1] && vec3[1] < aabb[1][1] &&
         vec3[2] > aabb[0][2] && vec3[2] < aabb[1][2];
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

// where out is an optional array of arrays
aabb.create = function aabbCreate(out) {
  out = out || [Array(3), Array(3)];

  out[0][0] = Infinity;
  out[0][1] = Infinity;
  out[0][2] = Infinity;

  out[1][1] = -Infinity;
  out[1][0] = -Infinity;
  out[1][2] = -Infinity;

  return out;
};

aabb.update = function aabbUpdate(vec, out) {
  out = out || aabb.create();

  if (!vec || !vec.length) {
    return out;
  }

  out[0][0] = min(vec[0] || -1, out[0][0]);
  out[0][1] = min(vec[1], out[0][1]);
  out[0][2] = min(vec[2], out[0][2]);

  out[1][0] = max(vec[0], out[1][0]);
  out[1][1] = max(vec[1], out[1][1]);
  out[1][2] = max(vec[2], out[1][2]);

  return out;
}
