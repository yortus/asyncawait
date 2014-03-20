# node-async-await
async/await for node.js

# Example
```javascript
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');

var longCalculation = async (function(seconds, result) {
    await (Promise.delay(seconds * 1000));
    return result;
});

var program = async (function() {
    console.log('zero...');
    var msg = await (longCalculation(1, 'one...'));
    console.log(msg);
    msg = await (longCalculation(1, 'two...'));
    console.log(msg);
    msg = await (longCalculation(1, 'three...'));
    console.log(msg);
    msg = await (longCalculation(1, 'four...'));
    console.log(msg);
});

program().then(function() {
    console.log('Finished!');
});
```

