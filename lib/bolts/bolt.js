'use strict';
var Storm = require('../storm.js'),
	util = require('util');


var Bolt = function() {};

util.inherits(Bolt, Storm);

Bolt.prototype.mode = 'bolt';
Bolt.prototype.tupleCallback = function(tuple) {	
	this.process(tuple, function() {});
};

module.exports = Bolt;
