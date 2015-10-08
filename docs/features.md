## Features

### Deep Objects
Pogostick supports using objects as namespaces. It also supports arrays of 
functions.

```javascript
// Server
var server = mkServer({
	foo: {
		bar: function() {
			return "foobar";
		},
		baz: function() {
			return "foobaz";
		}
	}
});
// etc...

// Client
mkClient({ port: 3000 }, function(err, remote) {
	remote.foo.bar().then(function(res) {
		console.log('server says: ', res); // -> server says: foobar
	});
});
```

### Pick-Your-Own Promises
As long as the library you choose follows the Promises/A+ specification, you
can use your favourite promises library. You just need to specify the factory
function so that pogostick can instantiate the promises for you.

```javascript
var Bluebird = require('bluebird');
var bluebirdMkClient = pogo.client(function(resolver) {
	return new Bluebird(resolver);
});

var Q = require('q');
var qMkClient = pogo.client(Q.Promise);

var when = require('when');
var whenMkClient = pogo.client(when.promise);
```

### Implicit Parameters
Implicit parameters in Pogostick are inspired by Scala implicit parameters. 
These were implemented to make it possible to pass authentication tokens and 
such into remote procedures without having to specify them every time. So,
here's an example:

Server:
```javascript
...
mkServer({
	greet: function() {
		// You access the implicit values sent by the client through the "this"
		// keyword.
		return "hello " + this.name + "!";
	}
});
...
```

Client:
```javascript
mkClient({ port: 3000 }, function(err, remote) {
	if(err) return console.log('there was an error loading the remote');
	var withName = remote.$implicitly('name', 'AGhost-7');
	// Using withName, you will automatically send "AGhost-7" to the server.
	withName
		.greet()
		.then(console.log.bind(console));
});
```

The client in this case will print to the console `Hello AGhost-7`.


