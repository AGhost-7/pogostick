
/* This is a simple server used for testing the browser client. Theres also a server here 
 * used for loading the assets.
 */ 

var pogo = require('pogostick-http');
var fs = require('fs');
var http = require('http');
var path = require('path');

var mkServer = pogo.server({
	headers: {
		'Content-Type': 'text/plain',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
		'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
	}
});

var server = mkServer({
	add: function(a, b) {
		return a + b;
	},
	foo: {
		bar: function() {
			return "foobar";
		}
	}
});

server.listen(3002);

http.createServer(function(req, res) {
	
	function asset(reqUrl, source, type) {
		if(req.url === reqUrl) {
			res.writeHead(200, { 'Content-Type': type });
			fs.createReadStream(path.join(__dirname, source)).pipe(res);
		}
	}
	
	asset('/mocha.css', '../node_modules/mocha/mocha.css', 'text/css');
	asset('/mocha.js',  '../node_modules/mocha/mocha.js', 'text/javascript');
	asset('/blob.js', 'blob.js', 'text/javascript');
	asset('/', 'runner.html', 'text/html');
}).listen(3003);

