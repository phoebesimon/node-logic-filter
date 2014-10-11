var test = require('tape');
var tst = require('transform-stream-test');

var LogicFilter = require('../index');


test('rule: simple', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', {'foo': 'bar'});

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar'},
      {'foo': 'baz'},
      {'foo': 'bar'},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'label': 'simpleRule1'},
      {'foo': 'bar', 'label': 'simpleRule1'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok);
});


test('rule: and', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', {
    and: {
      'foo': 'bar',
      'bar': 'qux'
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'foo'},
      {'foo': 'qux', 'baz': 'qux'},
      {'foo': 'bar', 'bar': 'qux'},
      {'bar': 'foo', 'qux': 'bar'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'bar': 'qux', 'label': 'simpleRule1'},
      {'foo': 'bar', 'bar': 'qux', 'label': 'simpleRule1'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok);
});


test('rule: or', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', {
    or: {
      'foo': 'bar',
      'bar': 'qux'
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar', 'bar': 'qux'},
      {'foo': 'bar', 'bar': 'foo'},
      {'foo': 'qux', 'bar': 'qux'},
      {'foo': 'qux', 'bar': 'foo'},
      {'bar': 'foo', 'qux': 'bar'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'bar': 'qux', 'label': 'simpleRule1'},
      {'foo': 'bar', 'bar': 'foo', 'label': 'simpleRule1'},
      {'foo': 'qux', 'bar': 'qux', 'label': 'simpleRule1'}
    ],
    'Rule matched and labeled 3 objects',
    t.ok);
});


test('rule: not', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', {
    not: {
      'foo': 'bar'
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'foo'},
      {'bar': 'qux'},
      {'foo': 'bar'},
      {},
      0,
      undefined
    ], [
      {'foo': 'baz', 'bar': 'foo', 'label': 'simpleRule1'},
      {'bar': 'qux', 'label': 'simpleRule1'},
      {'label': 'simpleRule1'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok);
});


test('rule: not -> implied and', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', {
    not: {
      'foo': 'bar',
      'bar': 'qux'
    }
  });

  //!(foo == bar && bar == qux)

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'qux'},
      {'foo': 'bar', 'bar': 'foo'},
      {'foo': 'bar'},
      {'bar': 'qux'},
      {},
      0,
      undefined
    ], [
      {'foo': 'baz', 'bar': 'qux', 'label': 'simpleRule1'},
      {'foo': 'bar', 'bar': 'foo', 'label': 'simpleRule1'},
      {'foo': 'bar', 'label': 'simpleRule1'},
      {'bar': 'qux', 'label': 'simpleRule1'},
      {'label': 'simpleRule1'}
    ],
    'Rule matched and labeled 5 objects',
    t.ok);
});


test('rule: not -> and', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', {
    not: {
      and: {
        'foo': 'bar',
        'bar': 'qux'
      }
    }
  });

  //!(foo == bar && bar == qux)

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'qux'},
      {'foo': 'bar', 'bar': 'foo'},
      {'foo': 'bar'},
      {'bar': 'qux'},
      {},
      0,
      undefined
    ], [
      {'foo': 'baz', 'bar': 'qux', 'label': 'simpleRule1'},
      {'foo': 'bar', 'bar': 'foo', 'label': 'simpleRule1'},
      {'foo': 'bar', 'label': 'simpleRule1'},
      {'bar': 'qux', 'label': 'simpleRule1'},
      {'label': 'simpleRule1'}
    ],
    'Rule matched and labeled 5 objects',
    t.ok);
});


test('rule: not -> or', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    not: {
      or: {
        'foo': 'bar',
        'bar': 'qux'
      }
    }
  });

  //!(foo == bar || bar == qux)

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'qux'},
      {'foo': 'bar', 'bar': 'foo'},
      {'foo': 'bar'},
      {'bar': 'qux'},
      {'foo': 'qux', 'bar': 'baz'},
      {},
      0,
      undefined
    ], [
      {'foo': 'qux', 'bar': 'baz', 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok);
});


