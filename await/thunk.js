var oldBuilder = require('../src/awaitBuilder');
var pipeline = require('../src/pipeline');
var _ = require('../src/util');

var builder = oldBuilder.derive(function () {
    return function thunkHandler(co, args) {
        if (args.length !== 1 || !_.isFunction(args[0]))
            return pipeline.notHandled;
        args[0](co.enter);
    };
});
module.exports = builder;
//# sourceMappingURL=thunk.js.map
