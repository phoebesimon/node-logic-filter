var util = require('util');
var Transform = require('stream').Transform;

var _ = require('underscore');

var OPERATORS = {
  'and': 1,
  'or': 2,
  'not': 3
};


var isObject = function(obj) {
  return obj && typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
}


var LogicFilter = function() {
  Transform.call(this, {objectMode: true});

  this.rules = {};
};
util.inherits(LogicFilter, Transform);


LogicFilter.validate = function(rule) {
  var values = [];

  if (_.isEqual(rule, {}) || rule === null || rule === undefined) {
    return false;
  }

  function _validate(rule) {
    _.each(_.keys(rule), function(key) {
      var isObj = isObject(rule[key]);

      if (!OPERATORS[key]) {
        if (isObj) {
          if (rule[key].hasOwnProperty('exists')) {
            if(!(rule[key].exists === true || rule[key].exists === false)) {
              values.push(false);
            }
          } else if (rule[key].hasOwnProperty('value')) {
            values.push(true);
          } else {
            values.push(_validate(rule[key]));
          }
        } else {
          values.push(true);
        }
      } else {
        if (!isObj) {
          values.push(false);
        } else {
          values.push(_validate(rule[key]));
        }
      }
    });
  }

  _validate(rule);
  return values.indexOf(false) === -1;
};


LogicFilter.prototype.add = function(label, rule) {
  var isValid = LogicFilter.validate(rule);

  if (isValid) {
    this.rules[label] = rule;
    return true;
  }

  return false;
};


LogicFilter.prototype.update = function(label, rule) {
  var isValid = LogicFilter.validate(rule);

  if (!this.rules.hasOwnProperty(label)) {
    return false;
  }

  if (isValid) {
    this.rules[label] = rule;
    return true;
  }

  return false;
};


LogicFilter.prototype.remove = function(label) {
    delete this.rules[label];
};

LogicFilter.prototype._compareValue = function(filter, key, obj, options) {
  var found = false,
      i = 0,
      value;

  options = options || {}
  value = options.literal || options.exists ? filter : filter[key];

  if (!obj) {
    return false;
  }

  if (options.exists) {
    return value == obj.hasOwnProperty(key);
  }

  if (options.literal) {
    return _.isEqual(value, obj[key]);
  }

  //[[1, 2, 3]]
  if (value instanceof Array) {
    if (_.has(obj, key)) {
      for (i = 0; i < value.length; i++) {
        if (!found) {
          found = _.isEqual(value[i], obj[key]);
        }
      }
    }
    return found;
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
      return !this._applyOperator('and', values);
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

  if (!obj) {
    obj = {};
  }

  keys = _.keys(filter);

  _.each(keys, function(key) {
    var isObj = isObject(filter[key]);
    if (!OPERATORS[key]) {
      if (isObj) {
        if (filter[key].hasOwnProperty('exists')) {
          values.push(self._compareValue(filter[key].exists, key, obj, {exists: true}));
        } else if (filter[key].hasOwnProperty('value')) {
          values.push(self._compareValue(filter[key].value, key, obj, {literal: true}));
        } else {
          values.push(self._applyFilter('and', filter[key], obj[key]));
        }
      } else {
        values.push(self._compareValue(filter, key, obj));
      }
    } else if (OPERATORS[key] && !isObj) {
      throw new Error('Incorrect syntax: Operators must apply to an object');
    } else if (OPERATORS[key] && isObj) {
      values.push(self._applyFilter(key, filter[key], obj));
    }
  });

  return self._applyOperator(operator, values);
};


LogicFilter.prototype._transform = function(obj, encoding, callback) {
  var self = this,
      values = [];

  _.each(_.keys(this.rules), function(label) {
    var filter = self.rules[label];
    var toReturn = self._applyFilter('and', filter, obj);
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
