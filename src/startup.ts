import references = require('references');
import extensibility = require('./extensibility');
import asyncBuilder = require('./asyncBuilder');
import promiseMod = require('./mods/async/promise');


//TODO: need a more general/better way to indicate this... See also /src/async/index.ts
extensibility.options().defaults.async = asyncBuilder.mod(promiseMod);


//TODO: testing...
extensibility.useDefaults();
