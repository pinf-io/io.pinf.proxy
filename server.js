
var http = require('http');


http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  res.end('Hello World from proxy.pinf.io\n');

}).listen(15000, process.env.OPENSHIFT_INTERNAL_IP);

