var oldBuilder = require('./cps');

var newBuilder = oldBuilder.mod({
    name: 'express',
    type: null,
    overrideProtocol: function (cps, options) {
        return ({
            end: function (fi, error, value) {
                if (error)
                    return cps.end(fi, error);
                if (value === 'next')
                    return cps.end(fi);
                if (value === 'route')
                    return cps.end(fi, 'route');
                if (!!value)
                    return cps.end(fi, new Error('unexpected return value: ' + value));
            }
        });
    }
});
module.exports = newBuilder;
//# sourceMappingURL=express.js.map
