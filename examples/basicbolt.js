'use strict';
var Storm = require('../lib/index');
var util = require('util');

var TestBolt = function() {
  // Put any init code here.
};
// Inherit BasicBolt for automatic ack & anchoring.
util.inherits(TestBolt, Storm.BasicBolt);

TestBolt.prototype.process = function(tuple, done) {
  this.emit(["val1","val2"]);
  // `done` must be called to ack.
  done();
};

var bolt = new TestBolt();
bolt.run();
