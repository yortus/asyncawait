var semaphore = require('./semaphore');

/** Get or set global configuration values for async(...). */
function config(value) {
    // Update config using the specified value(s).
    if (value) {
        if (value.maxConcurrency)
            semaphore.size(value.maxConcurrency);
    }

    // Create and return a Config object.
    return { maxConcurrency: semaphore.size() };
}
module.exports = config;
//# sourceMappingURL=asyncConfig.js.map
