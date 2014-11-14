import references = require('references');
import _ = require('../util');
export = use;



// A middleware object is any of the following:
// - a middleware function
// - a 'default options' hash
// - an array of middleware objects

function use(middleware: any) {

    if (_.isFunction(middleware)) return useMiddlewareFunction(middleware);
    //TODO: more...
}


function useMiddlewareFunction(middleware: Function) {

    // Get function name and parameter names
    var name = middleware.name;
    var paramNames = _.getParamNames(middleware);

    // Collect values to inject for each parameter.
    var args = paramNames.map(paramName => {
        switch (paramName) {
            case 'options': break; //TODO:...
            case 'base': break; //TODO:...
            default: break; //TODO:...
        }
    });
}
