var extend = require('extend');

module.exports = function (http) {
	return function(cb, options) {
		return http.createServer(function(req, res) {
			var str = '';
			req.on('data', function(buf) {
				str += buf.toString();
			});

			req.on('end', function(buf) {
				var msg = str.split('\n');
				// The proto module already handles all possible errors, making sure
				// to catch them.
				var result = cb(msg);
				res.writeHead(200, options.headers);
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
		});
	};
};
