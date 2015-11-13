#!/usr/bin/env node

var pogo = require('../../index');
var net = require('net');
var fs = require('fs');

var serverHandler = pogo.server({
	ping: function() {
		return 'pong';
	},
	add: function(a, b) {
		return a + b;
	},
	boom: function() {
		throw 'boom';
	}
});

var server = net.createServer(serverHandler);

server.listen(54321, function() {
	process.send('loaded');																			
});

