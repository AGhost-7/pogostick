## Pogostick
Repository containing all `pogostick` modules.

![Alt Text](https://raw.githubusercontent.com/AGhost-7/pogostick/master/pogo-cat.gif)

### Example

Server:
```javascript
var pogo = require('pogostick-http');

// Define default headers and other configurations.
var mkServer = pogo.server({
	headers: {
		'Content-Type': 'text/plain'
	}
});
// returns a http.Server instance
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

server.listen(3003);
```

Browser Client:
```javascript
var pogo = require('pogostick-browser');
var Promise = require('bluebird');
// You can use any promises library as long as it stays true to the Promise/A+ spec.
var promiseFactory = function(resolver) { return new Promise(resolver); };
var mkClient = pogo(promiseFactory, {
	port: 3003
});

mkClient(function(err, remote) {
	if(err) return console.log('there was an error loading the remote');
	Promise.all([
		remote.add(2, 4),
		remote.foo.bar()
	]).spread(function(sum, foo) {
		console.log('sum is:', sum);
		console.log('foobar is:', foo);
	});
});
```
