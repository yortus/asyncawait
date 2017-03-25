var asyncawait = require('./');

for(var func in asyncawait){
  global[func] = asyncawait[func];
}
