var _ = require('../util');
var async = require('../async');

//TODO:...
var promiseProtocol = async.getVariant('async.promise').protocol.members;

function override2(base, options) {
    return {
        begin: function (fi) {
            console.log('begin');
            var next = function () {
                //TODO: handle args generically... Don't assume no args
                return promiseProtocol.begin(fi);
            };
            var it = new AsyncIterator(next);
            return it;
        },
        suspend: function (fi, error, value) {
            console.log('suspend with ' + (error || value));
            if (error)
                throw error;
            var result = { done: false, value: value };
            promiseProtocol.end(fi, null, result);
            _.yieldCurrentFiber();
        },
        resume: function (fi, error, value) {
            console.log('resume with ' + (error || value));
            return base.resume(fi, error, value);
        },
        end: function (fi, error, value) {
            console.log('end with ' + (error || value));

            //TODO: handle errors...
            var result = { done: true };
            promiseProtocol.end(fi, null, result);
        }
    };
}

//function createNextFunc(fi: Fiber) {
//    var variant = 'promise'; //TODO: generalise this...
//    var next = async[variant] (() => {
//        var result = fi.resume(); // Will suspend until fi yields
//        return result;
//    });
//    return next;
//}
var mod = {
    name: 'async.iterable.promise',
    base: '',
    override: override2
};

//TODO: also support send(), throw(), close()...
//TODO: see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
//TODO: also for other iterable variants...
var AsyncIterator = (function () {
    function AsyncIterator(next) {
        this.next = next;
    }
    return AsyncIterator;
})();
module.exports = mod;
//# sourceMappingURL=async.iterable.promise.js.map
