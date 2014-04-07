import _refs = require('_refs');
import Fiber = require('fibers');
import Promise = require('bluebird');
export = iterable;


// This is the iterable() API function (see docs).
var iterable = function(fn: Function) {

    //TODO:...
    return function () {

        // Capture initial arguments used to start the iterator
        var initArgs = new Array(arguments.length);
        for (var i = 0; i < initArgs.length; ++i) initArgs[i] = arguments[i];

        //TODO...
        return {
            next: function() {


            }
        };
    };
};
