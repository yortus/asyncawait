import references = require('references');
import _ = require('../../util');
export = mod;


var mod = {

    name: 'thunk',

    type: <AsyncAwait.Await.ThunkBuilder> null,

    overrideHandlers: (base, options) => ({
        singular: (fi, arg) => {
            if (!_.isFunction(arg)) return _.notHandled;
            arg(fi.resume);
        },
        variadic: (fi, args) => {
            if (!_.isFunction(args[0])) return _.notHandled;
            args[0](fi.resume);
        },

        elements: (values: any[], result: (err: Error, value: any, index: number) => void) => {

            // TODO: temp testing...
            var k = 0;
            values.forEach((value, i) => {
                if (_.isFunction(value)) {
                    var callback = (err, res) => result(err, res, i);
                    value(callback);
                    ++k;
                }
            });
            return k;
        }
    })
};
