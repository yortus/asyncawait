import api = require('./api');
import Coroutine = require('./coroutine');
export = protocol;


var protocol = <api.AwaitProtocol> <any> {

    type: 'await',

    name: 'array',

    autoSelect: (expr: any) => arguments.length === 1 && Array.isArray(expr),

    dependencies: ['auto'],

    definition: (auto: api.AwaitProtocolDefinition) => ({

        resolve: (callback: Function, expr: any[]) => {

            // Special case: empty array.
            var len = expr.length;
            if (len === 0) return callback(null, []);

            // TODO: Non-empty array...
            var result = new Array(len), completed = 0, failed = false;
            for (var i = 0; i < len; ++i) {
                auto.resolve(makeCallback(i), expr[i]);
            }

            function makeCallback(index: number) {
                return (error, value) => {
                    if (failed) {
                        return;
                    }

                    if (error) {
                        failed = true;
                        return callback(error);
                    }

                    result[index] = value;
                    if (++completed === len) {
                        callback(null, result);
                    }
                };
            }
        }
    })
};
