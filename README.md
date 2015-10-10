## Pogostick ![Build](https://travis-ci.org/AGhost-7/pogostick.svg?branch=master)
Repository containing all `pogostick` modules.

![PogoCat](https://raw.githubusercontent.com/AGhost-7/pogostick/master/pogo-cat.gif)

### Example

Http Server:
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

Http Browser Client:
```javascript
var pogo = require('pogostick-browser');
var Promise = require('bluebird');
// You can use any promises library as long as it stays true to the Promise/A+ spec.
var promiseFactory = function(resolver) { return new Promise(resolver); };
var mkClient = pogo(promiseFactory, {
	host: 'localhost'
});

mkClient({ port: 3003 }, function(err, remote) {
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

### Implicits
Implicit parameters in Pogostick are inspired by [Scala][1] implicit 
parameters. These were implemented to make it possible to pass authentication
tokens and such into remote procedures without having to specify them every 
time. So here's an example:

Client:
```javascript
mkClient(function(err, remote) {
	if(err) return console.log('there was an error loading the remote');
	var withName = remote.$implicitly('name', 'AGhost-7');
	withName
		.greet()
		.then(console.log.bind(console));
});
```

Server:
```javascript
var server = mkServer({
	greet: function() {
		if(this.name) return 'Hello ' + this.name;
		else return 'Hello';
	}
});
```

The client in this case will print to the console `Hello AGhost-7`.

[1]: http://docs.scala-lang.org/tutorials/tour/implicit-parameters.html

### TODOs
- Add debugging without the overhead. Look into the possibility of using 
sweetjs node loader to have this working.
- Stream-based implementation
