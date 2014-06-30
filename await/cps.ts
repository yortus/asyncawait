import references = require('references');
var Fiber = require('../src/fibers');
import builder = require('../src/awaitBuilder');
export = api;


var cpsHandler = (expr, resume) => {
    if (expr !== void 0) return false;
    Fiber.current.resume = resume;
};


var api: any = builder.createAwaitBuilder(cpsHandler);
api.contd = () => {
    var fiber = Fiber.current;
    return (err, result) => {
        var resume = fiber.resume;
        fiber.resume = null;
        fiber = null;
        resume(err, result);
    };
};
