var _ = require('lodash');
var Protocol = require('./protocols/base');

var async = makeAsyncFunc(Protocol);

function makeAsyncFunc(protocolClass) {
    var result = function async(suspendableDefn) {
        if (arguments.length !== 1)
            throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn))
            throw new Error('async(): expected argument to be a function');

        function asyncRunner($ARGS) {
            var nargs = arguments.length, args = new Array(nargs);
            for (var i = 0; i < nargs; ++i)
                args[i] = arguments[i];

            var protocol = new protocolClass();
            return protocol.invoke(suspendableDefn, this, args);
        }

        var result, args = [], arity = suspendableDefn.length + (protocolClass.acceptsCallback ? 1 : 0);
        for (var i = 0; i < arity; ++i)
            args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + asyncRunner.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    result.protocol = protocolClass;
    result.mod = function (options) {
        var protocol = options.protocol;
        if (_.isFunction(protocol)) {
            var result = makeAsyncFunc(protocol);
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
