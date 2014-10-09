var through = require('through');
var JSONStream = require('JSONStream');
var fs = require('fs');
var LogicFilter = require('../index').LogicFilter;

var lf = new LogicFilter();

lf.add('testRule', {not: {'metadata': 'foo'}});

fs.createReadStream('./examples/exampleObjects.json')
  .pipe(JSONStream.parse())
  .pipe(lf)
  .pipe(through(function(obj) {
    console.log('obj: ' + JSON.stringify(obj, null, 4));
  }));
