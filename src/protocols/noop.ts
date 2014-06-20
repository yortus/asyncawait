import references = require('references');
import Protocol = AsyncAwait.Async.Protocol;
export = protocol;


var protocol: Protocol = {
    methods: () => ({
        invoke: (co) => { },
        return: (co, result) => { },
        throw: (co, error) => { },
        yield: (co, value) => { },
        finally: (co) => { }
    })
};
