var pogo = require('pogostick-protocol');

var requestFactory = function(options, cb) {
	var req = new XMLHttpRequest();
	
	var protocol = options.protocol || 'http';
	var host = options.host || 'localhost';
	var port = options.port || protocol === 'http' ? 80 : 443;
	var path = options.path || '/';
	var url = options.protocol + '://' + options.host + ':' + options.port + path;
	

	// apply the headers to the request...
	headers["X-Requested-With"] = "XMLHttpRequest";
	Object.keys(options.headers).forEach(function(key) {
		req.setRequestHeader(key, options.headers[key]);
	});

	req.open(options.method, url, true);

	req.onload = function(res) {
		if(res.status < 300 && res.status >= 200) {
			cb(null, res.responseText.split('\n'));
		} else {
			// TODO: should parse the error a bit more to make it more convenient.
			cb(res);
		}
	};

	req.onerror = function(err) {
		cb(err);
	};

	try {
		req.send(options.body);
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
