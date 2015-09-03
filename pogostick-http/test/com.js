//var client = require('../lib/client');
var expect = require('chai').expect;
var Promise = require('bluebird');
var proto = require('pogostick-proto');

var promiseFactory = function(resolver) { return new Promise(resolver); };

var mkClient = proto.client(promiseFactory, require('../lib/httpReqFactory'));
var mkServer = proto.server(require('../lib/httpServerFactory'));

describe('inter-communication', function() {

	var remote;
	var srv;

	before(function(done) {
		srv = mkServer({
			add: function(a, b) {
				console.log('received some numbers:');
				console.log(a, b);
				return a + b;
			},
			multiply: function(a, b) {
				return a + b;
			},
			foo: {
				bar: function() {
					return 'foobar';
				},
				baz: function() {
					return 'foobaz';
				}
			},
			boom: function() {
				throw new Error('boom');
			}
			
		});
		srv.listen(3000, function(){
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

	});


	it('should not give random errors when the network is fine', function(done) {
		var p = remote.add(1,2);
		p.finally(done);			
	});
	
	it('should return the expected result', function(done) {
		remote
			.add(1, 2)
			.then(function(res) {
				expect(res).to.equal(3);
			})
			.finally(done);
	});

	it('should call namespaced functions', function(done) {
		var p = remote.foo.bar();
		p
			.then(function(res) {
				expect(res).to.equal('foobar');
			})
			.finally(done);
	});

	it('should return a failed promise if there was an error on the server', function(done){
		remote
			.boom()
			.then(function() {
				throw 'Boom did not generate an error';
			}, function() {
				return 'ok';
			})
			.finally(done);
	});

	after(function() {
		console.log('closing...');
		srv.close();
		console.log('closed');
	});
	
});


