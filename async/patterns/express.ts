import references = require('references');
import NodebackCoro = require('./nodeback');
export = ExpressCoro;


class ExpressCoro extends NodebackCoro {
    constructor() { super(); }

    return(result) {
        if (result === 'next') return super.return(null);
        if (result === 'route') return super.throw('route');
        if (!!result) return super.throw(new Error('unexpected return value: ' + result));
    }
}
