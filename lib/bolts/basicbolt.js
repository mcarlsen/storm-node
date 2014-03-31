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
	self.anchoringTuple = tuple;
	
	self.process(tuple, function() {
    self.ack(tuple);
  });
};

module.exports = BasicBolt;
