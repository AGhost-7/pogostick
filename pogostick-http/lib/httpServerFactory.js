var http = require('http');

module.exports = function(cb) {
	return http.createServer(function(req, res) {
		var str = '';
		req.on('data', function(buf) {
			str += buf.toString();
		});

		req.on('end', function(buf) {
			var msg = str.split('\n');
			// TODO: Handle errors
			var result = cb(msg);
			res.writeHead(200);
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
