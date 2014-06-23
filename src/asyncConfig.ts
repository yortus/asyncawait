import references = require('references');
import semaphore = require('./semaphore');
export = config;


/** Get or set global configuration values for async(...). */
function config(value?: AsyncAwait.Async.Config): AsyncAwait.Async.Config {

    // Update config using the specified value(s).
    if (value) {
        if (value.maxConcurrency) semaphore.size(value.maxConcurrency);
    }

    // Create and return a Config object.
    return { maxConcurrency: semaphore.size() };
}
