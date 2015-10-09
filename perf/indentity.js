
/* The goal is to find which way of figuring the identity of the object is the
 * fastest.
 */ 

var bench = require('./bench');

var iterations = 10000000;

var Foo = function() {};

var foo = new Foo();

var iend = bench();
for(var i = 0; i < iterations; i++){
	if(foo instanceof Foo){}
}
var iprint = iend();

var pend = bench();
for(var i = 0; i < iterations; i++) {
	if(foo.prototype === Foo.prototype) {}
}
var pprint = pend();

iprint('instanceof:');
pprint('prototype comparison:');

// instanceof is rougly twice as fast.
