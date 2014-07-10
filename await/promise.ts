import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import Promise = require('bluebird');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Await.PromiseBuilder>(
    () => (co, args) => {
        if (args.length !== 1 || !args[0] || typeof args[0].then !== 'function') return false;
        args[0].then(val => co.enter(null, val), co.enter);
    }
);
