
/**
 * Compare performace to another RPC lib which uses tcp instead of http.
 */

var bench = require('./bench');
var dnode = require('dnode');
var net = require('net');

var iterations = Number(process.argv[2]) || 1000;

function times(cnt, block, done) {
	var left = cnt;
	var fn = function() {
		if(left > 0) {
			left -= 1;
			block(fn);
		} else if(done) {
			done();
		}
	};
	block(fn);
}

var dnodeCon;
var dnodeServer = net.createServer(function(con) {
	dnodeCon = con;
	var d = dnode({
		ping: function(cb) {
			cb('pong');
		}	
	});
	con.pipe(d).pipe(con);
});

dnodeServer.listen(3001, function() {
	var dnodeBenchStop = bench();
	var dClient = dnode.connect(3001);
	dClient.on('remote', function(remote) {
		console.log('remote received, begining benchmark');
		times(iterations, function(cb) {
			remote.ping(cb);
		}, function() {
			dnodeServer.close();
			dnodeCon.destroy();
			dnodeBenchStop()('Time for dnode at ' + iterations + ' iterations:');
			process.exit(0);

			//process.exit(0);
			//dnodeServer.close();
		});
	});
});

