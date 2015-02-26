import api = require('./api');
import Coroutine = require('./coroutine');
export = protocol;


var protocol = <api.AwaitProtocol> <any> {

    type: 'await',

    name: 'promise',

    autoSelect: (expr: any) => arguments.length === 1 && isThenable(expr),

    dependencies: [],

    definition: () => ({

        resolve: (callback: Function, expr: Promise.Thenable<any>) => {
            //TODO: assume suspended?
            expr.then(value => callback(null, value), error => callback(error));
        }
    })
};


function isThenable(value: any): boolean {
    throw new Error('not implemented');// TODO: ...    
}
