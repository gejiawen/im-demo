/**
 * @file: gulpfile
 * @author: gejiawen
 * @date: 13/01/2017 00:14
 * @description: gulpfile
 */

const gulp = require('gulp')
const stylus = require('gulp-stylus')
const sourcemaps = require('gulp-sourcemaps')

gulp.task('stylus-with-sourcemaps', () => {
    return gulp.src('./*.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus({compress: true}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./build'))
})

gulp.task('default', ['stylus-with-sourcemaps'])

gulp.watch('./*.styl', ['stylus-with-sourcemaps'])
