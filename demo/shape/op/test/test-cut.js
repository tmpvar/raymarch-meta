var test = require('tape');
var Cut = require('../cut');

var Sphere = require('../../sphere');


test('Cut passthrough mock', function(t) {
  var vec = [10, 1, .4];
  var mock = {
    evaluateVec3 : function(v) {
      t.deepEqual(v, vec);
      t.end();
    },
    bounds: [[-1, -1, -1], [1, 1, 1]],
    name: 'mock-shape'
  };

  (new Cut(mock)).evaluateVec3(vec);
});

test('Cut passthrough mock (max(-a, b))', function(t) {
  var vec = [10, 1, .4];
  var mocka = {
    evaluateVec3 : function(v) {
      return -1;
    },
    bounds: [[-1, -1, -1], [1, 1, 1]],
    name: 'mock-shape'
  };

  var mockb = {
    evaluateVec3 : function(v) {
      return 0.5
    },
    bounds: [[-1, -1, -1], [1, 1, 1]],
    name: 'mock-shape'
  };

  var val = (new Cut(mocka, mockb)).evaluateVec3(vec);
  t.equal(val, -0.5, 'union is basically a Math.max(-a, b)');
  t.end();
});

test('Cut - evaluateVec3 - hollow sphere', function(t) {

  var outer = new Sphere(1);
  var inner = new Sphere(.5);
  var cut = new Cut(outer, inner);

  // test the hollow part
  t.equal(cut.evaluateVec3([0, 0, 0]), 0.5, 'center of the sphere is hollow');
  t.equal(cut.evaluateVec3([0, .5, 0]), 0, 'y=.5 defines the inner boundary of the outer shell');
  t.equal(cut.evaluateVec3([.5, 0, 0]), 0, 'x=.5 defines the inner boundary of the outer shell');
  t.equal(cut.evaluateVec3([0, 0, .5]), 0, 'z=.5 defines the inner boundary of the outer shell');

  // test the outer boundary
  t.equal(cut.evaluateVec3([0, 0, 1]), 0, 'z=1 defines the outer boundary');
  t.equal(cut.evaluateVec3([0, 1, 0]), 0, 'y=1 defines the outer boundary');
  t.equal(cut.evaluateVec3([1, 0, 0]), 0, 'x=1 defines the outer boundary');

  // test outside
  t.ok(cut.evaluateVec3([0, 0, 1.1]) > 0, 'z=1.1 is outside the boundary');
  t.ok(cut.evaluateVec3([0, 1.1, 0]) > 0, 'y=1.1 is outside the boundary');
  t.ok(cut.evaluateVec3([1.1, 0, 0]) > 0, 'x=1.1 is outside the boundary');

  t.end();
});

// TODO: trim the bounding box
test('Cut - computeAABB', function(t) {
  var outer = new Sphere(1);
  var inner = new Sphere(.5);

  // cut the outer from the inner to demonstrate that
  // the bounds are a copy of to the `target`
  var cut = new Cut(inner,outer);
  t.deepEqual(cut.bounds, inner.bounds, 'bounds are unchanged');
  t.end();
});


