
function main () {

    const PATH = require("path");
    const CCJSON = require("ccjson")(null);
    const Promise = CCJSON.LIB.Promise;

    var VERBOSE = false;


    var ccjson = new CCJSON();

    return ccjson.parseFile(PATH.join(__dirname, "start.cc.json"), {
        env: process.env,
        verbose: VERBOSE
    }).then(function (Config) {

        var config = new Config();

        var spine = {};
        Object.keys(Config.prototype["@instances"]).forEach(function (instanceAlias) {

            if (VERBOSE) {
                console.log("Instance:", instanceAlias, Config.prototype["@instances"][instanceAlias]);
            }

            spine[instanceAlias] = config.getInstance(instanceAlias);
        });

        return spine;
    });
}

main().catch(function (err) {
    console.error(err.stack || err);
    process.exit(1);
});
