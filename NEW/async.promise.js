var protocol = {
    type: 'async',
    name: 'promise',
    dependencies: [],
    definition: function () { return ({
        invoke: function (coro) {
            var resolver = coro.resolver = Promise.defer();
            coro.resume();
            return resolver.promise;
        },
        return: function (coro, value) {
            coro.resolver.resolve(value);
        },
        throw: function (coro, error) {
            coro.resolver.reject(error);
        }
    }); }
};
module.exports = protocol;
//# sourceMappingURL=async.promise.js.map