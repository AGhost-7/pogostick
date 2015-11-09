
'use strict';

var debug = require('./debug');
var serializer = require('./serializer');
var extend = require('extend');
var mkFn = require('mk-fn');

/* This is what is used to travel through the listen sent by the server. 
 * TODO: Optimize to a while loop or something. Not really important atm since
 * its only executed on the initial connection.
 */
function parseField(
		promiseFactory, 
		requestFactory,
		options,
		events,
	 	state,
		path,
		val) {
	// if its a number, then according to the protocol we have a function.
	if(typeof val === 'number') {
		var proc = mkRemoteProc(
			promiseFactory, 
			requestFactory, 
			options,
			events,
			state, 
			path);
		return mkFn(val, proc);
	} else if(Array.isArray(val)) {
		var arr = [];
		for(var i = 0; i < val.length; i++) {
			var parsed = parseField(
					promiseFactory, 
					requestFactory, 
					options,
					events,
					state,
					path + '.' + i,
					val[i]);
			arr.push(parsed);
		}
		return arr;
	} else if(typeof val === 'object') {
		var res = {};
		for(var key in val) {
			if(val.hasOwnProperty(key)) {
				var parsedObj = parseField(
						promiseFactory,
						requestFactory,
						options,
						events,
						state,
						path + '.' + key,
						val[key]);

				res[key] = parsedObj;
			}
		}
		return res;
	}
}

function mkRemoteProc(
		promiseFactory, 
		requestFactory, 
		options, 
		events, 
		state, 
		path) {
	return function() {
		if(state.isEnded) {
			debug('Procedure %s has been closed', path);
			return promiseFactory(function(resolve, reject) {
				return reject(new Error('Connection is closed'));
			});
		}

		// Lazy evaluation is used to handle the caching to keep things optimal.
		// Convert it to a string once, and since the object is to some extent 
		// immutable, I don't need to convert it after that for this particular
		// object instance.
		if(this._implicitsCache === undefined) {
			this._implicitsCache = JSON.stringify(this._implicits);
		}

		var implicits = this._implicitsCache;
		// the procol requires this to be an array.
		var args = Array.prototype.slice.call(arguments);
		return promiseFactory(function(resolve, reject) {
			var body = serializer.call(path, args, implicits);
			var opts = extend({ body: body }, options);
			requestFactory(opts, function(err, msg) {
				if(err) {
					debug('Error %o processing request %o', err, opts);
					reject(err);
					if(events.broadcastError) events.error(err);
					return;
				}

				switch(msg[0]) {
					case 'exit':	
						// all functions will now return a rejected promise.
						state.isEnded = true;
						var exitReason;
						if(msg[3] !== undefined) {
							try {
								exitReason = JSON.parse(msg[3]);
							} catch(err) {}
						}
						events.exit(msg[1], msg[2], exitReason);
						events.end(msg[1], msg[2], exitReason);
						break;
					case 'err':
						var res;
						try {
							res = new Error(JSON.parse(msg[3]));
						} catch (err) {
							res = err;
						}

						reject(res);
						if(events.broadcastError) events.error(res);
						break;
					case 'res':
						resolve(JSON.parse(msg[3]));
						break;
					default:
						// ????

				}
			});
		});
	};
}

/* Mutates the implicit context of the remote. If you call the function with
 * nothing more than the key name, it will delete that property.
 */
function $implicitlyMut(key, value) {
	if(arguments.length === 1) {
		delete this._implicits[key];
	} else {
		this._implicits[key] = value;
	}
	// clear the cache since the implicits were changed.
	delete this._implicitsCache;
	return this;
}


/* Creates a new instance with the exact same remote procedures but with a 
 * change in the implicit object.
 */ 
function $implicitly(source) {
	var impl = Object.create(null), k;
	for(k in this._implicits) {
		impl[k] = this._implicits[k];
	}
	// this method can behave in a couple of different ways...
	if(typeof arguments[0] === 'object') {
		switch(arguments.length) {

			case 1:
				// then we're mixing in everything.
				for(k in source) {
					impl[k] = source[k];
				}
				break;

			case 2:
				// transfer only one property from the object.
				var transferProp  = arguments[1];
				impl[transferProp] = source[transferProp];
				break;

			default:
				// transfer multiple properties from the object
				var props = Array.prototype.slice.call(arguments, 1);
				for(var i = 0; i < props.length; i++) {
					impl[props[i]] = source[props[i]];
				}
		}
	} else {
		// Then in this case you're only creating with an additional property.
		// No transfer of data here.
		var key = arguments[0];
		var value = arguments[1];
		impl[key] = value;

	}

	return new this.constructor(impl);
}

