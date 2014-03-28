'use strict';
var Storm = require('../storm'),
  util = require('util');

var debug = require('../log');

// states
var Spout = function() {
  this.mode = 'spout';
};

util.inherits(Spout, Storm);

/**
 * sends the sync command back to the shellspout
 */
Spout.prototype.sync = function() {
  this.sendCommand({
    command: 'sync'
  }, this);
};
/**
 * override this for acknowledgement of tuple
 */
Spout.prototype.onAcknowledge = function(id) {
  throw 'acknowledge not implemented';
};

/**
 * override this to fail 
 */
Spout.prototype.onFail = function(id) {
  throw 'fail not implemented';
};

/**
 * read a msg from the queue
 */
Spout.prototype.readTuple = function() {
  throw 'readTuple not implemented'
};

Spout.prototype.spoutCallback = function(msg) {
  var self = this;
  var no_tuple = false;

  debug('callback: ' + JSON.stringify(msg));

  switch (msg.command) {
    case 'next':
      self.readTuple(function(tuple) {
        if (tuple) {
          debug('emitting:' + JSON.stringify(tuple));
          self.emit(tuple, self);
          self.sync();
        } else {
          setTimeout(self.sync.bind(self), 1000);
        }
      });
      break;
    case 'ack':
      self.onAcknowledge(msg.id);
      break;
    case 'fail':
      // queue the failed msg
      self.onFail(msg.id);
      break;
    case 'default':
      break;
  }
};

module.exports = Spout;
