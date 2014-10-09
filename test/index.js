var util = require('util');
var Readable = require('stream').Readable;

var test = require('tape');

var LogicFilter = require('../index');


var TestStream = function() {
  Readable.call(this, {objectMode: true});
};
util.inherits(TestStream, Readable);

TestStream.prototype._read = function() {
};


test('test simple rule', function(t) {
  var r = new TestStream,
      lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule1', {'foo': 'bar'});

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 2, '2 objects passed through the filter');
    t.end();
  });

  r.pipe(lf);

  r.push({'foo': 'bar'});
  r.push({'foo': 'baz'});
  r.push({'foo': 'qux'});
  r.push({'foo': 'bar'});
  r.push({'bar': 'foo'});
  r.push(null);
});
