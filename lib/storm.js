'use strict';
var util = require('util'),
  fs = require('fs');

var debug = require('./log');

var Storm = function() {};

Storm.prototype = {
  msgCount: 0,
  stormConfig: {},
  topologyContext: {},
  anchoringTuple: null,

  tupleCallback: function(tuple) {
    this.log("Process tuple here: " + tuple.tuple);
  },

  ack: function(tuple) {
    this.sendCommand({
      command: 'ack',
      id: tuple.id
    });
  },

  fail: function(tuple) {
    this.sendCommand({
      command: 'fail',
      id: tuple.id
    });
  },

  log: function(msg) {
    this.sendCommand({
      command: 'log',
      msg: msg
    });
  },

  sendToParent: function(msg) {
    var str = msg + "\nend\n";
    process.stdout.write(str);
  },

  sendCommand: function(command) {
    debug('sending: ' + JSON.stringify(command));
    this.sendToParent(JSON.stringify(command));
  },

  emit: function(tuple) {
    this.emitTuple(tuple, null, [], null);
  },

  emitTuple: function(tuple, stream, anchors, directTask) {
    var command = {
      command: 'emit'
    };

    if (this.anchoringTuple != null) {
      anchors = [this.anchoringTuple];
    }

    if (stream != null) {
      command.stream = stream;
    }

    if (anchors != null) {
      command.anchors = anchors.map(function(a) {
        return a.id;
      });
    }

    if (directTask != null) {
      command.task = directTask;
    }

    command.tuple = tuple;

    this.sendCommand(command);
  },

  sendPid: function(dir) {
    try {
      fs.writeFileSync(dir + '/' + process.pid);
    } catch (e) {
      //do nothing - issue creating pid file
    }

    process.on('uncaughtException', function(e) {
      debug('uncaught exception:' + e.toString());
      process.stdout.write(e);
    });

    process.on('exit', function() {
      process.stdout.write("Exiting");
    });

    this.sendCommand({
      pid: process.pid
    });
  },

  parseMessage: function(msg) {
    this.msgCount++;

    // Initial message, contains config. Send pid back.
    if (this.msgCount == 1) {
      var data = JSON.parse(msg);
      this.sendPid(data.pidDir);
      this.stormConfig = data.config;
      this.topologyContext = data.context;
      if (typeof this.onConfig === 'function') this.onConfig(this.stormConfig);
      if (typeof this.onContext === 'function') this.onContext(this.topologyContext);
    } else {
      var cmd = {};

      try {
        cmd = JSON.parse(msg);
      } catch (err) {
        debug("Malformed STDIN: " + msg);
        this.log('MALFORMED' + msg);
        //malformed stdin - error check here
      }

      debug('received:' + msg);

      if (this.mode == 'spout') {
        this.spoutCallback(cmd);
      } else {
        if ('tuple' in cmd) {
          this.tupleCallback(cmd);
        }
      }
    }

  },

  readMessages: function() {
    process.stdin.setEncoding("utf8");
    var msgs = [];

    process.stdin.on('data', function(chunk) {
      var chunks = chunk.split("\n");
      var last_end = 0;

      msgs = msgs.concat(chunks);

      for (var i in msgs) {
        if (msgs[i] == "end") {
          this.parseMessage(msgs.slice(last_end, i).join("\n"));
          last_end = parseInt(i) + 1;
        }
      }

      msgs.splice(0, last_end);

    });

    process.stdin.resume();
  },

  run: function() {
    this.readMessages();
  }
};

module.exports = Storm;
