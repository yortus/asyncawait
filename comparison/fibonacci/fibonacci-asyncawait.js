var async = require('../../async');
var await = require('../../await');


// WARNING: BAD CODE!! THIS IMPL IS HUGELY INEFFICIENT. It's purpose is purely
// to exercise recursive behaviour for testing and evaluation purposes.
var fibonacci = async (function (n) {
    if (n <= 1) return 1;

// NB: Both options slow down over subsequent benchmark runs (same behaviour):

//OPTION 1: PARALLEL
//    var operands = await ([fibonacci(n - 1), fibonacci(n - 2)]);

//OPTION 2: SEQUENTIAL
    var operands = [0,0];
    operands[0] = await (fibonacci(n - 1));
    operands[1] = await (fibonacci(n - 2));
    return operands[0] + operands[1];
});


function nodeified(n, callback) { fibonacci(n).nodeify(callback); }
module.exports = nodeified;
