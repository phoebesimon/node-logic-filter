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


test('test or rule', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule1', {
    or: {
      'foo': 'bar',
      'bar': 'qux'
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 3, '3 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 'bar', 'bar': 'qux'});
  lf.write({'foo': 'bar', 'bar': 'foo'});
  lf.write({'foo': 'qux', 'bar': 'qux'});
  lf.write({'foo': 'qux', 'bar': 'foo'});
  lf.write({'bar': 'foo', 'qux': 'bar'});
  lf.end();
});


test('test not rule', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule1', {
    not: {
      'foo': 'bar'
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
  lf.write({'bar': 'qux'});
  lf.write({'foo': 'bar'});
  lf.end();
});


test('test not implied and rule', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule1', {
    not: {
      'foo': 'bar',
      'bar': 'qux'
    }
  });

  //!(foo == bar && bar == qux)
  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 5, '5 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 'bar', 'bar': 'qux'}); //N
  lf.write({'foo': 'baz', 'bar': 'qux'}); //Y
  lf.write({'foo': 'bar', 'bar': 'foo'}); //Y
  lf.write({'foo': 'bar'}); //Y
  lf.write({'bar': 'qux'}); //Y
  lf.write({}); //Y
  lf.end();
});
