var bench = require('./bench');

/* I want to figure out if creating a function on each request affects inlining
 * potential. I need to compare the performance difference with object
 * creation to see if the additional overhead isn't caused only by that.
 */

var 
	stop, 
	print,
	iterations = 10000000,
	i,
	calc;

stop = bench();
var fn = function() {
	return 1 + 1;
};
for(i = 0; i < iterations; i++) {
	fn();
}
stop()('Result for single function:');

stop = bench();
var obj;
for(i = 0; i < iterations; i++) {
	fn();
	obj = {};
}
stop()('For comparison, single function with object created:');

stop = bench();
for(i = 0; i < iterations; i++) {
	(function() {
		return 1 + 1;
	})();
}

stop()('New function created for each call:');

// result:
// 18 ms
// 56 ms
// 160 ms
// ... respectively. It seems that creating a new function on each call adds
// overhead which is significantly higher than just the cost of creating an
// object.
