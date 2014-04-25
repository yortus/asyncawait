///<reference path="./typings/asyncawait.d.ts" />
///<reference path="./typings/bluebird.d.ts" />
///<reference path="./typings/lodash.d.ts" />
///<reference path="./typings/node.d.ts" />
///<reference path="./typings/node-fibers.d.ts" />
declare module "_refs" { }


/** Extended Fiber interface. */
interface Fiber {

    /** The RunContext associated with this fiber. */
    runContext: AsyncAwait.RunContext;

    /**
     * Executes the wrapped function specified in the RunContext instance. The final
     * return/throw value of the wrapped function is used to notify the promise resolver
     * and/or callback specified in the RunContext.
     */
    start(): any;
}
