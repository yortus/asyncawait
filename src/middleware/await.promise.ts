import references = require('references');
import Promise = require('bluebird');
import _ = require('../util');
export = promise;


function promise(options) {
    return {

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
    };
}
