import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'cps',

    type: <AsyncAwait.Await.CPSBuilder> null,

    overrideHandlers: (base, options) => ({
        singular: (fi, arg) => {
            if (arg !== void 0) return pipeline.notHandled;

            if (fi.awaiting.length !== 1) {
                // TODO: mismatch here - raise an error
                fi.resume(null, new Error('222'));
            }

            fi.awaiting[0] = (err, res) => {
                fi.awaiting = [];
                fi.resume(err, res);
            }
            

        },
        variadic: (fi, args) => {
            if (args[0] !== void 0) return pipeline.notHandled;
        },

        elements: (values: any[], result: (err: Error, value?: any, index?: number) => void) => {

            // TODO: temp testing...
            var k = 0, fi = pipeline.currentFiber();
            values.forEach((value, i) => {
                if (i in values && values[i] === void 0) {
                    fi.awaiting[k++] = (err, res) => {
                        if (err) return result(err, null, i);
                        return result(null, res, i);    
                    };
                }
            });
            if (k !== fi.awaiting.length) {
                // TODO: mismatch here - raise an error
                result(new Error('111'));
            }
            return k;
        }
    })
});


//TODO: is pipeline the right place for this?
newBuilder.continuation = pipeline.continuation;
