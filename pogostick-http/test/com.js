var client = require('../lib/client');
var Promise = require('bluebird');
var server = require('../lib/server');

var promiseFactory = function(resolver) { return new Promise(resolver); };

var mkClient = client(promiseFactory, require('../lib/httpReqFactory'));
var mkServer = server(require('../lib/httpServerFactory'));
var srv;
before(function(done) {
	srv = mkServer({
		add: function(a, b) {
			return a + b;
		},
		multiply: function(a, b) {
			return a + b;
		}
	});
	srv.listen(3000, done);

});

describe('inter-communication', function() {
	
	var remote;
	before(function(done) {
		console.log('connecting...');
		mkClient({
			port: 3000,
			host: 'localhost'
		} ,function(err, r) {
			console.log('connected');
			if(err) return done(err);
			remote = r;
			done();
		});
	});

	it('should not give an error', function(done) {
		console.log(remote, p, remote.add);
		var p = remote.add(1,2);
		//console.log(remote, p, remote.add);
		p.then(function(res) {
			console.log('result', res);
		}, function() {
			console.log('error');
		})
		.finally(done);			
	});
	it.skip('should gime me the result of the addition', function() {
	});

});

after(function() {
	console.log('closing...');
	srv.close();
	console.log('closed');
});
