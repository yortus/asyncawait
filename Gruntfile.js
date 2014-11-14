module.exports = function(grunt) {


    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            main: {
                src: [
                    'src/**/*.js', 'test/**/*.js',
                    'src/**/*.js.map', 'test/**/*.js.map'
                ]
            }
        },

        typescript: {
            main: {
                src: [
                    'src/**/*.ts',
                    'test/**/*.ts'
                ],
                //src: [
                    //'src/mods/async.iterable.cps.ts',
                    //'src/mods/async.iterable.promise.ts',
                    //'src/mods/async.iterable.thunk.ts',
                    //'src/mods/async.iterable.ts',
                    //'src/mods/await.compound.ts',
                    //'src/mods/await.value.ts',
                    //'src/mods/baseline.ts',
                    //'src/mods/callbacks.ts',
                    //'src/mods/express.ts',
                    //'src/mods/fiberPool.ts',
                    //'src/mods/promises.ts',
                    //'src/mods/streams.ts',
                    //'src/mods/thunks.ts',
                    //'src/async.ts',
                    //'src/await.ts',
                    //'src/createSuspendableFunction.ts',
                    //'src/fiberProtocol.ts',
                    //'src/main.ts',
                    //'src/options.ts',
                    //'src/protocol.ts',
                    //'src/util.ts',
                    //'src/yield.ts',
                    //'test/async.cps.ts',
                    //'test/async.express.ts',
                    //'test/async.iterable.cps.ts',
                    //'test/async.iterable.promise.ts',
                    //'test/async.iterable.thunk.ts',
                    //'test/async.iterable.ts',
                    //'test/async.mod.ts',
                    //'test/async.promise.ts',
                    //'test/async.stream.ts',
                    //'test/async.thunk.ts',
                    //'test/async.ts',
                    //'test/await.cps.ts',
                    //'test/await.promise.ts',
                    //'test/await.thunk.ts',
                    //'test/await.ts',
                    //'test/config.cpsKeyword.ts',
                    //'test/config.fiberPool.ts',
                    //'test/config.fibersHotfix169.ts',
                    //'test/config.maxSlots.ts',
                    //'test/config.mod.ts',
                    //'test/config.ts',
                    //'test/protocol.ts'
                //],
                dest: '.',
                options: {
                    target: 'es5',
                    module: 'commonjs',
                    sourceMap: true,
                    declaration: false,
                    comments: true
                }
            }
        },

        copy: {
            main: {
                expand: true,
                src: ['src/**/*.js', 'async.js', 'await.js', 'config.js', 'yield.js', 'index.js'],
                dest: 'node_modules/asyncawait'
            }
        },

        mochaTest: {
            main: {
                options: { reporter: 'list' },
                src: ['test/**/*.js']
                //src: [
                //    //'test/async.cps.js',
                //    //'test/async.express.js',
                //    //'test/async.iterable.cps.js',
                //    //'test/async.iterable.promise.js',
                //    //'test/async.iterable.thunk.js',
                //    //'test/async.iterable.js',
                //    //'test/async.mod.js',
                //    //'test/async.promise.js',
                //    //'test/async.stream.js',
                //    //'test/async.thunk.js',
                //    //'test/async.js',
                //    //TODO: add(create) await.compound, await.value test files
                //    //'test/await.cps.js',
                //    //'test/await.promise.js',
                //    //'test/await.thunk.js',
                //    //'test/await.js',
                //    //'test/config.fiberPool.js',
                //    //'test/config.cpsKeyword.js',
                //    //'test/config.fibersHotfix169.js',
                //    //'test/config.maxSlots.js',
                //    //'test/config.mod.js',
                //    //'test/config.js',
                //    //'test/protocol.js'
                //]
            }
        },

        shell: {
            bench: {
                command: 'node support/comparison/benchmark.js'
            }
        },

        findts: {
            main: { }
        }

    });


    // Load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-findts');

    // Register task aliases and the default task
    grunt.registerTask('build', ['typescript:main', 'copy:main']);
    grunt.registerTask('test', ['mochaTest:main']);
    grunt.registerTask('bench', ['shell:bench']);
    grunt.registerTask('default', ['build', 'test']);
};
