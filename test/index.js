var test = require('tape');

var LogicFilter = require('../index');


test('rule: simple', function(t) {
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


test('rule: and', function(t) {
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


test('rule: or', function(t) {
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


test('rule: not', function(t) {
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


test('rule: not -> implied and', function(t) {
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


test('rule: not -> and', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    not: {
      and: {
        'foo': 'bar',
        'bar': 'qux'
      }
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


test('rule: not -> or', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    not: {
      or: {
        'foo': 'bar',
        'bar': 'qux'
      }
    }
  });

  //!(foo == bar || bar == qux)
  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 2, '2 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 'bar', 'bar': 'qux'}); //N
  lf.write({'foo': 'baz', 'bar': 'qux'}); //N
  lf.write({'foo': 'bar', 'bar': 'foo'}); //N
  lf.write({'foo': 'bar'}); //N
  lf.write({'bar': 'qux'}); //N
  lf.write({'foo': 'qux', 'bar': 'baz'}); //Y
  lf.write({}); //Y
  lf.end();
});


test('rule: and -> or', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    and: {
      or: {
        'foo': 'bar',
        'bar': 'qux'
      },
      'qux': 'baz'
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 3, '3 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 'bar', 'bar': 'qux'}); //N
  lf.write({'foo': 'baz', 'bar': 'qux'}); //N
  lf.write({'foo': 'bar', 'qux': 'baz'}); //Y
  lf.write({'bar': 'qux', 'qux': 'baz'}); //Y
  lf.write({'foo': 'bar', 'bar': 'qux', 'qux': 'baz'}); //Y
  lf.write({'foo': 'bar', 'bar': 'foo'}); //N
  lf.write({'qux': 'baz'}); //N
  lf.write({}); //N
  lf.end();
});


test('rule: or -> and', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    or: {
      and: {
        'foo': 'bar',
        'bar': 'qux'
      },
      'qux': 'baz'
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 7, '7 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 'bar', 'bar': 'qux'}); //Y
  lf.write({'foo': 'baz', 'bar': 'qux'}); //N
  lf.write({'foo': 'baz', 'bar': 'qux', 'qux': 'baz'}); //Y
  lf.write({'foo': 'bar', 'qux': 'baz'}); //Y
  lf.write({'bar': 'qux', 'qux': 'baz'}); //Y
  lf.write({'foo': 'bar', 'bar': 'qux', 'qux': 'baz'}); //Y
  lf.write({'foo': 'bar', 'bar': 'qux', 'qux': 'foo'}); //N
  lf.write({'foo': 'bar', 'bar': 'foo'}); //N
  lf.write({'qux': 'baz'}); //Y
  lf.write({'qux': 'foo'}); //N
  lf.write({}); //N
  lf.end();
});


test('rule: or -> (and not)', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    or: {
      and: {
        'foo': 'bar',
        'bar': 'qux'
      },
      not: {
        'qux': 'baz'
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 7, '7 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 'bar', 'bar': 'qux'}); //Y
  lf.write({'foo': 'baz', 'bar': 'qux'}); //Y
  lf.write({'foo': 'baz', 'bar': 'qux', 'qux': 'foo'}); //Y
  lf.write({'foo': 'baz', 'bar': 'qux', 'qux': 'baz'}); //N
  lf.write({'foo': 'bar', 'qux': 'baz'}); //N
  lf.write({'bar': 'qux', 'qux': 'baz'}); //N
  lf.write({'foo': 'bar', 'bar': 'qux', 'qux': 'baz'}); //Y
  lf.write({'foo': 'bar', 'bar': 'foo'}); //Y
  lf.write({'foo': 'bar', 'bar': 'foo', 'qux': 'foo'}); //Y
  lf.write({'qux': 'baz'}); //N
  lf.write({}); //Y
  lf.end();
});


test('rule: and -> (or not)', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    and: {
      or: {
        'foo': 'bar',
        'bar': 'qux'
      },
      not: {
        'qux': 'baz'
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 7, '7 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 'bar', 'bar': 'qux'}); //Y
  lf.write({'foo': 'baz', 'bar': 'qux'}); //Y
  lf.write({'foo': 'baz', 'bar': 'qux', 'qux': 'foo'}); //Y
  lf.write({'foo': 'baz', 'bar': 'qux', 'qux': 'baz'}); //N
  lf.write({'foo': 'bar', 'qux': 'baz'}); //N
  lf.write({'bar': 'qux', 'qux': 'baz'}); //N
  lf.write({'bar': 'qux', 'qux': 'foo'}); //Y
  lf.write({'foo': 'bar', 'bar': 'qux', 'qux': 'baz'}); //N
  lf.write({'foo': 'bar', 'bar': 'foo'}); //Y
  lf.write({'foo': 'bar', 'bar': 'foo', 'qux': 'foo'}); //Y
  lf.write({'qux': 'baz'}); //N
  lf.write({'foo': 'bar'}); //Y
  lf.write({'bar': 'bar'}); //N
  lf.write({}); //N
  lf.end();
});


test('rule: any', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': [1, 2, 3]
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 3, '3 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': [1, 2, 3]}); //N
  lf.write({'foo': 1}); //Y
  lf.write({'foo': 2}); //Y
  lf.write({'foo': 3}); //Y
  lf.write({'foo': 4}); //Y
  lf.write({'bar': 1}); //N
  lf.write({}); //N
  lf.end();
});


test('rule: or -> any', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    or: {
      'foo': [1, 2, 3],
      bar: 'qux'
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 6, '6 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': [1, 2, 3], 'bar': 'qux'}); //Y
  lf.write({'foo': 1}); //Y
  lf.write({'foo': 2}); //Y
  lf.write({'foo': 3}); //Y
  lf.write({'foo': 4}); //N
  lf.write({'bar': 2}); //N
  lf.write({'foo': 2, 'bar': 'baz'}); //Y
  lf.write({'foo': 5, 'bar': 'baz'}); //N
  lf.write({'bar': 'qux'}); //Y
  lf.write({}); //N
  lf.end();
});


test('rule: not -> any', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    not: {
      'foo': [1, 2, 3]
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 5, '5 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': [1, 2, 3]}); //Y
  lf.write({'foo': 1}); //N
  lf.write({'foo': 2}); //N
  lf.write({'foo': 3}); //N
  lf.write({'foo': 4}); //Y
  lf.write({'bar': 2}); //Y
  lf.write({'foo': 2, 'bar': 'baz'}); //N
  lf.write({'foo': 5, 'bar': 'baz'}); //Y
  lf.write({}); //Y
  lf.end();
});


test('rule: literal array equality', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': {
      value: [1, 2, 3]
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 1, '1 object passed through the filter');
    t.end();
  });

  lf.write({'foo': [1, 2, 3]}); //Y
  lf.write({'foo': 1}); //N
  lf.write({'foo': 2}); //N
  lf.write({'foo': 3}); //N
  lf.write({'foo': 4}); //N
  lf.write({'bar': [1, 2, 3]}); //N
  lf.write({}); //N
  lf.end();
});


test('rule: literal object equality', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': {
      value: {
        'bar': 'baz'
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 1, '1 object passed through the filter');
    t.end();
  });

  lf.write({'foo': {'bar': 'baz'}}); //Y
  lf.write({'foo': {'bar': 'baz', 'baz': 'qux'}}); //N
  lf.write({'bar': 'baz'}); //N
  lf.write({'foo': 'baz'}); //N
  lf.write({'foo': 'bar'}); //N
  lf.write({'bar': {'bar': 'baz'}}); //N
  lf.write({}); //N
  lf.end();
});
