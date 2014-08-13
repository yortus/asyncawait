
//TODO: how to indicate that this must mod async.cps??
var mod = {
    name: 'express',
    //TODO: add checking in extensibility.ts or somehow for this:
    base: 'cps',
    type: null,
    override: function (cps, options) {
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
};
module.exports = mod;
//# sourceMappingURL=express.js.map
