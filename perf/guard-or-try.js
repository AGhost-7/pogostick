/* Am I better off letting exceptions run or check if the value has become 
 * undefined?
 */ 
var bench = require('./bench');

var iterations = 1000000;

var proc = {
	hello: {
		world: console.log.bind(console, 'hello world')
	}
};

var call = 'hello.world';
var split = call.split('.');
var obj;

var uStop = bench();
for(var i = 0; i < iterations; i++) {
	obj = proc;
	try {
		for(var k = 0; k < split.length; k++) {	
			obj = obj[split[k]];
		}
	} catch(err) {
		return console.log(err);
	}	
}
uPrint = uStop();


var sStop = bench();
for(var i = 0; i < iterations; i++) {
	obj = proc;
	
	for(var k = 0; k < split.length; k++) {
		obj = obj[split[k]];
		if(obj === undefined) {
			return console.log(err);
		}
	}
}
var sPrint = sStop();

uPrint('Unsafe:');
sPrint('Guarded:');

// Oddly enough, it seems that using a guarded approach is better, although
// only marginally (5%~). I think I wil use the guarded approach since 
// exceptions tend to have a high overhead when they are actually thrown.
// But hey, lets test it.

var call = 'hello.friend.foo';
var split = call.split('.');

uStop = bench();
for(var i = 0; i < iterations; i++) {
	obj = proc;
	try {
		for(var k = 0; k < split.length; k++) {
			obj = obj[split[k]];
		}
	} catch (err) {
		obj = undefined;
	}
}
uPrint = uStop();

sStop = bench();
for(var i = 0; i < iterations; i++) {
	obj = proc;
	for(var k = 0; k < split.length; k++) {
		obj = obj[split[k]];
		if(obj === undefined) break;
	}	
}
sPrint = sStop();

uPrint('Unsafe (in failure)');
sPrint('Safe (in failure)');

// The safe handling in this case is an order of magnitude faster.
