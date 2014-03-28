'use strict';
var util = require('util');
var Storm = require('../lib/index');

var SplitSentenceBolt = function() {
  // Put any init code here.
};
util.inherits(SplitSentenceBolt, Storm.Bolt);

// Optional. If present will be called with storm configuration.
SplitSentenceBolt.prototype.onConfig = function(stormConfig) {

};

// Optional. If present, will be called with topology context.
SplitSentenceBolt.prototype.onContext = function(topologyContext) {

};

SplitSentenceBolt.prototype.process = function(tuple) {
  // Configuration is also available via `this.stormConfig`
  var words = tuple.tuple[0].split(" ");

  for(var i = 0; i < words.length; i++)
  {
    this.emit([words[i]]);
  }
};

var ssb = new SplitSentenceBolt();
// `run()` will start listening for messages via stdin.
ssb.run();
