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
