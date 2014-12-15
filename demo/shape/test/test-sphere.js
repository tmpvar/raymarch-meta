var test = require('tape');
var Sphere = require('../sphere')

test('Sphere - evaluateVec3 (0, 0, 0)', function(t) {

  var s = new Sphere(1);

  // test some interior points
  t.ok(s.evaluateVec3([0.0, 0.0, 0.0]) < 0, '0,0,0 is inside');
  t.ok(s.evaluateVec3([0.0, 0.4, 0.0]) < 0, '0,.4,0 is inside');
  t.ok(s.evaluateVec3([0.4, 0.0, 0.0]) < 0, '0.4,0,0 is inside');
  t.ok(s.evaluateVec3([0.0, 0.0, 0.4]) < 0, '0.0,0,0.4 is inside');
  t.ok(s.evaluateVec3([0.4, 0.4, 0.4]) < 0, '0.4,0.4,0.4 is inside');

  // test some boundary points
  t.equal(s.evaluateVec3([0.0, 1.0, 0.0]), 0, ' 0, 1, 0 is on boundary');
  t.equal(s.evaluateVec3([0.0,-1.0, 0.0]), 0, ' 0,-1, 0 is on boundary');
  t.equal(s.evaluateVec3([1.0, 0.0, 0.0]), 0, ' 1, 0, 0 is on boundary');
  t.equal(s.evaluateVec3([-1.0,0.0, 0.0]), 0, '-1, 0, 0 is on boundary');
  t.equal(s.evaluateVec3([0.0, 0.0, 1.0]), 0, ' 0, 0, 1 is on boundary');
  t.equal(s.evaluateVec3([0.0, 0.0,-1.0]), 0, ' 0, 0,-1 is on boundary');

  // test some ouside points points
  t.equal(s.evaluateVec3([0.0, 2.0, 0.0]), 1, ' 0, 2, 0 is outside');
  t.equal(s.evaluateVec3([0.0,-2.0, 0.0]), 1, ' 0,-2, 0 is outside');
  t.equal(s.evaluateVec3([2.0, 0.0, 0.0]), 1, ' 2, 0, 0 is outside');
  t.equal(s.evaluateVec3([-2.0,0.0, 0.0]), 1, '-2, 0, 0 is outside');
  t.equal(s.evaluateVec3([0.0, 0.0, 2.0]), 1, ' 0, 0, 2 is outside');
  t.equal(s.evaluateVec3([0.0, 0.0,-2.0]), 1, ' 0, 0,-2 is outside');

  t.end();
});

test('Sphere - evaluateVec3 (0, 5, 0)', function(t) {

  var s = new Sphere(1);
  s.translate(0, 5, 0);

  // test some interior points
  t.ok(s.evaluateVec3([0.0, 5.0, 0.0]) < 0, '0,0,0 is inside');
  t.ok(s.evaluateVec3([0.0, 5.4, 0.0]) < 0, '0,.4,0 is inside');
  t.ok(s.evaluateVec3([0.4, 5.0, 0.0]) < 0, '0.4,0,0 is inside');
  t.ok(s.evaluateVec3([0.0, 5.0, 0.4]) < 0, '0.0,0,0.4 is inside');
  t.ok(s.evaluateVec3([0.4, 5.4, 0.4]) < 0, '0.4,0.4,0.4 is inside');

  // test some boundary points
  t.equal(s.evaluateVec3([0.0, 6.0, 0.0]), 0, ' 0, 1, 0 is on boundary');
  t.equal(s.evaluateVec3([0.0, 4.0, 0.0]), 0, ' 0,-1, 0 is on boundary');
  t.equal(s.evaluateVec3([1.0, 5.0, 0.0]), 0, ' 1, 0, 0 is on boundary');
  t.equal(s.evaluateVec3([-1.0,5.0, 0.0]), 0, '-1, 0, 0 is on boundary');
  t.equal(s.evaluateVec3([0.0, 5.0, 1.0]), 0, ' 0, 0, 1 is on boundary');
  t.equal(s.evaluateVec3([0.0, 5.0,-1.0]), 0, ' 0, 0,-1 is on boundary');

  // test some ouside points points
  t.equal(s.evaluateVec3([0.0, 7.0, 0.0]), 1, ' 0, 2, 0 is outside');
  t.equal(s.evaluateVec3([0.0, 3.0, 0.0]), 1, ' 0,-2, 0 is outside');
  t.equal(s.evaluateVec3([2.0, 5.0, 0.0]), 1, ' 2, 0, 0 is outside');
  t.equal(s.evaluateVec3([-2.0,5.0, 0.0]), 1, '-2, 0, 0 is outside');
  t.equal(s.evaluateVec3([0.0, 5.0, 2.0]), 1, ' 0, 0, 2 is outside');
  t.equal(s.evaluateVec3([0.0, 5.0,-2.0]), 1, ' 0, 0,-2 is outside');

  t.end();
});

test('Sphere - bounds', function(t) {

  t.deepEqual((new Sphere(1)).computeAABB(), [
    [-1, -1, -1],
    [ 1,  1,  1],
  ], 'bounds around origin');

  t.deepEqual((new Sphere(1)).translate(0, 5, 0).computeAABB(), [
    [-1,  4, -1],
    [ 1,  6,  1],
  ], 'bounds around (0, 5, 0)');

  t.deepEqual((new Sphere(5)).translate(5, 5, 5).computeAABB(), [
    [0,  0, 0],
    [ 10,  10,  10],
  ], 'bounds around (5, 5, 5) r=5');

  t.deepEqual((new Sphere(10)).translate(5, 5, 5).computeAABB(), [
    [-5, -5, -5],
    [ 15,  15,  15],
  ], 'bounds around (5, 5, 5) r=10');

  t.end();
});

