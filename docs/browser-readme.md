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

${features}

${types}

${remote}

${events}

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
