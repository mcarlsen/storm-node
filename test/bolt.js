'use strict';
var mocha = require('mocha');
var spawn = require('child_process').spawn;
var path = require('path');
var assert = require('assert');
var fs = require('fs');

var handshakeMsg = {
  "conf": {
      "topology.message.timeout.secs": 3
  },
  "context": {
      "task->component": {
          "1": "example-spout",
          "2": "__acker",
          "3": "example-bolt"
      },
      "taskid": 3
  },
  "pidDir": "pids"
};

describe('Basic splitSentenceBolt tests' , function() {

  var ssb;
  it('Should spawn successfully', function(done) {
    ssb = spawn(
      'node',
      ['splitsentence'],
      {
        cwd: path.resolve(process.cwd(), "examples"),
        stdio: 'pipe'
      }
    );

    // Expect a pid msg
    ssb.stdout.once('data', function(data) {
      data = parseMessage(data)[0];
      assert.equal(data.pid, ssb.pid, "PID should be in message and equal to " + ssb.pid);
      var pidPath = path.resolve(process.cwd(), 'examples/' + handshakeMsg.pidDir + '/' + ssb.pid);
      assert(fs.existsSync(pidPath), 
        "Bolt should have written a pidfile to " + pidPath);
      fs.unlinkSync(pidPath);
      done();
    });

    ssb.stdin.write(JSON.stringify(handshakeMsg) + "\nend\n");
  });

  it('Should split sentences', function(done) {

    var input = [
      {
        id: 0,
        tuple: ['This sentence should be split']
      },
      {
        id: 1,
        tuple: ['and so should this.']
      }
    ];

    var index = 0;
    var splitWords = Array.prototype.concat.apply([], input.map(function(msg){ return msg.tuple[0].split(' '); }));
    ssb.stdout.on('data', function(data) {
      data = parseMessage(data);

      // For each messages that comes through, check it.
      data.forEach(function(datum){
        if (datum.command === 'emit') {
          assert.equal(datum.tuple[0], splitWords[index], "Output tuple correctly contains a split sentence.");
        } else if (datum.command === 'ack') {
          assert(datum.id === 0 || datum.id === 1);
        } else {
          throw new Error("Bolt threw an unexpected message: " + JSON.stringify(datum));
        }
        if (++index === splitWords.length) done();
      });
    });

    input.forEach(function(msg) {
      ssb.stdin.write(JSON.stringify(msg) + "\nend\n");
    });

  });
});


var msgs = [];
function parseMessage(msg) {
  var out = [];
  var chunks = msg.toString().split("\n");
  var last_end = 0;

  msgs = msgs.concat(chunks);

  msgs = msgs.filter(function(msg) {
    return !!msg;
  });

  for (var i in msgs) {
    if (msgs[i] == "end") {
      out.push(msgs.slice(last_end, i).join("\n"));
      last_end = parseInt(i) + 1;
    }
  }

  msgs.splice(0, last_end);

  return out.map(JSON.parse);
}

