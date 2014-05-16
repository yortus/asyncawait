var semaphore = require('./semaphore');

function config(value) {
    if (value) {
        if (value.maxConcurrency)
            semaphore.size(value.maxConcurrency);
    }

    return { maxConcurrency: semaphore.size() };
}
module.exports = config;
//# sourceMappingURL=config.js.map
