var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var async = require('async');


/** Returns the number of files in the given directory. */
var countFiles = function (dir, callback) {
    async.waterfall([
        function (callback) {

            // Get all directory entries.
            fs.readdir(dir, callback);
        },
        function (files, callback) {

            // Get all file stats in parallel.
            var paths = _.map(files, function (file) { return path.join(dir, file); });
            async.parallel(_.map(paths, function (path) { return fs.stat.bind(fs, path); }), callback);
        },
        function (stats, callback) {

            // Count the files.
            var result = _.filter(stats, function (stat) { return stat.isFile(); }).length;
            callback(null, result);
        }
    ], callback);
}


module.exports = countFiles;
