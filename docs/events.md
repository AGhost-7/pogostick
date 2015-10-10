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