test('rule: and -> or', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    and: {
      or: {
        'foo': 'bar',
        'bar': 'qux'
      },
      'qux': 'baz'
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'qux'},
      {'foo': 'bar', 'qux': 'baz'},
      {'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'bar': 'foo'},
      {'qux': 'baz'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'qux': 'baz', 'label': 'simpleRule'},
      {'bar': 'qux', 'qux': 'baz', 'label': 'simpleRule'},
      {'foo': 'bar', 'bar': 'qux', 'qux': 'baz', 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 3 objects',
    t.ok);
});


test('rule: or -> and', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    or: {
      and: {
        'foo': 'bar',
        'bar': 'qux'
      },
      'qux': 'baz'
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'qux': 'baz'},
      {'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'bar': 'qux', 'qux': 'foo'},
      {'foo': 'bar', 'bar': 'foo'},
      {'qux': 'baz'},
      {'qux': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'bar': 'qux', 'label': 'simpleRule'},
      {'foo': 'baz', 'bar': 'qux', 'qux': 'baz', 'label': 'simpleRule'},
      {'foo': 'bar', 'qux': 'baz', 'label': 'simpleRule'},
      {'bar': 'qux', 'qux': 'baz', 'label': 'simpleRule'},
      {'foo': 'bar', 'bar': 'qux', 'qux': 'baz', 'label': 'simpleRule'},
      {'foo': 'bar', 'bar': 'qux', 'qux': 'foo', 'label': 'simpleRule'},
      {'qux': 'baz', 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 7 objects',
    t.ok);
});


test('rule: or -> (and not)', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

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

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'qux', 'qux': 'foo'},
      {'foo': 'baz', 'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'qux': 'baz'},
      {'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'bar': 'foo'},
      {'foo': 'bar', 'bar': 'foo', 'qux': 'foo'},
      {'qux': 'baz'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'bar': 'qux', 'label': 'simpleRule'},
      {'foo': 'baz', 'bar': 'qux', 'label': 'simpleRule'},
      {'foo': 'baz', 'bar': 'qux', 'qux': 'foo', 'label': 'simpleRule'},
      {'foo': 'bar', 'bar': 'qux', 'qux': 'baz', 'label': 'simpleRule'},//
      {'foo': 'bar', 'bar': 'foo', 'label': 'simpleRule'},
      {'foo': 'bar', 'bar': 'foo', 'qux': 'foo', 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 7 objects',
    t.ok);
});


test('rule: and -> (or not)', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

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

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'qux'},
      {'foo': 'baz', 'bar': 'qux', 'qux': 'foo'},
      {'foo': 'baz', 'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'qux': 'baz'},
      {'bar': 'qux', 'qux': 'foo'},
      {'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'bar': 'qux', 'qux': 'baz'},
      {'foo': 'bar', 'bar': 'foo'},
      {'foo': 'bar', 'bar': 'foo', 'qux': 'foo'},
      {'qux': 'baz'},
      {'foo': 'bar'},
      {'bar': 'bar'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'bar': 'qux', 'label': 'simpleRule'},
      {'foo': 'baz', 'bar': 'qux', 'label': 'simpleRule'},
      {'foo': 'baz', 'bar': 'qux', 'qux': 'foo', 'label': 'simpleRule'},
      {'bar': 'qux', 'qux': 'foo', 'label': 'simpleRule'},
      {'foo': 'bar', 'bar': 'foo', 'label': 'simpleRule'},
      {'foo': 'bar', 'bar': 'foo', 'qux': 'foo', 'label': 'simpleRule'},
      {'foo': 'bar', 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 7 objects',
    t.ok);
});


test('rule: any', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'foo': [1, 2, 3]
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': [1, 2, 3]},
      {'foo': 1},
      {'foo': 2},
      {'foo': 3},
      {'foo': 4},
      {'bar': 1},
      {},
      0,
      undefined
    ], [
      {'foo': 1, 'label': 'simpleRule'},
      {'foo': 2, 'label': 'simpleRule'},
      {'foo': 3, 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 3 objects',
    t.ok);
});


