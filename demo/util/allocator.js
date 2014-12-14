module.exports = alloc;

// TODO: enable a realloc situation when memory is exhausted
// TODO: allow multiple ndarrays based on the max texture size
//       in webgl (based on the card)

// this represents the height and width of a
// ndarray which will be used later to create
// a texture for controlling the objects in
// the scene.
var variableMapSize = 128;

alloc.ops = ndarray(
  new Float32Array(this.variableMapSize*this.variableMapSize),
  [this.variableMapSize, this.variableMapSize]
);

function alloc(value, multiplier) {
  var x = this.pointer[0];
  var y = this.pointer[1];

  multiplier = multiplier || 1;

  if (x >= this.variableMapSize) {
    x=0;
    y++;
  }

  if (y > this.variableMapSize) {
    throw new Error('ENOMEM');
  }

  this.pointer[0] = x + 1;
  this.pointer[1] = y;

  var ops = this.ops;
  var scene = this;
  function getset(v) {
    if (typeof v !== 'undefined') {
      scene.dirty = true;
      value = v;
      ops.set(x, y, v * multiplier);
      return v;
    }

    return ops.get(x, y);
  }

  if (typeof value !== 'undefined') {
    getset(value);
  }

  getset.position = [x, y];

  // allow normal operators to work
  // e.g. scene.alloc(8) + 1 === 9
  getset.valueOf = function() {
    return value;
  };

  getset.toString = function() {
    return value + '';
  }

  return getset;
}
