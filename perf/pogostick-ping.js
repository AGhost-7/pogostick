/**
 * Standard benchmark to see what the performace improvements are.
 */

var bench = require('./bench');
var pogo = require('pogostick-http');
var Promise = require('bluebird');
var promise = function(res) { return new Promise(res); };
var http = require('http');
var Agent = require('agentkeepalive');

var iterations = Number(process.argv[2]) || 1000;
var agent;
switch(process.argv[3]) {
	case 'node':
		console.log('Using node agent');
		agent = new http.Agent({
			keepAlive: true,
			maxSockets: 1000		
		});
		break;
	case 'true':
		console.log('Using agentkeepalive agent');
		agent = new Agent({
			maxSockets: 100,
			maxFreeSockets: 10,
			timeout: 60000,
			keepAliveTimeout: 30000
		});
		break;
	default: 
		console.log('Using no agent');
}

var pogoServer = pogo.server({})({
	ping: function() {
		return 'pong';
	}
});

pogoServer.listen(3000, function() {
	var pogoBenchStop = bench();
	pogo.client(promise)({
		port: 3000,
		agent: agent,
		//keepAlive: true
	}, function(err, remote) {
		if(!err) {
			var i = 0;
			function loop() {
				if(i < iterations) {
					i++;
					remote.ping().then(loop);
				} else {
					pogoBenchStop()('pogostick;' + iterations + ' iterations in');
					process.exit(0);
				}
			}
			loop();
		} else throw err;
	});
});

/* PROBLEM: Agents seem to SLOW down significantly the rpc. Theres got to be
 * a better way of getting keep-alive.
 */ 
