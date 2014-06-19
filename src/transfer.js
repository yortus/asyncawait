var Fiber = require('fibers');
var semaphore = require('./semaphore');
var fiberPool = require('./fiberPool');


var transfer;

transfer = function (co) {
    if (co) {
        var isTopLevelInitial = !co.fiber && !Fiber.current;
        if (isTopLevelInitial)
            return semaphore.enter(function () {
                return startOrResume(co);
            });
        else
            startOrResume(co);
    } else {
        return Fiber.yield();
    }
};

transfer.withValue = function (co, value) {
    if (arguments.length > 1) {
        var isTopLevelInitial = !co._fiber && !Fiber.current;
        if (isTopLevelInitial)
            return semaphore.enter(function () {
                return startOrResume(co);
            });
        else
            startOrResume(co);
    } else {
        return Fiber.yield(co);
    }
};

function startOrResume(co) {
    if (!co.fiber) {
        fiberPool.inc();
        var fiber = Fiber(makeFiberBody(co));
        fiber.yield = function (value) {
            return co.protocol.yield(co, value);
        };
        co.fiber = fiber;
    }
    setImmediate(function () {
        return co.fiber.run();
    });
}

function dispose(co) {
    fiberPool.dec();
    co.protocol = null;
    co.body = null;
    co.fiber = null;
    semaphore.leave();
}

function makeFiberBody(co) {
    var tryBlock = function () {
        return co.protocol.return(co, co.body());
    };
    var catchBlock = function (err) {
        return co.protocol.throw(co, err);
    };
    var finallyBlock = function () {
        return dispose(co);
    };

    return function fiberBody() {
        try  {
            tryBlock();
        } catch (err) {
            catchBlock(err);
        } finally {
            finallyBlock();
        }
    };
}
module.exports = transfer;
//# sourceMappingURL=transfer.js.map
