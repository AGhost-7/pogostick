
var reqFactory = require('./lib/httpReqFactory');
var serverFactory = require('./lib/httpServerFactory');

var secureReqFactory = require('./lib/httpsReqFactory');
var secureServerFactory = require('./lib/httpsServerFactory');
var pogo = require('pogostick-proto');

module.exports = {
	client: function(promiseFactory, options) {
		return pogo.client(promiseFactory, reqFactory, options);
	},
	server: pogo.server(serverFactory),
	https: {
		client: function(promiseFactory, options) {
			return pogo.client(promiseFactory, secureReqFactory, options);
		},
		server: pogo.server(secureServerFactory)
	}
};
