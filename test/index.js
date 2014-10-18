var test = require('tape');
var tst = require('transform-stream-test');

var LogicFilter = require('../index');


test('rule: simple string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', 'foo === "bar"');

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


test('rule: and string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', 'foo === "bar" && bar === "qux"');

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


test('rule: or string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', 'foo === "bar" || bar === "qux"');

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


test('rule: triple equals any string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', '(foo === "bar" || foo === "baz") || foo === "qux"');

  t.plan(1);

  fixture.deepEqual([
      {'foo': 'bar'},
      {'foo': 'baz'},
      {'foo': 'qux'},
      {'foo': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': 'bar', 'label': 'simpleRule1'},
      {'foo': 'baz', 'label': 'simpleRule1'},
      {'foo': 'qux', 'label': 'simpleRule1'}
    ],
    'Rule matched and labeled 3 objects',
    t.ok);
});


test('rule: not string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', 'foo !== "bar"');

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


test('rule: not -> and string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule1', '!(foo === "bar" && bar === "qux")');

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


test('rule: not -> or string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '!(foo === "bar" || bar === "qux")');

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


test('rule: and -> or string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '(foo == "bar" || bar == "qux") && qux === "baz"');

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


test('rule: or -> and string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '(foo == "bar" && bar == "qux") || qux == "baz"');

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


test('rule: or -> (and not) string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '(foo =="bar" && bar == "qux") || !(qux == "baz")');

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


test('rule: and -> (or not) string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '(foo=="bar" || bar == "qux") && !(qux=="baz")');

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


test('rule: any string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '(foo==1 || foo==2) || foo==3');

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


test('rule: literal array string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo===[1,2,3]');

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
      {'foo': [1, 2, 3], 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 1 objects',
    t.ok);
});


test('rule: or -> any string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '(foo==1||foo==2)||(foo==3||bar=="qux")');

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

  lf.add('simpleRule', '!((foo==1||foo==2)||foo==3)');

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


test('rule: simple array in array', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo==[1,2,3]');

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


test('rule: array/values in array string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '(foo==[1,2,3]||foo==1) || (foo==2||foo==3)');

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
      {'foo': [1, 2, 3], 'label': 'simpleRule'},
      {'foo': 1, 'label': 'simpleRule'},
      {'foo': 2, 'label': 'simpleRule'},
      {'foo': 3, 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 4 object',
    t.ok);
});


test('rule: literal object equality string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo=={bar:"baz"}');

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


test('rule: literal array inequality string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo!=[1,2,3]');

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


test('rule: literal object inequality string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo!={bar:"baz"}');

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


test('rule: simple update string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo==="bar"');

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

  lf.update('simpleRule', 'foo=="baz"');

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


test('rule: nested object and string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo.bar=="baz"&&foo.qux=="bar"');

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


test('rule: nested object or string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo.bar=="baz"||foo.qux=="bar"');

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


test('rule: nested object not -> implied and string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo.bar!="baz"&&foo.qux!="bar"');

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
      {'bar': 'baz', 'qux': 'bar', 'label': 'simpleRule'},
      {'foo': 'baz', 'label': 'simpleRule'},
      {'foo': 'bar', 'label': 'simpleRule'},
      {'bar': {'bar': 'baz'}, 'label': 'simpleRule'},
      {'label': 'simpleRule'}
    ],
    'Rule matched and labeled 8 objects',
    t.ok);
});


test('rule: nested object not -> and string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '!(foo.bar=="baz"&&foo.qux=="bar")');

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


test('rule: nested object not -> or string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '!(foo.bar=="baz"||foo.qux=="bar")');

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


test('rule: exists string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo');

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


test('rule: not exists string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '!foo');

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

test('rule: exists nested string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', '!foo.bar');

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 1}},
      {'foo': {'bar': true}},
      {'foo': {'bar': false}},
      {'foo': {'bar': null}},
      {'foo': {'bar': 'one'}},
      {'foo': {'bar': {'bar': 'baz'}}},
      {'foo': {'bar': [1, 2, 3]}},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'bar': 'foo', 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 1 object',
    t.ok);
});

