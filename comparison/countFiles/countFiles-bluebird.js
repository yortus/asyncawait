var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');


/** Returns the number of files in the given directory. */
module.exports = function countFiles(dir, cb) {
    return Promise.try(() => {
        return fs.readdirAsync(dir);
    }).map((file) => {
        return path.join(dir, file);
    }).map((file) => {
        return fs.statAsync(file);
    }).filter((stat) => {
        return stat.isFile();
    }).then((stats) => {
        return stats.length;
    }).nodeify(cb);
}
