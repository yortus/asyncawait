import references = require('references');
import _ = require('./util');


//TODO: doc all...
export function get() {
    return _options;
}


export function set(value: any, preserveExisting?: boolean) {
    var under = preserveExisting ? value : _options;
    var over = preserveExisting ? _options : value;
    _options = _.mergePropsDeep({}, under, over);
    _listeners.forEach(cb => cb(_options));
}


export function onChange(callback) {
    _listeners.push(callback);
}


var _options: any = {};


var _listeners: Function[];
