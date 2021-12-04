"use strict";


const input_dir = 'dist/';
const output_dir = 'build/';

const is_production = true;
const all_pages_target = true;
const pug_file_target = 'pug/pages/course.pug';
const scss_file_target = input_dir + 'scss/pages/course.scss';
const js_file_target = input_dir + 'js/pages/course.js';


var gulp = require('gulp');
var gulpif = require('gulp-if');
var del = require('del');



/* ++++++++++++++++++++++++++++++++++++++++++++++++ pug ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ pug ++++++++++++++++++++++++++++++++++++++++++++++++ */
{
    const { src, dest } = require('gulp');
    const pug = require('gulp-pug');
    const prettyHtml = require('gulp-pretty-html');

    gulp.task('pug-pages', function () {
        return src(
            all_pages_target ? 'pug/pages/*.pug' : pug_file_target
        )
            .pipe(
                pug({
                    pretty: is_production
                })
            )
            .pipe(gulpif(is_production,
                prettyHtml({
                    wrap_line_length: 160,
                    unformatted: ['code', 'pre', 'em', 'strong', 'b', 'br'],
                    extra_liners: ['span', '/span', 'a', '/a', 'button', '/button', 'i', '/i', 'img']
                })))
            .pipe(dest('pages'));
    });

    gulp.task('pug:watch', function () {
        gulp.watch('pug/*.pug', gulp.series(['pug-build']));
    });

    gulp.task('pug-build', gulp.series('pug-pages'));
}
/* ++++++++++++++++++++++++++++++++++++++++++++++++ pug ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ pug ++++++++++++++++++++++++++++++++++++++++++++++++ */

/* ++++++++++++++++++++++++++++++++++++++++++++++++ css ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ css ++++++++++++++++++++++++++++++++++++++++++++++++ */
{
    var sass = require('gulp-sass');
    var importOnce = require('node-sass-import-once');

    sass.compiler = require('node-sass');
    const cleanCSS = require('gulp-clean-css');

    gulp.task('sass', function () {
        return gulp
            .src(
                all_pages_target ? input_dir + 'scss/**/*.scss' : scss_file_target
            )
            .pipe(sass({ importer: importOnce }).on('error', sass.logError))
            .pipe(gulpif(is_production, cleanCSS()))
            .pipe(gulp.dest(all_pages_target ? output_dir + 'css/' : output_dir + 'css/pages/'))
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
                .pipe(cleanCSS())
                .pipe(gulp.dest(output_dir + 'css/'))
        })

        gulp.task('autoprefixer', gulp.series('css-prefix'));
    }
    // postcss & autoprefixer +++

    // join media queries
    {
        var mmq = require('gulp-merge-media-queries');

        gulp.task('mmq', async function () {
            gulp
                .src([
                    output_dir + 'css/**/*.css',
                    '!' + output_dir + 'css/libs/*',
                ])
                .pipe(mmq({
                    // log: true,
                    use_external: false
                }))
                .pipe(cleanCSS())
                .pipe(gulp.dest(output_dir + 'css'));
        });
    }
    // join media queries

    gulp.task('sass:watch', function () {
        gulp.watch(input_dir + 'scss/**/*.scss', gulp.series(['sass']));
    });

    gulp.task('css-other', function () {
        return gulp
            .src(input_dir + 'css/libs/**/*')
            .pipe(cleanCSS())
            .pipe(gulp.dest(output_dir + 'css/libs/'))
    });

    gulp.task('css-build', gulp.series('sass', 'autoprefixer', 'mmq', 'css-other'));
}
/* ++++++++++++++++++++++++++++++++++++++++++++++++ css ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ css ++++++++++++++++++++++++++++++++++++++++++++++++ */

