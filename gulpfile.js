const path = require('path');
const gulp = require('gulp');
const bs = require('browser-sync').create();
const swPreCache = require('sw-precache');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const cleanCss = require('gulp-clean-css');
const gzip = require('gulp-gzip');
// files paths
const paths = {
    css: 'css/styles.css',
    js: path.join(__dirname, 'js/*.js'),
    html: path.resolve(`${__dirname}/*.html`)
};
gulp.task('build', ['css', 'index-scripts', 'restaurant-scripts'], () => {
    gulp.watch(paths.js, ['index-scripts', 'restaurant-scripts']);
    gulp.watch(paths.css, ['css']);
});
gulp.task('default', ['serve']);
gulp.task('serve', ['css', 'index-scripts', 'restaurant-scripts'], () => {
    // initial server with port 8000
    bs.init({
        server: {
            baseDir: './'
        },
        port: 4000
    });

    // reload on every change
    gulp.watch(paths.css, ['css']).on('change', bs.reload);
    gulp.watch(paths.html).on('change', bs.reload);
    gulp
        .watch(paths.js, ['index-scripts', 'restaurant-scripts'])
        .on('change', bs.reload);
});
// minify css
gulp.task('css', () => {
    return gulp
        .src(paths.css)
        .pipe(cleanCss())
        .pipe(gulp.dest('dist'));
});

// concat all scripts
// uglify them in one script
gulp.task('index-scripts', () => {
    return gulp
        .src(['js/*.js', '!js/restaurant_info.js'])
        .pipe(concat('mainIndex.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('restaurant-scripts', () => {
    return gulp
        .src(['js/*.js', '!js/main.js'])
        .pipe(concat('restaurant.js'))
        .pipe(gulp.dest('dist'));
});
// generating service worker
gulp.task('gen-sw', () => {
    const swOptions = {
        staticFileGlobs: [
            './index.html',
            './restaurant.html',
            './dist/*.js',
            './dist/*.css',
            './icons/*',
            './manifest.json',
            './img/*'
        ],
        stripPrefix: '.',
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/maps\.googleapis\.com/,
                handler: 'networkFirst'
            },
        ],
            ignoreUrlParametersMatching:[/^id/]
    };
    return swPreCache.write(`${path.join(__dirname, 'sw.js')}`, swOptions);
});
// minify images
gulp.task('mini-images', () => {
    return gulp
        .src('./img/*.jpg')
        .pipe(imagemin())
        .pipe(gulp.dest('img'));
});
gulp.task('gzip',()=>{
    return gulp.src('./dist/mainIndex.js')
        .pipe(gzip())
        .pipe(gulp.dest('public'))
})