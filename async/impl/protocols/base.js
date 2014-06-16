var Fiber = require('fibers');
var semaphore = require('../semaphore');
var fiberPool = require('../fiberPool');

var Protocol = (function () {
    function Protocol() {
    }
    Protocol.prototype.invoke = function () {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        return this;
    };

    Protocol.prototype.resume = function () {
        var _this = this;
        // Define a function to resume the fiber, lazily creating it on the initial call.
        var doResume = function () {
            if (!_this._fiber) {
                fiberPool.inc();
                var fiber = Fiber(_this.makeFiberBody());
                fiber.yield = function (value) {
                    _this.yield(value);
                };
                _this._fiber = fiber;
            }
            _this._fiber.run();
        };

        // Route all top-level initial resume()s through the global semaphore.
        var isTopLevelInitial = !this._fiber && !Fiber.current;
        if (isTopLevelInitial)
            semaphore.enter(doResume);
        else
            doResume();
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
        fiberPool.dec();
        this._fiber = null;
        this._func = null;
        semaphore.leave();
    };

    Protocol.prototype.makeFiberBody = function () {
        var _this = this;
        var tryBlock = function () {
            return _this.return(_this._func());
        };
        var catchBlock = function (err) {
            return _this.throw(err);
        };
        var finallyBlock = function () {
            return _this.dispose();
        };

        // V8 may not optimise the following function due to the presence of
        // try/catch/finally. Therefore it does as little as possible, only
        // referencing the optimisable closures prepared above.
        return function fiberBody() {
            try  {
                tryBlock();
            } catch (err) {
                catchBlock(err);
            } finally {
                finallyBlock();
            }
        };
    };
    return Protocol;
})();
module.exports = Protocol;
//# sourceMappingURL=base.js.map
