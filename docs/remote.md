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

