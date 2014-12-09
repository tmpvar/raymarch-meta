var aabb = module.exports = {};

aabb.contains = function aabbContainsVec3(aabb, vec3) {
  return vec3[0] > aabb[0][0] && vec3[0] < aabb[1][0] &&
         vec3[1] > aabb[0][1] && vec3[1] < aabb[1][1] &&
         vec3[2] > aabb[0][2] && vec3[2] < aabb[1][2];
};

aabb.merge = function aabbMerge(array, out) {

  out = out || array[0].slice();
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
      out[0][0] = min(item[0][0], out[0][0]);
      out[0][1] = min(item[0][1], out[0][1]);
      out[0][2] = min(item[0][2], out[0][2]);

      out[1][0] = max(item[1][0], item[1][0]);
      out[1][1] = max(item[1][1], item[1][1]);
      out[1][2] = max(item[1][2], item[1][2]);
  }
};
