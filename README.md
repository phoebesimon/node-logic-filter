node-logic-filter
=================

[![Build Status](https://travis-ci.org/phoebesimon/node-logic-filter.svg?branch=master)](https://travis-ci.org/phoebesimon/node-logic-filter)

logic-filter performs filtering using arbitrary rules on streams of JSON objects and outputs objects tagged with the label of the rule they matched. If an object matches more than one rule, it will be output multiple times with each of the labels.

#Example
``` js
var LogicFilter = require('logic-filter');

var lf = new LogicFilter();

lf.add('testFilter', {
  "and": {
    "a": 1,
    "not": {
      "b": 3
    }
  }
});

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

lf.add('testFilter', {
  "and": {
    "a": 1,
    "not": {
      "b": 3
    }
  }
});

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
Filter rules are JSON objects that tell LogicFilter which objects to allow through. LogicFilter considers a rule to be a match if the value for a key in the rule equals the value for the same key in the object in the stream. There are also a few reserved keywords used for logical expression construction: `and`, `or` and `not`, and two other keywords: `value` and `exists`. The following are examples of rules and a simple object they will match:

###Rule: No operators
In this case, all the fields must be present in the compared object and equal to the values provided
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

###Rule: And
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

###Rule: Or
```
{
    "or": {
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

###Rule: Not
With `not`, note that `and` is implied when there is more than one key/value pair in the closure. In this case it must be true that !(a == 1 && b == "two").
```
{
  "not": {
    "a": 1,
    "b": "two"
  }
}
```

Matches:
```
{
  "a": 1,
  "b": "one"
}
{
  "a": 2,
  "b": "two"
}
{
  "c": 3
}
```

###Rule: Any of several values
Use an array to specify that a field can be equal to any of several values:
```
{
  "a": [1, 2, 3]
}
```

Matches:
```
{
  "a": 1
}
{
  "a": 2
}
{
  "a": 3
}
```

###Rule: Equals literal array
Use the `value` keyword to denote that you want to actually compare the value specified:
```
{
  "a": {
    "value": [1, 2, 3]
  }
}
```

Matches:
```
{
  "a": [1, 2, 3]
}
```

###Rule: Compare fields in a nested object
In this example, `and` is implied. You can pass arbitrary operators in here as well
```
{
  "a": {
    "foo": "bar",
    "bar": "baz"
  }
}
```

Matches:
```
{
  "a": {
    "foo": "bar",
    "bar": "baz"
  }
}
```
These rules can be deeply nested:
```
{
  "a": {
    "baz": {
      "value": {
        "foo": "bar"
      },
    },
    "qux": {
      "or": {
        "blue": "fish",
        "red": "fish"
      }
    }
  }
}
```

Matches:
```
{
  "a": {
    "baz": {
      "foo": "bar"
    },
    "qux": {
      "one": "fish",
      "two": "fish",
      "red": "fish"
      "blue": "whale",
    }
}
``` 

Does not match:
```
{
  "a": {
    "baz": {
      "fraggle": "rock"
    },
    "qux": {
      "one": "fish",
      "two": "fish",
      "red": "fish"
      "blue": "whale",
    }
}
```

###Rule: Object deep equal
Using the `value` keyword will compare the entire value in the filter to the entire value in the JSON object and only pass if they are both deep equal
```
{
  "a": {
    "value": {
      "b": 2,
      "c": 3
    }
  }
}
```

Matches:
```
{
  "a": {
    "b": 2,
    "c": 3
  }
}
```

###Rule: Field exists
You can also check for whether or not a field exists by using the `exists` keyword, passing it either `true` or `false`:
```
{
  "a": {
    "exists": true
  }
}
```

Matches:
```
{
  "a": 1
}
{
  "a": "one"
}
{
  "a": true
}
{
  "a": [1, 2, 3]
}
{
  "a": {
    "b": 2
  }
}

```
