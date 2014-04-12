
//TODO: rename to RunContext
/** A class for encapsulating the single argument passed to the wrapper() function. */
var Context = (function () {
    function Context(output, wrapped, thisArg, argsAsArray, semaphore) {
        this.output = output;
        this.wrapped = wrapped;
        this.thisArg = thisArg;
        this.argsAsArray = argsAsArray;
        this.semaphore = semaphore;
    }
    return Context;
})();
module.exports = Context;
//# sourceMappingURL=context.js.map
