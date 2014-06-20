var cpsProtocol = require('./cps');


var protocol = {
    methods: function (options, fallback) {
        var methods = cpsProtocol.methods(options, fallback);
        var cpsReturn = methods.return, cpsThrow = methods.throw;
        methods.return = function (co, result) {
            if (result === 'next')
                return cpsReturn(co, null);
            if (result === 'route')
                return cpsThrow(co, 'route');
            if (!!result)
                return cpsThrow(co, new Error('unexpected return value: ' + result));
        };
        return methods;
    }
};
module.exports = protocol;
//# sourceMappingURL=express.js.map
