var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var _ = require('lodash');
var async = require('../..').async;
var await = require('../..').await;


// Return the number of files in the given directory
var countFiles = async (function (dir) {
    var files = await (fs.readdirSync(dir));
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = await (_.map(paths, function (path) { return fs.statAsync(path); }));
    return _.filter(stats, function (stat) { return stat.isFile(); }).length;
});


function nodeified(dir, callback) { countFiles(dir).nodeify(callback); }
module.exports = nodeified;
