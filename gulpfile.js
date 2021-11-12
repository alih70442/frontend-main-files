"use strict";

var gulp = require('gulp');

const input_dir = 'dist/';
const output_dir = 'build/';



/* ++++++++++++++++++++++++++++++++++++++++++++++++ pug ++++++++++++++++++++++++++++++++++++++++++++++++ */
{
    // npm install gulp-pretty-html --save-dev

    const { src, dest } = require('gulp');
    const pug = require('gulp-pug');
    const prettyHtml = require('gulp-pretty-html');

    gulp.task('pug-build', function () {
        return src('pug/pages/*.pug')
            .pipe(
                pug({
                    pretty: true
                })
            )
            .pipe(prettyHtml({
                wrap_line_length: 160,
                unformatted: ['code', 'pre', 'em', 'strong', 'b', 'br'],
                extra_liners: ['span', '/span', 'a', 'i', 'img']
            }))
            .pipe(dest('pages/'));
    });

    gulp.task('pug:watch', function () {
        gulp.watch('pug/*.pug', { delay: 1000 }, gulp.series(['pug-build']));
    });
}
/* ++++++++++++++++++++++++++++++++++++++++++++++++ pug ++++++++++++++++++++++++++++++++++++++++++++++++ */

/* ++++++++++++++++++++++++++++++++++++++++++++++++ css ++++++++++++++++++++++++++++++++++++++++++++++++ */
{
    var sass = require('gulp-sass');
    // var sassImportOnce = require('gulp-sass-import-once');
    // var sass = require('node-sass');
    var importOnce = require('node-sass-import-once');

    sass.compiler = require('node-sass');

    gulp.task('sass', function () {
        return gulp
            .src(input_dir + 'scss/**/*.scss')
            .pipe(sass({ importer: importOnce, outputStyle: 'compressed' }).on('error', sass.logError))
            .pipe(gulp.dest(output_dir + 'css/'))
    });

    // postcss & autoprefixer +++
    {
        const autoprefixer = require('autoprefixer'),
            postcss = require('gulp-postcss');

        gulp.task('css-prefix', function () {
            return gulp
                .src([
                    output_dir + 'css/**/*.css',
                    '!' + output_dir + 'css/libs/**/*'
                ])
                .pipe(postcss([autoprefixer()]))
                .pipe(gulp.dest(output_dir + 'css/'))
        })

        gulp.task('autoprefixer', gulp.series('css-prefix'));
    }
    // postcss & autoprefixer +++

    gulp.task('sass:watch', function () {
        //   gulp.watch('dist/scss/**/*.scss', ['sass']);
        gulp.watch(input_dir + 'scss/**/*.scss', gulp.series(['sass']));
    });

    gulp.task('css-other', function () {
        return gulp
            .src(input_dir + 'css/libs/**/*')
            .pipe(gulp.dest(output_dir + 'css/libs/'))
    });

    gulp.task('css-build', gulp.series('sass', 'autoprefixer', 'css-other'));
}
/* ++++++++++++++++++++++++++++++++++++++++++++++++ css ++++++++++++++++++++++++++++++++++++++++++++++++ */

