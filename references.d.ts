/*----------findts----------*/
/* NB: This section is generated and maintained by grunt-findts. */
/* NB: Any manual changes here will be overwritten whenever grunt-findts runs. */
///<reference path="typings/node/node.d.ts" />
///<reference path="typings/bluebird/bluebird.d.ts" />
///<reference path="typings/mocha/mocha.d.ts" />
///<reference path="typings/chai/chai.d.ts" />
/*----------/findts----------*/

﻿
///<reference path="./typings/asyncawait/asyncawait.d.ts" />
///<reference path="./typings/node-fibers/node-fibers.d.ts" />


declare module "references" { }


// TODO: re-open...
interface Fiber {
    id: number;//TODO: doc: useful for debugging/assertions
    bodyFunc: Function;
    bodyThis: any;
    bodyArgs: any[];
    awaiting: AsyncAwait.Callback<any>[];

    //TODO: ...
    suspend: (error?: Error, value?: any) => void;
    resume: (error?: Error, value?: any) => void;
    context: any;
}


/** V8 supports Function.name. */ 
interface Function {
    name: string;
}
