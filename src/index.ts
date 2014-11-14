
import main = require('./main');

import async = require('./async/api');
import await = require('./await/api');
import yield_ = require('./yield/api');

import use = require('./setup/use');
import options = require('./setup/options');


var _ = {
    async: async,
    await: await,
    yield: yield_,
    use: use,
    options: options
};

export = options;
