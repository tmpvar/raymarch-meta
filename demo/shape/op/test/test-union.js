var test = require('tape');
var Union = require('../union');
var Torus = require('../../torus');

var aabb = require('../../../util/aabb');


test('Union passthrough mock', function(t) {
  var vec = [10, 1, .4];
  var mock = {
    evaluateVec3 : function(v) {
      t.deepEqual(v, vec);
      t.end();
    },
    bounds: [[-1, -1, -1], [1, 1, 1]],
    name: 'mock-shape'
  };

  (new Union(mock)).evaluateVec3(vec);
});

test('Union passthrough mock (min)', function(t) {
  var vec = [10, 1, .4];
  var mocka = {
    evaluateVec3 : function(v) {
      return 1;
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

  var val = (new Union([mocka, mockb])).evaluateVec3(vec);
  t.equal(val, 0.5, 'union is basically a Math.min');
  t.end();
});


test('Union of two toruses', function(t) {
  var shapes = [
    (new Torus(2, .25)).translate(1, 0, 0),
    (new Torus(2, .25)).translate(-1, 0, 0),
  ];

  var union = new Union(shapes);
  t.ok(union.evaluateVec3([-1, 0, 0]) < 0, 'left doughnut hole is partially filled');
  t.ok(union.evaluateVec3([1, 0, 0]) < 0, 'right doughnut hole is partially filled');
  t.end();
});

// TODO: rotation of union

test('Union of contained shape aabbs', function(t) {

  var shapes = [
    { bounds: [[-1, -1, -1], [1, 2, 3]]},
    { bounds: [[-2, -3, -4], [.1, .1, .5]]}
  ];

  var union = new Union(shapes);

  t.deepEqual(union.bounds, [[-2, -3, -4], [1, 2, 3]], 'aabbs are merged');
  t.end();
});
