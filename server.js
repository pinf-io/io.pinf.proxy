
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

		if (
			!api ||
			typeof api !== "object"
		) {
			console.error("API.__pgl_meta", API.__pgl_meta);
			console.error("API.config.services['" + route + "'].implementation:", api);
			throw new Error("Module at API['" + API.config.services[route].implementation + "'] does not export api!");
		}

		// We should support all the popular low-level adapters here.

		// @see https://nodejs.org/api/http.html#http_event_request
		if (api["nodejs.org/api/http/0"]) {

			function handler1 (req, res, opts, callback) {

				req.urlPrefix = req.url;
				req.url = "/" + opts.splat;
				req.urlPrefix = req.urlPrefix.substring(0, req.urlPrefix.indexOf(req.url));

				try {
					api["nodejs.org/api/http/0"](req, res);
				} catch (err) {
					return callback(err);
				}
			}

			router.set("/" + route + "/", handler1);
			router.set("/" + route + "/*", handler1);
		} else
		// @see https://github.com/creationix/stack
		if (api["github.com/creationix/stack/0"]) {

			function handler2 (req, res, opts, callback) {

				var urlParts = req.url.split("?");
				req.urlPrefix = req.url;
				if (opts.splat) {
					req.url = "/" + opts.splat;
					if (urlParts.length > 1) {
						req.url += "?" + urlParts.slice(1).join("?");
					}
					req.urlPrefix = req.urlPrefix.substring(0, req.urlPrefix.lastIndexOf(req.url));
				} else {
					req.url = "/";
					if (urlParts.length > 1) {
						req.url += "?" + urlParts.slice(1).join("?");
					}
				}
				req.urlPrefix = req.urlPrefix.replace(/\/$/, "");

				try {
					STACK(api["github.com/creationix/stack/0"])(req, res);
				} catch (err) {
					return callback(err);
				}
			}

			router.set("/" + route + "/", handler2);
			router.set("/" + route + "/*", handler2);
		}

		API.console.log("Service for route '" + route + "' available at: http://" + API.config.bind + ":" + API.config.port + "/" + route + "/");
	}

	HTTP.createServer(function handler (req, res) {

		logger.info("Request", req.url);

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
