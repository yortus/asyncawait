var Fiber = require('fibers');
var Semaphore = require('../semaphore');

var Protocol = (function () {
    function Protocol() {
    }
    Protocol.prototype.invoke = function (func, this_, args) {
        this.semaphore = semaphore;
        this.func = function () {
            return func.apply(this_, args);
        };
        return this;
    };

    Protocol.prototype.resume = function () {
        var _this = this;
        if (!this.fiber) {
            var fiber = Fiber(function () {
                return _this.fiberBody();
            });
            fiber.yield = function (value) {
                _this.yield(value);
            };
            this.fiber = fiber;

            if (Fiber.current)
                return fiber.run();
            this.semaphore.enter(function () {
                return fiber.run();
            });
        } else {
            this.fiber.run();
        }
    };

    Protocol.prototype.suspend = function () {
        Fiber.yield();
    };

    Protocol.prototype.return = function (result) {
    };

    Protocol.prototype.throw = function (error) {
    };

    Protocol.prototype.yield = function (value) {
    };

    Protocol.prototype.dispose = function () {
        this.fiber = null;
        this.func = null;
        this.semaphore.leave();
        this.semaphore = null;
    };

    Protocol.arityFor = function (func) {
        return func.length;
    };

    Protocol.maxConcurrency = function (n) {
        if (arguments.length === 0)
            return maxConcurrency;
        maxConcurrency = n;
        semaphore = new Semaphore(n);
    };

    Protocol.prototype.fiberBody = function () {
        try  {
            this.try();
        } catch (err) {
            this.catch(err);
        } finally {
            this.finally();
        }
    };

    Protocol.prototype.try = function () {
        adjustFiberCount(+1);

        var result = this.func();
        this.return(result);
    };

    Protocol.prototype.catch = function (err) {
        this.throw(err);
    };

    Protocol.prototype.finally = function () {
        adjustFiberCount(-1);

        this.dispose();
    };
    return Protocol;
})();

var maxConcurrency = 1000000;
var semaphore = new Semaphore(maxConcurrency);

function adjustFiberCount(delta) {
    activeFiberCount += delta;
    if (activeFiberCount >= fiberPoolSize) {
        fiberPoolSize += 100;
        Fiber.poolSize = fiberPoolSize;
    }
}
var fiberPoolSize = Fiber.poolSize;
var activeFiberCount = 0;
module.exports = Protocol;
//# sourceMappingURL=base.js.map
