node-logic-filter
=================

[![Build Status](https://travis-ci.org/phoebesimon/node-logic-filter.svg?branch=master)](https://travis-ci.org/phoebesimon/node-logic-filter)

logic-filter is a Transform object stream that performs filtering using arbitrary rules on streams of JSON objects and outputs objects tagged with the label of the rule they matched. If an object matches more than one rule, it will be output multiple times with each of the labels.

#Example
``` js
var LogicFilter = require('logic-filter');

var lf = new LogicFilter();

lf.add('testFilter', 'a === 1 && b !== 3');

lf.on('data', function(obj) {
  console.log(JSON.stringify(obj, null, 4))
});

lf.write({"a": 1, "b": 2});
lf.write({"a": 1, "b": 3});
lf.write({"a": 1});
lf.write({"b": 2});
lf.write({});
```
Which outputs:
```
{
    "a": 1,
    "b": 2,
    "label": "testFilter"
}
{
    "a": 1,
    "label": "testFilter"
}
```

LogicFilter can also be used as part of a pipeline:
``` js
var LogicFilter = require('logic-filter');
var through = require('through');

var lf = new LogicFilter();

lf.add('testFilter', 'a === 1 && b !== 3');

lf.write({"a": 1, "b": 2});
lf.write({"a": 1, "b": 3});
lf.write({"a": 1});
lf.write({"b": 2});
lf.write({});

lf.pipe(through(function(obj) {
  console.log(JSON.stringify(obj, null, 4));
}));

```
Which will output:
```
{
    "a": 1,
    "b": 2,
    "label": "testFilter"
}
{
    "a": 1,
    "label": "testFilter"
}
```


##Filter Language
Filter rules are logical expression strings that tell LogicFilter which objects to allow through. LogicFilter considers a rule to be a match if the value for a key in the rule equals the value for the same key in the object in the stream. The following are examples of rules and some simple objects they will match:


###Rule: Foo exists
```
'foo'
```
Matches:
```
{
  "foo": 1
}
{
  "foo": "bar"
}
{
  "foo": [1, 2, 3]
}
{
  "foo": {"bar": "baz"}
}
{
  "foo": null
}

```

###Rule: And
In this case, all the fields must be present in the compared object and equal to the values provided
```
'a === 1 && b ==="two"'
```
**Note that strings as values must be either single or double quoted; keys may be quoted, but it is not necessary unless you want to include a space (" ") as part of the key

Matches:
```
{
  "a": 1,
  "b": "two",
  "c": "three"
}
```

###Rule: Or
```
'a === 1 || b === "two"'
```

Matches:
```
{
  "a": 1,
  "b": "one"
}
```

###Rule: Not
```
'a !== 1'
```
or
```
'!(a === 1)'

Matches:
```
{
  "a": 2,
  "b": "two"
}
{
  "c": 3
}
{}
```
But not:
```
{
  "a": 1,
  "b": "one"
}
```

###Rule: foo equals an array
```
'foo === [1, 2, 3]'
```

Matches:
```
{
  "foo": [1, 2, 3]
}
```

###Rule: Compare fields in a nested object
```
'foo.bar === "baz"'
```

Matches:
```
{
  "foo": {
    "bar": "baz"
  }
}
```
The `.` operator acts as a delimiter. You can change what is used as the delimiter by setting the delimiter using the `setDelimiter` method. These rules can be arbitrarily deeply nested.

###Rule: Object deep equal
```
'foo === {"bar": "baz", "qux": "baz"}'
```

Matches:
```
{
  "foo": {
    "bar": "baz",
    "qux": "baz"
  }
}
```
