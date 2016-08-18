

exports.forLib = function (LIB) {
    var ccjson = this;

    function server (config) {

        const HTTP = require("http");
        const HTTP_PROXY = require('http-proxy');
        const EXPRESS = require("express");
        const MORGAN = require("morgan");

        const VERBOSE = true;


        if (VERBOSE) console.log("ROUTES", config.routes);


        var proxy = HTTP_PROXY.createProxyServer({});
        proxy.on('error', function (err) {
            console.error(err.stack);
        });


        var app = EXPRESS();
        app.get(/^\/favicon\.(ico|png)$/, function(req, res, next) {
            res.writeHead(200);
            return res.end();
        });
        app.use(MORGAN('combined'));
        app.use(function (req, res, next) {
            // TODO: Optionally force to HTTPS if we can detect via AWS ELB.
        	var origin = null;
            if (req.headers.origin) {
                origin = req.headers.origin;
            } else
            if (req.headers.host) {
                origin = [
                    // TODO: Allow for HTTPS via config.
                    "http://",
                    req.headers.host
                ].join("");
            }
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Cookie");
            if (req.method === "OPTIONS") {
                return res.end();
            }
            return next();
        });

        app.use(function (req, res, next) {

            try {

                if (VERBOSE) console.log("Headers:", req.headers);
                if (VERBOSE) console.log("Host:", req.headers.host);

                var routeLookupHost = req.headers.host;
                if (VERBOSE) console.log("routeLookupHost:", routeLookupHost);

                var target = (
                    config.routes["/" + routeLookupHost + "/"] ||
                    config.routes["/" + routeLookupHost.replace(/^([^:]+)(:\d+)/, "$1") + "/"]
                );
                if (target) {
                    if (target.host) {
                        if (VERBOSE) console.log("routeTargetHost:", target.host);
                        return proxy.web(req, res, {
                            target: "http://" + target.host
                        });
                    } else
                    if (target.adapter === "html") {
                        res.writeHead(200, {
                            "Content-Type": "text/html"
                        });
                        res.end(target.html);
                        return;
                    }
                }
                res.statusCode = 404;
                return res.end("Not Found!");
            } catch (err) {
                console.error(err.stack);
                res.statusCode = 500;
                return res.end("Internal Server Error!");
            }
        });

        var server = HTTP.createServer(app);

        // Setup websocket proxies for the routes that need it.
        var wsProxies = {};
        Object.keys(config.routes).forEach(function (routeName) {
            if (!config.routes[routeName].ws) {
                return;
            }
            var wsRouteTargetHost = config.routes[routeName].host;
            if (VERBOSE) console.log("wsRouteTargetHost for '" + routeName + "':", wsRouteTargetHost);
            wsProxies[routeName] = HTTP_PROXY.createProxyServer({
                target: "http://" + wsRouteTargetHost
            });
        });
        server.on('upgrade', function (req, socket, head) {

            try {

                if (VERBOSE) console.log("WS Headers:", req.headers);
                if (VERBOSE) console.log("WS Host:", req.headers.host);

                var wsRouteLookupHost = req.headers.host;
                if (VERBOSE) console.log("wsRouteLookupHost:", wsRouteLookupHost);

                var target = (
                    wsProxies["/" + wsRouteLookupHost + "/"] ||
                    wsProxies["/" + wsRouteLookupHost.replace(/^([^:]+)(:\d+)/, "$1") + "/"]
                );
                if (target) {
                    if (VERBOSE) console.log("proxy WS upgrade request to:", config.routes[wsRouteLookupHost].host);
                    target.ws(req, socket, head);
                } else {
                    if (VERBOSE) console.log("No WS proxy found for", wsRouteLookupHost);
                    return socket.end("Forbidden!");
                }

            } catch (err) {
                console.error(err.stack);
                return socket.end("Internal Server Error!");
            }
        });

        return new LIB.Promise(function (resolve, reject) {
            server.listen(config.port, config.bind, function (err) {
                if (err) return reject(err);
                return resolve(null);
            });
        });
    }


    return LIB.Promise.resolve({
        forConfig: function (defaultConfig) {

            var Entity = function (instanceConfig) {
                var self = this;

                var config = {};
                LIB._.merge(config, defaultConfig);
                LIB._.merge(config, instanceConfig);
                config = ccjson.attachDetachedFunctions(config);


                function ensure () {
                    if (!ensure._promise) {

                        ensure._promise = server(config);
                    }
                    return ensure._promise;
                }

                self.AspectInstance = function (aspectConfig) {

                    var config = {};
                    LIB._.merge(config, defaultConfig);
                    LIB._.merge(config, instanceConfig);
                    LIB._.merge(config, aspectConfig);
                    config = ccjson.attachDetachedFunctions(config);

                    return ensure().then(function (rt) {

                        return LIB.Promise.resolve({
                            server: function () {
                                return LIB.Promise.resolve(
                                    ccjson.makeDetachedFunction(function (args) {

                                        var exports = {};

                                        return exports;
                                    })
                                );
                            }
                        });
                    });
                }
            }

            return Entity;
        }
    });
}
