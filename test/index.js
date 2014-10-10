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
  lf.write(0);
  lf.write(undefined);
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


test('rule: literal array inequality', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    not: {
      'foo': {
        value: [1, 2, 3]
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 6, '6 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': [1, 2, 3]}); //N
  lf.write({'foo': 1}); //Y
  lf.write({'foo': 2}); //Y
  lf.write({'foo': 3}); //Y
  lf.write({'foo': 4}); //Y
  lf.write({'bar': [1, 2, 3]}); //Y
  lf.write({}); //Y
  lf.end();
});


test('rule: literal object inequality', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    not: {
      'foo': {
        value: {
          'bar': 'baz'
        }
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 6, '6 object passed through the filter');
    t.end();
  });

  lf.write({'foo': {'bar': 'baz'}}); //N
  lf.write({'foo': {'bar': 'baz', 'baz': 'qux'}}); //Y
  lf.write({'bar': 'baz'}); //Y
  lf.write({'foo': 'baz'}); //Y
  lf.write({'foo': 'bar'}); //Y
  lf.write({'bar': {'bar': 'baz'}}); //Y
  lf.write({}); //Y
  lf.end();
});


test('rule: simple update', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule1', {'foo': 'bar'});

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 3, '3 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 'bar'});
  lf.write({'foo': 'baz'});
  lf.write({'foo': 'qux'});
  lf.write({'foo': 'bar'});
  lf.write({'bar': 'foo'});

  lf.update('simpleRule1', {'foo': 'baz'});

  lf.write({'foo': 'bar'});
  lf.write({'foo': 'baz'});
  lf.write({'foo': 'qux'});
  lf.write({'foo': 'bar'});
  lf.write({'bar': 'foo'});
  lf.end();
});


test('rule: simple remove', function(t) {
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

  lf.remove('simpleRule1');

  lf.write({'foo': 'bar'});
  lf.write({'foo': 'baz'});
  lf.write({'foo': 'qux'});
  lf.write({'foo': 'bar'});
  lf.write({'bar': 'foo'});
  lf.end();
});


test('bad _applyOperator', function(t) {
  var lf = new LogicFilter();

  t.throws(lf._applyOperator.bind(lf, 'bad', [true, false, true]),
           /Applying non-existent operator/, 'Should throw error');
  t.end();
});


test('null filter', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  t.ifError(lf._applyFilter('and', null, {'foo': 'bar'}));
  t.end();
});


test('rule: literal object equality', function(t) {
  var lf = new LogicFilter();

  lf.add('simpleRule', {
    and: 'foo'
  });

  t.throws(lf.write.bind(lf, {'foo': {'bar': 'baz'}}));
  t.end();
});


test('rule: nested object and', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': {
      and: {
        'bar': 'baz',
        'qux': 'bar'
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

  lf.write({'foo': {'bar': 'baz', 'qux': 'bar'}}); //Y
  lf.write({'foo': {'qux': 'bar'}}); //N
  lf.write({'foo': {'bar': 'baz', 'baz': 'qux'}}); //N
  lf.write({'foo': {'bar': 'baz'}}); //N
  lf.write({'bar': 'baz', 'qux': 'bar'}); //N
  lf.write({'foo': 'baz'}); //N
  lf.write({'foo': 'bar'}); //N
  lf.write({'bar': {'bar': 'baz'}}); //N
  lf.write({}); //N
  lf.end();
});


test('rule: nested object or', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': {
      or: {
        'bar': 'baz',
        'qux': 'bar'
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 4, '4 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': {'bar': 'baz', 'qux': 'bar'}}); //Y
  lf.write({'foo': {'qux': 'bar'}}); //Y
  lf.write({'foo': {'bar': 'baz', 'baz': 'qux'}}); //Y
  lf.write({'foo': {'bar': 'baz'}}); //Y
  lf.write({'bar': 'baz', 'qux': 'bar'}); //N
  lf.write({'foo': 'baz'}); //N
  lf.write({'foo': 'bar'}); //N
  lf.write({'bar': {'bar': 'baz'}}); //N
  lf.write({}); //N
  lf.end();
});


test('rule: nested object not -> implied and', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': {
      not: {
        'bar': 'baz',
        'qux': 'bar'
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 8, '8 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': {'bar': 'baz', 'qux': 'bar'}}); //N
  lf.write({'foo': {'qux': 'bar'}}); //Y
  lf.write({'foo': {'bar': 'baz', 'baz': 'qux'}}); //Y
  lf.write({'foo': {'bar': 'baz'}}); //Y
  lf.write({'bar': 'baz', 'qux': 'bar'}); //Y
  lf.write({'foo': 'baz'}); //Y
  lf.write({'foo': 'bar'}); //Y
  lf.write({'bar': {'bar': 'baz'}}); //Y
  lf.write({}); //Y
  lf.end();
});


