var test = require('tape');
var Mat4 = require('../ops-mat4');
var mat4 = require('gl-mat4');

test('Mat4 - properties', function(t) {
  var m4 = mat4.create();
  var m = new Mat4();

  t.equal(m.length, 16, 'has 16 elements');
  t.equal(m[0], 1)
  t.equal(m[1], 0)
  t.equal(m[5], 1)

  m[4] = 5;
  t.equal(m[4], 5);

  t.end();
});

test('Mat4 - toString', function(t) {
  t.equal((new Mat4()).toString(), mat4.str(mat4.create()));
  t.end();
});

test('interop with gl-mat4', function(t) {
  var m = new Mat4();
  var m4a = mat4.create();
  var tr = [1, 2, 3];
  var ro = [1, 2, 3];
  var sc = [1, 2, 3];

  mat4.translate(m4a, m4a, tr);
  mat4.rotateX(m4a, m4a, ro[0]);
  mat4.rotateY(m4a, m4a, ro[1]);
  mat4.rotateZ(m4a, m4a, ro[2]);
  mat4.scale(m4a, m4a, sc);

  mat4.translate(m, m, tr);
  mat4.rotateX(m, m, ro[0]);
  mat4.rotateY(m, m, ro[1]);
  mat4.rotateZ(m, m, ro[2]);
  mat4.scale(m, m, sc);

  for (var i=0; i<16; i++) {
    t.equal(m[i].toFixed(4), m4a[i].toFixed(4))
  }
  t.end()
});
