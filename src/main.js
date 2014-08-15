var config = require('./config');

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
