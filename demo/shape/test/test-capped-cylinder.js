var test = require('tape');
var Cyl = require('../capped-cylinder')

test('CappedCylinder - evaluateVec3 (0, 0, 0)', function(t) {
  var cyl = new Cyl(0, 0, 0, 1, 1,  0, 0, 0);

  // inside sides
  t.ok(cyl.evaluateVec3([0, 0, 0]) < 0, 'inside at origin');
  t.ok(cyl.evaluateVec3([.4, 0, 0]) < 0, 'inside at x=.5');

  // outside sides
  t.ok(cyl.evaluateVec3([2, 0, 0]) > 0, 'outside at x=2.0');
  t.ok(cyl.evaluateVec3([0, 0, 2]) > 0, 'outside at z=2.0');
  t.ok(cyl.evaluateVec3([1.01, 0, 0]) > 0, 'outside at x=1.01');
  t.ok(cyl.evaluateVec3([0, 0, 1.01]) > 0, 'outside at z=1.01');

  // on side border
  t.equal(cyl.evaluateVec3([1, 0, 0]), 0, 'on right border x=1.0');
  t.equal(cyl.evaluateVec3([1, 0, 0]), 0, 'on left border x=-1.0');
  t.equal(cyl.evaluateVec3([0, 0, 1]), 0, 'on back border z=1.0');
  t.equal(cyl.evaluateVec3([0, 0, -1]), 0, 'on front border z=-1.0');

  // test the top and bottom (outside)
  t.ok(cyl.evaluateVec3([0, 5.1, 0]) > 0, 'outside y=5.1');
  t.ok(cyl.evaluateVec3([0, -1.1, 0]) > 0, 'outside y=-1.1');

  // test the top and bottom (on border)
  t.equal(cyl.evaluateVec3([0, 0.5, 0]), 0, 'on top border y=1.0');
  t.equal(cyl.evaluateVec3([0, -0.5, 0]), 0, 'on bottom border y=-1');

  t.end();
});

test('CappedCylinder - evaluateVec3 (0, 10, 0)', function(t) {
  var cyl = new Cyl(0, 10, 0, 1, 1,  0, 0, 0);

  // inside sides
  t.ok(cyl.evaluateVec3([0, 10, 0]) < 0, 'inside at origin');
  t.ok(cyl.evaluateVec3([.4, 10, 0]) < 0, 'inside at x=.5');

  // outside sides
  t.ok(cyl.evaluateVec3([2, 10, 0]) > 0, 'outside at x=2.0');
  t.ok(cyl.evaluateVec3([0, 10, 2]) > 0, 'outside at z=2.0');
  t.ok(cyl.evaluateVec3([1.01, 10, 0]) > 0, 'outside at x=1.01');
  t.ok(cyl.evaluateVec3([0, 10, 1.01]) > 0, 'outside at z=1.01');

  // on side border
  t.equal(cyl.evaluateVec3([1, 10, 0]), 0, 'on right border x=1.0');
  t.equal(cyl.evaluateVec3([1, 10, 0]), 0, 'on left border x=-1.0');
  t.equal(cyl.evaluateVec3([0, 10, 1]), 0, 'on back border z=1.0');
  t.equal(cyl.evaluateVec3([0, 10, -1]), 0, 'on front border z=-1.0');

  // test the top and bottom (outside)
  t.ok(cyl.evaluateVec3([0, 10.6, 0]) > 0, 'outside y=10.6');
  t.ok(cyl.evaluateVec3([0, 8.9, 0]) > 0, 'outside y=8.9');

  // test the top and bottom (on border)
  t.equal(cyl.evaluateVec3([0, 10.5, 0]), 0, 'on top border y=10.5');
  t.equal(cyl.evaluateVec3([0, 9.5, 0]), 0, 'on bottom border y=9.5');

  t.end();
});

test('CappedCylinder - bounds', function(t) {

  t.deepEqual((new Cyl(0, 0, 0, 1, 1,  0, 0, 0)).bounds, [
    [-1, -.5, -1],
    [ 1,  .5,  1],
  ], 'bounds around origin r=1, h=1');

  t.deepEqual((new Cyl(0, 5, 0, 1, 1)).bounds, [
    [-1,  4.5, -1],
    [ 1,  5.5,  1],
  ], 'bounds around (0, 5, 0) r=1, h=1');

  t.deepEqual((new Cyl(0, 5, 0, 1, 10,  0, 0, 0)).bounds, [
    [-1,  0, -1],
    [ 1,  10,  1],
  ], 'bounds around (0, 5, 0) r=1, h=5');

  t.end();
});

