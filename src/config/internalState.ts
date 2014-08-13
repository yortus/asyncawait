import references = require('references');
import Protocol = require('../protocol');
import _ = require('../util');
import Mod = AsyncAwait.Mod;
//export = protocol;


//var protocol = new Protocol(<any> {}, _.empty);

/** Holds the global options hash. */
export var options: any = {};


/** Holds the list of registered mods, in order of registration. */
export var mods: Mod[] = [];
