var test = require('tape');

var LogicFilter = require('../index');


test('test simple rule', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule1', {'foo': 'bar'});

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 2, '2 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 'bar'});
  lf.write({'foo': 'baz'});
  lf.write({'foo': 'qux'});
  lf.write({'foo': 'bar'});
  lf.write({'bar': 'foo'});
  lf.end();
});


test('test and rule', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule1', {
    and: {
      'foo': 'bar',
      'bar': 'qux'
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 2, '2 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 'bar', 'bar': 'qux'});
  lf.write({'foo': 'baz', 'bar': 'foo'});
  lf.write({'foo': 'qux', 'baz': 'qux'});
  lf.write({'foo': 'bar', 'bar': 'qux'});
  lf.write({'bar': 'foo', 'qux': 'bar'});
  lf.end();
});
