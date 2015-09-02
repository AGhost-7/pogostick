
var reqFactory = require('./lib/httpReqFactory');
var serverFactory = require('./lib/httpServerFactory');
var pogo = require('pogostick-proto');

module.exports = {
	client: function(promiseFactory, options) {
		return pogo.client(promiseFactory, reqFactory, options);
	},
	server: pogo.server(serverFactory)
};
