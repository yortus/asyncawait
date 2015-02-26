var protocol = {
    type: 'await',
    name: 'array',
    autoSelect: function (expr) { return arguments.length === 1 && Array.isArray(expr); },
    dependencies: ['auto'],
    definition: function (auto) { return ({
        resolve: function (callback, expr) {
            // Special case: empty array.
            var len = expr.length;
            if (len === 0)
                return callback(null, []);
            // TODO: Non-empty array...
            var result = new Array(len), completed = 0, failed = false;
            for (var i = 0; i < len; ++i) {
                auto.resolve(makeCallback(i), expr[i]);
            }
            function makeCallback(index) {
                return function (error, value) {
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
    }); }
};
module.exports = protocol;
//# sourceMappingURL=await.array.js.map