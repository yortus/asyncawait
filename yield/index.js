var pipeline = require('../src/pipeline');

var yield_ = function yield_(value) {
    // Ensure this function is executing inside a coroutine.
    var co = pipeline.currentCoro();
    if (!co)
        throw new Error('yield: may only be called inside a suspendable function.');

    // Delegate to the appropriate protocol-specific behaviour.
    co.leave(value);
};

yield_.continue = pipeline.continueAfterYield;
module.exports = yield_;
//# sourceMappingURL=index.js.map
