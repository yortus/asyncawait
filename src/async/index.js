var Config = require('./config');
var makeAsyncFunc = require('./makeAsyncFunc');

var defaultConfig = new Config();
var async = makeAsyncFunc(defaultConfig);
async.iterable = async.mod({ isIterable: true });
async.cps = async.mod({ returnValue: Config.NONE, acceptsCallback: true });
module.exports = async;
//# sourceMappingURL=index.js.map