test('rule: or -> any', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    or: {
      'foo': [1, 2, 3],
      bar: 'qux'
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': [1, 2, 3], 'bar': 'qux'},
      {'foo': 1},
      {'foo': 2},
      {'foo': 3},
      {'foo': 4},
      {'bar': 2},
      {'foo': 2, 'bar': 'baz'},
      {'foo': 5, 'bar': 'baz'},
      {'bar': 'qux'},
      {},
      0,
      undefined
    ], [
      {'foo': [1, 2, 3], 'bar': 'qux', 'label': 'simpleRule'},
      {'foo': 1, 'label': 'simpleRule'},
      {'foo': 2, 'label': 'simpleRule'},
      {'foo': 3, 'label': 'simpleRule'},
      {'foo': 2, 'bar': 'baz', 'label': 'simpleRule'},
      {'bar': 'qux', 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 6 objects',
    t.ok);
});


test('rule: not -> any', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    not: {
      'foo': [1, 2, 3]
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': [1, 2, 3]},
      {'foo': 1},
      {'foo': 2},
      {'foo': 3},
      {'foo': 4},
      {'bar': 2},
      {'foo': 2, 'bar': 'baz'},
      {'foo': 5, 'bar': 'baz'},
      {},
      0,
      undefined
    ], [
      {'foo': [1, 2, 3], 'label': 'simpleRule'},
      {'foo': 4, 'label': 'simpleRule'},
      {'bar': 2, 'label': 'simpleRule'},
      {'foo': 5, 'bar': 'baz', 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 5 objects',
    t.ok);
});


test('rule: literal array equality', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'foo': {
      value: [1, 2, 3]
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': [1, 2, 3]},
      {'foo': 1},
      {'foo': 2},
      {'foo': 3},
      {'foo': 4},
      {'bar': [1, 2, 3]},
      {},
      0,
      undefined
    ], [
      {'foo': [1, 2, 3], 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 1 object',
    t.ok);
});


test('rule: literal object equality', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'foo': {
      value: {
        'bar': 'baz'
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 'baz'}},
      {'foo': {'bar': 'baz', 'baz': 'qux'}},
      {'bar': 'baz'},
      {'foo': 'baz'},
      {'foo': 'bar'},
      {'bar': {'bar': 'baz'}},
      {},
      0,
      undefined
    ], [
      {'foo': {'bar': 'baz'}, 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 1 object',
    t.ok);
});


test('rule: literal array inequality', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    not: {
      'foo': {
        value: [1, 2, 3]
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': [1, 2, 3]},
      {'foo': 1},
      {'foo': 2},
      {'foo': 3},
      {'foo': 4},
      {'bar': [1, 2, 3]},
      {},
      0,
      undefined
    ], [
      {'foo': 1, 'label': 'simpleRule'},
      {'foo': 2, 'label': 'simpleRule'},
      {'foo': 3, 'label': 'simpleRule'},
      {'foo': 4, 'label': 'simpleRule'},
      {'bar': [1, 2, 3], 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 6 objects',
    t.ok);
});


test('rule: literal object inequality', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    not: {
      'foo': {
        value: {
          'bar': 'baz'
        }
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 'baz'}},
      {'foo': {'bar': 'baz', 'baz': 'qux'}},
      {'bar': 'baz'},
      {'foo': 'baz'},
      {'foo': 'bar'},
      {'bar': {'bar': 'baz'}},
      {},
      0,
      undefined
    ], [
      {'foo': {'bar': 'baz', 'baz': 'qux'}, 'label': 'simpleRule'},
      {'bar': 'baz', 'label': 'simpleRule'},
      {'foo': 'baz', 'label': 'simpleRule'},
      {'foo': 'bar', 'label': 'simpleRule'},
      {'bar': {'bar': 'baz'}, 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 6 objects',
    t.ok);
});


test('rule: simple update', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {'foo': 'bar'});

  t.plan(2);

  fixture.deepEqual([
      {'foo': 'bar'},
      {'foo': 'baz'},
      {'foo': 'qux'},
      {'foo': 'bar'},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'label': 'simpleRule'},
      {'foo': 'bar', 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok);

  lf.update('simpleRule', {'foo': 'baz'});

  fixture.deepEqual([
      {'foo': 'bar'},
      {'foo': 'baz'},
      {'foo': 'qux'},
      {'foo': 'bar'},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': 'baz', 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 1 object',
    t.ok);
});


