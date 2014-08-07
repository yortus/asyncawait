import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import _ = require('../src/util');
export = newBuilder;


//TODO: but overrideHandler call needs (REALLY??? check) to happen *after* user has a chance to set options
//      with config(...). So, builders must call the override...() func lazily ie when first
//      async(...) or await(...) call is made.
var newBuilder = oldBuilder.mod({

    name: 'promise',

    type: <AsyncAwait.Await.PromiseBuilder> null,

    overrideHandlers: (base, options) => ({
        singular: (fi, arg) => {
            if (!_.isPromise(arg)) return _.notHandled;
            arg.then(val => fi.resume(null, val), fi.resume);
        },
        variadic: (fi, args) => {
            if (!_.isPromise(args[0])) return _.notHandled;
            args[0].then(val => fi.resume(null, val), fi.resume);
        },

        elements: (values: any[], result: (err: Error, value: any, index: number) => void) => {

            // TODO: temp testing...
            var k = 0;
            values.forEach((value, i) => {
                if (_.isPromise(value)) {
                    value.then(val => result(null, val, i), err => result(err, null, i));
                    ++k;
                }
            });
            return k;
        }
    })
});
