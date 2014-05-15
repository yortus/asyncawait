module.exports = function(grunt) {


    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        ts: {
            build: {
                src: [
                    'async/**/*.ts',
                    'await/**/*.ts',
                    'yield/**/*.ts'
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
        }

    });


    grunt.loadNpmTasks('grunt-ts');


    grunt.registerTask('build', ['ts:build']);
    grunt.registerTask('default', ['build']);


};
