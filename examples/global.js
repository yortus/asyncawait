require('../global');
var Promise = require('bluebird');

var sayAsync = async (function(word){
  await (Promise.delay(3000));
  console.info(word);
});

sayAsync('hello world');