/* ++++++++++++++++++++++++++++++++++++++++++++++++ js ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ js ++++++++++++++++++++++++++++++++++++++++++++++++ */
{
    var concat = require('gulp-concat');
    var uglify = require('gulp-uglify');
    var ts = require('gulp-typescript');
    var jsImport = require('gulp-js-import');

    gulp.task('js-pages', function () {
        return gulp.src(
            all_pages_target ? input_dir + 'js/pages/*.js' : js_file_target
        )
            .pipe(jsImport({
                hideConsole: true,
                importStack: true,
                es6import: true
            }))
            .pipe(gulpif(is_production, uglify()))
            .pipe(gulp.dest(output_dir + 'js/pages/'));
    });

    gulp.task('js-public', function () {
        return gulp.src([input_dir + 'js/public/*.js'])
            .pipe(jsImport({
                hideConsole: true,
                importStack: true,
                es6import: true
            }))
            .pipe(gulpif(is_production, uglify()))
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
        gulp.watch([input_dir + 'js/templates/**/*.js', input_dir + 'js/classes/*.js'], gulp.series(['js-pages', 'js-public']));
        gulp.watch(input_dir + 'js/pages/*.js', gulp.series(['js-pages']));
        gulp.watch([input_dir + 'js/public/*.js'], gulp.series(['js-public']));
    });
}
/* ++++++++++++++++++++++++++++++++++++++++++++++++ js ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ js ++++++++++++++++++++++++++++++++++++++++++++++++ */

/* ++++++++++++++++++++++++++++++++++++++++++++++++ image ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ image ++++++++++++++++++++++++++++++++++++++++++++++++ */
{
    // https://www.npmjs.com/package/gulp-imagemin

    // import dependencies
    // const imagemin = require('gulp-imagemin');
    // const webp = require('gulp-webp');

    // gulp.task('image', function () {
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
    // });

    // gulp.task('webp', () =>
    //     // gulp.src(output_dir + 'images/**/*.{png,jpg}')
    //     gulp.src(input_dir + 'images/**/*.png')
    //         .pipe(webp({
    //             quality: 75, // 0 - 100
    //             // alphaQuality: 100, // 0 - 100
    //             // sns: 100, // 0 - 100
    //             // method: 4, // 0 - 6
    //             // sharpness: 4, // 0 - 6
    //             // filter: 4, // 0 - 100
    //             // autoFilter: true,
    //             // nearLossless: 4, // 0 - 100
    //             lossless: true,
    //         }))
    //         .pipe(gulp.dest(output_dir + 'images/'))
    // );

    // gulp.task('image-build', gulp.series('image'/*, 'webp'*/));
}
/* ++++++++++++++++++++++++++++++++++++++++++++++++ image ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ image ++++++++++++++++++++++++++++++++++++++++++++++++ */

/* ++++++++++++++++++++++++++++++++++++++++++++++++ other files ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ other files ++++++++++++++++++++++++++++++++++++++++++++++++ */
{
    gulp.task('fonts', function () {
        return gulp.src(input_dir + 'fonts/**/*')
            .pipe(gulp.dest(output_dir + 'fonts/'));
    });

    gulp.task('images', function () {
        return gulp.src([
            input_dir + 'images/**/*',
        ])
            .pipe(gulp.dest(output_dir + 'images/'));
    });

    gulp.task('files-build', gulp.series('fonts', 'images'));
}
/* ++++++++++++++++++++++++++++++++++++++++++++++++ other files ++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++ other files ++++++++++++++++++++++++++++++++++++++++++++++++ */

// watch the project
gulp.task('watch', function () {
    
    gulp.watch('pug/**/*.pug', gulp.series(['pug-build']));

    gulp.watch(input_dir + 'scss/**/*.scss', gulp.series(['sass']));

    gulp.watch([input_dir + 'js/templates/**/*.js', input_dir + 'js/classes/*.js'], gulp.series(['js-pages', 'js-public']));
    gulp.watch(input_dir + 'js/pages/*.js', gulp.series(['js-pages']));
    gulp.watch(input_dir + 'js/public/*.js', gulp.series(['js-public']));
});

gulp.task('build-delete', function () {
    return del([
        output_dir + 'css',
        output_dir + 'fonts',
        output_dir + 'images',
        output_dir + 'js',
    ]);
});

// build the project
gulp.task('build', gulp.series('build-delete', 'pug-build', 'css-build', 'js-build', 'files-build', /*'image-build'*/));