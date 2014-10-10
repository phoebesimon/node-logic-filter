node-logic-filter
=================

[![Build Status](https://travis-ci.org/phoebesimon/node-logic-filter.svg?branch=master)](https://travis-ci.org/phoebesimon/node-logic-filter)

logic-filter performs filtering using arbitrary rules on streams of JSON objects and outputs objects tagged with the label of the rule they matched. If an object matches more than one rule, it will be output multiple times with each of the labels.

#Example
For this example, assume you have a file with JSON objects in `exampleObjects.json` that look like:

```
{
  "a": 1,
  "b": 2
}
{
  "a": 1,
  "b": 3
} 
...
```

``` js
var LogicFilter = require('logic-filter');
var JSONstream = require('JSONstream');
var through = require('through');
var fs = require('fs');

var lf = new LogicFilter();

lf.add('testRule', {
  "and": {
    "a": 1,
    "not": {
      "b": 3
    }
  }
});

fs.createReadStream('./exampleObjects.json').pipe(JSONstream.parse()).pipe(lf).pipe(through(function(obj) {
  console.log(JSON.stringify(obj, null, 4));
}));

```

##Filter Language
Filter rules are JSON objects that tell LogicFilter which objects to allow through. LogicFilter considers a rule to be a match if the value for a key in the rule equals the value for the same key in the object in the stream. There are also a few reserved keywords used for logical expression construction: `and`, `or` and `not`. The following are examples of rules and a simple object they will match:

Rule:
```
{
    "a": 1,
    "b": "two"
}
```

Matches:
```
{
  "a": 1,
  "b": "two",
  "c": "three"
}
```
Note that in the above, "and" is implied when there is no operator

Rule:
This is equivalent to the previous example:
```
{
    "and": {
      "a": 1,
      "b": "two"
    }
}
```

Matches:
```
{
  "a": 1,
  "b": "two",
  "c": "three"
}
```

Rule:
```
{
    'or': {
      "a": 1,
      "b": "two"
    }
}
```
**Note this is logical or, so both may be true

Matches:
```
{
  "a": 1,
  "b": "one"
}
```

