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
    yield(value?: any): any;
}


/** V8 supports Function.name. */ 
interface Function {
    name: string;
}


/** V8 supports Object.setProtoyypeOf. */ 
interface Object {
    setPrototypeOf(obj, prototype): void;
}
