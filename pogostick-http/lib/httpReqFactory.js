var http = require('http');
var reqFactory = require('./reqFactory');
var extend = require('extend');

module.exports = reqFactory(http);


