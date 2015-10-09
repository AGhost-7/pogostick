
function Bench() {}

Bench.prototype.start = function() {
	this.began = Date.now();
};
Bench.prototype.stop = function() {
	this.stopped = Date.now();
};
Bench.prototype.print = function() {
	console.log('Time processing: ', this.stopped - this.began);
};

function bench() {
	var began = Date.now();
	return function() {
		var stopped = Date.now();
		return function(message) {
			console.log(message, stopped - began, 'milliseconds');
		};
	};
}

module.exports = bench;