/* Generates a class from the procedure listing call to the server which will 
 * be our remote.
 */ 
function createRemoteClass(promiseFactory, requestFactory, listing, options) {
	debug('Creating remote class for listing:\n%e', listing);
	// At this stage, I don't have much of a choice to add mutable state. If
	// the remote has been closed at the protocol-level, they need to change 
	// of state to alter their behaviour. State in this case will be shared
	// accross all remote instances which have the same connection, even if
	// they have different implicits.
	var state = {
		isEnded: false
	};

	var on = options.on || {};
	var events = {
		end: on.end,
		error: on.error,
		broadcastError: !!on.error,
		exit: on.exit
	};

	var Remote = function(impl) {
		this._implicits = impl;
	};

	var RemoteProto = Object.create(null);
	for(var key in listing) {
		RemoteProto[key] = parseField(
				promiseFactory,
				requestFactory,
				options,
				events,
				state,
				key,
				listing[key]);
	}
	
	Remote.prototype = RemoteProto;
	Remote.prototype.$implicitly = $implicitly;
	Remote.prototype.$implicitlyMut = $implicitlyMut;
	
	// I need to externalize the `end` handler since in some situation the end
	// will be protocol specific, e.g., tcp streams (persistent connections).
	Remote.prototype.$end = function() {
		state.isEnded = true;
		if(typeof events.end === 'function') {
			events.end.apply(this, arguments);
		}
	};

	Remote.prototype.constructor = Remote;

	return Remote;
}

/* Handles any case where there was an error fetching the procedure listing. 
 */
function initError(msg) {
	var errMsg;
	try {
		errMsg = JSON.parse(msg[3]);
	} catch(err) {
		return new Error('Error requesting procedure listing');
	}
	return new Error(errMsg);
}

/* To make this agnostic, I need to use a function which will handle the 
 * the request logic, abstracting the transport completely from this module.
 *
 * promiseFactory: function(resolver: function(resolve, reject)): Promise
 *
 * requestFactory: function(options, cb: function(err, msg: Array<String>)): void
 *
 */
module.exports = function(promiseFactory, requestFactory, opts) {
	// clone this just to be on the safe side.
	var heldOptions = opts ? extend({}, opts) : {};
	// return a client factory
	return function(opts, cb) {

		// this will be the options object used for all requests for the client 
		// instance, in part determined by the factory.
		var defOptions = extend(extend({}, heldOptions), opts);

		//var events = defOptions.on;

		// start by asking the server to list its procedure which we can use.
		var initOpts = extend({ body: serializer.ls() }, defOptions);
		requestFactory(initOpts, function(err, msg) {
			// the underlying network error should be propagated as it will be the 
			// more useful than a cryptic, library-specific error. E.g., 
			// ERRCONREFUSED will be more useful to know.
			if(err) {
				debug('Error %o received for listing requests %o', err, initOpts);
				return cb(err);
			}
			// The protocol permits returning an `err` or `exit` response for the
			// `ls` call.
			if(msg[0] === 'err' || msg[0] === 'exit') {
				debug('Received a `%s` for the response to the listing', msg[0]);
				return cb(initError(msg));
			}

			// While it should not happen, it is possible for a parse error. Since
			// this library aims to never throw anything, it should handle parse
			// errors.
			var listing;
			try {
				listing = JSON.parse(msg[3]);
			} catch(er) {
				debug('JSON parsing error at listing');
				return cb(new Error('JSON parser error: ' + er.message));
			}
			
			// Since implicits create a new remote every time, I should optimize
			// object creation to limit the overhead. Instead of generating an entire
			// remote every time, the remote procedure functions are placed on a 
			// prototype which is created on the fly at the initial connection.
			var Remote = createRemoteClass(
					promiseFactory, 
					requestFactory, 
					listing, 
					defOptions);

			cb(null, new Remote(Object.create(null)));	
		});
	};
};
