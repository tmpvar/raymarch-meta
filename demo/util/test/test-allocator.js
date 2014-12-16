var test = require('tape');
var alloc = require('../allocator')

test('alloc(5)', function(t) {
  var val = alloc(5);

  t.equal(
    alloc.ops.get(
      val.position[0],
      val.position[1]
    ),
    5,
    'multiplier defaults to 1'
  );
  t.end();
});

test('alloc(5) multiplier=.5', function(t) {
  var val = alloc(5, .5);

  t.equal(
    alloc.ops.get(
      val.position[0],
      val.position[1]
    ),
    2.5,
    'multiplier is applied when setting to ops buffer'
  );

  t.equal(+val, 5, 'is 5 when called')
  t.end();
});

test('alloc.dirty', function(t) {
  var val = alloc(5);

  alloc.dirty(function(val, x, y) {
    t.equal(val, 6)

    t.end();
  });

  val(5);
  val(6);
});
