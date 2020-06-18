// GULP
var gulp = require('gulp');
// HTML
var htmlminify = require('gulp-html-minify');
// CSS
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var autoprefijar = require('gulp-autoprefixer');
// JS
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
// CREA SERVIDOR LOCAL
var browserSync = require('browser-sync').create();
// HERRAMIENTA PARA HACER UN USO CONDICIONAL DE LAS TAREAS/HERRAMIENTAS DE GULP
var gulpif = require('gulp-if');
// RENOMBRA ARCHIVOS (.min.css / .min.js)
var rename = require('gulp-rename');
// OPTIMIZACIÓN DE IMÁGENES
var imagemin = require('gulp-imagemin');
// LIMPIEZA DE ARCHIVOS ANTES DE EXPORTAR A PRODUCCIÓN
var del = require('del');
// PARA REALIZAR UNA SECUENCIA DE TAREAS
var runSequence = require('run-sequence');


// Establece una variable distMode que luego se utilizará para ejecutar las tareas más pesadas únicamente para producción
var config = {
  distMode: false,
  environment: 'dev'
};

// Crea un servidor local con hot reloading y posibilidad de conectar dispositivos a la IP (por ejemplo el móvil)
gulp.task('connect', function () {
  browserSync.init({
    server: "./app"
  });
});

// Minifica el html
gulp.task('html', function () {
  gulp.src('src/html/**/*.html')
    .pipe(htmlminify())
    .pipe(gulp.dest('./app'))
    .pipe(browserSync.stream());
});

// Minifica y concatena todo nuestro JavaScript en un único archivo minificado
gulp.task('js', function () {
  gulp.src('src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulpif(config.distMode, concat('app.min.js')))
    .pipe(gulpif(config.distMode, uglify()))
    .pipe(rename({
      suffix : '.min',
      extname : '.js'
    }))
    .pipe(gulp.dest('./app/js'))
    .pipe(browserSync.stream());
});

// La tarea que está pendiente de nuestra estructura scss y genera un único archivo main.css minificado
gulp.task('sass', function () {
  gulp.src('src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cssnano())
    .pipe(gulpif(config.distMode, autoprefijar({
      browsers: ['last 10 versions'],
      cascade: false
    })))
    // renombra el archivo minificado con .min
    .pipe(rename({
      suffix : '.min',
      extname : '.css'
    }))
    .pipe(gulp.dest('./app/css'))
    .pipe(browserSync.stream());
});

// Optimiza las imágenes. Esta tarea se cumple solo en el modo de producción (dist) para ahorrar tiempo y peso
gulp.task('img', function () {
  gulp.src('src/img/**/*')
    .pipe(gulpif(config.distMode, imagemin()))
    .pipe(gulp.dest('./app/img'))
    .pipe(browserSync.stream());
});

// Si añadimos fuentes personalizadas. Aunque mi elección es añadirlas en el scss. 1-Settings/_settings.fonts.scss
gulp.task('fonts', function () {
  gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('./app/fonts'))
    .pipe(browserSync.stream());
});

// Limpia la carpeta antes de exportar los nuevos archivos
gulp.task('clean', function () {
  return del([
    './app'
  ]);
});

// Estas tareas observan los continuos cambios que tengan los archivos y la vista se recarga cuando desarrollamos
gulp.task('watch', function () {
  gulp.watch(['src/html/**/*'], ['html']).on('change', browserSync.reload);
  gulp.watch(['src/js/**/*'], ['js']).on('change', browserSync.reload);
  gulp.watch(['src/scss/**/*'], ['sass']).on('change', browserSync.reload);
  gulp.watch(['src/img/**/*']).on('change', browserSync.reload);
  gulp.watch(['src/fonts/**/*'], ['fonts']).on('change', browserSync.reload);
});

// Visualizar el proyecto. Solo podemos verlo
// $ gulp
gulp.task('default', function () {
  runSequence(
    ['connect', 'watch']
  );
});

// Compilación de desarrollo. No realiza las tareas de optimización ni minificado
// $ gulp dev
gulp.task('dev', function () {
  runSequence(
    'clean', ['html', 'js', 'sass', 'img', 'fonts']
  );
});

// Trabajar en el proyecto y que esté pendiente de cambios. Es la que uso para desarrollar
// $ gulp work
gulp.task('work', function () {
  // Realiza la compilación de desarrollo + la visualización
  runSequence(
    'dev',
    'default'
  );
});

// Versión para subir a producción. Cambia la variable distMode a true para que se realicen las tareas que dependen de ello
// $ gulp dist
gulp.task('dist', function () {
  config.distMode = true;
  config.environment = 'dist';
  runSequence(
    'clean', ['html', 'js', 'sass', 'img', 'fonts']
  );
});
