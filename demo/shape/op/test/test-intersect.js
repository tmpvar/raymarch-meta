var test = require('tape');
var Intersect = require('../intersect');
var Torus = require('../../torus');

var aabb = require('../../../util/aabb');


test('Intersect passthrough mock', function(t) {
  var vec = [10, 1, .4];
  var mock = {
    evaluateVec3 : function(v) {
      t.deepEqual(v, vec);
      t.end();
    },
    bounds: [[-1, -1, -1], [1, 1, 1]],
    name: 'mock-shape'
  };

  (new Intersect(mock)).evaluateVec3(vec);
});

test('Intersect passthrough mock (min)', function(t) {
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

  var val = (new Intersect([mocka, mockb])).evaluateVec3(vec);
  t.equal(val, 1, 'intersect is basically a Math.max');
  t.end();
});


test('Intersect of two toruses', function(t) {
  var shapes = [
    new Torus(1, 0, 0, 1, .25),
    new Torus(-1, 0, 0, 1, .25),
  ];

  var isect = new Intersect(shapes);

  t.ok(isect.evaluateVec3([0, 0, 0]) < 0, 'origin is filled');
  t.end();
});

// TODO: to properly perform this test we *need*
//       aabb.intersect
/*test('Intersect of contained shape aabbs', function(t) {

  var shapes = [
    { bounds: [[-1, -1, -1], [1, 2, 3]]},
    { bounds: [[-2, -3, -4], [.1, .1, .5]]}
  ];

  var isect = new Intersect(shapes);

  t.deepEqual(isect.bounds, [[-2, -3, -4], [1, 2, 3]], 'aabbs are merged');
  t.end();
});
*/
