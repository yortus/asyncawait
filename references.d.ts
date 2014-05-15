///<reference path="./typings/asyncawait/asyncawait.d.ts" />
///<reference path="./typings/bluebird/bluebird.d.ts" />
///<reference path="./typings/chai/chai.d.ts" />
///<reference path="./typings/lodash/lodash.d.ts" />
///<reference path="./typings/mocha/mocha.d.ts" />
///<reference path="./typings/node/node.d.ts" />
///<reference path="./typings/node-fibers/node-fibers.d.ts" />
declare module "references" { }


/** Extended Fiber interface. */
interface Fiber {

    //TODO: temp testing...
    yield(value?: any): any;
    //idiom: AsyncAwait.Idiom;

    //TODO: was.. remove now...
    ///** The RunContext associated with this fiber. */
    //runContext: AsyncAwait.RunContextBase;//TODO: testing, was... RunContext

    ///**
    // * Executes the wrapped function specified in the RunContext instance. The final
    // * return/throw value of the wrapped function is used to notify the promise resolver
    // * and/or callback specified in the RunContext.
    // */
    //start(): any;
}


/** V8 supports Function.name. */ 
interface Function {
    name: string;
}
