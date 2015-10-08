function Bench() {
}
Bench.prototype.start = function() {
	this.began = Date.now();
};
Bench.prototype.stop = function() {
	this.stopped = Date.now();
};
Bench.prototype.print = function() {
	console.log('Time processing: ', this.stopped - this.began);
};

module.exports = Bench;
