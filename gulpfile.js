var gulp = require('gulp');
var tsc = require('gulp-tsc');
var mocha = require('gulp-mocha');


var locations = {
    src: ['./**/*.ts', '!src/typings/**', '!node_modules/**'],
    dest: './',
    test: ['./test/*.js']
}


gulp.task('build', function () {
    return gulp.src(locations.src)

        // Compile ALL typescript sources as CommonJS modules.
        .pipe(tsc({
            module: 'CommonJS',
            sourcemap: false,
            emitError: false,
            outDir: locations.dest
        }))

        // Generate build outputs.
        .pipe(gulp.dest(locations.dest));
});


gulp.task('test', function () {
    return gulp.src(locations.test, {read: false})
        .pipe(mocha({reporter: 'list'}));
});
