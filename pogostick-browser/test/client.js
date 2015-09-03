var mkClient = require('../index');
var expect = require('chai').expect;


var remote;
before(function() {
	mkClient({port: 3002}, function(err, r) {
		if(err) return done(err);
		remote = r;
	});
});

describe('browser client', function() {
	
	
	it('should be able to do simple calls', function() {
		return remote
			.add(2, 3)
			.then(function(res) {
				expect(res).to.equal(5);
			});
	});

	it('should be able to call nested object', function() {
		return remote
			.foo.bar
			.then(function(res) {
				expect(res).to.equal('foobar');
			});
			
	});


});

