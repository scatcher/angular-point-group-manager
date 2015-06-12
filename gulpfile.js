'use strict';

/* jshint camelcase:false */
//var concat = require('concat-stream');
var fs = require('fs');
var gulp = require('gulp');
//var inject = require('inject');
var projectDir = __dirname + '/';
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-typescript');
var concat = require('gulp-concat');
var pkg = require('./package.json');
var templateCache = require('gulp-angular-templatecache');
var fileName = pkg.name + '.js';

gulp.task('build', ['ts', 'template-cache'], function () {
    return gulp.src(['.tmp/*.js', 'dist/' + fileName])
        .pipe(concat(fileName))
        .pipe(gulp.dest('dist'));
});

gulp.task('ts', function () {
//    var tsResult = gulp.src(paths.tsFiles)
    var tsResult = gulp.src('src/*.ts')
        .pipe(sourcemaps.init({loadMaps: true})) // This means sourcemaps will be generated
        .pipe(typescript({
            target: 'ES5',
            sortOutput: true,
            noExternalResolve: true,
            typescript: require('typescript')
        }));

    return tsResult.js
            .pipe(concat(fileName)) // You can use other plugins that also support gulp-sourcemaps
            .pipe(sourcemaps.write('.', { sourceRoot: '/' })) // Now the sourcemaps are added along side the .js file
            .pipe(gulp.dest('dist'));
});

gulp.task('template-cache', function () {
    return gulp.src('src/**/*.html')
        .pipe(templateCache({module: 'angularPoint'}))
        .pipe(gulp.dest('.tmp'));
});

// Static server
gulp.task('serve', ['inject-dev', 'styles'], function () {
    browserSync.init({
        server: {
            baseDir: ["./", "app"],
            index: "app/index.html"
        }
    });

    gulp.watch("app/**/*.ts", ['ts']);
    gulp.watch("app/styles/**/*.less", ['styles']);
    gulp.watch("app/**/*.ts", {events: ['add']}, ['ts', 'inject-dev']);
    gulp.watch(".tmp/**/*.js").on('change', browserSync.reload);
    gulp.watch("app/**/*.html").on('change', browserSync.reload);
});