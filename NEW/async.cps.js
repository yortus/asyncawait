var protocol = {
    type: 'async',
    name: 'cps',
    dependencies: ['base'],
    definition: function (base) { return ({
        define: function (bodyFunc) {
            var result = base.define(bodyFunc);
            result.params.push('callback'); // TODO: check for duplicate name in array?
            return result;
        },
        invoke: function (coro) {
            coro.callback = coro.args.pop();
            coro.resume();
            return void 0;
        },
        return: function (coro, value) {
            coro.callback(null, value);
        },
        throw: function (coro, error) {
            coro.callback(error);
        }
    }); }
};
module.exports = protocol;
//# sourceMappingURL=async.cps.js.map