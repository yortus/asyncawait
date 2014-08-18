var config = require('./config');

var async;
var x = async(function (a) {
    return null;
});

//TODO: side effects!
console.log('MAIN!!!!!!!!!!!!!!!');

config.options({
    defaults: {
        async: 'promise'
    }
});

var mod = require('./mods/async.promise');
config.use(mod);
//# sourceMappingURL=main.js.map
