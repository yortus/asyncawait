import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
export = builder;


var builder = oldBuilder.mod<AsyncAwait.Await.ThunkBuilder>(
    () => (args, resume) => {
        if (args.length !== 1 || typeof args[0] !== 'function') return false;
        args[0](resume);
    }
);
