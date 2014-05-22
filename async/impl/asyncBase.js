var _ = require('lodash');
var Protocol = require('./protocols/base');

var async = makeAsyncFunc({ constructor: Protocol });

function makeAsyncFunc(options) {
    if (!options)
        throw new Error('async(): expected options to be specified');
    var protocolClass = options.constructor;
    if (!protocolClass)
        throw new Error('async(): expected options.constructor to be specified');
    var newProtocol = function () {
        return new protocolClass(options);
    };
    var protocolArgCount = newProtocol().invoke.length;

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

            var invoke = function () {
                return suspendableDefn.apply(_this, sArgs);
            };
            var protocol = newProtocol();
            protocol['_func'] = invoke;
            return protocol.invoke.apply(protocol, pArgs);
        }

        var result, args = [], arity = suspendableDefn.length + protocolArgCount;
        for (var i = 0; i < arity; ++i)
            args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    result.mod = function (options_) {
        var opts = _.assign({}, options_);
        opts.constructor = opts.constructor || protocolClass;

        return makeAsyncFunc(opts);
    };

    return result;
}
module.exports = async;
//# sourceMappingURL=asyncBase.js.map
