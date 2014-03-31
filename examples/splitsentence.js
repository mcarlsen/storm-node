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

  // Optionally, you can anchor this tuple. Emits sent after this line
  // will automatically have their `anchors` attribute set.
  this.anchoringTuple = tuple;

  for(var i = 0; i < words.length; i++)
  {
    this.emit([words[i]]);
  }
  // In a subclass of Storm.Bolt, `ack` must be called manually.
  this.ack(tuple);
  // Or fail.
  // this.fail(tuple);
};

var ssb = new SplitSentenceBolt();

// `run()` will start listening for messages via stdin.
ssb.run();
