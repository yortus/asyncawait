///<reference path="./typings/asyncawait.d.ts" />
///<reference path="./typings/bluebird.d.ts" />
///<reference path="./typings/lodash.d.ts" />
///<reference path="./typings/node.d.ts" />
///<reference path="./typings/node-fibers.d.ts" />
declare module "_refs" { }


/** Extended Fiber interface. */
interface Fiber {

    //TODO: temp testing...
    yield(value?: any): any;
    //idiom: AsyncAwait.Idiom;

    /** The RunContext associated with this fiber. */
    runContext: AsyncAwait.RunContextBase;//TODO: testing, was... RunContext

    /**
     * Executes the wrapped function specified in the RunContext instance. The final
     * return/throw value of the wrapped function is used to notify the promise resolver
     * and/or callback specified in the RunContext.
     */
    start(): any;
}


/** V8 supports Function.name. */ 
interface Function {
    name: string;
}
