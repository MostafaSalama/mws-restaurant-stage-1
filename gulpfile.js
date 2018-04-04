const path = require('path');
const gulp = require('gulp');
const bs = require('browser-sync').create();
const swPrecache = require('sw-precache');
// files paths
const paths = {
    css: 'css/styles.css',
    js: path.join(__dirname, 'js/*.js'),
    html: path.resolve(`${__dirname}/*.html`)
};

gulp.task('default', ['serve']);
gulp.task('gen-sw', () => {
    const swOptions = {
        staticFileGlobs: [
            './index.html',
            './restaurant.html',
            './data/*.json',
            './img/*.{png,svg,gif,jpg}',
            './js/*.js',
            './css/*.css',
            'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css',
        ],
        stripPrefix: '.',
       
    };
    return swPrecache.write(`${path.join(__dirname,'sw.js')}`, swOptions);
})
gulp.task('generate-service-worker', function(callback) {
    var path = require('path');
    var swPrecache = require('sw-precache');
    var rootDir = 'app';

    swPrecache.write(path.join(rootDir, 'service-worker.js'), {
        staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif}'],
        stripPrefix: rootDir
    }, callback);
});
gulp.task('serve', ['html', 'css', 'js'], () => {
    // initial server with port 8000
    bs.init({
        server: {
            baseDir: './'
        },
        port: 8000
    });

    gulp.watch(paths.css, ['css']);
});
gulp.task('css', () => {
    gulp.watch(paths.css).on('change', bs.reload);
});

gulp.task('html', () => {
    // reload on every change
    gulp.watch(paths.html).on('change', bs.reload);
});

gulp.task('js', () => {
    // reload on every change
    gulp.watch(paths.js).on('change', bs.reload);
});
