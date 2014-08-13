module.exports = function(grunt) {


    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            main: {
                src: [
                    'src/**/*.js', 'tests/**/*.js',
                    'src/**/*.js.map', 'tests/**/*.js.map'
                ]
            }
        },

        typescript: {
            main: {
                src: [
                    'src/**/*.ts',
                    'tests/**/*.ts'
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
                //src: ['tests/**/*.js']
                src: [
                    //'tests/async.cps.js',
                    //'tests/async.express.js',
                    //'tests/async.iterable.cps.js',
                    //'tests/async.iterable.promise.js',
                    //'tests/async.iterable.thunk.js',
                    //'tests/async.iterable.js',
                    //'tests/async.mod.js',
                    //'tests/async.promise.js',
                    //'tests/async.stream.js',
                    //'tests/async.thunk.js',
                    //'tests/async.js',
                    //'tests/await.cps.js',
                    //'tests/await.promise.js',
                    //'tests/await.thunk.js',
                    //'tests/await.js',
                    //'tests/config.fiberPool.js',
                    //'tests/config.cpsKeyword.js',
                    //'tests/config.fibersHotfix169.js',
                    //'tests/config.maxSlots.js',
                    //'tests/config.mod.js',
                    //'tests/config.js',
                    'tests/protocol.js'
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
