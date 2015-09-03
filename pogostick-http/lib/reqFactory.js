
var extend = require('extend');

module.exports = function(http) {
	return function(options, cb) {

		var req = http.request(extend({ method: 'POST' }, options), function(res) {
			var str = '';
			res.on('data', function(buf){
				str += buf.toString();
			});
			res.on('end', function() {
				cb(null, str.split('\n'));
			});
		});
		
		req.on('error', cb);
		if(options.body !== undefined) {
			if(options.body.str) req.write(options.body.str);
			else req.write(options.body);
		}

		req.end();
	};
};
