var _ = require('lodash');

var Promise = require('bluebird');
var Fiber = require('fibers');
var semaphore = require('./semaphore');
var fiberPool = require('./fiberPool');


var async = makeAsyncFunc(function (resume, suspend, options) {
    var resolver = Promise.defer();
    var result = {
        create: function () {
        },
        delete: function () {
        },
        return: function (result) {
        },
        throw: function (error) {
        },
        yield: function (value) {
        }
    };
    return result;
});

function makeAsyncFunc(factory, options) {
    var newProtocol = factory(function () {
    }, function () {
    }, options);
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

            var _run = function () {
                return suspendableDefn.apply(_this, sArgs);
            };
            var co = new Co(_run);

            var protocol = factory(function () {
                return co.resume();
            }, function () {
                return co.suspend();
            }, options);
            co._return = function (v) {
                return protocol.return(v);
            };
            co._throw = function (v) {
                return protocol.throw(v);
            };
            co._yield = function (v) {
                return protocol.yield(v);
            };
            co._delete = function () {
                return protocol.delete();
            };
            return protocol.create.apply(protocol, pArgs);
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
module.exports = async;
//# sourceMappingURL=asyncBase2.js.map
