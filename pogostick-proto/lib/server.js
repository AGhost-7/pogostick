
'use strict';

var extend = require('extend');
var serializer = require('./serializer');

var Exit = require('./exit');

function processCall(procs, msg) {
	var proc;
	try {
		proc = msg[3].split('.').reduce(function(obj, key) {
			return obj[key];
		}, procs);
	} catch(err) {
		return notExist(msg);
	}
	if(proc === undefined) {
		return notExist(msg);
	}

	var implicits = msg[5] ? JSON.parse(msg[5]) : {};
	var res;
	try {
		res = proc.apply(implicits, JSON.parse(msg[4]));
	} catch(err) {
		return serializer.err(msg[1], msg[2], err.message);
	}

	// the value returned can either be a promise or regular value. 
	if(typeof res.then === 'function') {
		return res.then(function(res) {
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
	} else if(res instanceof Exit) {
		return serializer.exit(msg[1], msg[2], res.message);
	} else {
		return serializer.res(msg[1], msg[2], res);
	}

}

function notExist(msg) {
	return serializer
	.err(msg[1], msg[2], new Error('Procedure ' + msg[3] + ' does not exist'));
}

/* Creates a server instance which will send its results. The protocol doesn't 
 * take care of this, but procnet will manage connecting to other servers.
 */
module.exports = function(serverFactory, opts) {
	var defOpts = extend({}, opts);
	return function(procs, opts) {
		var options = extend(extend({}, defOpts), opts);
		
		var procsInit = serializer.init(procs);
		
		var processRequest = function(msg) {
			try {
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
			} catch(err) {
				return serializer.err(msg[1], msg[2], err.message);
			}
			
		};
		return serverFactory(processRequest, options);
	};
};



