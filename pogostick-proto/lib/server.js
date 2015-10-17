
'use strict';

var extend = require('extend');
var serializer = require('./serializer');
var debug = require('./debug');

var Exit = require('./exit');

var noop = function() {};

var debugResponse = debug.enabled ?
	debug.bind(debug, 'serializing result %s') : noop;

function processCall(procs, msg) {
	
	var proc = procs;
	var parts = msg[3].split('.');
	for(var i = 0; i < parts.length; i++) {
		proc = proc[parts[i]];
		if(proc === undefined) return notExist(msg);
	}

	var implicits, res;
	try {
		implicits = msg[5] ? JSON.parse(msg[5]) : {};
		res = proc.apply(implicits, JSON.parse(msg[4]));
	} catch(err) {
		return serializer.err(msg[1], msg[2], err.message);
	}

	// the value returned can either be a promise or regular value. 
	if(typeof res.then === 'function') {
		return res.then(function(res) {
			debugResponse(res);
			if(res instanceof Exit) {
				return serializer.exit(msg[1], msg[2], res.message);
			} else {
				return serializer.res(msg[1], msg[2], res);
			}
			
		}, function(err) {
			// I dont think it would make sense for the user to send the Exit object
			// as a rejected promise, so don't process it here.
			return serializer.err(msg[1], msg[2], err);
		});
	} else {
		debugResponse(res);
		if(res instanceof Exit) {
			return serializer.exit(msg[1], msg[2], res.message);
		} else {
			return serializer.res(msg[1], msg[2], res);
		}
	}
}

function notExist(msg) {
	var err = new Error('Procedure ' + msg[3] + ' does not exist');
	return serializer.err(msg[1], msg[2], err);
}

function createReqHandler(procs) {
	var procsInit = serializer.init(procs);
	return function(msg) {
		switch(msg[0]) {
			case 'ls':
				return procsInit(msg[1], msg[2]);

			case 'call':
				return processCall(procs, msg);
					
			default:
				var err = { 
					message: 'Could not process request.', 
					received: msg.join('\n') 
				};
				return serializer.err(msg[1], msg[2], err);
		}	

	};
}

/* Creates a server instance which will send its results. 
 */
module.exports = function(serverFactory, opts) {
	var defOpts = extend({}, opts);
	return function(procs, opts) {
		var options = extend(extend({}, defOpts), opts);
		var processRequest = createReqHandler(procs);
		return serverFactory(processRequest, options);
	};
};


module.exports.fn = createReqHandler;
