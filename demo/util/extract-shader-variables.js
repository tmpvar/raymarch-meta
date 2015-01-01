module.exports = extractShaderVariables;

// TODO: handle `uniform mat4 a,b,c;`

var uniformExp = /(uniform|attribute)\W+[^\W]+\W+[^\W;]+/g;
var whitespaceExp = /\W+/;
function extractShaderVariables(vert, frag) {
  var vars = { attribute: {}, uniform: {} };

  ((vert || '').match(uniformExp) || []).concat(
    (frag || '').match(uniformExp) || []
  ).forEach(function(uniformLine) {
    var parts = uniformLine.split(/\W+/);

    if (vars[parts[0]]) {
      vars[parts[0]][parts[2]] = parts[1];
    }
  });

  return [
    // uniforms
    Object.keys(vars.uniform).map(function(key) {
      return { name: key, type: vars.uniform[key] }
    }),

    // attributes
    Object.keys(vars.attribute).map(function(key) {
      return { name: key, type: vars.attribute[key] }
    })
  ];
}
