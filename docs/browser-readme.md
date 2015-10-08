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

${features}

${"module-types"}

${remote}

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

