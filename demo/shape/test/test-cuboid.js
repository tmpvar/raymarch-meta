var test = require('tape');
var Box = require('../cuboid')

test('evaluateVec3', function(t) {
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
