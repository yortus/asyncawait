var _ = require('lodash');

var Fiber = require('fibers');
var semaphore = require('./semaphore');
var fiberPool = require('./fiberPool');


var Co = (function () {
    function Co() {
        this._run = nullFunc;
        this._fiber = null;
    }
    Co.prototype.resume = function () {
        var _this = this;
        var doResume = function () {
            if (!_this._fiber) {
                fiberPool.inc();
                var fiber = Fiber(_this._makeFiberBody());
                fiber.yield = function (value) {
                    _this.yield(value);
                };
                _this._fiber = fiber;
            }
            _this._fiber.run();
        };

        var isTopLevelInitial = !this._fiber && !Fiber.current;
        if (isTopLevelInitial)
            semaphore.enter(doResume);
        else
            doResume();
    };

    Co.prototype.suspend = function () {
        Fiber.yield();
    };

    Co.prototype.create = function () {
    };

    Co.prototype.delete = function () {
    };

    Co.prototype.return = function (result) {
    };

    Co.prototype.throw = function (error) {
    };

    Co.prototype.yield = function (value) {
    };

    Co.prototype._makeFiberBody = function () {
        var _this = this;
        var tryBlock = function () {
            return _this.return(_this._run());
        };
        var catchBlock = function (err) {
            return _this.throw(err);
        };
        var finallyBlock = function () {
            return _this._dispose();
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
    };

    Co.prototype._dispose = function () {
        fiberPool.dec();
        this._fiber = null;
        this._run = null;
        semaphore.leave();
        this.delete();
    };
    return Co;
})();

var co = new Co();

var async = makeAsyncFunc(function () {
    var result = {};
    result.resume = co.resume;
    result.suspend = co.suspend;
    result.create = co.create;
    result.delete = co.delete;
    result.return = co.return;
    result.throw = co.throw;
    result.yield = co.yield;
    result._makeFiberBody = co._makeFiberBody;
    result._dispose = co._dispose;
    result._run = co._run;
    result._fiber = co._fiber;
    return result;
});

function makeAsyncFunc(protocolFactory) {
    var newProtocol = protocolFactory();
    var protocolArgCount = newProtocol.create.length;

    var result = function async(suspendableDefn) {
        if (arguments.length !== 1)
            throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn))
            throw new Error('async(): expected argument to be a function');

        function asyncRunner($ARGS) {
            var _this = this;
            var argCount = arguments.length, suspendableArgCount = argCount - protocolArgCount;
            var sArgs = new Array(suspendableArgCount), pArgs = new Array(protocolArgCount);
            for (var i = 0; i < suspendableArgCount; ++i)
                sArgs[i] = arguments[i];
            for (var i = 0; i < protocolArgCount; ++i)
                pArgs[i] = arguments[i + suspendableArgCount];

            var protocol = protocolFactory();
            protocol._run = function () {
                return suspendableDefn.apply(_this, sArgs);
            };

            return protocol.create.apply(protocol, pArgs);
        }

        var result, args = [], arity = suspendableDefn.length + protocolArgCount;
        for (var i = 0; i < arity; ++i)
            args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    result.mod = function mod(override_, options_) {
        var override = _.isFunction(override_) ? override_ : null;
        var options = override ? options_ : override_;

        if (override) {
            var newProtocolFactory = function (opts) {
                var newProtocol = protocolFactory();

                var overrides = override(newProtocol, opts || options);

                if (overrides.create)
                    newProtocol.create = overrides.create;
                if (overrides.delete)
                    newProtocol.delete = overrides.delete;
                if (overrides.return)
                    newProtocol.return = overrides.return;
                if (overrides.throw)
                    newProtocol.throw = overrides.throw;
                if (overrides.yield)
                    newProtocol.yield = overrides.yield;

                return newProtocol;
            };
        } else {
            newProtocolFactory = function (opts) {
                return protocolFactory(opts || options);
            };
        }

        return makeAsyncFunc(newProtocolFactory);
    };

    return result;
}

function nullFunc() {
}
module.exports = async;
//# sourceMappingURL=asyncBase2.js.map
