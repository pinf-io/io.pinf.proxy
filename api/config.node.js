

exports.forLib = function (LIB) {
    var ccjson = this;

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
                        ensure._promise = LIB.Promise.try(function () {
                            if (config.config.basePath === config.config.globalBasePath) {
                                return null;
                            }
                            return LIB.FS.outputFileAsync(LIB.PATH.join(config.config.basePath, "io.pinf.proxy/config.cc.json"), JSON.stringify({
                                "@io.pinf.proxy/server/0": {
                                    "$io.pinf.proxy/server": {
                                        "routes": config.routes
                                    }
                                }
                            }, null, 4));
                        }).then(function () {
                            if (!config.config.globalBasePath) {
                                return null;
                            }
                            return LIB.FS.outputFileAsync(LIB.PATH.join(config.config.globalBasePath, "io.pinf.proxy/config.cc.json"), JSON.stringify({
                                "@": {
                                    "$": [
                                        "../*/io.pinf.proxy/config.cc.json"
                                    ]
                                },
                                "@io.pinf.proxy/server/0": {
                                    "$io.pinf.proxy/server": {
                                        "routes": ((config.config.basePath === config.config.globalBasePath) && config.routes) || {}
                                    }
                                }
                            }, null, 4));
                        });
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
                            api: function () {
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
