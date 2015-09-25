## Pogostick Browser ![Build](https://travis-ci.org/AGhost-7/pogostick.svg?branch=master)

This is an ajax client for the pogostick protocol. The interface is the exact 
same as the client in `pogostick-http`.

Unfortunately, there isn't really a way to create an ajax server. It is
possible that I could use a different api to get this done.

```javascript
// Use whichever promise library you want, as long as it follows Promises/A+ spec.
var Promise = require('bluebird');
var pogo = require('pogostick-http');

// you need to pass to the client constructor a function which generates
// promise instances.
var promiseFactory = function(resolver) { return new Promise(resolver); };
var mkClient = pogo.client(promiseFactory, { host: 'localhost' });

mkClient({ port: 3000 }, function(err, remote) {
	Promise.all([
		remote.add(1, 2),
		remote.delayedGreet()
	]).spread(function(sum, greet) {
		console.log(sum, greet);
	});
});

```
