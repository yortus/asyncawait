import references = require('references');
export = mod;


var mod = {

    name: 'async.express',

    base: 'async.cps',

    override: (cps, options) => ({
        end: (fi, error?, value?) => {
            if (error) return cps.end(fi, error);
            if (value === 'next') return cps.end(fi);
            if (value === 'route') return cps.end(fi, <any> 'route');
            if (!!value) return cps.end(fi, new Error('unexpected return value: ' + value));
        }
    })
};
