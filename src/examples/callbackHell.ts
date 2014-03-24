import _refs = require('_refs');
import fs = require('fs')
var async = require('async')
var path = require('path')
declare var await: any;
declare var readdir: any;
declare var stat: any;
declare var _;

// ================================================================================
// From http://strongloop.com/strongblog/node-js-callback-hell-promises-generators/

// Let’s say we want to write a module that finds the largest file within a directory.

// var findLargest = require('./findLargest')
// findLargest('./path/to/dir', function (er, filename) {
//   if (er) return console.error(er)
//   console.log('largest file was:', filename)
// })

// Let’s break down the steps to accomplish this:
// 1. Read the files in the provided directory
// 2. Get the stats on each file in the directory
// 3. Determine which is largest (pick one if multiple have the same size)
// 4. Callback with the name of the largest file

// If an error occurs at any point, callback with that error instead. We also should never call the callback more than once. 
// ================================================================================





export function withCallbacks(dir, cb) {
  async.waterfall([
    function (next) {
      fs.readdir(dir, next)
    },
    function (files, next) {
      var paths = 
       files.map(function (file) { return path.join(dir,file) })
      async.map(paths, fs.stat, function (er, stats) {
        next(er, files, stats)
      })
    },
    function (files, stats, next) {
      var largest = stats
        .filter(function (stat) { return stat.isFile() })
        .reduce(function (prev, next) {
        if (prev.size > next.size) return prev
          return next
        })
        next(null, files[stats.indexOf(largest)])
    }
  ], cb)
}


export function withAsyncAwait(dir, cb) {

    var files = await (readdir(dir));
    var stats = await (_.map(files, file => stat(path.join(dir, file))));

    var largest = _(stats)
        .filter(stat => stat.isFile())
        .reduce((prev, next) => {
            if (prev.size > next.size) return prev;
            return next
        });

    return files[stats.indexOf(largest)];
}
