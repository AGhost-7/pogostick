/* jshint expr: true */

var net = require('net');
var pogo = require('../index');
var Promise = require('bluebird');
var expect = require('chai').expect;
var cp = require('child_process');
var fork = cp.fork;
var spawn = cp.spawn;

var promise = function() { return new Promise(arguments[0]); };

describe('communications', function() {
	var remote;
	var server;

	before(function(done) {
		server = fork('test/lib/server.js');
		var mkClient = pogo.client(promise);
		server.on('message', function() {
			var con = net.connect({ port: 54321 }, function() {
				mkClient({}, con, function(err, rem) {
					if(err) return done(err);
					remote = rem;
					done();
				});	
			});
		});
	});

	it('should contain multiple methods', function() {
		expect(remote.add).to.exist;
		expect(remote.ping).to.exit;
	});
	
	it('should ping!', function() {
		return remote.ping().then(function(res) {
			expect(res).to.equal('pong');
		});
	});
	
	// I need to ensure that the server won't cause leaking for the client. This is a bit difficult,
	// since
	it('should not leak when throwing errors', function() {
		return remote.boom().then(function() {
		}, function(err) {
			expect(err).to.exist;
		});
	});

	
	it('shouldn\'t leak when the server is closed forcefully.', function(done) {
		
		var kill = spawn('kill', ['-9', server.pid]);
		
		server.on('exit', function() {
			var p = remote.ping();
			p.catch(function(err) {
				expect(err.message).to.contain('Connect');
				done();
			});
		});
	});
});


