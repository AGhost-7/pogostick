var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var slurp = function(file) {
	var absPath = path.join(__dirname, file);
	return fs.readFileSync(absPath, 'utf-8');
};

// Define global files to reference from the main readmes.
var files = [
	'features'
];

var data = _.reduce(files, function(accu, filename) {
	accu[filename] = slurp(filename + '.md');
	return accu;
}, {});

var render = function(filename) {
	return _.template(slurp(filename + '.md'))(data);
};

// Define field mappings; file in docs to directory in 
var readmes = {
	'http-readme': 'pogostick-http',
	'browser-readme': 'pogostick-browser',
	'proto-readme': 'pogostick-proto'
};

_.forEach(readmes, function(outDir, readmeName) {
	var output = render(readmeName);
	var outFileName = path.join(__dirname, '..', outDir, 'readme.md');

	fs.writeFileSync(outFileName, output);
});


