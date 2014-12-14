var test = require('tape');
var Box = require('../cuboid')

test('Cuboid - evaluateVec3', function(t) {
  var box = new Box(0, 0, 0, 1, 1, 1);

  // inside sides
  t.ok(box.evaluateVec3([0, 0, 0]) < 0, 'inside at origin');
  t.ok(box.evaluateVec3([.4, 0, 0]) < 0, 'inside at x=.5');

  // outside sides
  t.ok(box.evaluateVec3([2, 0, 0]) > 0, 'outside at x=2.0');
  t.ok(box.evaluateVec3([0, 0, 2]) > 0, 'outside at z=2.0');
  t.ok(box.evaluateVec3([1.01, 0, 0]) > 0, 'outside at x=1.01');
  t.ok(box.evaluateVec3([0, 0, 1.01]) > 0, 'outside at z=1.01');

  // on side border
  t.equal(box.evaluateVec3([0.5, 0, 0]), 0, 'on right border x=0.5');
  t.equal(box.evaluateVec3([0.5, 0, 0]), 0, 'on left border x=-0.5');
  t.equal(box.evaluateVec3([0, 0, 0.5]), 0, 'on back border z=0.5');
  t.equal(box.evaluateVec3([0, 0, -0.5]), 0, 'on front border z=-0.5');

  // test the top and bottom (outside)
  t.ok(box.evaluateVec3([0, 5.1, 0]) > 0, 'outside y=5.1');
  t.ok(box.evaluateVec3([0, -1.1, 0]) > 0, 'outside y=-1.1');

  // test the top and bottom (on border)
  t.equal(box.evaluateVec3([0, 0.5, 0]), 0, 'on top border y=1.0');
  t.equal(box.evaluateVec3([0, -0.5, 0]), 0, 'on bottom border y=-1');

  t.end();
});

test('Cuboid - evaluateVec3 at 0, 10, 0', function(t) {
  var box = new Box(0, 10, 0, 1, 1, 1);

  // inside sides
  t.ok(box.evaluateVec3([0, 10, 0]) < 0, 'inside at 0, 10, 0');
  t.ok(box.evaluateVec3([.4, 10, 0]) < 0, 'inside at x=.5');

  // outside sides
  t.ok(box.evaluateVec3([2, 10, 0]) > 0, 'outside at x=2.0');
  t.ok(box.evaluateVec3([0, 10, 2]) > 0, 'outside at z=2.0');
  t.ok(box.evaluateVec3([1.01, 10, 0]) > 0, 'outside at x=1.01');
  t.ok(box.evaluateVec3([0, 10, 1.01]) > 0, 'outside at z=1.01');

  // on side border
  t.equal(box.evaluateVec3([0.5, 10, 0]), 0, 'on right border x=0.5');
  t.equal(box.evaluateVec3([0.5, 10, 0]), 0, 'on left border x=-0.5');
  t.equal(box.evaluateVec3([0, 10, 0.5]), 0, 'on back border z=0.5');
  t.equal(box.evaluateVec3([0, 10, -0.5]), 0, 'on front border z=-0.5');

  // test the top and bottom (outside)
  t.ok(box.evaluateVec3([0, 15.1, 0]) > 0, 'outside y=15.1');
  t.ok(box.evaluateVec3([0, 13.9, 0]) > 0, 'outside y=13.9');

  // test the top and bottom (on border)
  t.equal(box.evaluateVec3([0, 10.5, 0]), 0, 'on top border y=1.0');
  t.equal(box.evaluateVec3([0, 9.5, 0]), 0, 'on bottom border y=9.5');

  t.end();
});

test('Cuboid - aabb', function(t) {
  t.deepEqual((new Box(0, 0, 0, 2, 2, 2)).bounds, [
    [-1, -1, -1],
    [ 1,  1,  1],
  ], 'bounds around origin');

  t.deepEqual((new Box(0, 1, 0, 2, 2, 2)).bounds, [
    [ -1, 0, -1],
    [ 1,  2,  1],
  ], 'bounds at y=1');

  t.deepEqual((new Box(1, 1, 1, 2, 2, 2)).bounds, [
    [ 0, 0, 0],
    [ 2, 2, 2],
  ], 'bounds at 1, 1, 1');

  t.end();
});
