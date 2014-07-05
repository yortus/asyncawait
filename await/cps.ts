import references = require('references');
var Fiber = require('../src/fibers');
import oldBuilder = require('../src/awaitBuilder');
import Promise = require('bluebird');
export = builder;


var builder = oldBuilder.mod<AsyncAwait.Await.CPSBuilder>(
    () => (co, args) => {
        if (args.length !== 1 || args[0] !== void 0) return false;
        Fiber.current.resume = co.enter;
    }
);


//TODO: define the '__' property as an accessor that creates and returns a callback function.
Object.defineProperty(builder, '__', {
    get: () => {
        var fiber = Fiber.current;
        return (err, result) => {
            var resume = fiber.resume;
            fiber.resume = null;
            fiber = null;
            resume(err, result);
        };
    }
});


//TODO: putting stuff on the fiber object - better way??