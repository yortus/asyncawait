var protocol = {
    type: 'await',
    name: 'promise',
    autoSelect: function (expr) { return arguments.length === 1 && isThenable(expr); },
    dependencies: [],
    definition: function () { return ({
        resolve: function (callback, expr) {
            //TODO: assume suspended?
            expr.then(function (value) { return callback(null, value); }, function (error) { return callback(error); });
        }
    }); }
};
function isThenable(value) {
    throw new Error('not implemented');
}
module.exports = protocol;
//# sourceMappingURL=await.promise.js.map