'use strict';

// docs ==============================================================================================
//
// first run -> npm i -> to install all dependencies
//
// to finalize the project run --> gulp all
//
// to watch the project run --> gulp watch
//
// to show all tasks run --> gulp --tasks
//
// docs ==============================================================================================

// import main gulp
// need to install gulp-cli --> (npm i -g gulp-cli)
// https://gulpjs.com/docs/en/getting-started/quick-start/
var gulp = require('gulp');

// css ===============================================
{
    // https://www.npmjs.com/package/gulp-sass
    // https://www.npmjs.com/package/node-sass-import-once
    // https://www.npmjs.com/package/node-sass

    var sass = require('gulp-sass');
    var importOnce = require('node-sass-import-once');

    sass.compiler = require('node-sass');

    // sass +++
    gulp.task('sass', function () {
        return gulp
            .src('dist/scss/**/*.scss')
            .pipe(sass({ importer: importOnce, outputStyle: 'compressed' }).on('error', sass.logError))
            .pipe(gulp.dest('dist/build/css/'))
    });
    // sass +++

    // other css +++
    {
        // https://www.npmjs.com/package/gulp-cssnano
        var cssnano = require('gulp-cssnano');

        gulp.task('css-other', function () {
            // input files
            return gulp.src([
                'dist/css/**/*.css'
            ])
                .pipe(cssnano())
                .pipe(gulp.dest('dist/build/css/'));
        });
    }
    // other css +++

    gulp.task('sass:watch', function () {
        gulp.watch('dist/scss/**/*.scss', gulp.series(['sass']));
    });

    gulp.task('css-all', gulp.series('sass', 'css-other'));
}
// css ===============================================

// js ================================================
{
    // https://www.npmjs.com/package/gulp-jshint
    // https://www.npmjs.com/package/gulp-concat
    // https://www.npmjs.com/package/gulp-uglify

    // import dependencies
    const jshint = require('gulp-jshint');
    const concat = require('gulp-concat');
    const uglify = require('gulp-uglify');

    // jshing +++
    {
        gulp.task('js-hint', function () {
            return gulp.src(['dist/js/**/*.js'])
                .pipe(jshint())
                .pipe(jshint.reporter('default'))
                .pipe(jshint.reporter('fail'));
        });
    }
    // jshing +++

    gulp.task('js-temp', function () {
        return gulp.src('dist/js/templates/*.js')
            .pipe(concat('templates.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/build/js/templates/'));
    });

    gulp.task('js-pages', function () {
        return gulp.src('dist/js/pages/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('dist/build/js/pages/'));
    });

    gulp.task('js-public', function () {
        return gulp.src('dist/js/public/public.js')
            .pipe(uglify())
            .pipe(gulp.dest('dist/build/js/public/'));
    });

    // other js +++
    {
        gulp.task('js-other', function () {
            return gulp.src('dist/js/libs/**/*.js')
                .pipe(uglify())
                .pipe(gulp.dest('dist/build/js/'));
        });
    }
    // other js +++

    gulp.task('js-all', gulp.series('js-temp', 'js-pages', 'js-public', 'js-other'));

    gulp.task('js:watch', function () {
        gulp.watch('dist/js/templates/*.js', gulp.series(['js-temp']));
        gulp.watch('dist/js/pages/*.js', gulp.series(['js-pages']));
        gulp.watch('dist/js/public/*.js', gulp.series(['js-public']));
    });
}
// js ================================================

// fontIcon ==========================================
{
    // https://www.npmjs.com/package/gulp-iconfont
    // https://www.npmjs.com/package/gulp-iconfont-css

    // import dependencies
    var iconfont = require('gulp-iconfont');
    var iconfontCss = require('gulp-iconfont-css');
    var runTimestamp = Math.round(Date.now() / 1000);

    var fontName = 'fontIcon';

    gulp.task('fontIcon', function () {
        return gulp.src(['dist/icons/*.svg'])
            .pipe(iconfontCss({
                fontName: fontName,
                path: 'dist/icons/templates/template.css',
                targetPath: '../../css/icons.css',
                fontPath: '../fonts/'
            }))
            .pipe(iconfont({
                fontName: fontName, // required
                prependUnicode: true, // recommended option
                formats: ['eot', 'woff', 'ttf', 'woff2', 'svg'], // default, 'woff2' and 'svg' are available
                timestamp: runTimestamp, // recommended to get consistent builds when watching files
                fixedWidth: false,
                centerHorizontally: true,
                normalize: true,
            }))
            .on('glyphs', function (glyphs, options) {
                // CSS templating, e.g.
                console.log(glyphs, options);
            })
            .pipe(gulp.dest('dist/build/fontIcons/'));
    });

    // other fontIcons +++
    {
        gulp.task('fontIcon-other', function () {
            return gulp.src('dist/fontIcons/**/*')
                .pipe(gulp.dest('dist/build/fontIcons/js/'));
        });
    }
    // other fontIcons +++

    // icon.css created by fontIcon, should concatinate to style.min.css (to apply)
    gulp.task('fontIcon-all', gulp.series('fontIcon', 'fontIcon-other'));
}
// fontIcon ==========================================

// image =============================================
{
    // https://www.npmjs.com/package/gulp-imagemin

    // import dependencies
    const imagemin = require('gulp-imagemin');

    gulp.task('image', function () {
        gulp.src('dist/images/**/*.{png,jpg,svg,gif}')
            .pipe(imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 30, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        { removeViewBox: true },
                        { cleanupIDs: false }
                    ]
                })
            ]))
            .pipe(gulp.dest('dist/build/images/'))
    })

    gulp.task('image-all', gulp.series('image'));
}
// image =============================================

// other files =======================================
{
    gulp.task('fonts', function () {
        return gulp.src('dist/fontIcons/**/*')
            .pipe(gulp.dest('dist/build/fontIcons/js/'));
    });

    gulp.task('files-all', gulp.series('fonts'));
}
// other files =======================================

// watch files
gulp.task('watch', function () {
    // css
    gulp.watch('dist/scss/**/*.scss', gulp.series(['sass']));
    // js
    gulp.watch('dist/js/templates/*.js', gulp.series(['js-temp']));
    gulp.watch('dist/js/pages/*.js', gulp.series(['js-pages']));
    gulp.watch('dist/js/public/*.js', gulp.series(['js-public']));
});

// build finalized project
gulp.task('build', gulp.series('css-all', 'js-all', 'fontIcon-all', 'files-all', 'image-all'));