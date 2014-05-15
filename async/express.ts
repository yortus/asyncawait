import references = require('references');
import CPSPRotocol = require('./cps');
export = ExpressProtocol;


class ExpressProtocol extends CPSPRotocol {
    constructor() { super(); }

    return(result) {
        if (result === 'next') return super.return(null);
        if (result === 'route') return super.throw('route');
        if (!!result) return super.throw(new Error('unexpected return value: ' + result));
    }
}
