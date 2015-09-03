var mkServer = require('pogostick-http').server;

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

server.listen(3001);

