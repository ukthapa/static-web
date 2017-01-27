'use strict';
var gulp = require('gulp'),     
    sass = require('gulp-sass') ,
    notify = require("gulp-notify") ,
    imagemin = require("gulp-imagemin") ,   
    pngquant = require("imagemin-pngquant") , 
    rename = require('gulp-rename'),
    size = require('gulp-filesize'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    eslint = require('gulp-eslint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    bower = require('gulp-bower'),
    nunjucks = require('nunjucks'),
    markdown = require('nunjucks-markdown'),
    marked = require('marked'),
    rename = require('gulp-rename'),
    gulpnunjucks = require('gulp-nunjucks');


var config  = {
	bowerDir : './bower_components',
	dev : './dev',
	prod : './prod',
    templates : './dev/templates/'
}


// Nunjucks template engine
var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(config.templates));


marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});


markdown.register(env, marked);

gulp.task('pages', function() {
    // Gets .html files. see file layout at bottom
    return gulp.src([config.templates + '/pages/*.+(html|nunjucks)', config.templates + '/pages/**/*.+(html|nunjucks)'])
        // Renders template with nunjucks and marked
        .pipe(gulpnunjucks.compile("", {env: env}))
        // Uncomment the following if your source pages are something other than *.html. 
        .pipe(rename(function (path) { path.extname=".html" }))
        // output files in dist folder
        .pipe(gulp.dest(config.dev))
});


//gulp task for running bower
gulp.task('bower', function() { 
    return bower()
        .pipe(gulp.dest(config.bowerDir)) 
});



//gulp task to copy font-awasome
gulp.task('icons', function() { 
    return gulp.src(config.bowerDir + '/font-awesome/fonts/**.*') 
        .pipe(gulp.dest(config.dev + '/fonts'))
});



//gulp task to copy glyphicons
gulp.task('glyphicons', function() { 
    return gulp.src(config.bowerDir + '/bootstrap-sass/assets/fonts/bootstrap/**.*') 
        .pipe(gulp.dest(config.dev + '/fonts/bootstrap'))
});


//gulp task to convert scss file to css
gulp.task('css', function() { 
    return gulp.src(config.dev + '/sass/style.scss')
         .pipe(sass({
             includePaths: [
                 config.dev + '/sass',
                 config.bowerDir + '/bootstrap-sass/assets/stylesheets',
                 config.bowerDir + '/font-awesome/scss',
             ]
         }) 
            .on("error", notify.onError(function (error) {
                 return "Error: " + error.message;
             }))) 
         .pipe(gulp.dest(config.dev + '/css')); 
});



//gulp task to concatinate js files
gulp.task('js', function() { 
 // Build vendor files
gulp.src([config.bowerDir + '/jquery/dist/jquery.js', 
    config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap.js', 
    config.dev + '/js/vendor/**/*.js'])
  // Concat files
    .pipe(concat('vendor.js'))
  // Minify combined files and rename
    .pipe(uglify())
    // .pipe(rename({ extname: '.min.js' }))
    .pipe(size())
    .pipe(gulp.dest(config.dev + '/js/vendor'))

  return gulp.src(config.dev + '/js/*.js')
  // Concat files
    .pipe(concat('main.js'))
  // Lint file
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
  // Minify files and rename
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(size())
    .pipe(gulp.dest(config.dev + '/js'));
});





// Rerun the task when a file changes
 gulp.task('watch', function() {
     gulp.watch(config.dev + '/sass/**/*.scss', ['css']); 
});


  gulp.task('default', ['bower', 'icons', 'css']);





//////////////////////////
/// PRODUCTION BUILD TASK
/////////////////////////


gulp.task('optimizeImg', function(){
    return gulp.src(config.dev + '/images/**.*')
        .pipe(imagemin({
          progressive: true,
          use: [pngquant({
            quality: '65-75'
          })]
        }))
        .pipe(gulp.dest(config.prod + '/images'))
});


gulp.task('buildcss', function() { 
    return gulp.src(config.dev + '/css/**/*.css')
          .pipe(autoprefixer({
          browsers: ['last 2 versions']
        }))
        .pipe(minifyCss())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(size())
         .pipe(gulp.dest(config.prod + '/css')); 
});