test('rule: simple remove', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {'foo': 'bar'});

  t.plan(2);

  fixture.deepEqual([
      {'foo': 'bar'},
      {'foo': 'baz'},
      {'foo': 'qux'},
      {'foo': 'bar'},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'label': 'simpleRule'},
      {'foo': 'bar', 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok);

  lf.remove('simpleRule');

  fixture.deepEqual([
      {'foo': 'bar'},
      {'foo': 'baz'},
      {'foo': 'qux'},
      {'foo': 'bar'},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [],
    'Rule matched and labeled 1 object',
    t.ok,
    100);
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
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'foo': {
      and: {
        'bar': 'baz',
        'qux': 'bar'
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 'baz', 'qux': 'bar'}},
      {'foo': {'qux': 'bar'}},
      {'foo': {'bar': 'baz', 'baz': 'qux'}},
      {'foo': {'bar': 'baz'}},
      {'bar': 'baz', 'qux': 'bar'},
      {'foo': 'baz'},
      {'foo': 'bar'},
      {'bar': {'bar': 'baz'}},
      {},
      0,
      undefined
    ], [
      {'foo': {'bar': 'baz', 'qux': 'bar'}, 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 1 object',
    t.ok);
});


test('rule: nested object implied and', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'foo': {
      'bar': 'baz',
      'qux': 'bar'
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 'baz', 'qux': 'bar'}},
      {'foo': {'qux': 'bar'}},
      {'foo': {'bar': 'baz', 'baz': 'qux'}},
      {'foo': {'bar': 'baz'}},
      {'bar': 'baz', 'qux': 'bar'},
      {'foo': 'baz'},
      {'foo': 'bar'},
      {'bar': {'bar': 'baz'}},
      {},
      0,
      undefined
    ], [
      {'foo': {'bar': 'baz', 'qux': 'bar'}, 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 1 object',
    t.ok);
});


test('rule: nested object or', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'foo': {
      or: {
        'bar': 'baz',
        'qux': 'bar'
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 'baz', 'qux': 'bar'}},
      {'foo': {'qux': 'bar'}},
      {'foo': {'bar': 'baz', 'baz': 'qux'}},
      {'foo': {'bar': 'baz'}},
      {'bar': 'baz', 'qux': 'bar'},
      {'foo': 'baz'},
      {'foo': 'bar'},
      {'bar': {'bar': 'baz'}},
      {},
      0,
      undefined
    ], [
      {'foo': {'bar': 'baz', 'qux': 'bar'}, 'label': 'simpleRule'},
      {'foo': {'qux': 'bar'}, 'label': 'simpleRule'},
      {'foo': {'bar': 'baz', 'baz': 'qux'}, 'label': 'simpleRule'},
      {'foo': {'bar': 'baz'}, 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 4 objects',
    t.ok);
});


test('rule: nested object not -> implied and', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'foo': {
      not: {
        'bar': 'baz',
        'qux': 'bar'
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 'baz', 'qux': 'bar'}},
      {'foo': {'qux': 'bar'}},
      {'foo': {'bar': 'baz', 'baz': 'qux'}},
      {'foo': {'bar': 'baz'}},
      {'bar': 'baz', 'qux': 'bar'},
      {'foo': 'baz'},
      {'foo': 'bar'},
      {'bar': {'bar': 'baz'}},
      {},
      0,
      undefined
    ], [
      {'foo': {'qux': 'bar'}, 'label': 'simpleRule'},
      {'foo': {'bar': 'baz', 'baz': 'qux'}, 'label': 'simpleRule'},
      {'foo': {'bar': 'baz'}, 'label': 'simpleRule'},
      {'bar': 'baz', 'qux': 'bar', 'label': 'simpleRule'},
      {'foo': 'baz', 'label': 'simpleRule'},
      {'foo': 'bar', 'label': 'simpleRule'},
      {'bar': {'bar': 'baz'}, 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 8 objects',
    t.ok);
});


