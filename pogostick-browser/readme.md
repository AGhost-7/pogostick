## Pogostick Browser ![Build](https://travis-ci.org/AGhost-7/pogostick.svg?branch=master)

This is an ajax client for the pogostick protocol. The interface is the exact 
same as the client in `pogostick-http`.

Unfortunately, there isn't really a way to create an ajax server. It is
possible that I could use a different api to get this done.

## Introductory Example

```javascript
// Use whichever promise library you want, as long as it follows Promises/A+ spec.
var Promise = require('bluebird');
var pogo = require('pogostick-browser');

// you need to pass to the client constructor a function which generates
// promise instances.
var promiseFactory = function(resolver) { return new Promise(resolver); };
var mkClient = pogo(promiseFactory, { host: 'localhost' });

mkClient({ port: 3000 }, function(err, remote) {
	Promise.all([
		remote.add(1, 2),
		remote.delayedGreet()
	]).spread(function(sum, greet) {
		console.log(sum, greet);
	});
});

```

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




module-types

## The Remote Object
The remote object contains all procedures that the server has listed, allowing
you to call the functions from the network. There are two additional methods
which are added to the remote object.

### `$end()`
Prevents the procedures on the remote from sending any more requests to the 
server. This is called internally in some cases.

```javascript
// returns a resolved promise if there was no error
remote.foo(); 
// Close the remote
remote.$end();
// skips fetching to the server and will just return a rejected promise
remote.foo();
```

## `$implicitly(key, value)`
Returns a new remote instance which will send the data to the server each time
you call the procedures on it.



## Module Functions

### `(promiseFactory, options)`

The options are the following:
- `protocol`: Either `http` or `https`. Defaults to `http`.
- `host`: Server name, defaults to `localhost`.
- `port`: Socket port used for each request. Defaults to `80` if the protocol
is set to `http`, and `443` if using `https`.
- `path`: Path relative to the website. Defaults to `/`.
- `headers`: If there are extra headers you want to add for each underlying 
HTTP request, you can specify this property which is an object where the key
is the HTTP header name and the value is what you want the header to be set to.
- `method`: Defaults to `POST`. Specifies which HTTP method to use for the 
requests.

