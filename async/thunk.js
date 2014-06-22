var oldBuilder = require('./cps');

var newBuilder = oldBuilder.mod({
    methods: function (options, cps) {
        return ({
            invoke: function (co) {
                return function (callback) {
                    return cps.invoke(co, callback || nullFunc);
                };
            }
        });
    }
});

function nullFunc() {
}
module.exports = newBuilder;
//# sourceMappingURL=thunk.js.map
