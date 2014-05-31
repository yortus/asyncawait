var asyncCps = require('./cps');

var async = asyncCps.mod(function (base) {
    var baseCreate = base.create;
    return {
        create: function () {
            return function (callback) {
                baseCreate.call(base, callback || nullFunc);
            };
        }
    };
});

function nullFunc() {
}
module.exports = async;
//# sourceMappingURL=thunk.js.map