test('rule: nested object not -> and', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

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

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 'baz', 'qux': 'bar'}},
      {'foo': {'qux': 'bar'}},
      {'foo': {'bar': 'baz', 'baz': 'qux'}},
      {'foo': {'bar': 'baz'}},
      {'bar': 'baz', 'qux': 'bar'},
      {'foo': 'baz'},
      {'foo': 'bar'},
      {'bar': {'bar': 'baz'}},
      {},
      0,
      undefined
    ], [
      {'foo': {'qux': 'bar'}, 'label': 'simpleRule'},
      {'foo': {'bar': 'baz', 'baz': 'qux'}, 'label': 'simpleRule'},
      {'foo': {'bar': 'baz'}, 'label': 'simpleRule'},
      {'bar': 'baz', 'qux': 'bar', 'label': 'simpleRule'},
      {'foo': 'baz', 'label': 'simpleRule'},
      {'foo': 'bar', 'label': 'simpleRule'},
      {'bar': {'bar': 'baz'}, 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 8 objects',
    t.ok);
});


test('rule: nested object or', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'foo': {
      or: {
        'bar': 'baz',
        'qux': 'bar'
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 'baz', 'qux': 'bar'}},
      {'foo': {'qux': 'bar'}},
      {'foo': {'bar': 'baz', 'baz': 'qux'}},
      {'foo': {'bar': 'baz'}},
      {'bar': 'baz', 'qux': 'bar'},
      {'foo': 'baz'},
      {'foo': 'bar'},
      {'bar': {'bar': 'baz'}},
      {},
      0,
      undefined
    ], [
      {'foo': {'bar': 'baz', 'qux': 'bar'}, 'label': 'simpleRule'},
      {'foo': {'qux': 'bar'}, 'label': 'simpleRule'},
      {'foo': {'bar': 'baz', 'baz': 'qux'}, 'label': 'simpleRule'},
      {'foo': {'bar': 'baz'}, 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 4 objects',
    t.ok);
});


test('rule: nested object not -> or', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

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

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 'baz', 'qux': 'bar'}},
      {'foo': {'qux': 'bar'}},
      {'foo': {'bar': 'baz', 'baz': 'qux'}},
      {'foo': {'bar': 'baz'}},
      {'foo': {}},
      {'bar': 'baz', 'qux': 'bar'},
      {'foo': 'baz'},
      {'foo': 'bar'},
      {'bar': {'bar': 'baz'}},
      {},
      0,
      undefined
    ], [
      {'foo': {}, 'label': 'simpleRule'},
      {'bar': 'baz', 'qux': 'bar', 'label': 'simpleRule'},
      {'foo': 'baz', 'label': 'simpleRule'},
      {'foo': 'bar', 'label': 'simpleRule'},
      {'bar': {'bar': 'baz'}, 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 6 objects',
    t.ok);
});


test('rule: exists', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'foo': {
      exists: true
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': 1},
      {'foo': true},
      {'foo': false},
      {'foo': null},
      {'foo': 'one'},
      {'foo': {'bar': 'baz'}},
      {'foo': [1, 2, 3]},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': 1, 'label': 'simpleRule'},
      {'foo': true, 'label': 'simpleRule'},
      {'foo': false, 'label': 'simpleRule'},
      {'foo': null, 'label': 'simpleRule'},
      {'foo': 'one', 'label': 'simpleRule'},
      {'foo': {'bar': 'baz'}, 'label': 'simpleRule'},
      {'foo': [1, 2, 3], 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 7 objects',
    t.ok);
});


test('rule: not exists false', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    not: {
      'foo': {
        exists: false
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': 1},
      {'foo': true},
      {'foo': false},
      {'foo': null},
      {'foo': 'one'},
      {'foo': {'bar': 'baz'}},
      {'foo': [1, 2, 3]},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': 1, 'label': 'simpleRule'},
      {'foo': true, 'label': 'simpleRule'},
      {'foo': false, 'label': 'simpleRule'},
      {'foo': null, 'label': 'simpleRule'},
      {'foo': 'one', 'label': 'simpleRule'},
      {'foo': {'bar': 'baz'}, 'label': 'simpleRule'},
      {'foo': [1, 2, 3], 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 7 objects',
    t.ok);
});


test('rule: exists false', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'foo': {
      exists: false
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': 1},
      {'foo': true},
      {'foo': false},
      {'foo': null},
      {'foo': 'one'},
      {'foo': {'bar': 'baz'}},
      {'foo': [1, 2, 3]},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'bar': 'foo', 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok);
});