/* ++++++++++++++++++++++++++++++++++++++++++++++++ js ++++++++++++++++++++++++++++++++++++++++++++++++ */
{
    var concat = require('gulp-concat');
    var uglify = require('gulp-uglify');
    var ts = require('gulp-typescript');
    var jsImport = require('gulp-js-import');

    gulp.task('js-pages', function () {
        return gulp.src(input_dir + 'js/pages/*.js')
            .pipe(jsImport({
                hideConsole: true,
                importStack: true,
                es6import: true
            }))
            .pipe(uglify())
            .pipe(gulp.dest(output_dir + 'js/pages/'));
    });

    gulp.task('js-public', function () {
        return gulp.src([input_dir + 'js/public/*.js'])
            .pipe(jsImport({
                hideConsole: true,
                importStack: true,
                es6import: true
            }))
            .pipe(uglify())
            .pipe(concat('public.js'))
            .pipe(gulp.dest(output_dir + 'js/public/'));
    });

    gulp.task('ts-build', function () {
        return gulp.src([
            output_dir + 'js/**/*.js',
            '!' + output_dir + 'js/libs/*.js'
        ])
            .pipe(ts({
                target: 'ES5',
                noImplicitAny: true,
                allowJs: true,
                removeComments: true,
                outDir: output_dir + 'js/'
            }))
            .pipe(uglify())
            .pipe(gulp.dest(output_dir + 'js/'));
    });

    gulp.task('js-other', function () {
        return gulp
            .src(input_dir + 'js/libs/**/*')
            .pipe(gulp.dest(output_dir + 'js/libs/'))
    });

    gulp.task('js-build', gulp.series('js-pages', 'js-public', 'ts-build', 'js-other'));

    gulp.task('js:watch', function () {
        gulp.watch([input_dir + 'js/templates/*.js', input_dir + 'js/public/classes/*.js'], gulp.series(['js-pages', 'js-public']));
        gulp.watch(input_dir + 'js/pages/*.js', gulp.series(['js-pages']));
        gulp.watch([input_dir + 'js/public/*.js'], gulp.series(['js-public']));
    });
}
/* ++++++++++++++++++++++++++++++++++++++++++++++++ js ++++++++++++++++++++++++++++++++++++++++++++++++ */


/* ++++++++++++++++++++++++++++++++++++++++++++++++ image ++++++++++++++++++++++++++++++++++++++++++++++++ */
{
    // https://www.npmjs.com/package/gulp-imagemin

    // import dependencies
    // const imagemin = require('gulp-imagemin');

    // gulp.task('images', function () {
    //     gulp.src(input_dir + 'images/**/*.{png,jpg,svg,gif}')
    //         .pipe(imagemin([
    //             imagemin.gifsicle({ interlaced: true }),
    //             imagemin.mozjpeg({ quality: 30, progressive: true }),
    //             imagemin.optipng({ optimizationLevel: 5 }),
    //             imagemin.svgo({
    //                 plugins: [
    //                     { removeViewBox: true },
    //                     { cleanupIDs: false }
    //                 ]
    //             })
    //         ]))
    //         .pipe(gulp.dest(output_dir + 'images/'))
    // })

    // gulp.task('images-build', gulp.series('images'));
}
/* ++++++++++++++++++++++++++++++++++++++++++++++++ image ++++++++++++++++++++++++++++++++++++++++++++++++ */

/* ++++++++++++++++++++++++++++++++++++++++++++++++ other files ++++++++++++++++++++++++++++++++++++++++++++++++ */
{
    gulp.task('fonts', function () {
        return gulp.src(input_dir + 'fonts/**/*')
            .pipe(gulp.dest(output_dir + 'fonts/'));
    });

    gulp.task('images', function () {
        return gulp.src(input_dir + 'images/**/*')
            .pipe(gulp.dest(output_dir + 'images/'));
    });

    gulp.task('files-build', gulp.series('fonts', 'images'));
}
/* ++++++++++++++++++++++++++++++++++++++++++++++++ other files ++++++++++++++++++++++++++++++++++++++++++++++++ */

// watch the project
gulp.task('watch', function () {
    // pug
    gulp.watch('pug/**/*.pug', { delay: 1000 }, gulp.series(['pug-build']));

    // scss
    gulp.watch(input_dir + 'scss/**/*.scss', gulp.series(['sass']));

    // js
    gulp.watch([input_dir + 'js/templates/*.js', input_dir + 'js/public/classes/*.js'], gulp.series(['js-pages', 'js-public']));
    gulp.watch(input_dir + 'js/pages/*.js', gulp.series(['js-pages']));
    gulp.watch(input_dir + 'js/public/*.js', gulp.series(['js-public']));
});

// build the project
gulp.task('build', gulp.series('pug-build', 'css-build', 'js-build', 'files-build'/*, 'images-build'*/));