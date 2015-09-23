
var pogo = require('./index');
var Promise = require('bluebird');
var promise = function(res) { return new Promise(res); };
var mkClient = pogo.client(promise);
var mkServer = pogo.server();

// If I want to make this even close to how it works in scala,
// I need to find a way to keep the same context asynchronously...
// I think that the best way to do this is to make it as expicit
// as possible in the protocol implementation. I then need to couple
// the server and client a bit to provide a 'implicit context' 
// otherwise I dont think it will work.

var server = mkServer({
	name: function() {
		if(this.token == 'foobar') {
			return 'fooer';
		} else {
			return 'anon';
		}
	}
});
server.listen(3000);

mkClient({ port: 3000 }, function(err, remote) {
	// This creates a NEW remote object which will automatically send
	// and object along with the function arguments. There are probably some
	// optimizations which can be done since the only thing which will ever change
	// for the remotes is the implicits it contains.
	remote
		.$implicitly('token', 'foobar')
		.name()
		.then(function(name) {
			assert.equal(name, 'fooer');
		});

});


