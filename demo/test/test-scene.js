var test = require('tape');
var Scene = require('../scene');

Scene.prototype.initGL = function() {};


test('Scene#alloc', function(t) {
  var scene = new Scene();
  var val = scene.alloc(5);

  t.equal(
    scene.ops.get(
      val.position[0],
      val.position[1]
    ),
    5,
    'multiplier defaults to 1'
  );
  t.end();
});

test('Scene#alloc multiplier=.5', function(t) {
  var scene = new Scene();
  var val = scene.alloc(5, .5);

  t.equal(
    scene.ops.get(
      val.position[0],
      val.position[1]
    ),
    2.5,
    'multiplier is applied when setting to ops buffer'
  );

  t.equal(+val, 5, 'is 5 when called')
  t.end();
});
