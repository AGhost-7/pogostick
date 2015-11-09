## Pogostick Browser ![Build](https://travis-ci.org/AGhost-7/pogostick.svg?branch=master)

This is an ajax client for the pogostick protocol. The interface is the exact 
same as the client in `pogostick-http`.

Unfortunately, there isn't really a way to create an ajax server. It is
possible that I could use a different web API to get this done.

## Introductory Example

```javascript
// Use whichever promise library you want, as long as it follows Promises/A+ spec.
var Promise = require('bluebird');
var pogo = require('pogostick-browser');

// you need to pass to the client constructor a function which generates
// promise instances.
var promise = function(resolver) { return new Promise(resolver); };
var mkClient = pogo(promise, { host: 'localhost' });

var options = {
	port: 3000,
	on: {
		end: function() {
			alert('Connection was lost!');
		}
	}
};

mkClient(options, function(err, remote) {
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




## Module Types
`promiseFactory` is a function which accepts a resolver function and returns
a promise. It is bundled in most promise libaries and can usually be easily
created when it is not.

```javascript
var fs = require('fs');
var Q = require('q');
var p = Q.promise(function(resolve, reject) {
	fs.readFile('/etc/dkms', function(err, buf) {
		err ? reject(err) : resolve(buf.toString());
	});
});
p.then(console.log.bind(console));
```


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

## `$implicitly([dynamnic])`
Returns a new remote instance which will send the data to the server each time
you call the procedures on it.

Use it like a map containing automatically sent pieces of data.
```javascript
var withName = remote.$implicitly('name', 'AGhost-7');
withName.greet(); // -> name is "AGhost-7"
```

You can create a new remote with the value at the specified key of removed.
```javascript
var noName = withName.$implicitly('name');
noName.greet(); // -> name is undefined
```

Transfer properties on objects to the implicit context.
```javascript
var withContext = noName.$implicitly({
	name: 'foobar',
	gameScore: 5000
});
withContext.greet(); // -> name is "foobar", and gameScore is 5000.
```

Transfer specific properties from an object to the implicit context.

```javascript
var withContext = noName.$implicitly({
	name: 'foobar',
	gameScore: 5000,
	level: 5,
	experience: 34908725
}, 'name', 'level');
// -> sends only send the name and level property from the implicit context.
withContext.greet();
```
## `$implicitlyMut(key[, value])`
Modifies the implicit context on the remote, mutating it. Delete the value from
the context by not specifying the value argument.


## Client Events

### `error`
The error event is triggered whenever the client receives and `err` message
back from the server. Essentially, whenever the remote object returns a 
rejected promise.

This can be useful if you want to catch certain connection errors. For example,
you may want to give GUI feedback if you can't connect to the server because
there is no connection.

### `exit`
This is a response that the server can send to the client to terminate any
more requests. This will cause the remote to stop sending requests, and simply
return rejected promises every time.

### `end`
Called at any time the remote is no longer capable of sending requests. For the
http implementations, this is only the case when the server sends a `exit` 
response. For persistent connections such as TCP, the `end` event is triggered
whenever the connection is lost as well.


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
- `on`: This option allows you to specify what events you wish to listen to.

## Example Uses

### Angular

#### Vanilla as a Constant
Since pogostick discourages mutations, we can treat the procedure listing as a 
constant. The server's remote procedures should not change over time, meaning 
once loaded, we don't need to worry about refreshing the procedures we can call
from the server.

```javascript
// Since we're loading the module manually, make sure to NOT place the `ng-app`
// property for the module on your application's html.
var app = angular.module('App', []);

var injector = angular.injector(['ng']);
var $q = injector.get('$q');

// start by injecting the promise factory.
pogo($q)({
	port: 3000,
	host: 'localhost'
}, function(err, remote) {
	if(err) {
		// place error page or something.
	} else {
		app.constant('$remote', remote);
		angular.element(document).ready(function() {
			angular.bootstrap(document, ['App']);
		});
	}
});

app.controller('MainCtrl', ['$scope', '$remote', function($scope, $remote) {
	$remote
		// lets say we fetch some items to display to our user.
		.products()
		.then(function(list) {
			$scope.products = list;
		});
}]);

```

#### As a Constant Using `angular-deferred-bootstrap`

```javascript
deferredBootstrapper.bootstrap({
	element: document,
	module: 'App',
	resolve: {
		'$remote': ['$q', function($q) {
			return $q(function(resolve, reject) {
				pogo($q)({
					port: 3000,
					host: 'localhost'
				}, function(err, remote) {
					if(err) reject(err); else resolve(remote);
				});
			});
		}]
	}
});
```