test('rule: not exists nested string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo.bar');

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': 1}},
      {'foo': {'bar': true}},
      {'foo': {'bar': false}},
      {'foo': {'bar': null}},
      {'foo': {'bar': 'one'}},
      {'foo': {'bar': {'bar': 'baz'}}},
      {'foo': {'bar': [1, 2, 3]}},
      {'bar': 'foo'},
      {},
      0,
      undefined
    ], [
      {'foo': {'bar': 1}, 'label': 'simpleRule'},
      {'foo': {'bar': true}, 'label': 'simpleRule'},
      {'foo': {'bar': false}, 'label': 'simpleRule'},
      {'foo': {'bar': null}, 'label': 'simpleRule'},
      {'foo': {'bar': 'one'}, 'label': 'simpleRule'},
      {'foo': {'bar': {'bar': 'baz'}}, 'label': 'simpleRule'},
      {'foo': {'bar': [1, 2, 3]}, 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 7 objects',
    t.ok);
});

test('Unparseable rule', function(t) {
  var lf = new LogicFilter();

  t.ifError(lf.add('bad rule', 'blah =='), 'Correctly did not parse bad string');
  t.end();
});

test('Update nonexistent rule', function(t) {
  var lf = new LogicFilter();

  t.ifError(lf.update('bad rule', 'blah =='), 'Did not update non-existent rule');
  t.end();
});

test('Update to unparseable rule', function(t) {
  var lf = new LogicFilter();

  lf.add('good rule', 'foo == "bar"');

  t.ifError(lf.update('good rule', 'blah =='), 'Correctly did not update to bad rule');
  t.end();
});


test('rule: simple remove', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo == "bar"');

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
    'Rule matched and labeled 0 objects',
    t.ok,
    100);
});


test('setDelimiter option', function(t) {
  var lf = new LogicFilter({'delimiter': '_'}),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo.bar == "baz"');
  lf.add('simpleRule2', 'foo_bar == "baz"');

  t.plan(1);

  fixture.deepEqual([
      {'foo': {'bar': "baz"}},
      {'foo.bar': 'baz'},
      {'foo_bar': 'baz'},
      {'foo': {'bar': "qux"}},
      {'foo.bar': 'qux'},
      {'foo:bar': 'qux'},
      {},
      0,
      undefined
    ], [
      {'foo': {'bar': "baz"}, 'label': 'simpleRule2'},
      {'foo.bar': 'baz', 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok);
});


test('setDelimiter', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'foo.bar == "baz"');
  lf.add('simpleRule2', 'foo_bar == "baz"');

  t.plan(2);

  console.log()
  fixture.deepEqual([
      {'foo': {'bar': "baz"}},
      {'foo.bar': 'baz'},
      {'foo_bar': 'baz'},
      {'foo': {'bar': "qux"}},
      {'foo.bar': 'qux'},
      {'foo:bar': 'qux'},
      {},
      0,
      undefined
    ], [
      {'foo': {'bar': "baz"}, 'label': 'simpleRule'},
      {'foo_bar': 'baz', 'label': 'simpleRule2'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok);

  lf.setDelimiter('_');

  fixture.deepEqual([
      {'foo': {'bar': "baz"}},
      {'foo.bar': 'baz'},
      {'foo_bar': 'baz'},
      {'foo': {'bar': "qux"}},
      {'foo.bar': 'qux'},
      {'foo:bar': 'qux'},
      {},
      0,
      undefined
    ], [
      {'foo': {'bar': "baz"}, 'label': 'simpleRule2'},
      {'foo.bar': 'baz', 'label': 'simpleRule'}
    ],
    'Rule matched and labeled 2 objects',
    t.ok,
    100);
});

test('rule: doubly nested object string', function(t) {
  var lf = new LogicFilter(),
      fixture = tst(t, lf);

  lf.add('simpleRule', 'metrics.duration.valueI32 === 70');

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