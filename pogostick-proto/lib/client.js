
'use strict';

var serializer = require('./serializer');
var extend = require('extend');
var mkFn = require('mk-fn');

/* This is what is used to travel through the listen sent by the server. */
function parseField(
		promiseFactory, 
		requestFactory, 
		options, 
		path,
		val) {
	// if its a number, then according to the protocol we have a function.
	if(typeof val === 'number') {
		var proc = mkRemoteProc(promiseFactory, requestFactory, options, path);
		return mkFn(val, proc);
	} else if(Array.isArray(val)) {
		var arr = [];
		for(var i = 0; i < val.length; i++) {
			var parsed = parseField(
					promiseFactory, 
					requestFactory, 
					options, 
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
						path + '.' + key,
						val[key]);

				res[key] = parsedObj;
			}
		}
		return res;
	}
}

function mkRemoteProc(promiseFactory, requestFactory, options, path) {
	return function() {		
		// Lazy evaluation is used to handle the caching to keep things optimal.
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
				if(err) return reject(err);
				
				if(msg[0] === 'err') {
					// if there is an error, I still need to parse the response
					// which contains the details on the error.
					reject(new Error(JSON.parse(msg[3])));
				} else if(msg[0] === 'res') {
					resolve(JSON.parse(msg[3]));
				}	
			});
		});
	};

}

/* Creates a new instance with the exact same remote procedures but with a 
 * change in the implicit object.
 */ 
function $implicitly(key, value) {
	var impl = {};
	for(var k in this._implicits) {
		impl[k] = this._implicits;
	}
	impl[key] = value;
	return new this.constructor(impl);
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

		// start by asking the server to list its procedure which we can use.
		var initOpts = extend({ body: serializer.ls() }, defOptions);
		requestFactory(initOpts, function(err, msg) {
			if(err) return cb(err);

			var listing;
			try {
				listing = JSON.parse(msg[3]);
			} catch(er) {
				return cb(new Error('JSON parser error: ' + er.message));
			}
			
			var Remote = function(impl) {
				this._implicits = impl;
			};

			var RemoteProto = Object.create(null);
			for(var key in listing) {
				RemoteProto[key] = parseField(
						promiseFactory,
						requestFactory,
						defOptions,
						key,
						listing[key]);
			}
			
			Remote.prototype = RemoteProto;
			Remote.prototype.$implicitly = $implicitly;
			Remote.prototype.constructor = Remote;
			cb(null, new Remote({}));	
		});
	};
};
