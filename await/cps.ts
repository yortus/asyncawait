import references = require('references');
var Fiber = require('fibers');
import oldBuilder = require('../src/awaitBuilder');
import Promise = require('bluebird');
export = builder;


var builder = oldBuilder.derive<AsyncAwait.Await.CPSBuilder>(
    () => (co, args) => {
        if (args.length !== 1 || args[0] !== void 0) return false;
        Fiber.current.resume = co.enter;
    }
);

builder.continuation = () => {
    var fiber = Fiber.current;
    return (err, result) => {
        var resume = fiber.resume;
        fiber.resume = null;
        fiber = null;
        resume(err, result);
    };
};


//TODO: putting stuff on the fiber object - better way??