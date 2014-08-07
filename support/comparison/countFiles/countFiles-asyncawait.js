var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var async = require('../../..').async;
var await = require('../../..').await;
async.config({ cpsKeyword: '___', fibersHotfix169: true });


/** Returns the number of files in the given directory. */
var countFiles = async.cps (function (dir) {
    var files = await (fs.readdir(dir, ___));

    // Get all file stats in parallel.
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = await (_.map(paths, function (path) { return fs.stat(path, ___); }));

    // Count the files.
    return _.filter(stats, function (stat) { return stat.isFile(); }).length;
});


module.exports = countFiles;
