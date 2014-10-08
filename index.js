var util = require('util');
var _ = require('underscore');
var Transform = require('stream').Transform;

var OPERATORS = {
  'and': 1,
  'or': 2,
  'not': 3
};


var LogicFilter = function() {
  Transform.call(this, {objectMode: true});

  this.rules = {};
};
util.inherits(LogicFilter, Transform);


LogicFilter.prototype.add = function(label, rule) {
  this.rules[label] = rule;
};


LogicFilter.prototype.update = function(label, rule) {
  this.rules[label] = rule;
};


LogicFilter.prototype.remove = function(label) {
    delete this.rules[label];
};

LogicFilter.prototype._compareValue = function(filter, key, obj) {
  var value = filter[key];

  if (!obj) {
    return false;
  }

  if (value instanceof Array) {
    return _.has(obj, key) && _.contains(value, obj[key]);
  } else {
    return _.has(obj, key) && obj[key] === value;
  }
};


LogicFilter.prototype._applyOperator= function(operator, values) {
  switch (operator.toLowerCase()) {
    case 'and':
      return values.length !== 0 && values.indexOf(false) === -1;
    case 'or':
      return values.indexOf(true) !== -1;
    case 'not':
      return values.indexOf(true) === -1;
    default:
      throw new Error('Applying non-existent operator');
  }
};


LogicFilter.prototype._applyFilter = function(operator, filter, obj) {
  var self = this,
      keys,
      values = [];

  if (!filter) {
    return false;
  }

  keys = _.keys(filter);

  _.each(keys, function(key) {
    if (!OPERATORS[key]) {
      values.push(self._compareValue(filter, key, obj));
    } else if (OPERATORS[key] && !(filter[key] instanceof Object)) {
      throw new Error('Incorrect syntax: Operators must apply to an object');
    } else if (OPERATORS[key] && filter[key] instanceof Object) {
      values.push(self._applyFilter(key, filter[key], obj));
    }
  });

  return self._applyOperator(operator, values);
};


LogicFilter.prototype._transform = function(obj, encoding, callback) {
  var self = this,
      values = [];

  _.each(Object.keys(this.rules), function(label) {
    var filter = self.rules[label];
    var toReturn = self._applyFilter('and', filter, obj);
    if (toReturn) {
      obj.label = label
      self.push(obj);
    }
  });

  callback();
};

exports.LogicFilter = LogicFilter;