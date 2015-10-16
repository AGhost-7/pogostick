/**
 * Just how much of an overhead does noop functions have? Does the JIT kick in
 * and optimize to the point it doesnt matter? Should I use a conditional 
 * instead of a function to control what should be printed out?
 */
var debug = require('debug')('foobars');

var bench = require('./bench');
var iterations = 1000000000;

var nStop = bench();
for(var i = 0; i < iterations; i++) {
}
var nPrint = nStop();

var noop = function() {};
noop.enabled = false;
var data = 1, data2 = {};
var noopStop = bench();
for(var i = 0; i < iterations; i++) {
	noop('hello world', data2);
}
var noopPrint = noopStop();

var isDebug = false;
var iStop = bench();
for(var i = 0; i < iterations; i++){
	if(isDebug) {
		console.log('hello world:' + i);
	}
}
iPrint = iStop();

var dStop = bench();
for(var i = 0; i < iterations; i++){
	debug('an object %s and a number %s,', data2, data);
}
var dPrint = dStop();

var debugPrintString = 'an object %s and a number %s', data2, data;
var strStop = bench();
for(var i = 0; i < iterations; i++) {
	debug(debugPrintString, data2, data);
}
var strPrint = strStop();

nPrint('nothing:');
noopPrint('noop:');
iPrint('conditional:');
dPrint('Using debug module:');
strPrint('Debug with the message as a constant');

/**
 * noop is much faster in the case where you can just feed the data into the 
 * function, and avoid any sort of operation outside of that call to feed into
 * the function. I'm guessing that the operation just gets inlined, meaning you 
 * end up with nothing at all.
 *
 * The problem is sometimes you'll need to process strings, turn objects to 
 * JSON, and so on, to be able to to print out someting of decently helpful.
 */ 
