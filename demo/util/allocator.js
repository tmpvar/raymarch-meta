var ndarray = require('ndarray');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

module.exports = alloc;

// TODO: enable a realloc situation when memory is exhausted
// TODO: allow multiple ndarrays based on the max texture size
//       in webgl (based on the card)

// this represents the height and width of a
// ndarray which will be used later to create
// a texture for controlling the objects in
// the scene.
var variableMapSize = alloc.variableMapSize = 128;


// this is a 3 part vector as we will want to split ops across
// multiple textures as mentioned above.
var pointer = [0, 0, 0];

var ops = alloc.ops = ndarray(
  new Float32Array(variableMapSize*variableMapSize),
  [variableMapSize, variableMapSize]
);

function alloc(initial, multiplier) {
  var x =pointer[0];
  var y =pointer[1];
  var value;
  multiplier = multiplier || 1;

  if (x >= variableMapSize) {
    x=0;
    y++;
  }

  if (y > variableMapSize) {
    throw new Error('ENOMEM');
  }

  pointer[0] = x + 1;
  pointer[1] = y;

  function getset(v) {
    if (typeof v !== 'undefined' && v !== value) {
      value = v;
      ops.set(x, y, v * multiplier);
      alloc.dirty(v, x, y);
      return v;
    }

    return ops.get(x, y);
  }

  if (typeof initial !== 'undefined') {
    getset(initial);
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

var listeners = [];

alloc.dirty = function(v, x, y) {

  if (typeof v === 'function') {
    listeners.push(v);
  } else {
    for (var i=0; i<listeners.length; i++) {
      listeners[i](v, x, y);
    }
  }

}
