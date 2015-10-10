var bench = require('./bench');

var iterations = 100000000;

var fStop = bench();
var fn = function() { console.log(''); };
for(var i = 0; i < iterations; i++) {
	fn();
}

var fPrint = fStop();

var nStop = bench();
for(var i = 0; i < iterations; i++) {
	1 + 2;
}
nPrint = nStop();

fPrint('with a function call:');
nPrint('without a function call:');


