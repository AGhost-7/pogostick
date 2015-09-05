/* jshint expr: true */

var client = require('../index');
var expect = require('chai').expect;
var Promise = require('bluebird');

var promiseFactory = function(f) { return new Promise(f); };

var mkClient = client(promiseFactory);

describe('browser client', function() {

	var remote;
	before(function(done) {
		mkClient({port: 3002}, function(err, r) {
			if(err) return done(err);
			remote = r;
			done();
		});
	});

	it('should be initialized with methods', function() {
		expect(remote).to.exist;
		expect(remote.add).to.exist;
	});

	it('should be able to do simple calls', function() {
		return remote
			.add(2, 3)
			.then(function(res) {
				expect(res).to.equal(5);
			});
	});

	it('should be able to call nested object', function() {
		return remote
			.foo
			.bar()
			.then(function(res) {
				expect(res).to.equal('foobar');
			});
			
	});


});

