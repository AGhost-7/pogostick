
'use strict';

var pogo = require('pogostick-proto');

// turn streams into a request-response type of function.
function mkReqHandler(con) {
	var closed = false;
	// Doesn't inherit from any prototype, so safe to use for..in.
	var listeners = Object.create(null);

	con.on('data', function(buf) {
		var data = buf.toString().split('\n');
		var rand = data[2];
		var stamp = data[1];
		var key = rand + '-' + stamp;
		
		if(listeners[key] !== undefined) {
			listeners[key](null, data);
			delete listeners[key];
		}
	});

	// Close is called whenever there is a timeout or error. Skip handling it more than that for now.
	con.on('close', function() {
		closed = true;
		var err = new Error('Connection was closed');
		// connection was ended, so toss an error to all listeners.
		for(var key in listeners) {
			listeners[key](err);
			delete listeners[key];
		}
	});

	con.on('error', function() {
		// thats all for now children.
	});

	return function(options, cb) {
		if(closed) {
			var err = new Error('Connection was closed');
			cb(err);
		} else {
			var body = options.body;
			listeners[body.rand + '-' + body.stamp] = cb;
			var data = body.str;
			//var data = new Buffer(body.str || body);
			if(!con.write(data)) {
				var onFree;
				onFree = function() {
					con.removeListener('drain', onFree);
					con.write(data);
				};
				con.on('drain', onFree);
			}
		}
	};
}

function handleRequests(options, stream, process) {
	stream.on('data', function(buf) {
		var msg = buf.toString().split('\n');
		var result = process(msg);
		if(typeof result.then === 'function') {
			result.then(function(res) {
				if(!stream.write(res)) {
					var onDrain;
					onDrain = function() {
						stream.removeListener('drain', onDrain);
						stream.write(res);
					};
					stream.on('drain', onDrain);
				}
			});
		} else {
			if(!stream.write(result)) {
				var onDrain;
				onDrain = function() {
					stream.removeListener('drain', onDrain);
					stream.write(result);
				};
				stream.on('drain', onDrain);
			}
		}
	});

	stream.on('error', function(err) {
		if(options.on && options.on.error) {
			options.on.error(err);
		}
	});
	
	if(options.on && options.on.end) {
		stream.on('end', function() {
			options.on.end();
		});
	}
	
}

function mergeOptions() {
	return Array.prototype.reduce.call(arguments, function(accu, option) {
		return Object.keys(option).reduce(function(accu, key) {
			accu[key] = option[key];
			return accu;
		}, accu);
	}, Object.create(null));
}

module.exports = {
	client: function(promiseFactory, options) {
		return function(moreOptions, stream, cb) {
			var opts = mergeOptions({}, options || {}, moreOptions);
			
			var handler = mkReqHandler(stream);
			return pogo.client(promiseFactory, handler)(options, cb);
		};
	},
	server: function() {
		var procs, options;
		if(arguments.length === 1) {
			procs = arguments[0];
			options = {};
		} else {
			procs = arguments[1];
			options = arguments[0];
		}
		
		var process = pogo.server.fn(procs, options);
		return function(stream) {
			handleRequests(options, stream, process);
		};
	},
	_mergeOptions: mergeOptions
};
