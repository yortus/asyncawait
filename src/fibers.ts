import _refs = require('_refs');
import Fiber = require('fibers');
export = result;


// HOTFIX.
// in testing, more explanations to come...
if (!global.asyncawait) global.asyncawait = {};
if (!global.asyncawait.Fiber) global.asyncawait.Fiber = Fiber;
var result: typeof Fiber = global.asyncawait.Fiber;
