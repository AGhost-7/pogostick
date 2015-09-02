/* This script is used to install the commit hooks for git.
 *
 * Since this is a multi-package git project, I think it will be easier to maintain.
 */ 

var fs = require('fs');
var path = require('path');

var gitP = path.join(__dirname, '.git/hooks/pre-commit');

if(!fs.existsSync(gitP)) {
	console.info('Installing git pre-commit hook for project');
	fs.linkSync(path.join(__dirname, 'pre-commit'), gitP);

}

