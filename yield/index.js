var pipeline = require('../src/pipeline');

var yield_ = function yield_(value) {
    // Ensure this function is executing inside a coroutine.
    var co = pipeline.currentCoro();
    if (!co)
        throw new Error('yield: may only be called inside a suspendable function.');

    //TODO: rename 'protocol' everywhere (now pipelines?)
    // Delegate to the appropriate protocol-specific behaviour.
    co.suspend(null, value);
};

// TODO: this is about to be obsolete... remove it
yield_.continue = pipeline.continueAfterYield;
module.exports = yield_;
//# sourceMappingURL=index.js.map
