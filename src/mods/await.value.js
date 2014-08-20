
var mod = {
    name: 'await.value',
    base: null,
    // TODO: setImmediate correct/needed here?
    override: function (base, options) {
        return ({
            singular: function (fi, arg) {
                setImmediate(function () {
                    fi.resume(null, arg);
                });
            },
            variadic: function (fi, args) {
                setImmediate(function () {
                    fi.resume(null, args[0]);
                });
            },
            elements: function () {
                return 0;
            }
        });
    }
};
module.exports = mod;
//# sourceMappingURL=await.value.js.map
