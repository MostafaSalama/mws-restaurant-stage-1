const path = require('path');
const gulp = require('gulp');
const bs = require('browser-sync').create();

// files paths
const paths = {
    css: 'css/styles.css',
    js: path.join(__dirname, 'js/*.js'),
    html: path.resolve(`${__dirname}/*.html`)
};

gulp.task('default', ['serve']);

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
    gulp.watch(paths.css).on('change',bs.reload) ;
});

gulp.task('html', () => {
    // reload on every change
    gulp.watch(paths.html).on('change', bs.reload);
});

gulp.task('js', () => {
    // reload on every change
    gulp.watch(paths.js).on('change', bs.reload);
});
