var serializer = require('./serializer');
function notExist(procName) {
	return serializer.err(msg[1], msg[2], new Error('Procedure ' + msg[3] + ' does not exist'));

}

/* Creates a server instance which will send its results. The protocol doesn't take
 * care of this, but procnet will manage connecting to other servers.
 */
module.exports = function(serverFactory) {
	return function(procs) {
		var procsInit = serializer.init(procs);

		var server = serverFactory(function(msg) {
			switch(msg[0]) {
				case 'ls':
					return procsInit(msg[1], msg[2]);

				case 'call':
					try {
						// A result must be garanteed, if an exception occurs, we must return an
						// error packets
						var proc;
						try {
							proc = msg[3].split('.').reduce(function(obj, key) {
								return obj[key];
							}, procs);
						} catch(err) {
							return notExist(msg[3]);
						}
						if(proc === undefined) {
							return notExist(msg[3]);
						}

						var res = proc.apply(null, JSON.parse(msg[4]));
						// the value returned can either be a 
						if(res.then) {
							return res.then(function(res) {
								return serializer.res(msg[1], msg[2], res);
							}, function(err) {
								return serializer.err(msg[1], msg[2], err);
							});
						} else {
							return serializer.res(msg[1], msg[2], res);
						}
						
					} catch(err) {
						return serializer.err(msg[1], msg[2], err);
					}
			}	
			
		});

		return server;
	};
};
