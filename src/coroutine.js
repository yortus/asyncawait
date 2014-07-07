var system = require('./system');


//TODO: ...
function create(protocol, body) {
    return system.acquireCoro(protocol, body, null, []);
}
module.exports = create;
//# sourceMappingURL=coroutine.js.map
