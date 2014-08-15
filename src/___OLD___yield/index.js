var _ = require('../util');

var yield_ = function yield_(value) {
    // Ensure this function is executing inside a fiber.
    var fi = _.currentFiber();
    if (!fi)
        throw new Error('yield: may only be called inside a suspendable function.');

    // Delegate to the appropriate protocol-specific behaviour.
    fi.suspend(null, value);
};
module.exports = yield_;
//# sourceMappingURL=index.js.map
