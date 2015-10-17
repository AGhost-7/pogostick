'use strict';

var extend = require('extend');
var pogo = require('pogostick-proto');

function mkServerHandler(options, procHandler) {
	return function(req, res) {
		var str = '';
		req.on('data', function(buff) {
			str += buff.toString();
		});
		req.on('end', function(buff) {
			var msg = str.split('\n');
			var result = procHandler(msg);
			if(typeof result.then === 'function') {
				result.then(function(str) {
					res.write(str);
					res.end();
				});
			} else {
				res.write(result);
				res.end();
			}
		});
	};
}

var types = ['http', 'https'];

types.forEach(function(type) {
	var http = require(type);
	module.exports[type] = function(options) {
		return pogo.server(function(procHandler, options) {
			var handler = mkServerHandler(options, procHandler);
			return http.createServer(handler);
		}, options);
	};

	module.exports[type].fn = function(options, procs) {
		var procHandler = pogo.server.fn(procs);
		return mkServerHandler(options, procs);
	};

});

