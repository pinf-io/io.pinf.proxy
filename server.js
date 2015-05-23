
/*
var http = require('http');


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  res.end('Hello World from proxy.pinf.io\n');

}).listen(15000, process.env.OPENSHIFT_INTERNAL_IP);
*/

console.log("io.pinf.proxy server loading");


require('org.pinf.genesis.lib').forModule(require, module, function (API, exports) {

console.log("API.config", API.config);

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

});

console.log("io.pinf.proxy server loaded");
