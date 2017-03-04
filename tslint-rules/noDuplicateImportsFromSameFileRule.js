"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require("tslint/lib/lint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoDuplicateImportsFromSameFileWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = "duplicate imports from same file forbidden";
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var NoDuplicateImportsFromSameFileWalker = (function (_super) {
    __extends(NoDuplicateImportsFromSameFileWalker, _super);
    function NoDuplicateImportsFromSameFileWalker() {
        _super.apply(this, arguments);
        this.fileImportsByFileName = {};
    }
    NoDuplicateImportsFromSameFileWalker.prototype.visitImportDeclaration = function (node) {
        var sourceFile = node.parent;
        var fileImports = this.getFileImports(sourceFile.fileName);
        var importPath = node.moduleSpecifier.text;
        if (fileImports[importPath] != null) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        else {
            fileImports[importPath] = true;
        }
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    NoDuplicateImportsFromSameFileWalker.prototype.getFileImports = function (fileName) {
        this.fileImportsByFileName[fileName] = this.fileImportsByFileName[fileName] || {};
        return this.fileImportsByFileName[fileName];
    };
    return NoDuplicateImportsFromSameFileWalker;
}(Lint.RuleWalker));
