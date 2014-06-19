var _ = require('lodash');


function makeNullProtocol() {
    return {
        invoke: function (co) {
        },
        return: function (co, result) {
        },
        throw: function (co, error) {
        },
        yield: function (co, value) {
        },
        finally: function (co) {
        }
    };
}

function createAsyncBuilder(protocol_) {
    var protocol = _.assign(makeNullProtocol(), protocol_);
    var protocolArgCount = protocol.invoke.length - 1;

    var builder = function asyncBuilder(bodyFunc) {
        if (arguments.length !== 1)
            throw new Error('async builder: expected a single argument');
        if (!_.isFunction(bodyFunc))
            throw new Error('async builder: expected argument to be a function');

        function suspendable($ARGS) {
            var _this = this;
            var co = { protocol: protocol };

            var argCount = arguments.length, suspendableArgCount = argCount - protocolArgCount;
            var sArgs = new Array(suspendableArgCount), pArgs = new Array(protocolArgCount + 1);
            pArgs[0] = co;
            for (var i = 0; i < suspendableArgCount; ++i)
                sArgs[i] = arguments[i];
            for (var i = 0; i < protocolArgCount; ++i)
                pArgs[i + 1] = arguments[i + suspendableArgCount];

            co.body = function () {
                return bodyFunc.apply(_this, sArgs);
            };
            return protocol.invoke.apply(null, pArgs);
        }

        var result, args = [], arity = bodyFunc.length + protocolArgCount;
        for (var i = 0; i < arity; ++i)
            args.push('a' + i);
        var funcDefn, funcCode = eval('funcDefn = ' + suspendable.toString().replace('$ARGS', args.join(', ')));
        return funcDefn;
    };

    builder.mod = function mod(protocol_) {
        if (!protocol)
            return _.assign({}, protocol);

        return createAsyncBuilder(protocol_);
    };

    return builder;
}
module.exports = createAsyncBuilder;
//# sourceMappingURL=createAsyncBuilder.js.map
