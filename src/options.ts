import references = require('references');
import _ = require('./util');


export function get() {
    return _options;
}


export function set(value: any) {
    _.mergeProps(_options, value);
}


export function clear() {
    _options = {};
}


// TODO: side-effect
clear();


// TODO: private impl
var _options;
