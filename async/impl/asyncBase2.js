var _ = require('lodash');

var Fiber = require('fibers');
var semaphore = require('./semaphore');
var fiberPool = require('./fiberPool');


var async = makeAsyncFunc(function (resume, suspend, options) {
    return null;
});

function makeAsyncFunc(factory, options) {
    var newProtocol = factory(nullFunc, nullFunc, options) || {};
    var protocolArgCount = (newProtocol.create || nullFunc).length;

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

            var _run = function () {
                return suspendableDefn.apply(_this, sArgs);
            };
            var co = new Co(_run);

            var protocol = factory(function () {
                return co.resume();
            }, function () {
                return co.suspend();
            }, options);
            co._return = protocol.return || nullFunc;
            co._throw = protocol.throw || nullFunc;
            co._yield = protocol.yield || nullFunc;
            co._delete = protocol.delete || nullFunc;
            return (protocol.create || nullFunc).apply(protocol, pArgs);
        }

        var result, args = [], arity = suspendableDefn.length + protocolArgCount;
        for (var i = 0; i < arity; ++i)
            args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    result.mod = function (factory_, options) {
        return makeAsyncFunc(factory_ || factory, options);
    };

    return result;
}

var Co = (function () {
    function Co(_run) {
        this._run = _run;
    }
    Co.prototype._dispose = function () {
        fiberPool.dec();
        this._fiber = null;
        this._run = null;
        semaphore.leave();
        this._delete();
    };

    Co.prototype._makeFiberBody = function () {
        var _this = this;
        var tryBlock = function () {
            return _this._return(_this._run());
        };
        var catchBlock = function (err) {
            return _this._throw(err);
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

    Co.prototype.resume = function () {
        var _this = this;
        var doResume = function () {
            if (!_this._fiber) {
                fiberPool.inc();
                var fiber = Fiber(_this._makeFiberBody());
                fiber.yield = function (value) {
                    _this._yield(value);
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
    return Co;
})();

function nullFunc() {
}
module.exports = async;
//# sourceMappingURL=asyncBase2.js.map
