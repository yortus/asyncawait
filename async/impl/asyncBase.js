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
    var acceptsCallback = newProtocol().options().acceptsCallback;

    var result = function async(suspendableDefn) {
        if (arguments.length !== 1)
            throw new Error('async(): expected a single argument');
        if (!_.isFunction(suspendableDefn))
            throw new Error('async(): expected argument to be a function');

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

    result.mod = function (options_) {
        var opts = _.assign({}, options_);
        opts.constructor = opts.constructor || protocolClass;

        return makeAsyncFunc(opts);
    };
    return result;
}
module.exports = async;
//# sourceMappingURL=asyncBase.js.map