test('rule: nested object not -> and', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': {
      not: {
        and: {
          'bar': 'baz',
          'qux': 'bar'
        }
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 8, '8 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': {'bar': 'baz', 'qux': 'bar'}}); //N
  lf.write({'foo': {'qux': 'bar'}}); //Y
  lf.write({'foo': {'bar': 'baz', 'baz': 'qux'}}); //Y
  lf.write({'foo': {'bar': 'baz'}}); //Y
  lf.write({'bar': 'baz', 'qux': 'bar'}); //Y
  lf.write({'foo': 'baz'}); //Y
  lf.write({'foo': 'bar'}); //Y
  lf.write({'bar': {'bar': 'baz'}}); //Y
  lf.write({}); //Y
  lf.end();
});


test('rule: nested object or', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': {
      or: {
        'bar': 'baz',
        'qux': 'bar'
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 4, '4 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': {'bar': 'baz', 'qux': 'bar'}}); //Y
  lf.write({'foo': {'qux': 'bar'}}); //Y
  lf.write({'foo': {'bar': 'baz', 'baz': 'qux'}}); //Y
  lf.write({'foo': {'bar': 'baz'}}); //Y
  lf.write({'foo': {}}); //N
  lf.write({'bar': 'baz', 'qux': 'bar'}); //N
  lf.write({'foo': 'baz'}); //N
  lf.write({'foo': 'bar'}); //N
  lf.write({'bar': {'bar': 'baz'}}); //N
  lf.write({}); //N
  lf.end();
});


test('rule: nested object not -> or', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': {
      not: {
        or: {
          'bar': 'baz',
          'qux': 'bar'
        }
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 6, '6 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': {'bar': 'baz', 'qux': 'bar'}}); //N
  lf.write({'foo': {'qux': 'bar'}}); //N
  lf.write({'foo': {'bar': 'baz', 'baz': 'qux'}}); //N
  lf.write({'foo': {'bar': 'baz'}}); //N
  lf.write({'foo': {}}); //Y
  lf.write({'bar': 'baz', 'qux': 'bar'}); //Y
  lf.write({'foo': 'baz'}); //Y
  lf.write({'foo': 'bar'}); //Y
  lf.write({'bar': {'bar': 'baz'}}); //Y
  lf.write({}); //Y
  lf.end();
});


test('rule: exists', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': {
      exists: true
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 7, '7 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 1}); //Y
  lf.write({'foo': true}); //Y
  lf.write({'foo': false}); //Y
  lf.write({'foo': null}); //Y
  lf.write({'foo': 'one'}); //Y
  lf.write({'foo': {'bar': 'baz'}}); //Y
  lf.write({'foo': [1, 2, 3]}); //Y
  lf.write({'bar': 'foo'}); //N
  lf.write({}); //N
  lf.end();
});


test('rule: not exists false', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    not: {
      'foo': {
        exists: false
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

  lf.write({'foo': 1}); //Y
  lf.write({'foo': true}); //Y
  lf.write({'foo': false}); //Y
  lf.write({'foo': null}); //Y
  lf.write({'foo': 'one'}); //Y
  lf.write({'foo': {'bar': 'baz'}}); //Y
  lf.write({'foo': [1, 2, 3]}); //Y
  lf.write({'bar': 'foo'}); //N
  lf.write({}); //N
  lf.end();
});


test('rule: exists false', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    'foo': {
      exists: false
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 2, '2 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 1}); //N
  lf.write({'foo': true}); //N
  lf.write({'foo': false}); //N
  lf.write({'foo': null}); //N
  lf.write({'foo': 'one'}); //N
  lf.write({'foo': {'bar': 'baz'}}); //N
  lf.write({'foo': [1, 2, 3]}); //N
  lf.write({'bar': 'foo'}); //Y
  lf.write({}); //Y
  lf.end();
});


test('rule: not exists true', function(t) {
  var lf = new LogicFilter(),
      counter = 0;

  lf.add('simpleRule', {
    not: {
      'foo': {
        exists: true
      }
    }
  });

  lf.on('data', function(obj) {
    counter++;
  });

  lf.on('end', function() {
    t.equal(counter, 2, '2 objects passed through the filter');
    t.end();
  });

  lf.write({'foo': 1}); //N
  lf.write({'foo': true}); //N
  lf.write({'foo': false}); //N
  lf.write({'foo': null}); //N
  lf.write({'foo': 'one'}); //N
  lf.write({'foo': {'bar': 'baz'}}); //N
  lf.write({'foo': [1, 2, 3]}); //N
  lf.write({'bar': 'foo'}); //Y
  lf.write({}); //Y
  lf.end();
});
