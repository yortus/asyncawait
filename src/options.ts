import references = require('references');
import _ = require('./util');
export = options;


// TODO:...
var options: {
    (value?: any): any;
    defaults: any;
    clear(): void;
} = <any> function(value) {

    //TODO: as getter...
    if (arguments.length === 0) return _options;

    //TODO: as setter...
    _.mergeProps(_options, value);
    // 1. merge
    // 2. reload all joint/async/await mods
}




//TODO: expose this as non-enum 'private' property on _options...
options.clear = () => {
    _options = {};
}


// TODO: side-effect
options.clear();


// TODO: private impl
var _options;
