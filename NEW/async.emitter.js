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
            coro.stream.emit('end', value);
        },
        throw: function (coro, error) {
            coro.stream.emit('error', error);
            //TODO: and then emit 'end' event, or resume coro?
        },
        yield: function (coro, value) {
            coro.stream.emit('data', value);
            //TODO: do we pause here until some stream event?
        }
    }); }
};
module.exports = protocol;
//# sourceMappingURL=async.emitter.js.map