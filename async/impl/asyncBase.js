var _ = require('lodash');
var Protocol = require('./protocols/base');

var async = makeAsyncFunc({ constructor: Protocol });

function makeAsyncFunc(options) {
    var result = function async(suspendableDefn) {
        if (arguments.length !== 1)
            throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn))
            throw new Error('async(): expected argument to be a function');

        var protocolClass = options.constructor;
        if (!protocolClass) {
        }
        var newProtocol = function () {
            return new protocolClass(options);
        };
        var acceptsCallback = newProtocol().options().acceptsCallback;

        function asyncRunner($ARGS) {
            var nargs = arguments.length, args = new Array(nargs);
            for (var i = 0; i < nargs; ++i)
                args[i] = arguments[i];

            var protocol = newProtocol();
            return protocol.invoke(suspendableDefn, this, args);
        }

        var result, args = [], arity = suspendableDefn.length + (acceptsCallback ? 1 : 0);
        for (var i = 0; i < arity; ++i)
            args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    result.mod = function (options) {
        var protocol = options.constructor;
        if (_.isFunction(protocol)) {
            var result = makeAsyncFunc(options);
        } else if (_.isObject(protocol)) {
            result = null;
        } else {
            throw new Error('mod(): Expected a constructor function or an object');
        }

        return result;
    };
    return result;
}
module.exports = async;
//# sourceMappingURL=asyncBase.js.map
