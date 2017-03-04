var gulp = require("gulp");
var del = require("del");
var mocha = require("gulp-mocha");
var istanbul = require("gulp-istanbul");
var ts = require("gulp-typescript");
var tslint = require("gulp-tslint");
var replace = require("gulp-replace");
var sourcemaps = require("gulp-sourcemaps");
var p = require("./package.json");
var tsNameOf = require("ts-nameof");

gulp.task("typescript", ["clean-scripts"], function() {
    var tsProject = ts.createProject("tsconfig.json", {
        typescript: require("typescript")
    });

    return gulp.src(["./src/**/*.ts"])
        .pipe(sourcemaps.init())
        .pipe(tsNameOf())
        .pipe(ts(tsProject))
        .pipe(replace(/(}\)\()(.*\|\|.*;)/g, '$1/* istanbul ignore next */$2'))
        .pipe(replace(/(var __extends = \(this && this.__extends\))/g, '$1/* istanbul ignore next */'))
        .pipe(replace(/(if \(!exports.hasOwnProperty\(p\)\))/g, '/* istanbul ignore else */ $1'))
        // ignore empty constructors (for mixins and static classes)
        .pipe(replace(/(function [A-Za-z]+\(\) {[\s\n\t]+})/g, '/* istanbul ignore next */ $1'))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./dist"));
});

gulp.task("pre-test", ["typescript"], function () {
    return gulp.src(["dist/**/*.js", "!dist/tests/**/*.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});


gulp.task("test", ["pre-test"], function() {
    return gulp.src("dist/tests/**/*.js")
        .pipe(mocha({ reporter: "progress" }))
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task("tslint", function() {
    return gulp.src(["./src/**/*.ts", "!./src/typings/**/*.d.ts"])
        .pipe(tslint())
        .pipe(tslint.report("verbose"));
});

gulp.task("watch", function() {
    gulp.watch("./src/**/*.ts", ["tslint", "typescript"]);
});

gulp.task("clean-scripts", function(cb) {
    return del(["./dist/**/*"], cb);
});

gulp.task("default", ["tslint", "typescript"]);
