var bench = require('./bench');

var iterations = 1;

var proc = {
	hello: {
		world: function() {}
	}
};

var call = 'hello.world';
var split = call.split('.');
var obj;

var uStop = bench();
for(var i = 0; i < iterations; i++) {
	obj = split;
	try {
		for(var k = 0; k < split.length; k++) {
			obj = obj[split[k]];
		}
		console.log('1',obj);
	} catch(err) {}	
}
console.log('2',obj);

var sStop = bench();
for(var i = 0; i < iterations; i++) {
	var str = 'hello.world';

}

