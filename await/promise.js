var oldBuilder = require('../src/awaitBuilder');


var builder = oldBuilder.mod({
    handler: function () {
        return function (expr, resume) {
            if (typeof expr.then !== 'function')
                return false;
            var p = expr;
            p.nodeify(resume);
        };
    }
});
module.exports = builder;
//# sourceMappingURL=promise.js.map
