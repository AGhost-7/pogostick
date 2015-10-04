
## Pogostick Http ![Build](https://travis-ci.org/AGhost-7/pogostick.svg?branch=master)
This is the implementation of the Pogostick protocol for http.

## Introductory Example

```javascript
// Use whichever promise library you want, as long as it follows Promises/A+ spec.
var Promise = require('bluebird');
var pogo = require('pogostick-http');
var mkServer = pogo.server({
	host: 'localhost'	
});

var server = mkServer({
	add: function(a, b) {
		return 1 + 2;
	},
	// You can also return promises and it will return only the result contained
	// within it. If the promise is rejected, it will also be rejected on the client.
	delayedGreet: function(name) {
		return new Promise(function(resolve) {
			setTimeout(function() { 
				resolve('hello world!');
			}, 5000);
		});
});

// you need to pass to the client constructor a function which generates
// promise instances.
var promiseFactory = function(resolver) { return new Promise(resolver); };
var mkClient = pogo.client(promiseFactory, { host: 'localhost' });

server.listen(3000, function() {
	mkClient({ port: 3000 }, function(err, remote) {
		Promise.all([
			remote.add(1, 2),
			remote.delayedGreet()
		]).spread(function(sum, greet) {
			console.log(sum, greet);
		});
	});
});

``` 

${features}

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

## Module Functions

### `client(promiseFactory)`
Returns a client generating function that you can pass an options object and
a complete handler to.
 
The options are passed to the underlying native nodeJS [http][1] module, giving
the options such as `port` and `host`.

### `https.client(promiseFactory)`
Returns a client generating function similar to `client(promiseFactory)`. Just
like `client(promiseFactory)`, the options are passed to the underlying native
nodeJs module, this time [https][2].

### `server(options)`
Accepts the default options and returns a server instantiation function. Each
server instance will inherit the inital options specified in the function.

The options are the following:
- `headers` specifies which headers t send out in each request.

### `https.server(options)`
Similar to `server(options` with two additional options.
- `cert`, the ssl certificate.
- `key`, which is the encryption key.

[1]: https://nodejs.org/api/http.html#http_http_request_options_callback
[2]: https://nodejs.org/api/https.html#https_https_request_options_callback
