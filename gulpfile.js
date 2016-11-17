var path = require("path");

var gulp = require("gulp");
var ts = require("gulp-typescript");
var sourcemaps = require('gulp-sourcemaps');
var rimraf = require("rimraf");

var _buildRoot = path.join(__dirname, "build");
var _testRoot = path.join(__dirname, "build", "src", "test");

gulp.task("build", function () {
    var tsResult = gulp.src("src/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(ts({}));
    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("build"));
});

gulp.task("copyMainResources", function() {
    return gulp.src("./src/main/**/!(*.js|*.ts)")
        .pipe(gulp.dest("build/main"));
});

// TODO: Replace/augment this with a general-purpose "package" task that copies all node modules
gulp.task("copyExcalibur", function() {
    return gulp.src("./node_modules/excalibur/dist")
        .pipe(gulp.dest("build/main/excalibur"));
});

gulp.task("copyTestResources", function() {
    return gulp.src("./src/test/**/!(*.js|*.ts)")
        .pipe(gulp.dest("build/test"));
});

gulp.task("copyAllResources", gulp.parallel("copyMainResources", "copyExcalibur", "copyTestResources"));

gulp.task("clean", function (done) {
    rimraf(_buildRoot, done);
});

gulp.task("default", gulp.series("clean", gulp.parallel("copyAllResources", "build")));