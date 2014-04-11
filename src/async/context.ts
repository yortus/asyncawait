import _refs = require('_refs');
import Promise = require('bluebird');
import AsyncOutput = require('./asyncOutput');
import Semaphore = require('./semaphore');
export = Context;


/** A class for encapsulating the single argument passed to the wrapper() function. */
class Context {
    constructor(output: AsyncOutput, wrapped: Function, thisArg, argsAsArray: any[], semaphore: Semaphore) {
        this.output = output;
        this.wrapped = wrapped;
        this.thisArg = thisArg;
        this.argsAsArray = argsAsArray;
        this.semaphore = semaphore;
    }

    output: AsyncOutput;
    wrapped: Function;
    thisArg: any;
    argsAsArray: any[];
    semaphore: Semaphore;

    value: Promise.Resolver<any>;
    done: Promise.Resolver<boolean>;
}
