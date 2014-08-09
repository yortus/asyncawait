var extensibility = require('./extensibility');
var asyncBuilder = require('./asyncBuilder');
var promiseMod = require('./mods/async/promise');

//TODO: need a more general/better way to indicate this... See also /src/async/index.ts
extensibility.options().defaults.async = asyncBuilder.mod(promiseMod);

//TODO: testing...
extensibility.useDefaults();
//# sourceMappingURL=startup.js.map
