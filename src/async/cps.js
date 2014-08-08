var assert = require('assert');
var oldBuilder = require('../asyncBuilder');
var _ = require('../util');


var newBuilder = oldBuilder.mod({
    name: 'cps',
    type: null,
    overrideProtocol: function (base, options) {
        return ({
            begin: function (fi, callback) {
                assert(_.isFunction(callback), 'Expected final argument to be a callback');
                fi.context = callback;
                fi.resume();
            },
            end: function (fi, error, value) {
                if (error)
                    fi.context(error);
                else
                    fi.context(null, value);
            }
        });
    }
});
module.exports = newBuilder;
//# sourceMappingURL=cps.js.map
