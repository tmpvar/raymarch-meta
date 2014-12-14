var test = require('tape');
var aabb = require('../aabb');

test('aabb - update', function(t) {

  var testBounds = aabb.create();

  // XXX: pick sensible numbers - these are more or less randomly chosen
  aabb.update(testBounds, [ 32.0, 66.0, 12.2 ]);
  t.deepEqual(testBounds, [ [ 32.0, 66.0, 12.2 ], [ 32.0, 66.0, 12.2 ] ], 'bounds shrunk');

  aabb.update(testBounds, [ 32.0, 66.0, 10.1 ]);
  t.deepEqual(testBounds, [ [ 32.0, 66.0, 10.1 ], [ 32.0, 66.0, 12.2 ] ], 'bounds shrunk');

  aabb.update(testBounds, [ 32.0, 66.0, 14.1 ]);
  t.deepEqual(testBounds, [ [ 32.0, 66.0, 10.1 ], [ 32.0, 66.0, 14.1 ] ], 'bounds enlarged');

  aabb.update(testBounds, [ -32.0, 66.0, 14.1 ]);
  t.deepEqual(testBounds, [ [ -32.0, 66.0, 10.1 ], [ 32.0, 66.0, 14.1 ] ], 'bounds enlarged');

  t.end();
});

test('aabb - merge', function(t) {

  var testBounds = aabb.create();

  // XXX: pick sensible numbers - these are more or less randomly chosen
  testBounds = aabb.merge( [ [ [ 1, 2, 3 ], [ 2, 3, 4] ], [ [ 3, 2, 8 ], [ 2, 3, 4 ] ], [ [ 2, 6, 9 ], [ 12, 32, 14] ] ], testBounds);
  t.deepEqual(testBounds, [ [ 1, 2, 3 ], [ 12, 32, 14 ] ], 'bounds merged');

  testBounds = aabb.merge( [ [ [ -1, 2, 3 ], [ 2, 3, -4] ], [ [ -3, 2, 8 ], [ 2, -3, 4 ] ], [ [ 2, 6, 9 ], [ 12, -32, 14] ] ], testBounds);
  t.deepEqual(testBounds, [ [ -3, 2, 3 ], [ 12, 32, 14 ] ], 'bounds merged');

  t.end();
});

test('aabb - contains', function (t) {
  var testBounds = aabb.create();

  aabb.update(testBounds, [ 3.0, 6.0, 2.0 ]);
  aabb.contains(testBounds, [6, 1, 2]);

  t.end();
})