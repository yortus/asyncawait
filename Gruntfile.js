module.exports = function(grunt) {


    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        ts: {
            main: {
                src: [
                    'async/**/*.ts',
                    'await/**/*.ts',
                    'yield/**/*.ts',
                    'tests/**/*.ts'
                ],
                outDir: '.',
                options: {
                    target: 'es5',
                    module: 'commonjs',
                    sourceMap: true,
                    declaration: false,
                    removeComments: false
                }
            }
        },

        copy: {
            main: {
                expand: true,
                src: ['async/**/*.js', 'await/**/*.js', 'yield/**/*.js', 'index.js'],
                dest: 'node_modules/asyncawait'
            }
        },

        mochaTest: {
            main: {
                options: { reporter: 'list' },
                src: ['tests/**/*.js']
            }
        }

    });


    // Load grunt tasks
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha-test');

    // Register task aliases and the default task
    grunt.registerTask('build', ['ts:main', 'copy:main']);
    grunt.registerTask('test', ['mochaTest:main']);
    grunt.registerTask('default', ['build', 'test']);
};
