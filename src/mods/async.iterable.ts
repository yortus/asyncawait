import references = require('references');
import ip = require('./async.iterable.promise');
export = mod;


// TODO: better way? configurable default?
var mod = {

    name: 'async.iterable',

    base: '',

    override: ip.override
};
