
/**
* This class is used to pass all required contextual information to the runInFiber()
* function as a single argument. runInFiber() can only accept a single argument because
* it is invoked via Fiber#run(), which can only pass through a single argument.
*/
var RunContext = (function () {
    function RunContext(options, wrapped, thisArg, argsAsArray, semaphore) {
        this.value = null;
        this.options = options;
        this.wrapped = wrapped;
        this.thisArg = thisArg;
        this.argsAsArray = argsAsArray;
        this.semaphore = semaphore;
    }
    return RunContext;
})();
module.exports = RunContext;
//# sourceMappingURL=runContext.js.map
