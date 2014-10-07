var gulp = require( 'gulp' ),
    buffer = require( 'vinyl-buffer' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' ),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
    browserify = require('browserify'),
    gbrowserify = require( 'gulp-browserify' );

gulp.task( 'client', function(){
  var out = gulp.src( './index.js')
    .pipe( gbrowserify({ standalone:'Interface', bare:true }) )
    .pipe( rename('interface.js') )
    .pipe( gulp.dest('./build') )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('interface.min.js') )
    .pipe( gulp.dest('./build/') )
    
    return out
});

// gulp.task('watch', function() {
//   var bundler = watchify(browserify('./js/main.js', watchify.args));
// 
//   bundler.on('update', rebundle);
// 
//   function rebundle() {
//     return bundler.bundle()
//       .on('error', gutil.log.bind(gutil, 'Browserify Error'))
//       .pipe( source( 'bundle.js' ) )
//       .pipe( rename( 'index.js' ) )
//       .pipe( gulp.dest( './js' ) )
//   }
// 
//   return rebundle();
// });

gulp.task( 'default', ['client'] )