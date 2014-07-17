import references = require('references');
import Fiber = require('fibers');
import oldBuilder = require('../src/awaitBuilder');
import Promise = require('bluebird');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Await.CPSBuilder>(
    () => (co, args) => {
        if (args.length !== 1 || args[0] !== void 0) return false;
    }
);

builder.continuation = () => {
    var fiber = Fiber.current;
    return (err, result) => {
        fiber.enter(err, result);
        fiber = null;
    };
};
