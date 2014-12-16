var test = require('tape');
var Scene = require('../scene');
var Cuboid = require('../shape/cuboid');

Scene.prototype.initGL = function() {};

test('Scene - bounds compute', function(t) {

  var scene = new Scene();
  var cube = new Cuboid(1, 1, 1);

  cube.translate(10, 0, 0);
  cube.tick();
  scene.displayedObjects = [cube];
  scene.dirtyBounds = true;

  t.deepEqual(scene.getAABB(), [
    [9.5, -0.5, -0.5],
    [10.5, 0.5, 0.5],
  ])

  t.end();
});

test('Scene - bounds compute (2 cuboids)', function(t) {

  var scene = new Scene();
  var cube = (new Cuboid(1, 1, 1)).translate(10, 0, 0);
  var cube2 = (new Cuboid(10, 10, 10)).translate(-10, 0, 0);

  scene.displayedObjects = [cube, cube2];
  scene.dirtyBounds = true;

  t.deepEqual(scene.getAABB(), [
    [-15, -5, -5],
    [10.5, 5, 5],
  ])

  t.end();
});
