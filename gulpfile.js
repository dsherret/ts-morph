var gulp = require("gulp");
var del = require("del");
var tslint = require("tslint");
var mocha = require("gulp-mocha");
var istanbul = require("gulp-istanbul");
var ts = require("gulp-typescript");
var filter = require("gulp-filter");
var gulpTslint = require("gulp-tslint");
var replace = require("gulp-replace");
var p = require("./package.json");
var tsNameOf = require("ts-nameof");
var merge = require("merge2");
var runSequence = require('run-sequence');

var unusedDefinitionsFilter = filter([
    "**", "!*/factories/CompilerFactory.d.ts", "!*/factories/index.d.ts", "!*/tests/**/*.d.ts", "!*/manipulation/**/*.d.ts"
]);

gulp.task("typescript", ["clean-scripts"], function() {
    var tsProject = ts.createProject("tsconfig.json", {
        typescript: require("typescript")
    });

    var tsResult = gulp.src(["./src/**/*.ts"])
        .pipe(tsNameOf())
        .pipe(ts(tsProject));

    return merge([
        tsResult.dts.pipe(unusedDefinitionsFilter).pipe(gulp.dest('./dist')),
        tsResult.js.pipe(replace(/(}\)\()(.*\|\|.*;)/g, '$1/* istanbul ignore next */$2'))
            .pipe(replace(/(var __[a-z]+ = \(this && this.__[a-z]+\))/g, '$1/* istanbul ignore next */'))
            .pipe(replace(/(if \(!exports.hasOwnProperty\(p\)\))/g, '/* istanbul ignore else */ $1'))
            // ignore empty constructors (for mixins and static classes)
            .pipe(replace(/(function [A-Za-z]+\(\) {[\s\n\t]+})/g, '/* istanbul ignore next */ $1'))
            .pipe(gulp.dest("./dist"))
    ]);
});

gulp.task("test", function() {
    runSequence("typescript", "test-run");
});

gulp.task("pre-test", function () {
    return gulp.src(["dist/**/*.js", "!dist/tests/**/*.js", , "!dist/utils/TypeGuards.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task("test-run", ["pre-test"], function() {
    return gulp.src("dist/tests/**/*.js")
        .pipe(mocha({ reporter: "progress", timeout: 10000 }))
        .on('error', process.exit.bind(process, 1))
        .pipe(istanbul.writeReports());
});

gulp.task("tslint", function() {
    //var program = tslint.Linter.createProgram("./tsconfig.json"); // doesn't seem to work well
    return gulp.src(["./src/**/*.ts", "!./src/typings/**/*.d.ts", "./code-generation/**/*.ts"])
        .pipe(gulpTslint({ formatter: "verbose", /*program*/ }))
        .pipe(gulpTslint.report());
});

gulp.task("watch", function() {
    gulp.watch("./src/**/*.ts", ["tslint", "typescript"]);
});

gulp.task("clean-scripts", ["clean-code-generation"], function(cb) {
    return del(["./dist/**/*"], cb);
});

gulp.task("clean-code-generation", function(cb) {
    return del(["./dist-cg/**/*"], cb);
});

gulp.task("code-generate", ["clean-code-generation"], function (cb) {
    var tsProject = ts.createProject("tsconfig.json", {
        typescript: require("typescript")
    });

    var tsResult = gulp.src(["./{src,code-generation}/**/*.ts"])
        .pipe(tsNameOf())
        .pipe(ts(tsProject));

    return merge([
        tsResult.dts.pipe(unusedDefinitionsFilter).pipe(gulp.dest('./dist-cg')),
        tsResult.js.pipe(gulp.dest("./dist-cg"))
    ]);
});

gulp.task("default", ["tslint", "typescript"]);
