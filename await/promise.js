var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');


var builder = oldBuilder.derive(function () {
    return function (co, args) {
        if (args.length !== 1 || !args[0] || typeof args[0].then !== 'function')
            return pipeline.notHandled;
        args[0].then(function (val) {
            return co.enter(null, val);
        }, co.enter);
    };
});
module.exports = builder;
//# sourceMappingURL=promise.js.map
