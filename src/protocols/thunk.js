var cpsProtocol = require('./cps');


var protocol = {
    methods: function (options, fallback) {
        var methods = cpsProtocol.methods(options, fallback);
        var cpsInvoke = methods.invoke;
        methods.invoke = function (co) {
            return function (callback) {
                return cpsInvoke(co, callback || nullFunc);
            };
        };
        return methods;
    }
};

function nullFunc() {
}
module.exports = protocol;
//# sourceMappingURL=thunk.js.map
