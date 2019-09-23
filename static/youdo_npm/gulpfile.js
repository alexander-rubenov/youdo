'use strict';

const gulp = require('gulp'),
  autoprefixer = require('autoprefixer'),
  babel = require('gulp-babel'),
  cssmin = require('gulp-csso'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  postcss = require("gulp-postcss"),
  plumber = require("gulp-plumber"),
  pngquant = require('imagemin-pngquant'),
  rigger = require('gulp-rigger'),
  runSequence = require('run-sequence'),
  rimraf = require('rimraf'),
  htmlMin = require("gulp-htmlmin"),
  rename = require("gulp-rename"),
  typography = require('gulp-typograf'),
  // reload = browserSync.reload,
  sass = require('gulp-sass'),
  strip = require('gulp-strip-comments'),
  server = require('browser-sync').create(),
  sourcemaps = require('gulp-sourcemaps'),
  svgStore = require('gulp-svgstore'),
  uglify = require('gulp-uglify-es').default,
  watch = require('gulp-watch'),
  webp = require("gulp-webp"),
  qualityOfImage = 65;

const path = {
  src: {
    style: 'source/sass/style.scss',
    img: 'source/img/',
    fonts: 'source/fonts/',
    js: 'source/js/**/*.js',
    html: '../templates/**/*.html'
  },

  build: {
    build: '../youdo/',
    css: '../youdo/css/',
    js: '../youdo/js/',
    html: '../templates/'
  },

  clean: '../youdo/'
};


gulp.task('style', function () {
  return gulp.src(path.src.style)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(cssmin())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(path.build.css))
    .pipe(server.stream());
});

gulp.task('html', function () {
  return gulp.src(path.src.html)
    .pipe(gulp.dest(path.build.html))
    .pipe(server.stream());
});

// CLEAN
gulp.task('clean', () => {
  return del(path.clean, {
    force: true
  });
});

// COPY
gulp.task('copy', () => {
  return gulp.src([
    'source/img/**',
    'source/fonts/**',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest(path.build.build));
});

// JS
gulp.task('js', () => {
  return gulp.src(path.src.js)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(rigger())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
    .pipe(server.stream());
});

// BUILD
gulp.task("build", done => {
  runSequence(
    'clean',
    'copy',
    'html',
    'style',
    'js',
    done
  );
});

gulp.task("serve", ["style"], () => {
  server.init({
    server: ".",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.scss", ["style"]);
  gulp.watch("source/js/**/*.js", ["js"]);
});

