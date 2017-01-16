/**
 * @file: gulpfile
 * @author: gejiawen
 * @date: 13/01/2017 00:14
 * @description: gulpfile
 */

const gulp = require('gulp')
const stylus = require('gulp-stylus')
const sourcemaps = require('gulp-sourcemaps')
const exec = require('child_process').exec

gulp.task('stylus-with-sourcemaps', () => {
    return gulp.src('./*.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus({compress: true}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./build'))
})

gulp.task('default', ['stylus-with-sourcemaps'])
gulp.task('serve', ['stylus-with-sourcemaps'], () => {
    exec('hs .', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
        }

        console.log(`${stdout}`)
    })
})

gulp.watch('./*.styl', ['stylus-with-sourcemaps'])
