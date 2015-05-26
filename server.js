
/*
var http = require('http');


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  res.end('Hello World from proxy.pinf.io\n');

}).listen(15000, process.env.OPENSHIFT_INTERNAL_IP);
*/

console.log("io.pinf.proxy server loading");

const HTTP = require('http');
const HTTP_HASH_ROUTER = require('http-hash-router');
const STACK = require('stack');
const BUNYAN = require('bunyan');


require('org.pinf.genesis.lib').forModule(require, module, function (API, exports) {

console.log("API.config", API.config);

	var logger = BUNYAN.createLogger({
		name: "io.pinf.proxy"
	});

	var router = HTTP_HASH_ROUTER();

	for (var route in API.config.services) {
		API.console.log("Mounting service to route '" + route + "':", API.config.services[route]);

		var api = API[API.config.services[route].implementation];

		// We should support all the popular low-level adapters here.

		// @see https://nodejs.org/api/http.html#http_event_request
		if (api["nodejs.org/api/http/0"]) {
			router.set("/" + route + "/*", api["nodejs.org/api/http/0"]);
		} else
		// @see https://github.com/creationix/stack
		if (api["github.com/creationix/stack/0"]) {
			router.set("/" + route + "/*", STACK(api["github.com/creationix/stack/0"]));
		}
	}

	HTTP.createServer(function handler (req, res) {

		logger.info("Request", req);

	    router(req, res, {}, function (err) {
	        if (err) {
	            // use your own custom error serialization.
	            res.statusCode = err.statusCode || 500;
	            res.end(err.message);
	        }
	    });
	}).listen(
		API.config.port,
		API.config.bind
	);

console.log("Server listening at: http://" + API.config.bind + ":" + API.config.port);



/*
	var server = new API.WS.Server({
		host: API.config.host,
		port: API.config.port
	});

	server.on('connection', function connection (ws) {

	  ws.on('message', function incoming (message) {
	    console.log('received: %s', message);
	  });

	  ws.send('something');

	});
*/


});

console.log("io.pinf.proxy server loaded");
