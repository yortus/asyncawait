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
                //src: [
                //    'src/**/*.ts',
                //    'test/**/*.ts'
                //],
                src: [
                    //'src/___OLD___async/builder.ts',
                    //'src/___OLD___async/createSuspendableFunction.ts',
                    //'src/___OLD___async/index.ts',
                    'src/mods/async.promise.ts',
                    'src/mods/await.promise.ts',
                    'src/mods/baseline.ts',
                    //'src/mods/promises.ts',
                    'src/async.ts',
                    'src/await.ts',
                    //'src/awaitBuilder.ts',
                    'src/createSuspendableFunction.ts',
                    'src/fiberProtocol.ts',
                    //'src/jointProtocol.ts',
                    'src/main.ts',
                    'src/options.ts',
                    'src/protocol.ts',
                    'src/util.ts',
                    'src/yield.ts',
                    'test/async.promise.ts',
                    'test/protocol.ts'
                ],
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
                //src: ['test/**/*.js']
                src: [
                    //'test/async.cps.js',
                    //'test/async.express.js',
                    //'test/async.iterable.cps.js',
                    //'test/async.iterable.promise.js',
                    //'test/async.iterable.thunk.js',
                    //'test/async.iterable.js',
                    //'test/async.mod.js',
                    'test/async.promise.js',
                    //'test/async.stream.js',
                    //'test/async.thunk.js',
                    //'test/async.js',
                    //'test/await.cps.js',
                    //'test/await.promise.js',
                    //'test/await.thunk.js',
                    //'test/await.js',
                    //'test/config.fiberPool.js',
                    //'test/config.cpsKeyword.js',
                    //'test/config.fibersHotfix169.js',
                    //'test/config.maxSlots.js',
                    //'test/config.mod.js',
                    //'test/config.js',
                    'test/protocol.js'
                ]
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
