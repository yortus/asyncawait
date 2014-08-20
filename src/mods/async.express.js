
var mod = {
    name: 'async.express',
    base: 'async.cps',
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
//# sourceMappingURL=async.express.js.map
