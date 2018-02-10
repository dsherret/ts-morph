# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="6.12.0"></a>
# [6.12.0](https://github.com/dsherret/ts-simple-ast/compare/6.11.1...6.12.0) (2018-02-10)


### Features

* [#245](https://github.com/dsherret/ts-simple-ast/issues/245) - IndexSignatureDeclaration - Add support for readonly keyword. ([2624f8b](https://github.com/dsherret/ts-simple-ast/commit/2624f8b))



<a name="6.11.1"></a>
## [6.11.1](https://github.com/dsherret/ts-simple-ast/compare/6.11.0...6.11.1) (2018-02-09)


### Bug Fixes

* [#244](https://github.com/dsherret/ts-simple-ast/issues/244) - Fixes setOrder() bug where verify fails incorrectly. ([c7bec28](https://github.com/dsherret/ts-simple-ast/commit/c7bec28))
* Fix failing ts 2.4 test for IndexSignatureDeclaration. ([654e5c2](https://github.com/dsherret/ts-simple-ast/commit/654e5c2))



<a name="6.11.0"></a>
# [6.11.0](https://github.com/dsherret/ts-simple-ast/compare/6.9.0...6.11.0) (2018-02-09)


### Features

* [#242](https://github.com/dsherret/ts-simple-ast/issues/242) - Wrap IndexSignatureDeclaration. ([3dab39f](https://github.com/dsherret/ts-simple-ast/commit/3dab39f))
* Wrap more type nodes. ([9211350](https://github.com/dsherret/ts-simple-ast/commit/9211350))



<a name="6.10.0"></a>
# [6.10.0](https://github.com/dsherret/ts-simple-ast/compare/6.9.0...6.10.0) (2018-02-07)


### Features

* Wrap more type nodes. ([9211350](https://github.com/dsherret/ts-simple-ast/commit/9211350))



<a name="6.9.0"></a>
# [6.9.0](https://github.com/dsherret/ts-simple-ast/compare/6.8.0...6.9.0) (2018-02-04)


### Bug Fixes

* [#239](https://github.com/dsherret/ts-simple-ast/issues/239) - Fix JSDoc.getInnerText() stripping leading spaces. ([b9c56de](https://github.com/dsherret/ts-simple-ast/commit/b9c56de))


### Features

* Add Node.getEndLineNumber() ([f00ca4c](https://github.com/dsherret/ts-simple-ast/commit/f00ca4c))
* Add Symbol.getValueDeclaration() ([91da111](https://github.com/dsherret/ts-simple-ast/commit/91da111))
* Improve inserting to ArrayLiteralExpressions. ([b2e991f](https://github.com/dsherret/ts-simple-ast/commit/b2e991f))



<a name="6.8.0"></a>
# [6.8.0](https://github.com/dsherret/ts-simple-ast/compare/6.7.0...6.8.0) (2018-02-01)


### Features

* Add Node.getFullStart ([9d44185](https://github.com/dsherret/ts-simple-ast/commit/9d44185))
* Upgrade support to TypeScript 2.7. ([dab428a](https://github.com/dsherret/ts-simple-ast/commit/dab428a))



<a name="6.7.0"></a>
# [6.7.0](https://github.com/dsherret/ts-simple-ast/compare/6.6.0...6.7.0) (2018-01-28)


### Bug Fixes

* **type-guards:** A few nodes were not returning true for some type guards. ([f2f64b6](https://github.com/dsherret/ts-simple-ast/commit/f2f64b6))


### Features

* Add CallSignatureDeclaration. ([3067c2b](https://github.com/dsherret/ts-simple-ast/commit/3067c2b))
* Add ClassDeclaration - getExtendsOrThrow() and getBaseClassOrThrow. ([3e24db4](https://github.com/dsherret/ts-simple-ast/commit/3e24db4))
* Add ExternalModuleReference and ImportEqualsDeclaration. ([c140982](https://github.com/dsherret/ts-simple-ast/commit/c140982)), closes [#225](https://github.com/dsherret/ts-simple-ast/issues/225)
* StatementedNode - getStatement(condition) and getStatementByKind(kind). ([db34a13](https://github.com/dsherret/ts-simple-ast/commit/db34a13))



<a name="6.6.0"></a>
# [6.6.0](https://github.com/dsherret/ts-simple-ast/compare/6.5.0...6.6.0) (2018-01-27)


### Bug Fixes

* ClassDeclaration.getBaseClass should return the base class when using mixins. ([b455c60](https://github.com/dsherret/ts-simple-ast/commit/b455c60))
* Exceptions occurring when synchronously calling forgetNodesCreatedInBlock weren't being thrown. ([82798c1](https://github.com/dsherret/ts-simple-ast/commit/82798c1))


### Features

* [#138](https://github.com/dsherret/ts-simple-ast/issues/138) - getInitializerIfKind improvement. ([e0b88ba](https://github.com/dsherret/ts-simple-ast/commit/e0b88ba))
* Add SourceFile getRelativePathToSourceFile and getRelativePathToSourceFileAsModuleSpecifier. ([99e8585](https://github.com/dsherret/ts-simple-ast/commit/99e8585))
* Node.getStartLineNumber and SourceFile.getLineNumberFromPos. ([64178fa](https://github.com/dsherret/ts-simple-ast/commit/64178fa))



<a name="6.5.0"></a>
# [6.5.0](https://github.com/dsherret/ts-simple-ast/compare/6.4.0...6.5.0) (2018-01-26)


### Bug Fixes

* The wrapped Type should be a TypeParameter when it is a ts.TypeParameter. ([23e7e94](https://github.com/dsherret/ts-simple-ast/commit/23e7e94))


### Features

* Add Node.getType() ([2f15bd9](https://github.com/dsherret/ts-simple-ast/commit/2f15bd9))
* Add Type.isTypeParameter type guard. ([02c591f](https://github.com/dsherret/ts-simple-ast/commit/02c591f))



<a name="6.4.0"></a>
# [6.4.0](https://github.com/dsherret/ts-simple-ast/compare/6.3.0...6.4.0) (2018-01-21)


### Features

* [#231](https://github.com/dsherret/ts-simple-ast/issues/231) - Node.formatText() - Format individual nodes. ([34f61ea](https://github.com/dsherret/ts-simple-ast/commit/34f61ea))
* InterfaceDeclaration - getBaseTypes() and getBaseDeclarations() ([9785eeb](https://github.com/dsherret/ts-simple-ast/commit/9785eeb))



<a name="6.3.0"></a>
# [6.3.0](https://github.com/dsherret/ts-simple-ast/compare/6.2.0...6.3.0) (2018-01-20)


### Bug Fixes

* ExportableNode.setIsExported should not remove a default export on a different line. ([fe0bcc0](https://github.com/dsherret/ts-simple-ast/commit/fe0bcc0))
* Fixes setting node as a default export in ambientable situation would throw. ([66ac7e6](https://github.com/dsherret/ts-simple-ast/commit/66ac7e6))
* Some interfaces were missing from being exported from the main file. ([5330aba](https://github.com/dsherret/ts-simple-ast/commit/5330aba))


### Features

* ExportSpecifier - getLocalTargetSymbol() and getLocalTargetDeclarations() ([30eff42](https://github.com/dsherret/ts-simple-ast/commit/30eff42))
* ImportDeclaration & ExportDeclaration - getModuleSpecifierSourceFile ([a42d6a1](https://github.com/dsherret/ts-simple-ast/commit/a42d6a1))
* SourceFile - getExportedDeclarations() ([61663aa](https://github.com/dsherret/ts-simple-ast/commit/61663aa))
* TypeGuards.hasName(node) ([efed188](https://github.com/dsherret/ts-simple-ast/commit/efed188))



<a name="6.2.0"></a>
# [6.2.0](https://github.com/dsherret/ts-simple-ast/compare/6.1.0...6.2.0) (2018-01-14)


### Bug Fixes

* Removing a member throws when surrounding members have JS docs. ([fdc64c9](https://github.com/dsherret/ts-simple-ast/commit/fdc64c9))


### Features

* Node .getStart & .getStartLinePos - add includeJsDocComment. ([af8bb55](https://github.com/dsherret/ts-simple-ast/commit/af8bb55))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/dsherret/ts-simple-ast/compare/6.0.1...6.1.0) (2018-01-14)


### Bug Fixes

* Fix JSDocParameterTag not being wrapped. ([7363481](https://github.com/dsherret/ts-simple-ast/commit/7363481))
* Fix TypeAssertion not being wrapped. ([58fc48c](https://github.com/dsherret/ts-simple-ast/commit/58fc48c))
* Less strict ClassDeclaration getBaseClass ([033deb8](https://github.com/dsherret/ts-simple-ast/commit/033deb8))
* TypeGuards utility was missing some nodes. ([3ddca5d](https://github.com/dsherret/ts-simple-ast/commit/3ddca5d))


### Features

* [#187](https://github.com/dsherret/ts-simple-ast/issues/187) - Added TypeGuards.hasExpression. ([6e37480](https://github.com/dsherret/ts-simple-ast/commit/6e37480))
* Add .getType() to InterfaceDeclaration and ClassDeclaration. ([3c8ca33](https://github.com/dsherret/ts-simple-ast/commit/3c8ca33))
* Add JSDocableNode to ExpressionStatement and LabeledStatement. ([00c2a89](https://github.com/dsherret/ts-simple-ast/commit/00c2a89)), closes [#193](https://github.com/dsherret/ts-simple-ast/issues/193)



<a name="6.0.1"></a>
# [6.0.1](https://github.com/dsherret/ts-simple-ast/compare/6.0.0...6.0.1) (2018-01-13)


### Bug Fixes

* Accidentally released with no jsdocs. ([cf58690](https://github.com/dsherret/ts-simple-ast/commit/cf58690))


<a name="6.0.0"></a>
# [6.0.0](https://github.com/dsherret/ts-simple-ast/compare/5.6.0...6.0.0) (2018-01-13)


### Bug Fixes

* [#203](https://github.com/dsherret/ts-simple-ast/issues/203) - Source file will now be marked as "saved" when updating from file system. ([65f22ac](https://github.com/dsherret/ts-simple-ast/commit/65f22ac))
* [#218](https://github.com/dsherret/ts-simple-ast/issues/218) - Throw an error when a node is constructed outside the library. ([74fa8c1](https://github.com/dsherret/ts-simple-ast/commit/74fa8c1))
* Virtual file system properly handles multiple globs. ([74aaca7](https://github.com/dsherret/ts-simple-ast/commit/74aaca7))


### Code Refactoring

* ast.addExistingSourceFiles now takes either a single glob or multiple globs passed as an array. ([fb5b930](https://github.com/dsherret/ts-simple-ast/commit/fb5b930))


### Features

* [#7](https://github.com/dsherret/ts-simple-ast/issues/7) - Ability to import files from tsconfig. ([b538537](https://github.com/dsherret/ts-simple-ast/commit/b538537))
* [#7](https://github.com/dsherret/ts-simple-ast/issues/7) - Some fixes to importing files from tsconfig. ([2a95bc2](https://github.com/dsherret/ts-simple-ast/commit/2a95bc2))
* [#7](https://github.com/dsherret/ts-simple-ast/issues/7) - Specified compiler options and tsconfig path are both used to determine added files. ([20e7b77](https://github.com/dsherret/ts-simple-ast/commit/20e7b77))
* Support multiple globs when getting source files. ([bb935d9](https://github.com/dsherret/ts-simple-ast/commit/bb935d9))


### BREAKING CHANGES

* Use an array when passing in multiple file globs to ast.addExistingSourceFiles. This better expresses the intent of this method call.
* Files are added based on the tsconfig by default. `getCompilerOptionsFromTsConfig` now returns an object that includes the diagnostics.



<a name="5.6.0"></a>
# [5.6.0](https://github.com/dsherret/ts-simple-ast/compare/5.3.2...5.6.0) (2018-01-13)


### Features

* [#103](https://github.com/dsherret/ts-simple-ast/issues/103) - ClassDeclaration: Add .getBaseTypes() and .getBaseClass() ([e84252b](https://github.com/dsherret/ts-simple-ast/commit/e84252b))
* [#204](https://github.com/dsherret/ts-simple-ast/issues/204) - Add IfStatement. ([095eb24](https://github.com/dsherret/ts-simple-ast/commit/095eb24))
* [#204](https://github.com/dsherret/ts-simple-ast/issues/204) - Add IterationStatement, Do, ForIn, ForOf, For, While ([ce40dee](https://github.com/dsherret/ts-simple-ast/commit/ce40dee))
* [#204](https://github.com/dsherret/ts-simple-ast/issues/204) - Add WithStatement. ([215383a](https://github.com/dsherret/ts-simple-ast/commit/215383a))
* [#213](https://github.com/dsherret/ts-simple-ast/issues/213) - Add NoSubstitutionTemplateLiteral. ([e0fd583](https://github.com/dsherret/ts-simple-ast/commit/e0fd583))
* Add printNode utility function and Node.print() ([d6c2313](https://github.com/dsherret/ts-simple-ast/commit/d6c2313))



<a name="5.5.0"></a>
# [5.5.0](https://github.com/dsherret/ts-simple-ast/compare/5.3.2...5.5.0) (2018-01-11)

Thanks once again to thanks to [@dicarlo2](https://github.com/dicarlo2) for implementing a lot of new expression classes.

### Features

* [#103](https://github.com/dsherret/ts-simple-ast/issues/103) - ClassDeclaration: Add .getBaseTypes() and .getBaseClass() ([e84252b](https://github.com/dsherret/ts-simple-ast/commit/e84252b))
* [#204](https://github.com/dsherret/ts-simple-ast/issues/204) - Add IfStatement. ([095eb24](https://github.com/dsherret/ts-simple-ast/commit/095eb24))
* [#204](https://github.com/dsherret/ts-simple-ast/issues/204) - Add IterationStatement, Do, ForIn, ForOf, For, While ([ce40dee](https://github.com/dsherret/ts-simple-ast/commit/ce40dee))
* [#204](https://github.com/dsherret/ts-simple-ast/issues/204) - Add WithStatement. ([215383a](https://github.com/dsherret/ts-simple-ast/commit/215383a))
* [#213](https://github.com/dsherret/ts-simple-ast/issues/213) - Add NoSubstitutionTemplateLiteral. ([e0fd583](https://github.com/dsherret/ts-simple-ast/commit/e0fd583))



<a name="5.4.0"></a>
# [5.4.0](https://github.com/dsherret/ts-simple-ast/compare/5.3.2...5.4.0) (2018-01-10)

All statement nodes are wrapped thanks to [@dicarlo2](https://github.com/dicarlo2)!

### Features

* [#204](https://github.com/dsherret/ts-simple-ast/issues/204) - Add IfStatement. ([095eb24](https://github.com/dsherret/ts-simple-ast/commit/095eb24))
* [#204](https://github.com/dsherret/ts-simple-ast/issues/204) - Add IterationStatement, Do, ForIn, ForOf, For, While ([ce40dee](https://github.com/dsherret/ts-simple-ast/commit/ce40dee))
* [#204](https://github.com/dsherret/ts-simple-ast/issues/204) - Add WithStatement. ([215383a](https://github.com/dsherret/ts-simple-ast/commit/215383a))



<a name="5.3.2"></a>
## [5.3.2](https://github.com/dsherret/ts-simple-ast/compare/5.3.1...5.3.2) (2018-01-06)


### Bug Fixes

* [#203](https://github.com/dsherret/ts-simple-ast/issues/203) - Source file will now be marked as "saved" when updating from file system. ([fa0dd2c](https://github.com/dsherret/ts-simple-ast/commit/fa0dd2c))



<a name="5.3.1"></a>
## [5.3.1](https://github.com/dsherret/ts-simple-ast/compare/5.3.0...5.3.1) (2018-01-02)


### Bug Fixes

* Directory.getSourceFile should only return source files currently existing within the cache. ([8db2d84](https://github.com/dsherret/ts-simple-ast/commit/8db2d84))



<a name="5.3.0"></a>
# [5.3.0](https://github.com/dsherret/ts-simple-ast/compare/5.2.0...5.3.0) (2018-01-02)


### Bug Fixes

* [#137](https://github.com/dsherret/ts-simple-ast/issues/137) - Improve error message when manipulation throws error. ([34620f0](https://github.com/dsherret/ts-simple-ast/commit/34620f0))
* Changing from namespace to module keyword and vice versa will now change the node kind. ([38dc73b](https://github.com/dsherret/ts-simple-ast/commit/38dc73b))


### Features

* [#200](https://github.com/dsherret/ts-simple-ast/issues/200) - Add BooleanLiteral. ([6cc7917](https://github.com/dsherret/ts-simple-ast/commit/6cc7917))
* [#201](https://github.com/dsherret/ts-simple-ast/issues/201) - Add BinaryExpression. ([71a75bf](https://github.com/dsherret/ts-simple-ast/commit/71a75bf))
* Add Directory.getDescendantDirectories. ([d576acb](https://github.com/dsherret/ts-simple-ast/commit/d576acb))



<a name="5.2.0"></a>
# [5.2.0](https://github.com/dsherret/ts-simple-ast/compare/5.1.0...5.2.0) (2017-12-26)


### Features

* Ability to get source file from directory based on relative or absolute path. ([fb72396](https://github.com/dsherret/ts-simple-ast/commit/fb72396))



<a name="5.1.0"></a>
# [5.1.0](https://github.com/dsherret/ts-simple-ast/compare/5.0.0...5.1.0) (2017-12-26)


### Features

* Add overwrite option to source file and directory copy. ([0741180](https://github.com/dsherret/ts-simple-ast/commit/0741180))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/dsherret/ts-simple-ast/compare/4.2.1...5.0.0) (2017-12-26)


### Bug Fixes

* [#195](https://github.com/dsherret/ts-simple-ast/issues/195) - Fixes emitting directory crashes when directory does not exist. ([57c3381](https://github.com/dsherret/ts-simple-ast/commit/57c3381))
* [#196](https://github.com/dsherret/ts-simple-ast/issues/196) - Fixes directory.copy() crashing when directory already exists. ([def2992](https://github.com/dsherret/ts-simple-ast/commit/def2992))


### Code Refactoring

* [#181](https://github.com/dsherret/ts-simple-ast/issues/181) Rename DocumentationableNode to JSDocableNode. ([59a254e](https://github.com/dsherret/ts-simple-ast/commit/59a254e))
* Getting and inserting/adding imports method names now includes "Declaration". ([97812cf](https://github.com/dsherret/ts-simple-ast/commit/97812cf))


### Features

* [#177](https://github.com/dsherret/ts-simple-ast/issues/177) - Ability to use virtual file system. ([ae27f5b](https://github.com/dsherret/ts-simple-ast/commit/ae27f5b))
* [#191](https://github.com/dsherret/ts-simple-ast/issues/191) - Add SourceFile.getEmitOutput(). ([1707a7d](https://github.com/dsherret/ts-simple-ast/commit/1707a7d))
* [#194](https://github.com/dsherret/ts-simple-ast/issues/194) - Add async version of forget block. ([c73dd05](https://github.com/dsherret/ts-simple-ast/commit/c73dd05))
* Ability to get a directory from directory based on a relative path. ([b7714c5](https://github.com/dsherret/ts-simple-ast/commit/b7714c5))
* Add addDirectoryIfExists and addSourceFileIfExists ([0ff4ff2](https://github.com/dsherret/ts-simple-ast/commit/0ff4ff2))
* Add ast.getFileSystem() ([3364349](https://github.com/dsherret/ts-simple-ast/commit/3364349))
* Add ExportAssignment. ([f2b346b](https://github.com/dsherret/ts-simple-ast/commit/f2b346b))


### BREAKING CHANGES

* All import methods on SourceFile have been renamed to include "declaration" (ex. getImports() -> getImportDeclarations()). This was done for consistency with getExports() -> getExportDeclarations().
* getDocs(), insertDoc(), etc. have been renamed to getJsDocs(), insertJsDoc(), etc...
* All export methods on SourceFile have been renamed to include "declaration" (ex. getExports() -> getExportDeclarations())



<a name="4.2.1"></a>
## [4.2.1](https://github.com/dsherret/ts-simple-ast/compare/4.2.0...4.2.1) (2017-12-23)


### Bug Fixes

* For consistency, directory path should be relative to its path and not the parent. ([f832035](https://github.com/dsherret/ts-simple-ast/commit/f832035))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/dsherret/ts-simple-ast/compare/4.1.0...4.2.0) (2017-12-23)


### Bug Fixes

* [#192](https://github.com/dsherret/ts-simple-ast/issues/192) - Fix forget block crashes when removing node. ([3f195ea](https://github.com/dsherret/ts-simple-ast/commit/3f195ea))
* getDiagnostics() should return the syntactic, semantic, and declaration diagnostics. ([5ea5cfc](https://github.com/dsherret/ts-simple-ast/commit/5ea5cfc))
* Lazily create program and type checker when necessary. ([77b3889](https://github.com/dsherret/ts-simple-ast/commit/77b3889))


### Features

* [#184](https://github.com/dsherret/ts-simple-ast/issues/184) - Ability to copy directories. ([18f1e7b](https://github.com/dsherret/ts-simple-ast/commit/18f1e7b))
* [#185](https://github.com/dsherret/ts-simple-ast/issues/185) - Ability to save all descendant files in a directory. ([334f20b](https://github.com/dsherret/ts-simple-ast/commit/334f20b))
* Add ast.getPreEmitDiagnostics() ([a561994](https://github.com/dsherret/ts-simple-ast/commit/a561994))
* Add SourceFile.getPreEmitDiagnostics ([d1ea9eb](https://github.com/dsherret/ts-simple-ast/commit/d1ea9eb))
* Emit a directory. ([3cb455c](https://github.com/dsherret/ts-simple-ast/commit/3cb455c))
* Program - getSyntacticDiagnostics, getSemanticDiagnostics, getDeclarationDiagnostics, getPreEmitDiagnostics ([56b5f58](https://github.com/dsherret/ts-simple-ast/commit/56b5f58))
* Support TS 2.4, 2.5, and 2.6 ([57c87f8](https://github.com/dsherret/ts-simple-ast/commit/57c87f8))
* Wrap LanguageService.getEmitOutput(...). ([40ecc32](https://github.com/dsherret/ts-simple-ast/commit/40ecc32))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/dsherret/ts-simple-ast/compare/4.0.1...4.1.0) (2017-12-19)


### Bug Fixes

* replaceWithText should include the js docs if they exist. ([304a86a](https://github.com/dsherret/ts-simple-ast/commit/304a86a))


### Features

* [#180](https://github.com/dsherret/ts-simple-ast/issues/180) - Directory - isAncestorOf and isDescendantOf ([7b259d9](https://github.com/dsherret/ts-simple-ast/commit/7b259d9))



<a name="4.0.1"></a>
## [4.0.1](https://github.com/dsherret/ts-simple-ast/compare/4.0.0...4.0.1) (2017-12-17)


### Bug Fixes

* createDirectory should throw if the directory exists. ([93a9da2](https://github.com/dsherret/ts-simple-ast/commit/93a9da2))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/dsherret/ts-simple-ast/compare/3.2.0...4.0.0) (2017-12-17)


### Code Refactoring

* [#170](https://github.com/dsherret/ts-simple-ast/issues/170) - Rename methods on main api. ([07f27c4](https://github.com/dsherret/ts-simple-ast/commit/07f27c4))


### Features

* [#169](https://github.com/dsherret/ts-simple-ast/issues/169) - Directories. ([332c44d](https://github.com/dsherret/ts-simple-ast/commit/332c44d))
* [#173](https://github.com/dsherret/ts-simple-ast/issues/173) - SemicolonToken type guard. ([77d600a](https://github.com/dsherret/ts-simple-ast/commit/77d600a))
* [#174](https://github.com/dsherret/ts-simple-ast/issues/174) - Getting a source file by name or condition walks directories. ([e4f4b45](https://github.com/dsherret/ts-simple-ast/commit/e4f4b45))


### BREAKING CHANGES

* Renamed methods for creating & adding source files. See #170 for details.



<a name="3.2.0"></a>
# [3.2.0](https://github.com/dsherret/ts-simple-ast/compare/3.1.0...3.2.0) (2017-12-12)


### Features

* [#166](https://github.com/dsherret/ts-simple-ast/issues/166) - Add ReturnStatement. ([23eccf1](https://github.com/dsherret/ts-simple-ast/commit/23eccf1))
* [#168](https://github.com/dsherret/ts-simple-ast/issues/168) - Add SourceFile.refreshFromFileSystem() ([9ddcdd4](https://github.com/dsherret/ts-simple-ast/commit/9ddcdd4))
* Add Node.getSymbolOrThrow() ([6abbe7f](https://github.com/dsherret/ts-simple-ast/commit/6abbe7f))
* Add SourceFile.getDirectoryPath(). ([708f3bb](https://github.com/dsherret/ts-simple-ast/commit/708f3bb))
* Get exports from symbol. ([c815955](https://github.com/dsherret/ts-simple-ast/commit/c815955))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/dsherret/ts-simple-ast/compare/3.0.2...3.1.0) (2017-12-10)


### Features

* [#164](https://github.com/dsherret/ts-simple-ast/issues/164) - Support ExpressionStatements. ([d7d48a1](https://github.com/dsherret/ts-simple-ast/commit/d7d48a1))
* Support deleting a file from the file system. ([326b6e0](https://github.com/dsherret/ts-simple-ast/commit/326b6e0))



<a name="3.0.2"></a>
## [3.0.2](https://github.com/dsherret/ts-simple-ast/compare/3.0.1...3.0.2) (2017-12-10)


### Bug Fixes

* **manipulation:** Brace possibly placed at wrong indentation when manipulating comma & newline separated node. ([5318c0f](https://github.com/dsherret/ts-simple-ast/commit/5318c0f))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/dsherret/ts-simple-ast/compare/3.0.0...3.0.1) (2017-12-09)



<a name="3.0.0"></a>
# [3.0.0](https://github.com/dsherret/ts-simple-ast/compare/2.0.0...3.0.0) (2017-12-09)


### Bug Fixes

* ShorthandPropertyAssignment.removeObjectAssignmentInitializer was incorrectly returning undefined. ([62e2971](https://github.com/dsherret/ts-simple-ast/commit/62e2971))


### Code Refactoring

* [#160](https://github.com/dsherret/ts-simple-ast/issues/160) - Remove DocumentationableNode.getDocumentationComment ([54c94b1](https://github.com/dsherret/ts-simple-ast/commit/54c94b1))


### Features

* [#131](https://github.com/dsherret/ts-simple-ast/issues/131) - Ability to add statements within blocks. ([f2bb4de](https://github.com/dsherret/ts-simple-ast/commit/f2bb4de))
* [#145](https://github.com/dsherret/ts-simple-ast/issues/145) - Add JSDoc.getInnerText - Returns text without surrounding comment. ([a62cec4](https://github.com/dsherret/ts-simple-ast/commit/a62cec4))
* [#161](https://github.com/dsherret/ts-simple-ast/issues/161) - Rename getDocumentationCommentNodes to getDocNodes ([d29820f](https://github.com/dsherret/ts-simple-ast/commit/d29820f))
* [#42](https://github.com/dsherret/ts-simple-ast/issues/42) - Ability to pass in type checker to wrapped node. ([62b377f](https://github.com/dsherret/ts-simple-ast/commit/62b377f))
* [#59](https://github.com/dsherret/ts-simple-ast/issues/59) - Get parameter, type parameter, or decorator by name. ([f889515](https://github.com/dsherret/ts-simple-ast/commit/f889515))


### BREAKING CHANGES

* Removed DocumentationableNode.getDocumentationComment.
* getDocumentationCommentNodes is now getDocNodes.
* createWrappedNode's signature changed.



<a name="2.0.0"></a>
# [2.0.0](https://github.com/dsherret/ts-simple-ast/compare/1.3.0...2.0.0) (2017-12-08)


### Features

* [#37](https://github.com/dsherret/ts-simple-ast/issues/37) - Add StringLiteral.getQuoteType ([adad446](https://github.com/dsherret/ts-simple-ast/commit/adad446))
* SourceFile.formatText uses the formatting API. ([02e3feb](https://github.com/dsherret/ts-simple-ast/commit/02e3feb)), closes [#157](https://github.com/dsherret/ts-simple-ast/issues/157) [#158](https://github.com/dsherret/ts-simple-ast/issues/158)


### BREAKING CHANGES

* StringChar renamed to QuoteType. Manipulation setting's getStringChar() renamed to getQuoteType().

This was done for consistency.
* SourceFile.formatText now takes a FormatCodeSettings argument.



<a name="1.3.0"></a>
# [1.3.0](https://github.com/dsherret/ts-simple-ast/compare/1.2.0...1.3.0) (2017-12-05)


### Bug Fixes

* [#150](https://github.com/dsherret/ts-simple-ast/issues/150) - Fix SourceFile.addImport not using the specified string char. ([e704330](https://github.com/dsherret/ts-simple-ast/commit/e704330))


### Features

* Upgrade to code-block-writer 6.2.0 ([155f935](https://github.com/dsherret/ts-simple-ast/commit/155f935))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/dsherret/ts-simple-ast/compare/1.1.0...1.2.0) (2017-12-04)


### Bug Fixes

* [#149](https://github.com/dsherret/ts-simple-ast/issues/149) - "SourceFile.formatText() should respect indentation settings" ([b0b9e53](https://github.com/dsherret/ts-simple-ast/commit/b0b9e53))


### Features

* Add isInStringAtPos to Node. ([cfcf256](https://github.com/dsherret/ts-simple-ast/commit/cfcf256))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/dsherret/ts-simple-ast/compare/1.0.0...1.1.0) (2017-12-03)


### Features

* [#65](https://github.com/dsherret/ts-simple-ast/issues/65) - Navigation and manipulation of object literal expressions. ([d9d1621](https://github.com/dsherret/ts-simple-ast/commit/d9d1621))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/dsherret/ts-simple-ast/compare/0.99.0...1.0.0) (2017-11-28)


### Bug Fixes

* Renamed setIsOptional to setHasQuestionToken for consistency. ([ac45bba](https://github.com/dsherret/ts-simple-ast/commit/ac45bba))


### BREAKING CHANGES

* QuestionTokenableNode.setIsOptional is now setHasQuestionToken.



<a name="0.99.0"></a>
# [0.99.0](https://github.com/dsherret/ts-simple-ast/compare/0.98.0...0.99.0) (2017-11-28)


### Features

* **Manipulation:** [#65](https://github.com/dsherret/ts-simple-ast/issues/65) - Setting and removing initializers from (Shorthand)PropertyAssignments ([dc3a61c](https://github.com/dsherret/ts-simple-ast/commit/dc3a61c))
* **Node:** Getting child of node at index. ([cb0a800](https://github.com/dsherret/ts-simple-ast/commit/cb0a800))



<a name="0.98.0"></a>
# [0.98.0](https://github.com/dsherret/ts-simple-ast/compare/0.97.0...0.98.0) (2017-11-27)


### Features

* **navigation:** [#140](https://github.com/dsherret/ts-simple-ast/issues/140) - Forget blocks. ([f5a8b39](https://github.com/dsherret/ts-simple-ast/commit/f5a8b39))


### Performance Improvements

* Don't internally add nodes to the cache so often for common navigation methods. ([7efc147](https://github.com/dsherret/ts-simple-ast/commit/7efc147))
