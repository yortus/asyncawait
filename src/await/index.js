var awaitBuilder = require('../awaitBuilder');
var promiseMod = require('../mods/await/promise');
var cpsMod = require('../mods/await/cps');
var thunkMod = require('../mods/await/thunk');

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
var promise = awaitBuilder.mod(promiseMod);
var cps = awaitBuilder.mod(cpsMod);
var thunk = awaitBuilder.mod(thunkMod);
var opts = { handlers: [promise.handlers, cps.handlers, thunk.handlers, value] };
var api = compound.mod({ defaults: opts });
module.exports = api;
//# sourceMappingURL=index.js.map
