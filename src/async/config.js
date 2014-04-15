
/**
* TODO:...
*/
var Config = (function () {
    function Config() {
        this.returnValue = Config.PROMISE;
        this.callbackArg = Config.NONE;
        this.isIterable = false;
        //TODO:...isVariadic?: boolean;
        this.maxConcurrency = null;
    }
    Config.NONE = 'none';
    Config.PROMISE = 'promise';
    Config.REQUIRED = 'required';
    return Config;
})();
module.exports = Config;
//# sourceMappingURL=config.js.map
