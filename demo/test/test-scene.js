var test = require('tape');
var Scene = require('../scene');

// skip the webgl initialization
Scene.prototype.initGL = function() {};
