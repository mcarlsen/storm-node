'use strict';
var Storm = require('../storm.js'),
  util = require('util');

function BasicBolt() {
  //Empty Constructor
}

util.inherits(BasicBolt, Storm);

BasicBolt.prototype.mode = 'bolt';
BasicBolt.prototype.tupleCallback = function(tuple) {
  var self = this;

  self.process(
    tuple,
    // emit
    function(values, options) {
      self.emit(tuple, values, options || {});
    },
    // done
    function() {
      self.ack(tuple);
    }
  );
};
BasicBolt.prototype.emit = function(tuple, values, options) {
  if (arguments.length !== 3) {
    throw new Error("Do not use `this.emit` directly in a BasicBolt; see README for BasicBolt usage.");
  }
  return Storm.prototype.emit.apply(this, arguments);
};

module.exports = BasicBolt;
