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

gulp.task("copyBuildResources", function() {
    return gulp.src("./src/main/**/!(*.js|*.ts)")
        .pipe(gulp.dest("build/main"));
});

gulp.task("copyTestResources", function() {
    return gulp.src("./src/test/**/!(*.js|*.ts)")
        .pipe(gulp.dest("build/test"));
});

gulp.task("copyAllResources", gulp.parallel("copyBuildResources", "copyTestResources"));

gulp.task("clean", function (done) {
    rimraf(_buildRoot, done);
});

gulp.task("default", gulp.series("clean", gulp.parallel("copyAllResources", "build")));