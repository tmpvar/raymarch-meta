var test = require('tape');
var Torus = require('../torus');

test('Torus - evaluateVec3 (0, 0, 0) minor=.25, major=1.0', function(t) {

  var torus = new Torus(0, 0, 0, 1, .25);

  // outside
  t.ok(torus.evaluateVec3([0, 0, 0]) > 0, '0,0,0 is in the douhnut hole');
  t.ok(torus.evaluateVec3([1.3, 0, 0]) > 0, '1.3,0,0 is to the right');
  t.ok(torus.evaluateVec3([-1.3, 0, 0]) > 0, '1.3,0,0 is to the left');
  t.ok(torus.evaluateVec3([1, .3, 0]) > 0, '1,.3,0 is above');

  // on boundary - majorRadius
  t.equal(torus.evaluateVec3([ 1.25, 0, 0]), 0, '1.25, 0, 0 is on right boundary');
  t.equal(torus.evaluateVec3([-1.25, 0, 0]), 0, '-1.25, 0, 0 is on left boundary');
  t.equal(torus.evaluateVec3([0, 0,  1.25]), 0, '0, 0, 1.25 is on far boundary');
  t.equal(torus.evaluateVec3([0, 0, -1.25]), 0, '0, 0, -1.25 is on near boundary');

  // on boundary - minorRadius
  t.equal(torus.evaluateVec3([0, 0.25, 1]), 0, '0, 0.25,  1 on far top of minor');
  t.equal(torus.evaluateVec3([0,-0.25, 1]), 0, '0,-0.25,  1 on far bottom of minor');
  t.equal(torus.evaluateVec3([0, 0.25,-1]), 0, '0, 0.25, -1 on near top of minor');
  t.equal(torus.evaluateVec3([0,-0.25,-1]), 0, '0,-0.25, -1 on near bottom of minor');

  t.equal(torus.evaluateVec3([ 1, 0.25, 0]), 0, ' 1, 0.25, 0 on right top of minor');
  t.equal(torus.evaluateVec3([ 1,-0.25, 0]), 0, ' 1,-0.25, 0 on left bottom of minor');
  t.equal(torus.evaluateVec3([-1, 0.25, 0]), 0, '-1, 0.25, 0 on right top of minor');
  t.equal(torus.evaluateVec3([-1,-0.25, 0]), 0, '-1,-0.25, 0 on left bottom of minor');

  // inside
  t.ok(torus.evaluateVec3([ 1, 0,  0]) < 0, ' 1, 0, 0 is in the minor radius');
  t.ok(torus.evaluateVec3([-1, 0,  0]) < 0, '-1, 0, 0 is in the minor radius');
  t.ok(torus.evaluateVec3([ 0, 0,  1]) < 0, ' 0, 0, 1 is in the minor radius');
  t.ok(torus.evaluateVec3([ 0, 0, -1]) < 0, ' 0, 0,-1 is in the minor radius');

  t.end();
});

test('Torus - evaluateVec3 (5, 5, 0) minor=.25, major=1.0', function(t) {

  var torus = new Torus(5, 5, 0, 1, .25);

  // outside
  t.ok(torus.evaluateVec3([5, 5, 0]) > 0, '5,5,0 is in the douhnut hole');
  t.ok(torus.evaluateVec3([6.3, 5, 0]) > 0, '6.3,5,0 is to the right');
  t.ok(torus.evaluateVec3([3.6, 5, 0]) > 0, '3.6,5,0 is to the left');
  t.ok(torus.evaluateVec3([6, 5.3, 0]) > 0, '6,5.3,0 is above');

  // on boundary - majorRadius
  t.equal(torus.evaluateVec3([ 6.25, 5, 0]), 0, '6.25, 0, 0 is on right boundary');
  t.equal(torus.evaluateVec3([3.75, 5, 0]), 0, '-3.75, 0, 0 is on left boundary');
  t.equal(torus.evaluateVec3([5, 5,  1.25]), 0, '5, 5, 1.25 is on far boundary');
  t.equal(torus.evaluateVec3([5, 5, -1.25]), 0, '5, 5, -1.25 is on near boundary');

  // on boundary - minorRadius
  t.equal(torus.evaluateVec3([5, 5.25, 1]), 0, '5, 5.25,  1 on far top of minor');
  t.equal(torus.evaluateVec3([5, 4.75, 1]), 0, '5, 4.25,  1 on far bottom of minor');
  t.equal(torus.evaluateVec3([5, 5.25,-1]), 0, '5, 5.25, -1 on near top of minor');
  t.equal(torus.evaluateVec3([5, 4.75,-1]), 0, '5, 4.25, -1 on near bottom of minor');

  t.equal(torus.evaluateVec3([ 6, 5.25, 0]), 0, ' 6, 5.25, 0 on right top of minor');
  t.equal(torus.evaluateVec3([ 6, 4.75, 0]), 0, ' 6, 4.75, 0 on left bottom of minor');
  t.equal(torus.evaluateVec3([ 4, 5.25, 0]), 0, ' 4, 5.25, 0 on right top of minor');
  t.equal(torus.evaluateVec3([ 4, 4.75, 0]), 0, ' 4, 4.75, 0 on left bottom of minor');

  // inside
  t.ok(torus.evaluateVec3([ 6, 5,  0]) < 0, ' 6, 5, 0 is in the minor radius');
  t.ok(torus.evaluateVec3([ 4, 5,  0]) < 0, ' 4, 5, 0 is in the minor radius');
  t.ok(torus.evaluateVec3([ 5, 5,  1]) < 0, ' 5, 5, 1 is in the minor radius');
  t.ok(torus.evaluateVec3([ 5, 5, -1]) < 0, ' 5, 5,-1 is in the minor radius');

  t.end();
});

test('Torus - bounds', function(t) {

  t.deepEqual((new Torus(0, 0, 0, 1, .5)).bounds, [
    [-1.5, -.5, -1.5],
    [ 1.5,  .5,  1.5],
  ], 'bounds around origin');

  t.deepEqual((new Torus(0, 10, 0, 1, .5)).bounds, [
    [-1.5, 9.5, -1.5],
    [ 1.5, 10.5,  1.5],
  ], 'bounds around (0, 10, 0)');

  t.deepEqual((new Torus(2, 10, 0, 1, .5)).bounds, [
    [ 0.5, 9.5, -1.5],
    [ 3.5, 10.5,  1.5],
  ], 'bounds around (2, 10, 0)');

  t.deepEqual((new Torus(2, 10, 0, 2, .5)).bounds, [
    [ -0.5, 9.5, -2.5],
    [ 4.5, 10.5,  2.5],
  ], 'bounds around (2, 10, 0) minor=.5, major=1');

  t.end();
});
