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
