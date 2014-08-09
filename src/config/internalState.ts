import references = require('references');
import Mod = AsyncAwait.Mod;


/** Holds the global options hash. */
export var options: any = {};


/** Holds the list of registered mods, in order of registration. */
export var mods: Mod[] = [];
