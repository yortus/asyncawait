import references = require('references');
import await = require('../await');
import _ = require('../util');
export = mod;


var mod = {

    name: 'await.value',

    base: 'await.',

    // TODO: setImmediate correct/needed here?
    override: (base, options) => ({
        singular: (fi, arg) => { setImmediate(() => { fi.resume(null, arg); }); },
        variadic: (fi, args) => { setImmediate(() => { fi.resume(null, args[0]); }); },
        elements: () => 0
    })
};