test('rule: not exists true', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    not: {
      'foo': {
        exists: true
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': 1},
      {'foo': true},
      {'foo': false},
      {'foo': null},
      {'foo': 'one'},
      {'foo': {'bar': 'baz'}},
      {'foo': [1, 2, 3]},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'bar': 'foo', 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok);
});


test('rule: doubly nested object', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', {
    'metrics': {
      'duration': {
        'valueI32': 70
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'metrics': {'duration': {'valueI32': 70}}},
      {'metrics': {'duration': {'valueI32': 70, 'valueI64': 0}}},
      {'metrics': {'duration': {'valueI32': 70, 'valueI64': 0}, 'tt_firstbyte': {}}},
      {'metrics': {'duration': {'valueI32': 80}}},
      {'metrics': {'duration': {}}},
      {'metrics': {'notDuration': {'valueI32': 70}}},
      {'metrics': null},
      {},
      0,
      undefined
    ], [
      {'metrics': {'duration': {'valueI32': 70}}, 'label': 'simpleRule'},
      {'metrics': {'duration': {'valueI32': 70, 'valueI64': 0}}, 'label': 'simpleRule'},
      {'metrics': {'duration': {'valueI32': 70, 'valueI64': 0}, 'tt_firstbyte': {}}, 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 3 objects',
    t.ok);
});


test('compareValue', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  t.ifError(lf._compareValue({}, 'foo', null, {}));
  t.end();
});


test('rule: multiple simple', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', {'foo': 'bar'});
  lf.add('simpleRule2', {'bar': 'foo'});

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar'},
      {'foo': 'baz'},
      {'foo': 'qux'},
      {'foo': 'bar'},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'label': 'simpleRule1'},
      {'foo': 'bar', 'label': 'simpleRule1'},
      {'bar': 'foo', 'label': 'simpleRule2'}
    ],
    'Rule matched and labeled 3 objects',
    t.ok);
});


test('rule: multiple same simple', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', {'foo': 'bar'});
  lf.add('simpleRule2', {'foo': 'bar'});

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar'},
      {'foo': 'baz'},
      {'foo': 'qux'},
      {'foo': 'bar'},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'label': 'simpleRule1'},
      {'foo': 'bar', 'label': 'simpleRule1'},
      {'foo': 'bar', 'label': 'simpleRule2'},
      {'foo': 'bar', 'label': 'simpleRule2'}
    ],
    'Rule matched and labeled 4 objects',
    t.ok);
});


test('rule: multiple complex', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('rule1', {
    or: {
      'foo': 'bar',
      'bar': 'baz'
    }
  });
  lf.add('rule2', {
    and: {
      'foo': 'bar',
      'qux': {
        value: {
          'a': 1,
          'b': 2
        }
      }
    }
  });

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar'},
      {'foo': 'bar', 'bar': 'baz'},
      {'bar': 'baz'},
      {'foo': 'bar', 'qux': {'a': 1, 'b': 2}},
      {'foo': 'bar', 'qux': {'a': 1, 'b': 2, 'c': 3}},
      {'foo': 'bar', 'qux': 1},
      {'qux': 'bar'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'label': 'rule1'},
      {'foo': 'bar', 'bar': 'baz', 'label': 'rule1'},
      {'bar': 'baz', 'label': 'rule1'},
      {'foo': 'bar', 'qux': {'a': 1, 'b': 2}, 'label': 'rule1'},
      {'foo': 'bar', 'qux': {'a': 1, 'b': 2}, 'label': 'rule2'},
      {'foo': 'bar', 'qux': {'a': 1, 'b': 2, 'c': 3}, 'label': 'rule1'},
      {'foo': 'bar', 'qux': 1, 'label': 'rule1'}
    ],
    'Rule matched and labeled 7 objects',
    t.ok);
});
