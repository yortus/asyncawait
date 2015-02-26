var protocol = {
    type: 'async',
    name: 'thunk',
    dependencies: ['cps'],
    definition: function (cps) { return ({
        invoke: function (coro) {
            return function (callback) {
                coro.args.push(callback);
                return cps.invoke(coro);
            };
        },
        return: cps.return,
        throw: cps.throw
    }); }
};
module.exports = protocol;
//# sourceMappingURL=async.thunk.js.map