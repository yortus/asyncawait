var startup = require('../src/startup');

//TODO: temp... require('../src/extensibility').config({ handlers: [ promise.handler, cps.handler, thunk.handler, general, value ]});
var promisesMod = require('../src/mods/promises');
var cps = require('./cps');
var thunk = require('./thunk');

//TODO: testing...
startup.go();

//TODO: temp testing...
var compound = require('./compound');
var value = {
    singular: function (fi, arg) {
        setImmediate(function () {
            fi.resume(null, arg);
        });
    },
    variadic: function (fi, args) {
        setImmediate(function () {
            fi.resume(null, args[0]);
        });
    },
    elements: function () {
        return 0;
    }
};

//TODO: temp testing...
var promise = promisesMod.createAwaitBuilder();
var opts = { handlers: [promise.handlers, cps.handlers, thunk.handlers, value] };
var api = compound.mod({ defaultOptions: opts });
api.cps = cps;
api.thunk = thunk;
module.exports = api;
//# sourceMappingURL=index.js.map
