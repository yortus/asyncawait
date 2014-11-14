var _ = require('../util');

// A middleware object is any of the following:
// - a middleware function
// - a 'default options' hash
// - an array of middleware objects
function use(middleware) {
    if (_.isFunction(middleware))
        return useMiddlewareFunction(middleware);
    //TODO: more...
}

function useMiddlewareFunction(middleware) {
    // Get function name and parameter names
    var name = middleware.name;
    var paramNames = _.getParamNames(middleware);

    // Collect values to inject for each parameter.
    var args = paramNames.map(function (paramName) {
        switch (paramName) {
            case 'options':
                break;
            case 'base':
                break;
            default:
                break;
        }
    });
}
module.exports = use;
//# sourceMappingURL=use.js.map
