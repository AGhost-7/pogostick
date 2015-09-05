var pogo = require('pogostick-proto');

var requestFactory = function(options, cb) {
	try {
		var req = new XMLHttpRequest();
		
		var protocol = options.protocol || 'http';
		var host = options.host || 'localhost';
		var port = options.port || (protocol === 'https' ? 443 : 80);
		var path = options.path || '/';
		var url = protocol + '://' + host + ':' + port + path;
		var headers = options.headers || {};
		var method = options.method || 'POST';
		
		// Needs to be opened to write headers to.
		req.open(method, url, true);

		// apply the headers to the request...
		headers["X-Requested-With"] = "XMLHttpRequest";
		Object.keys(headers).forEach(function(key) {
			req.setRequestHeader(key, headers[key]);
		});

		req.onload = function() {
			if(req.status < 300 && req.status >= 200) {
				cb(null, req.responseText.split('\n'));
			} else {
				cb(new Error('Server responded with a ' + 
						req.status + ' with message: ' + req.responseText));
			}
		};

		req.onerror = function(err){
			cb(err);
		}; 
		
		if(options.body.str) req.send(options.body.str);
		else req.send(options.body);

	} catch (err) {
		cb(err);
	}

};

/* There is not way for to create an ajax server... Might need to use an different api.
 * For now, this is only a client function. 
 */
module.exports = function(promiseFactory, opts) {
	return pogo.client(promiseFactory, requestFactory, opts);
};
