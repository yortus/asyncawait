//import references = require('references');
//import asyncBase = require('./impl/asyncBase');
//import ThunkProtocol = require('./impl/protocols/thunk');
//export = async;


//var async = asyncBase.mod({ constructor: ThunkProtocol });



import references = require('references');
import asyncCps = require('./cps');
export = async;


var async: AsyncAwait.AsyncThunk = <any> asyncCps.mod(base => {
    var baseCreate = base.create;
    return {
        create: () => {
            return (callback?: (err, result) => void) => {
                //base.create();
                baseCreate.call(base, callback || nullFunc);
            };
        }
    }
});


function nullFunc() {}
