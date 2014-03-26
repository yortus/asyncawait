var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var Buffer = require('buffer').Buffer;
var _ = require('lodash');
var async = require('../async');
var await = require('../await');


var largest = async (function (dir) {

    // Enumerate all files and subfolders in 'dir' to get their stats.
    var files = await (fs.readdirAsync(dir));
    var paths = _.map(files, function (file) { return path.join(dir, file); });
    var stats = await (_.map(paths, function (path) { return fs.statAsync(path); }));
    var sizes = _.map(stats, function (stat) { return stat.size; });

    // Find the largest file, recursing into subfolders.
    var best = undefined; // index into paths/sizes arrays of largest file considered so far.
    var searched = 0; // number of files/folders considered so far.
    var previews = []; // preview of the contents of the largest files considered so far.
    await (_.map(stats, async (function (stat, i) { // NB: use an async func here so _.map runs in parallel,
                                                    // but we get blocking semantics inside the func
        if (stat.isDirectory()) {
            var subdirLargest = await (largest(paths[i])); // recurse into subfolder and await result.
            if (subdirLargest) { // will return nothing if subdir was empty.
                paths[i] = subdirLargest.path;
                sizes[i] = subdirLargest.size;
                previews[i] = subdirLargest.preview;
            }
        }
        searched += (subdirLargest ? subdirLargest.searched : 1);
        if (best === undefined || sizes[i] > sizes[best]) best = i;
    })));

    // If there were no files, return undefined now.
    if (best === undefined) return undefined;

    // Get a preview of the file contents, if we don't already have one.
    if (previews[best] === undefined) {
        var fd = await (fs.openAsync(paths[best], 'r'));
        var buffer = new Buffer(40);
        var bytesRead = await (fs.readAsync(fd, buffer, 0, 40, 0));
        previews[best] = buffer.toString('utf-8', 0, bytesRead);
    }

    // Return the path, size, preview, and searched in a single result.
    return { path: paths[best], size: sizes[best], preview: previews[best], searched: searched };
});


function nodeified(dir, callback) { largest(dir).nodeify(callback); }
module.exports = nodeified;


//TODO: remove...
nodeified(path.join(__dirname, '../..'), function (err, result) {
    console.log(err || result);
});

//TODO: not working for ../..
