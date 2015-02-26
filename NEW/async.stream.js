var protocol = {
    type: 'async',
    name: 'emitter',
    dependencies: [],
    definition: function () { return ({
        invoke: function (coro) {
            var stream = coro.stream = new stream; //TODO: construct in object mode
            coro.resume();
            return stream;
        },
        return: function (coro, value) {
            coro.stream.end();
        },
        throw: function (coro, error) {
            coro.stream.emit('error', error);
            //TODO: and then emit 'end' event, or resume coro?
        },
        yield: function (coro, value) {
            coro.stream.emit('data', value);
        }
    }); }
};
module.exports = protocol;
//# sourceMappingURL=async.stream.js.map