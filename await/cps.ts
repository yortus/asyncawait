import references = require('references');
import oldBuilder = require('../src/awaitBuilder');
import pipeline = require('../src/pipeline');
export = newBuilder;


var newBuilder = oldBuilder.mod({

    name: 'cps',

    type: <AsyncAwait.Await.CPSBuilder> null,

    overrideHandlers: (base, options) => ({
        singular: (co, arg) => {
            if (arg !== void 0) return pipeline.notHandled;

            if (co.awaiting.length !== 1) {
                // TODO: mismatch here - raise an error
                co.resume(null, new Error('222'));
            }

            co.awaiting[0] = (err, res) => {
                co.awaiting = [];
                co.resume(err, res);
            }
            

        },
        variadic: (co, args) => {
            if (args[0] !== void 0) return pipeline.notHandled;
        },

        elements: (values: any[], result: (err: Error, value?: any, index?: number) => void) => {

            // TODO: temp testing...
            var k = 0, co = pipeline.currentCoro();
            values.forEach((value, i) => {
                if (i in values && values[i] === void 0) {
                    co.awaiting[k++] = (err, res) => {
                        if (err) return result(err, null, i);
                        return result(null, res, i);    
                    };
                }
            });
            if (k !== co.awaiting.length) {
                // TODO: mismatch here - raise an error
                result(new Error('111'));
            }
            return k;
        }
    })
});


//TODO: is pipeline the right place for this?
newBuilder.continuation = pipeline.continuation;
