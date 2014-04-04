var fs = require('fs');
var path = require('path');
var _ = require('lodash');


// Return the number of files in the given directory
var countFiles = function (dir) {
    var files = fs.readdirSync(dir);
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = _.map(paths, function (path) { return fs.statSync(path); });
    return _.filter(stats, function (stat) { return stat.isFile(); }).length;
};


function nodeified(dir, callback) {
    try {
        callback(null, countFiles(dir));
    }
    catch (err) {
        callback(err);
    }
}
module.exports = nodeified;
