var util = require('util');
var Readable = require('stream').Readable;

var through = require('through');
var fs = require('fs');
var LogicFilter = require('../index');
var redis = require('redis');

var rc = redis.createClient();

var lf = new LogicFilter();

lf.add('testRule', {
  and: {
    'checkType': 'remote.http'
    /*'monitoringZoneId': 'mzdfw',
    'metrics': {
      'duration': {
        'valueI32': 70
      }
    }*/
  }
});

var RedisRead = function() {
  Readable.call(this, {objectMode: true});
  var self = this;

  this.rc = redis.createClient();

  rc.on('pmessage', function(pattern, channel, msg) {
    total++;
    self.push(JSON.parse(msg));
  });
};
util.inherits(RedisRead, Readable);

RedisRead.prototype._read = function() {
  rc.psubscribe('*.remote.http.*');
};

var rr = new RedisRead();

var count = 0;
var total = 0;
var start = Date.now();
rr.pipe(lf)
  .pipe(through(function(obj) {
    //console.log(JSON.stringify(obj, null, 4));
    count++;
  }));

setInterval(function() {
  var duration = (Date.now() - start) / 1000;
  console.log(total / duration, count / duration);
}, 10000);
