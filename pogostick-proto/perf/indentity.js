
/* The goal is to find which way of figuring the identity of the object is the
 * fastest.
 */ 

var Bench = require('./bench');

var iterations = 10000000;

var Foo = function() {};

var foo = new Foo();

var ibench = new Bench();
ibench.start();
for(var i = 0; i < iterations; i++){
	if(foo instanceof Foo){}
}
ibench.stop();

var pbench = new Bench();
pbench.start();
for(var i = 0; i < iterations; i++) {
	if(foo.prototype === Foo.prototype) {}
}
pbench.stop();

console.log('instanceof:');
ibench.print();
console.log('prototype comparison:');
pbench.print();

// instanceof is rougly twice as fast.
