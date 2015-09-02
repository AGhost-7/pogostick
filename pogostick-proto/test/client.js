var client = require('../lib/client');
var serializer = require('../lib/serializer');
var Promise = require('bluebird');
var expect = require('chai').expect;

var promiseFactory = function(resolver) { return new Promise(resolver); };

var response;
var request;
var clientSpy = function(opts, cb) {
	request = opts.body;
	cb(null, response);
};

var mkClient = client(promiseFactory, clientSpy, {});
var remote;

before(function(done) {
	response = serializer.init({mock: function() {} })(Date.now(), '').split('\n');
	//console.log('woop');
	//console.log(response);
	mkClient({}, function(err, r) {
		if(err) return done(err);
		//console.log('heh');
		remote = r;
		done();
	});
});

describe('client', function() {
	
	it('should have methods should properly initialized', function() {
		expect(remote.mock).to.exist;
		expect(remote.mock).to.not.throw(Error);
	});	

	it('should foo', function(done) {
		response = serializer.res(0,'', 'bar').split('\n');
	
		var p = remote.mock('foo');
		expect(request).to.contain('foo');
			
		p.then(function(res) {
			expect(res).to.equal('bar');
			done();
		});
	});

});
