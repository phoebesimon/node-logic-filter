var util = require('util');
var Transform = require('stream').Transform;
var logicFilterString = require('logic-filter-strings');

var _ = require('underscore');


var OPERATORS = {
  '&&': 1,
  '||': 2
}

var LogicFilter = function(options) {
  options = options || {};
  Transform.call(this, {objectMode: true});

  this.rules = {};
  this.delimiter = options.delimiter || '.';
};
util.inherits(LogicFilter, Transform);


LogicFilter.prototype.add = function(label, rule) {
  var _rule = logicFilterString(rule);

  if (!_rule.status) {
    return false;
  }
  rule = _rule.value;

  this.rules[label] = rule;
  return true;
};


LogicFilter.prototype.update = function(label, rule) {
  var _rule;

  if (!this.rules.hasOwnProperty(label)) {
    return false;
  }

  _rule = logicFilterString(rule);

  if (!_rule.status) {
    return false;
  }
  rule = _rule.value;

  this.rules[label] = rule;
  return true;
};


LogicFilter.prototype.remove = function(label) {
  delete this.rules[label];
};


LogicFilter.prototype.setDelimiter = function(delimiter) {
  this.delimiter = delimiter;
}


LogicFilter.prototype._exists = function(key, obj) {
  var result = true,
      keys = key.split(this.delimiter);

  function check(_obj, _key, _keys) {
    if (_keys.length === 0) {
      return result && _obj && _obj.hasOwnProperty(_key);
    }
    return result && _obj && _obj.hasOwnProperty(_key) && check(_obj[_key], _keys.shift(), _keys);
  }
  result = check(obj, keys.shift(), keys);
  return result;
};


LogicFilter.prototype._condition = function(filter, obj) {
  var key = filter[0],
      value = filter[2],
      result = true,
      keys = key.split(this.delimiter);

  function check(_obj, _key, _keys) {
    if (_keys.length === 0) {
      return result && _obj && _obj.hasOwnProperty(_key) && _.isEqual(_obj[_key], value);
    }
    return result && _obj && _obj.hasOwnProperty(_key) && check(_obj[_key], _keys.shift(), _keys);
  }

  result = check(obj, keys.shift(), keys);
  return result;
};


LogicFilter.prototype._applyFilter = function(filter, obj) {
  var self = this,
      result = true;

  if (filter.length === 1 && typeof filter[0] === 'string') {
    result = result && self._exists(filter[0], obj);
  } else if (filter.length === 3 && (filter[1] === '==' || filter[1] === '===')) {
    result = result && self._condition(filter, obj);
  } else if (filter.length === 3 && (filter[1] === '!=' || filter[1] === '!==')) {
    result = result && !self._condition(filter, obj);
  } else if (filter.length === 2 && filter[0] === '!') {
    result = result && !self._applyFilter(filter[1], obj);
  } else if (filter.length === 3 && OPERATORS[filter[1]]) {
    if (filter[1] === '&&') {
      result = result && (self._applyFilter(filter[0], obj) && self._applyFilter(filter[2], obj));
    } else {
      result = result && (self._applyFilter(filter[0], obj) || self._applyFilter(filter[2], obj));
    }
  }

  return result;
}


LogicFilter.prototype._transform = function(obj, encoding, callback) {
  var self = this,
      values = [];

  _.each(_.keys(this.rules), function(label) {
    var filter = self.rules[label];
    var toReturn = self._applyFilter(filter, obj);
    if (toReturn) {
      if (obj !== undefined) {
        obj.label = label
        self.push(obj);
      }
    }
  });

  callback();
};


module.exports = LogicFilter;
