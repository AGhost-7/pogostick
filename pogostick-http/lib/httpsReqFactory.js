var https = require('https');
var reqFactory = require('./reqFactory');
var extend = require('extend');

module.exports = reqFactory(https);


