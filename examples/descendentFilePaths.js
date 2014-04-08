var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var _ = require('lodash');
var async = require('../async');
var await = require('../await');
var iterable = require('../iterable');
var yield_ = require('../yield');


var descendentFilePaths = iterable (function recurse(dir, recursive) {

    var files = await (fs.readdirSync(dir));
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = await (_.map(paths, function (path) { return fs.statAsync(path); }));

    _.each(stats, function(stat, i) {
        if (stat.isFile()) yield_ (paths[i]);
        else if (recursive) recurse(paths[i], true);
    });
});


var program = async (function(dir) {
    var paths = descendentFilePaths(dir, true);

    while (true) {
        var path = paths.next();
        if (await(path.done)) break;
        console.log(await(path.value));
    }

    return 'Finished!';
});


console.log('running...');
program(path.join(__dirname, '.'))
    .then(function (result) {
        console.log(result);
    })
    .catch(function(err) {
        console.log('----- rejected: -----');
        console.log(err);
    });
