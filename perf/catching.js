var bench = require('./bench');

var iterations = 100000000;

var ncStop = bench();
for(var i = 0; i < iterations; i++) {
	// I need to do something...
	var a = 1 + 1;	
}
var ncPrint = ncStop();

var cStop = bench();
for(var i = 0; i < iterations; i++) {
	var a;
	try {
		a = 1 + 1;
	} catch(err) {}
}
var cPrint = cStop();

var dStop = bench();
for(var i = 0; i < iterations; i++) {
	var a;
	try {
		try {
			a = 1 + 1;
		} catch(err) {}
	} catch(err) {}
}
var dPrint = dStop();


ncPrint('without catch:');
cPrint('with catch:');
dPrint('with two catches:');

// On my machine, in order:
// 258 ms
// 444 ms
// 685 ms
