var oldBuilder = require('./cps');

var newBuilder = oldBuilder.mod(function (options, cps) {
    return ({
        return: function (co, result) {
            if (result === 'next')
                return cps.return(co, null);
            if (result === 'route')
                return cps.throw(co, 'route');
            if (!!result)
                return cps.throw(co, new Error('unexpected return value: ' + result));
        }
    });
});
module.exports = newBuilder;
//# sourceMappingURL=express.js.map
