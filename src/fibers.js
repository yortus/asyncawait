var Fiber = require('fibers');

if (!global.asyncawait)
    global.asyncawait = {};
if (!global.asyncawait.Fiber)
    global.asyncawait.Fiber = Fiber;
var result = global.asyncawait.Fiber;
module.exports = result;
//# sourceMappingURL=fibers.js.map
