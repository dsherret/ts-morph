# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="12.4.0"></a>
# [12.4.0](https://github.com/dsherret/ts-simple-ast/compare/12.2.0...12.4.0) (2018-06-10)


### Features

* [#342](https://github.com/dsherret/ts-simple-ast/issues/342) - Finish work on removing property assignment. ([9e35623](https://github.com/dsherret/ts-simple-ast/commit/9e35623))
* [#343](https://github.com/dsherret/ts-simple-ast/issues/343) - Ability to remove more object literal expression members ([e82d45f](https://github.com/dsherret/ts-simple-ast/commit/e82d45f))
* Add ability to add/insert type parameters with a default type node. ([cd05c3f](https://github.com/dsherret/ts-simple-ast/commit/cd05c3f))
* Add SourceFile.isFromExternalLibrary ([136a2da](https://github.com/dsherret/ts-simple-ast/commit/136a2da))
* Add Symbol.getEscapedName() ([4360bab](https://github.com/dsherret/ts-simple-ast/commit/4360bab))
* Add TypeParameterDeclaration - getConstraintOrThrow() and getDefaultOrThrow() ([8e8166b](https://github.com/dsherret/ts-simple-ast/commit/8e8166b))
* TypeParameterDeclaration - Add .removeDefault() and .removeConstraint() ([7a9d329](https://github.com/dsherret/ts-simple-ast/commit/7a9d329))
* TypeParameterDeclaration - Add .setDefault(text) and .setConstraint(text) ([de9d91b](https://github.com/dsherret/ts-simple-ast/commit/de9d91b))



<a name="12.3.0"></a>
# [12.3.0](https://github.com/dsherret/ts-simple-ast/compare/12.2.0...12.3.0) (2018-06-09)


### Features

* [#342](https://github.com/dsherret/ts-simple-ast/issues/342) - Ability to remove more object literal expression members ([e82d45f](https://github.com/dsherret/ts-simple-ast/commit/e82d45f),
  [9e35623](https://github.com/dsherret/ts-simple-ast/commit/9e35623)) -- Thanks [@cancerberoSgx](https://github.com/cancerberoSgx) for the help!

### Bug Fixes

* [#340](https://github.com/dsherret/ts-simple-ast/pull/340) - Fix insert/remove support for Block ([@cancerberoSgx](https://github.com/cancerberoSgx)).

<a name="12.2.0"></a>
# [12.2.0](https://github.com/dsherret/ts-simple-ast/compare/12.1.0...12.2.0) (2018-06-04)


### Features

* Add Node.getStartColumn(), Node.getEndColumn(), SourceFile.getColumnAtPos(pos). ([5119e83](https://github.com/dsherret/ts-simple-ast/commit/5119e83))
* Add UserPreferences on sourceFile.organizeImports() ([6b0a089](https://github.com/dsherret/ts-simple-ast/commit/6b0a089))



<a name="12.1.0"></a>
# [12.1.0](https://github.com/dsherret/ts-simple-ast/compare/12.0.0...12.1.0) (2018-06-04)


### Features

* Add ImportTypeNode. ([3d0203c](https://github.com/dsherret/ts-simple-ast/commit/3d0203c))
* ImportTypeNode - setArgument and setQualifier ([e94bbd4](https://github.com/dsherret/ts-simple-ast/commit/e94bbd4))
* Improvements to CompilerNodeToWrappedType. ([384613a](https://github.com/dsherret/ts-simple-ast/commit/384613a))



<a name="12.0.0"></a>
# [12.0.0](https://github.com/dsherret/ts-simple-ast/compare/11.3.0...12.0.0) (2018-06-03)


### Code Refactoring

* Remove .getReferencingNodes() found on some nodes and languageService.getDefinitionReferencingNodes() ([a20cd4e](https://github.com/dsherret/ts-simple-ast/commit/a20cd4e))


### Features

* [#302](https://github.com/dsherret/ts-simple-ast/issues/302) - Add CompilerNodeToWrappedType. ([0ce5af5](https://github.com/dsherret/ts-simple-ast/commit/0ce5af5))
* [#304](https://github.com/dsherret/ts-simple-ast/issues/304) - Improve getNodeProperty by using condition types. Add CompilerNodeToWrapperMappings. ([5bd2926](https://github.com/dsherret/ts-simple-ast/commit/5bd2926))
* [#337](https://github.com/dsherret/ts-simple-ast/issues/337) - Add DiagnosticWithLocation. ([f1f700e](https://github.com/dsherret/ts-simple-ast/commit/f1f700e))
* [#337](https://github.com/dsherret/ts-simple-ast/issues/337) - Add DocumentSpan - getOriginalTextSpan and getOriginalFileName ([254bea8](https://github.com/dsherret/ts-simple-ast/commit/254bea8))
* [#337](https://github.com/dsherret/ts-simple-ast/issues/337) - DefinitionInfo now extends DocumentSpan as done in ts 2.9. ([c1ff983](https://github.com/dsherret/ts-simple-ast/commit/c1ff983))
* [#338](https://github.com/dsherret/ts-simple-ast/issues/338) - Add Diagnostic.getLineNumber() ([4cba457](https://github.com/dsherret/ts-simple-ast/commit/4cba457))
* Add Type: isUnionOrIntersection, isClass, and isClassOrInterface. ([12c4710](https://github.com/dsherret/ts-simple-ast/commit/12c4710))
* Add UserPreferences and new organizeImports parameter ([a7864f1](https://github.com/dsherret/ts-simple-ast/commit/a7864f1))
* Update to TypeScript 2.9. ([da45aae](https://github.com/dsherret/ts-simple-ast/commit/da45aae))


### BREAKING CHANGES

* `getNodeProperty` functionality requires TS 2.8 or greater due to mapped types.
* DefinitionInfo.getNode() is now DefinitionInfo.getDeclarationNode() for compatibility with DocumentSpan.
* getReferencingNodes and getDefinitionReferencingNodes are both renamed to .findReferencesAsNodes(). This is so the method is more discoverable in auto complete when looking at .findReferences().
* Renamed all Type.isXType() methods to Type.isX() to match what's done in the compiler api and to remove needless repetition in name.
* Updating to TypeScript 2.9 introduces some changes in behaviour and breaking changes in the compiler API declaration file.



<a name="11.3.0"></a>
# [11.3.0](https://github.com/dsherret/ts-simple-ast/compare/11.2.2...11.3.0) (2018-06-01)


### Features

* Add .findReferencesAsNodes() to deprecate .getReferencingNodes() in next major. ([a8a731a](https://github.com/dsherret/ts-simple-ast/commit/a8a731a))



<a name="11.2.2"></a>
## [11.2.2](https://github.com/dsherret/ts-simple-ast/compare/11.2.1...11.2.2) (2018-06-01)


### Bug Fixes

* [#336](https://github.com/dsherret/ts-simple-ast/issues/336) - Calling .remove() incorrectly removes next sibling's leading comments. ([aab1c1b](https://github.com/dsherret/ts-simple-ast/commit/aab1c1b))
* sourceFile.getTrailingTriviaEnd() should return the end position of the source file. ([ff6b3b3](https://github.com/dsherret/ts-simple-ast/commit/ff6b3b3))



<a name="11.2.1"></a>
## [11.2.1](https://github.com/dsherret/ts-simple-ast/compare/11.2.0...11.2.1) (2018-05-28)


### Bug Fixes

* [#335](https://github.com/dsherret/ts-simple-ast/issues/335) - addStatements would throw if the containing block was only indented a portion of an indentation level. ([c93104c](https://github.com/dsherret/ts-simple-ast/commit/c93104c))



<a name="11.2.0"></a>
# [11.2.0](https://github.com/dsherret/ts-simple-ast/compare/11.1.1...11.2.0) (2018-05-08)


### Features

* [#251](https://github.com/dsherret/ts-simple-ast/issues/251) - Add importDeclaration.removeNamespaceImport() and .getNamespaceImportOrThrow() ([0250138](https://github.com/dsherret/ts-simple-ast/commit/0250138))
* Add ImportDeclaration.getImportClause() and .getImportClauseOrThrow() ([8d99c27](https://github.com/dsherret/ts-simple-ast/commit/8d99c27))
* Node.preprendWhitespace(textOrWriterFunction) and .appendWhitespace(textOrWriterFunction) ([a43cb65](https://github.com/dsherret/ts-simple-ast/commit/a43cb65))
* Update code-block-writer version. Adds .tab(), .tabIfLastNot(), and .isLastTab(). ([903b8ac](https://github.com/dsherret/ts-simple-ast/commit/903b8ac))



<a name="11.1.1"></a>
## [11.1.1](https://github.com/dsherret/ts-simple-ast/compare/11.1.0...11.1.1) (2018-05-05)


### Bug Fixes

* [#269](https://github.com/dsherret/ts-simple-ast/issues/269) - Support "extends" in tsconfig.json. ([4964bb7](https://github.com/dsherret/ts-simple-ast/commit/4964bb7))



<a name="11.1.0"></a>
# [11.1.0](https://github.com/dsherret/ts-simple-ast/compare/11.0.0...11.1.0) (2018-05-01)


### Features

* Ability to add/insert an argument with a writer. ([e1bcb6a](https://github.com/dsherret/ts-simple-ast/commit/e1bcb6a))
* Ability to set a DecoratorStructure's arguments using a writer function. ([585793c](https://github.com/dsherret/ts-simple-ast/commit/585793c))
* Ability to set a IndexSignatureDeclaration's return type using a writer function. ([0d6526d](https://github.com/dsherret/ts-simple-ast/commit/0d6526d))
* Ability to set a JSDoc's description in a structure by using a writer. ([0250ae1](https://github.com/dsherret/ts-simple-ast/commit/0250ae1))
* Ability to set a PropertyAssignment's initializer using a writer function. ([b633937](https://github.com/dsherret/ts-simple-ast/commit/b633937))
* Ability to set a return type with a writer. ([3db81f8](https://github.com/dsherret/ts-simple-ast/commit/3db81f8))
* Ability to set a SourceFileStructure's bodyText using a writer function. ([792c530](https://github.com/dsherret/ts-simple-ast/commit/792c530))
* Ability to set a SpreadAssignmentStructure's expression using a writer function. ([e7e0158](https://github.com/dsherret/ts-simple-ast/commit/e7e0158))
* Ability to set a type with a writer. ([5dc3565](https://github.com/dsherret/ts-simple-ast/commit/5dc3565))



<a name="11.0.0"></a>
# [11.0.0](https://github.com/dsherret/ts-simple-ast/compare/10.5.0...11.0.0) (2018-04-29)


### Bug Fixes

* [#312](https://github.com/dsherret/ts-simple-ast/issues/312) - StatementedNode uses inconsistent source for child count. ([67a22b9](https://github.com/dsherret/ts-simple-ast/commit/67a22b9))
* Directory.copy should not update module specifiers pointing to other files in the directory being copied. ([09244f9](https://github.com/dsherret/ts-simple-ast/commit/09244f9))


### Chores

* Update FileSystemHost to have move and copy methods. ([4401755](https://github.com/dsherret/ts-simple-ast/commit/4401755))
* Update to code-block-writer 7.0.0. ([7121e0d](https://github.com/dsherret/ts-simple-ast/commit/7121e0d))


### Code Refactoring

* code-block-writer is now a named export. ([412482c](https://github.com/dsherret/ts-simple-ast/commit/412482c))
* createDirectory will not throw if the directory exists. ([7be9dba](https://github.com/dsherret/ts-simple-ast/commit/7be9dba))
* Remove Directory.remove() ([0ba8ba0](https://github.com/dsherret/ts-simple-ast/commit/0ba8ba0))
* Remove getRelativePathToSourceFile and getRelativePathToSourceFileAsModuleSpecifier. ([734b7a0](https://github.com/dsherret/ts-simple-ast/commit/734b7a0))
* Remove Identifier.getDefinitionReferencingNodes() ([2b1446a](https://github.com/dsherret/ts-simple-ast/commit/2b1446a))
* Removed ExportAssignmentStructure.isEqualsExport ([0b098a5](https://github.com/dsherret/ts-simple-ast/commit/0b098a5))
* Rename AddDirectoryOptions to DirectoryAddOptions ([ccd1627](https://github.com/dsherret/ts-simple-ast/commit/ccd1627))
* Rename CreateSourceFileOptions to SourceFileCreateOptions and AddSourceFileOptions to SourceFileAddOptions. ([0a39f15](https://github.com/dsherret/ts-simple-ast/commit/0a39f15))


### Features

* [#256](https://github.com/dsherret/ts-simple-ast/issues/256) - Add Directory.copyImmediately. ([f2b01dc](https://github.com/dsherret/ts-simple-ast/commit/f2b01dc))
* [#256](https://github.com/dsherret/ts-simple-ast/issues/256) - Add Directory.move(...) ([29b776a](https://github.com/dsherret/ts-simple-ast/commit/29b776a))
* [#256](https://github.com/dsherret/ts-simple-ast/issues/256) - Add Directory.moveImmediately. ([255d01c](https://github.com/dsherret/ts-simple-ast/commit/255d01c))
* [#311](https://github.com/dsherret/ts-simple-ast/issues/311) - Allow providing a string instead of a JSDoc structure. ([a0b16e6](https://github.com/dsherret/ts-simple-ast/commit/a0b16e6))
* [#320](https://github.com/dsherret/ts-simple-ast/issues/320) - Add ability to set initializer in a structure with a writer function. ([20e51ed](https://github.com/dsherret/ts-simple-ast/commit/20e51ed))
* [#324](https://github.com/dsherret/ts-simple-ast/issues/324) - Added ClassDeclaration.insertConstructors() and addConstructors(). ([2aefd93](https://github.com/dsherret/ts-simple-ast/commit/2aefd93))
* Ability to set an initializer's text using a writer. ([2c1a9e5](https://github.com/dsherret/ts-simple-ast/commit/2c1a9e5))
* Add Directory.forget(). Will deprecate Directory.remove() in next major. ([f584d20](https://github.com/dsherret/ts-simple-ast/commit/f584d20))
* ImportDeclaration.getDefaultImportOrThrow() ([499c741](https://github.com/dsherret/ts-simple-ast/commit/499c741))
* Upgrade from TypeScript 2.8.1 to 2.8.3. ([106e17e](https://github.com/dsherret/ts-simple-ast/commit/106e17e))


### BREAKING CHANGES

* ClassDeclarationStructure.ctor is renamed ctors. It accepts multiple constructors now. Additionally, insertConstructor and addConstructor on ClassDeclaration does not remove the existing constructor if it exists.
* Directory.copy correctly does not update module specifiers pointing to other files in the directory being copied.
* Updated to code-block-writer 7.0.0. The writer methods `newLineIfLastNotNewLine`, `blankLineIfLastNotBlankLine`, and `spaceIfLastNotSpace`, are removed. Use the shorter method names like `spaceIfLastNot`.
* AddDirectoryOptions -> DirectoryAddOptions
* CreateSourceFileOptions -> SourceFileCreateOptions, AddSourceFileOptions -> SourceFileAddOptions
* The FileSystemHost interface now has move and copy methods.
* code-block-writer is now exported as a named export from the library (`CodeBlockWriter`).
* Directory.remove() is now Directory.forget() for consistency with SourceFile.
* SourceFile.getRelativePathToSourceFile and getRelativePathToSourceFileAsModuleSpecifier is now getRelativePathTo and getRelativePathAsModuleSpecifierTo respectively.
* ExportAssignmentStructure.isEqualsExport is now isExportEquals. This was incorrectly named.
* Identifier.getDefinitionReferencingNodes() is now getReferencingNodes().
* createDirectory will not throw if the directory exists.



<a name="10.5.0"></a>
# [10.5.0](https://github.com/dsherret/ts-simple-ast/compare/10.3.3...10.5.0) (2018-04-20)


### Bug Fixes

* Fix getting the relative path as a module specifier to the index file in the root directory. ([80ba49c](https://github.com/dsherret/ts-simple-ast/commit/80ba49c))


### Features

* [#317](https://github.com/dsherret/ts-simple-ast/issues/317) - Make Identifier a ReferenceFindableNode. ([652d00d](https://github.com/dsherret/ts-simple-ast/commit/652d00d))
* Add `Directory.getRelativePathAsModuleSpecifierTo` and `getRelativePathTo` ([5d5fa08](https://github.com/dsherret/ts-simple-ast/commit/5d5fa08))
* Add SourceFile.getRelativePathTo and getRelativePathAsModuleSpecifierTo. ([04f91eb](https://github.com/dsherret/ts-simple-ast/commit/04f91eb))



<a name="10.4.0"></a>
# [10.4.0](https://github.com/dsherret/ts-simple-ast/compare/10.3.3...10.4.0) (2018-04-18)


### Features

* [#317](https://github.com/dsherret/ts-simple-ast/issues/317) - Make Identifier a ReferenceFindableNode. ([652d00d](https://github.com/dsherret/ts-simple-ast/commit/652d00d))



<a name="10.3.3"></a>
## [10.3.3](https://github.com/dsherret/ts-simple-ast/compare/10.3.2...10.3.3) (2018-04-17)


### Bug Fixes

* [#125](https://github.com/dsherret/ts-simple-ast/issues/125) - Inserting a namespace or class into an ambient module/namespace should not write as non-ambient. ([a3c6291](https://github.com/dsherret/ts-simple-ast/commit/a3c6291))
* [#316](https://github.com/dsherret/ts-simple-ast/issues/316) - Getting references between source files was broken when the importHelpers compiler option was true. ([701e936](https://github.com/dsherret/ts-simple-ast/commit/701e936))



<a name="10.3.2"></a>
## [10.3.2](https://github.com/dsherret/ts-simple-ast/compare/10.3.1...10.3.2) (2018-04-15)


### Bug Fixes

* [#104](https://github.com/dsherret/ts-simple-ast/issues/104) - Fix documentation with compile errors. ([9d16ab4](https://github.com/dsherret/ts-simple-ast/commit/9d16ab4))
* ExportAssignmentStructure.isEqualsExport should be isExportEquals. Deprecated until next major. ([1189352](https://github.com/dsherret/ts-simple-ast/commit/1189352))
* ExportDeclaration.addNamedExport method overload was a duplicate of the other one. ([3715875](https://github.com/dsherret/ts-simple-ast/commit/3715875))



<a name="10.3.1"></a>
# [10.3.1](https://github.com/dsherret/ts-simple-ast/compare/10.3.0...10.3.1) (2018-04-15)


### Bug Fixes

* [#308](https://github.com/dsherret/ts-simple-ast/issues/308) - Should not insert before the BOM. ([07a2a51](https://github.com/dsherret/ts-simple-ast/commit/07a2a51))
* [#314](https://github.com/dsherret/ts-simple-ast/issues/314) - Fix moved source file not being marked as dirty in reference cache after move. ([91b1fbd](https://github.com/dsherret/ts-simple-ast/commit/91b1fbd))
* Should update a module specifier to a source file that was added after the internal reference cache was filled. ([d6c02b1](https://github.com/dsherret/ts-simple-ast/commit/d6c02b1))



<a name="10.3.0"></a>
# [10.3.0](https://github.com/dsherret/ts-simple-ast/compare/10.1.0...10.3.0) (2018-04-11)


### Features

* [#306](https://github.com/dsherret/ts-simple-ast/issues/306) - Add Node.forEachChild and Node.forEachDescendant ([9eabe57](https://github.com/dsherret/ts-simple-ast/commit/9eabe57))



<a name="10.2.0"></a>
# [10.2.0](https://github.com/dsherret/ts-simple-ast/compare/10.1.0...10.2.0) (2018-04-08)

Lots of performance improvements in this release. These performance improvements may have introduced bugs, so let me know about any issues!


### Bug Fixes

* Fix out of date TypeGuards by regenerating them. ([23eca82](https://github.com/dsherret/ts-simple-ast/commit/23eca82))


### Features

* [#300](https://github.com/dsherret/ts-simple-ast/issues/300) - Fix more nodes to have .findReferences() and .getReferencingNodes() ([9ae7383](https://github.com/dsherret/ts-simple-ast/commit/9ae7383))
* TypeGuards.hasBody(node). ([4041dfd](https://github.com/dsherret/ts-simple-ast/commit/4041dfd))



<a name="10.1.0"></a>
# [10.1.0](https://github.com/dsherret/ts-simple-ast/compare/10.0.1...10.1.0) (2018-04-01)


### Bug Fixes

* [#219](https://github.com/dsherret/ts-simple-ast/issues/219) - Removing the last statement in a default or case clause will cause a double newline. ([d46cbd0](https://github.com/dsherret/ts-simple-ast/commit/d46cbd0))
* [#261](https://github.com/dsherret/ts-simple-ast/issues/261) - sourceFile.getRelativePathToSourceFileAsModuleSpecifier(...) should not strip "index" file name when module resolution is classic. ([5ce71ac](https://github.com/dsherret/ts-simple-ast/commit/5ce71ac))
* Update to code-block-writer 6.7.2. ([eb5bd38](https://github.com/dsherret/ts-simple-ast/commit/eb5bd38))


### Features

* [#237](https://github.com/dsherret/ts-simple-ast/issues/237) - Add node.getLeadingCommentRanges() and .getTrailingCommentRanges(). ([9678b3d](https://github.com/dsherret/ts-simple-ast/commit/9678b3d))
* [#297](https://github.com/dsherret/ts-simple-ast/issues/297) - Simpler findReferences() and getDefinitions() that only returns nodes. ([4048116](https://github.com/dsherret/ts-simple-ast/commit/4048116))
* Add Node.getLeadingTriviaWidth(). ([09bdd01](https://github.com/dsherret/ts-simple-ast/commit/09bdd01))
* Add Node.getTrailingTriviaEnd() and .getTrailingTriviaWidth() ([98cd0b0](https://github.com/dsherret/ts-simple-ast/commit/98cd0b0))
* Add Program.getEmitModuleResolutionKind(). ([447573f](https://github.com/dsherret/ts-simple-ast/commit/447573f))
* Add Project.createWriter(). ([914f503](https://github.com/dsherret/ts-simple-ast/commit/914f503))



<a name="10.0.0"></a>
# [10.0.0](https://github.com/dsherret/ts-simple-ast/compare/9.5.0...10.0.0) (2018-03-29)


### Bug Fixes

* Change formatting settings insertSpaceAfterSemicolonInForStatements to be true by default. ([b74dfd9](https://github.com/dsherret/ts-simple-ast/commit/b74dfd9))
* Setting string literal value by string should escape newlines and quote chars. ([d68b6b9](https://github.com/dsherret/ts-simple-ast/commit/d68b6b9))
* Should escape quote char in passed in string to EnumMember.setValue(...); ([7134702](https://github.com/dsherret/ts-simple-ast/commit/7134702))
* Should write initializer if provided in EnumMemberStructure. ([35095dc](https://github.com/dsherret/ts-simple-ast/commit/35095dc))


### Code Refactoring

* addDirectoryIfExists -> addExistingDirectoryIfExists ([6bb08cd](https://github.com/dsherret/ts-simple-ast/commit/6bb08cd))
* Project & Directory, addSourceFileIfExists -> addExistingSourceFileIfExists. ([18caa1c](https://github.com/dsherret/ts-simple-ast/commit/18caa1c))
* Renamed QuoteType to QuoteKind. ([964571a](https://github.com/dsherret/ts-simple-ast/commit/964571a))


### Features

* [#154](https://github.com/dsherret/ts-simple-ast/issues/154) - Configuration for spaces surrounding named imports and exports. ([76ce4ad](https://github.com/dsherret/ts-simple-ast/commit/76ce4ad))
* [#268](https://github.com/dsherret/ts-simple-ast/issues/268) - Ancestor directories are now lazily loaded. ([1169b54](https://github.com/dsherret/ts-simple-ast/commit/1169b54))
* [#273](https://github.com/dsherret/ts-simple-ast/issues/273) - Add overwrite option to createSourceFile. ([ddcd03e](https://github.com/dsherret/ts-simple-ast/commit/ddcd03e))
* [#286](https://github.com/dsherret/ts-simple-ast/issues/286) - Populate all directories as specified in tsconfig.json ([206e795](https://github.com/dsherret/ts-simple-ast/commit/206e795))
* [#287](https://github.com/dsherret/ts-simple-ast/issues/287) - Descendant directories are populated based on file globs passed to addExistingSourceFiles ([402d395](https://github.com/dsherret/ts-simple-ast/commit/402d395))
* [#291](https://github.com/dsherret/ts-simple-ast/issues/291) - Add Type: isNumberLiteral, isStringLiteral(), and isBooleanLiteral(). ([10e40cb](https://github.com/dsherret/ts-simple-ast/commit/10e40cb))
* [#293](https://github.com/dsherret/ts-simple-ast/issues/293) - Upgrade to TypeScript 2.8.1 ([16e5962](https://github.com/dsherret/ts-simple-ast/commit/16e5962))
* [#294](https://github.com/dsherret/ts-simple-ast/issues/294) - Add sourceFile.organizeImports() ([4f3b2ff](https://github.com/dsherret/ts-simple-ast/commit/4f3b2ff))
* [#294](https://github.com/dsherret/ts-simple-ast/issues/294) - Wrap languageService.organizeImports(...). ([154bf2e](https://github.com/dsherret/ts-simple-ast/commit/154bf2e))
* [#295](https://github.com/dsherret/ts-simple-ast/issues/295) - ClassDeclaration now has a nullable name. ([96b9857](https://github.com/dsherret/ts-simple-ast/commit/96b9857))
* Add ImportDeclaration & ExportDeclaration .getModuleSpecifierValue(). ([1785054](https://github.com/dsherret/ts-simple-ast/commit/1785054))
* Add new project.compilerOptions property that has the ability to change the compiler options. ([4da80ba](https://github.com/dsherret/ts-simple-ast/commit/4da80ba))
* Add SourceFile.getLanguageVersion(). Language version is now specific to file. ([117433e](https://github.com/dsherret/ts-simple-ast/commit/117433e))
* Add sourceFile.getReferencingLiteralsInOtherSourceFiles(). ([9f009cf](https://github.com/dsherret/ts-simple-ast/commit/9f009cf))
* Add type.isEnumLiteralType() and type.isLiteral() ([56b26f8](https://github.com/dsherret/ts-simple-ast/commit/56b26f8))
* addExistingDirectory and addDirectoryExists now has a recursive option. ([45efb2f](https://github.com/dsherret/ts-simple-ast/commit/45efb2f))
* Rename VariableDeclarationType to VariableDeclarationKind. ([ce52ce3](https://github.com/dsherret/ts-simple-ast/commit/ce52ce3))


### Performance Improvements

* [#283](https://github.com/dsherret/ts-simple-ast/issues/283) - Do not temporarily wrap new tree when doing a manipulation. ([824819f](https://github.com/dsherret/ts-simple-ast/commit/824819f))


### BREAKING CHANGES

* addDirectoryIfExists is now addExistingDirectoryIfExists for consistency with addExistingDirectory.
* `.getName()` and `.getNameNode()` on ClassDeclaration can now possibly return undefined (ex. `export default class { ... }`).
* VariableDeclarationType is now VariableDeclarationKind. .getDeclarationType() is now .getDeclarationKind()

This was done to reduce confusion with the word "Type".
* QuoteType is now QuoteKind.

This was done to make it consistent with NewLineKind.
* ScriptTarget was moved from manipulation settings to be stored exclusively in the compiler options.
* `getReferencingImportAndExportDeclarations()` was removed. Use `getReferencingNodesInOtherSourceFiles()`.
* `ImportDeclaration` & `ExportDeclaration` `.getModuleSpecifier()` now returns the StringLiteral. Use `.getModuleSpecifierValue()` for the previous behaviour.
* Project & Directory's addSourceFileIfExists is now addExistingSourceFileIfExists.

This was done for consistency with addExistingSourceFile.
* Requesting an ancestor directory will no longer return undefined if it is an ancestor of a "root" directory.



<a name="9.5.0"></a>
# [9.5.0](https://github.com/dsherret/ts-simple-ast/compare/9.4.2...9.5.0) (2018-03-23)


### Features

* Add new getImportStringLiterals() method. ([a1b967f](https://github.com/dsherret/ts-simple-ast/commit/a1b967f))



<a name="9.4.2"></a>
## [9.4.2](https://github.com/dsherret/ts-simple-ast/compare/9.4.1...9.4.2) (2018-03-19)


### Bug Fixes

* Syntax kind to node mappings should include aliased kind names. ([5c7109e](https://github.com/dsherret/ts-simple-ast/commit/5c7109e))



<a name="9.4.1"></a>
## [9.4.1](https://github.com/dsherret/ts-simple-ast/compare/9.4.0...9.4.1) (2018-03-19)


### Bug Fixes

* Internally use the first name when getting the SyntaxKind name. ([cfab227](https://github.com/dsherret/ts-simple-ast/commit/cfab227))



<a name="9.4.0"></a>
# [9.4.0](https://github.com/dsherret/ts-simple-ast/compare/9.3.0...9.4.0) (2018-03-18)


### Features

* [#276](https://github.com/dsherret/ts-simple-ast/issues/276) - Improvements to moving source files. ([dd03789](https://github.com/dsherret/ts-simple-ast/commit/dd03789))
* [#279](https://github.com/dsherret/ts-simple-ast/issues/279) - Add StatementedNode.getDescendantStatements(). ([3b8b093](https://github.com/dsherret/ts-simple-ast/commit/3b8b093))
* [#279](https://github.com/dsherret/ts-simple-ast/issues/279) - Move .getDescendantStatements() to Node and improve performance. ([e397aa2](https://github.com/dsherret/ts-simple-ast/commit/e397aa2))
* [#280](https://github.com/dsherret/ts-simple-ast/issues/280) - Add setLiteralValue to more literals. ([38c1570](https://github.com/dsherret/ts-simple-ast/commit/38c1570))
* Ability to easily check if an external module reference is relative. ([f8676f0](https://github.com/dsherret/ts-simple-ast/commit/f8676f0))
* Ability to easily get an ImportEqualsDeclaration and ExternalModuleReference's referenced source file. ([c6d7c7b](https://github.com/dsherret/ts-simple-ast/commit/c6d7c7b))
* Add ImportEqualsDeclaration.setExternalModuleReference(...). ([e3396d3](https://github.com/dsherret/ts-simple-ast/commit/e3396d3))
* Add StringLiteral.setLiteralValue(...). ([8d5ff33](https://github.com/dsherret/ts-simple-ast/commit/8d5ff33))



<a name="9.3.0"></a>
# [9.3.0](https://github.com/dsherret/ts-simple-ast/compare/9.1.0...9.3.0) (2018-03-17)


### Features

* [#250](https://github.com/dsherret/ts-simple-ast/issues/250) - Accept strings for named imports and exports. ([8867b71](https://github.com/dsherret/ts-simple-ast/commit/8867b71))
* [#278](https://github.com/dsherret/ts-simple-ast/issues/278) - Add Type.isTupleType ([d7c3c3d](https://github.com/dsherret/ts-simple-ast/commit/d7c3c3d))
* Add more type guards. ([4a1a92d](https://github.com/dsherret/ts-simple-ast/commit/4a1a92d))
* Add Type.getConstraint() and getDefault(). ([8850266](https://github.com/dsherret/ts-simple-ast/commit/8850266))
* Add Type.getTupleElements(). ([8c5dafc](https://github.com/dsherret/ts-simple-ast/commit/8c5dafc))



<a name="9.2.0"></a>
# [9.2.0](https://github.com/dsherret/ts-simple-ast/compare/9.1.0...9.2.0) (2018-03-17)


### Features

* [#240](https://github.com/dsherret/ts-simple-ast/issues/240) - Ability to add/insert JSX attributes. ([e2b4a99](https://github.com/dsherret/ts-simple-ast/commit/e2b4a99))
* [#240](https://github.com/dsherret/ts-simple-ast/issues/240) - Ability to remove JSX attributes. ([1bf7642](https://github.com/dsherret/ts-simple-ast/commit/1bf7642))
* Add getAttribute to JsxOpeningElement and JsxSelfClosingElement. ([7dbe0f7](https://github.com/dsherret/ts-simple-ast/commit/7dbe0f7))
* Add getAttributeOrThrow for jsx nodes with attributes. ([93a0fbd](https://github.com/dsherret/ts-simple-ast/commit/93a0fbd))
* Add type.isStringType and type.isNumberType. ([66eecde](https://github.com/dsherret/ts-simple-ast/commit/66eecde))



<a name="9.1.0"></a>
# [9.1.0](https://github.com/dsherret/ts-simple-ast/compare/9.0.1...9.1.0) (2018-03-13)


### Bug Fixes

* Project.getSourceFile - Getting a source file by relative path should work. ([d117ecc](https://github.com/dsherret/ts-simple-ast/commit/d117ecc))


### Features

* TextInsertableNode - Add removeText() overload with no parameters. ([a4b5ef1](https://github.com/dsherret/ts-simple-ast/commit/a4b5ef1))



<a name="9.0.1"></a>
## [9.0.1](https://github.com/dsherret/ts-simple-ast/compare/9.0.0...9.0.1) (2018-03-12)


### Bug Fixes

* Fix intended method name. ([cbdee2e](https://github.com/dsherret/ts-simple-ast/commit/cbdee2e))



<a name="9.0.0"></a>
# [9.0.0](https://github.com/dsherret/ts-simple-ast/compare/8.2.4...9.0.0) (2018-03-11)


### Bug Fixes

* ExportableNode.isExported() takes into account all possible ways for a node to be exported from a file. ([ad07c33](https://github.com/dsherret/ts-simple-ast/commit/ad07c33))
* Project.getSourceFile should normalize the passed in path. ([c765b16](https://github.com/dsherret/ts-simple-ast/commit/c765b16))


### Code Refactoring

* Uses a WeakMap for wrapped Symbols, Types, etc. Internally created an Es5WeakMap. ([177dfe6](https://github.com/dsherret/ts-simple-ast/commit/177dfe6))


### Features

* Align ClassDeclaration more with the compiler. ([9b64bb5](https://github.com/dsherret/ts-simple-ast/commit/9b64bb5))


### BREAKING CHANGES

* Removed Symbol.equals(symbol). You can use === to compare symbols now.
* ClassDeclaration.getMembers() no longer returns parameter properties.



<a name="8.2.4"></a>
## [8.2.4](https://github.com/dsherret/ts-simple-ast/compare/8.2.3...8.2.4) (2018-03-08)


### Bug Fixes

* [#271](https://github.com/dsherret/ts-simple-ast/issues/271) - Fix SourceFile.move not deleting previous file on file system. ([a4dfda9](https://github.com/dsherret/ts-simple-ast/commit/a4dfda9))



<a name="8.2.3"></a>
## [8.2.3](https://github.com/dsherret/ts-simple-ast/compare/8.2.2...8.2.3) (2018-03-08)


### Bug Fixes

* [#270](https://github.com/dsherret/ts-simple-ast/issues/270) - Fix relative path file globs not working when using .getSourceFiles(...) ([fa19352](https://github.com/dsherret/ts-simple-ast/commit/fa19352))



<a name="8.2.2"></a>
## [8.2.2](https://github.com/dsherret/ts-simple-ast/compare/8.2.1...8.2.2) (2018-03-06)


### Bug Fixes

* [#262](https://github.com/dsherret/ts-simple-ast/issues/262) - Write public keyword when specified. ([6258c0e](https://github.com/dsherret/ts-simple-ast/commit/6258c0e))



<a name="8.2.1"></a>
## [8.2.1](https://github.com/dsherret/ts-simple-ast/compare/8.2.0...8.2.1) (2018-03-01)


### Bug Fixes

* [#265](https://github.com/dsherret/ts-simple-ast/issues/265) - Fix error thrown getting members in class containing semicolon terminated constructor & method declarations. ([dfb979f](https://github.com/dsherret/ts-simple-ast/commit/dfb979f))



<a name="8.2.0"></a>
# [8.2.0](https://github.com/dsherret/ts-simple-ast/compare/8.1.0...8.2.0) (2018-02-28)


### Features

* Add project.manipulationSettings.getEditorSettings() (mostly used internally for the default) ([af82884](https://github.com/dsherret/ts-simple-ast/commit/af82884))
* Add JsxElement setBodyText and setBodyTextInline. ([1420786](https://github.com/dsherret/ts-simple-ast/commit/1420786))
* Add languageService.getIdentationAtPosition(...) ([4de5f82](https://github.com/dsherret/ts-simple-ast/commit/4de5f82))
* Upgrade to code-block-writer 6.6.0 ([34c39a9](https://github.com/dsherret/ts-simple-ast/commit/34c39a9))
* Uses the language service to figure out the indentation level when writing. ([76f9531](https://github.com/dsherret/ts-simple-ast/commit/76f9531))



<a name="8.1.0"></a>
# [8.1.0](https://github.com/dsherret/ts-simple-ast/compare/8.0.0...8.1.0) (2018-02-24)


### Features

* [#259](https://github.com/dsherret/ts-simple-ast/issues/259) - Wrap TypeLiteralNode. ([d479100](https://github.com/dsherret/ts-simple-ast/commit/d479100))
* Add support for strict property initialization (exclamation token). ([1e787f2](https://github.com/dsherret/ts-simple-ast/commit/1e787f2))
* sourceFile.getBaseNameWithoutExtension() ([09a63d9](https://github.com/dsherret/ts-simple-ast/commit/09a63d9))
* sourceFile.getExtension() ([3906902](https://github.com/dsherret/ts-simple-ast/commit/3906902))



<a name="8.0.0"></a>
# [8.0.0](https://github.com/dsherret/ts-simple-ast/compare/7.1.0...8.0.0) (2018-02-19)


### Bug Fixes

* Blank line would be inserted when calling an addXs method and providing an empty array in some scenarios. ([dfbf940](https://github.com/dsherret/ts-simple-ast/commit/dfbf940))
* getRelativePathToSourceFileAsModuleSpecifier() should return `../` instead of `./../` when going back a directory. ([a7954fa](https://github.com/dsherret/ts-simple-ast/commit/a7954fa))
* sourceFile.copy should return the current source file when copying to its own path. ([6e737e7](https://github.com/dsherret/ts-simple-ast/commit/6e737e7))


### Code Refactoring

* **file-system:** Preparing for having the ability to queue deletions. ([83e45f0](https://github.com/dsherret/ts-simple-ast/commit/83e45f0))


### Features

* [#199](https://github.com/dsherret/ts-simple-ast/issues/199) - Add SourceFile.move(...), .getReferencingSourceFiles(), and .getReferencingImportAndExportDeclarations(). ([f22db6c](https://github.com/dsherret/ts-simple-ast/commit/f22db6c))
* Deletes do not happen on the file system until `.save()` is called on the main `ast` object. ([d208cfd](https://github.com/dsherret/ts-simple-ast/commit/d208cfd))
* ImportDeclaration and ExportDeclaration - isModuleSpecifierRelative() ([2ef3064](https://github.com/dsherret/ts-simple-ast/commit/2ef3064))
* setModuleSpecifier accepts a source file. ([c2a4d9a](https://github.com/dsherret/ts-simple-ast/commit/c2a4d9a))
* SourceFile - copyImmediately and moveImmediately along with sync methods. ([4183769](https://github.com/dsherret/ts-simple-ast/commit/4183769))
* sourceFile.copy() will automatically update the new source file's import & export declarations' module specifiers if necessary. ([e48949e](https://github.com/dsherret/ts-simple-ast/commit/e48949e))


### BREAKING CHANGES

* * project.saveUnsavedSourceFiles() is now project.save()
* Directory.saveUnsavedSourceFiles() is now Directory.save()
* **file-system:** SourceFile/Directory: delete() and deleteSync() are now deleteImmediately() and deleteImmediatelySync().



<a name="7.1.0"></a>
# [7.1.0](https://github.com/dsherret/ts-simple-ast/compare/7.0.1...7.1.0) (2018-02-15)


### Bug Fixes

* Fix scenario where adding a modifier would throw when there was an jsdoc on the parent in some scenarios. ([1fbcee6](https://github.com/dsherret/ts-simple-ast/commit/1fbcee6))
* Insert functions with a declaration keyword without a body. ([c64009d](https://github.com/dsherret/ts-simple-ast/commit/c64009d))


### Features

* [#252](https://github.com/dsherret/ts-simple-ast/issues/252) - Add Type.isNullable. ([f2dfd1f](https://github.com/dsherret/ts-simple-ast/commit/f2dfd1f))
* Add functions and variables to typescript declaration file. ([451840b](https://github.com/dsherret/ts-simple-ast/commit/451840b))
* Add ts.Node brand to prevent using ts.Nodes created outside the ts named export. ([ab7c353](https://github.com/dsherret/ts-simple-ast/commit/ab7c353))
* BodyableNode - addBody, removeBody, hasBody ([3f4175e](https://github.com/dsherret/ts-simple-ast/commit/3f4175e))



<a name="7.0.1"></a>
## [7.0.1](https://github.com/dsherret/ts-simple-ast/compare/7.0.0...7.0.1) (2018-02-14)


### Bug Fixes

* Fix ts compiler types not being exported from declaration file. ([0755aa2](https://github.com/dsherret/ts-simple-ast/commit/0755aa2))



<a name="7.0.0"></a>
# [7.0.0](https://github.com/dsherret/ts-simple-ast/compare/6.13.0...7.0.0) (2018-02-14)


### Code Refactoring

* [#232](https://github.com/dsherret/ts-simple-ast/issues/232) - HeritageClause: getTypes() -> getTypeNodes() ([ef5a369](https://github.com/dsherret/ts-simple-ast/commit/ef5a369))
* ClassDeclaration & InterfaceDeclaration: getAllMembers -> getMembers ([cdb186a](https://github.com/dsherret/ts-simple-ast/commit/cdb186a))
* getImport -> getImportDeclaration. ([acd9d70](https://github.com/dsherret/ts-simple-ast/commit/acd9d70))
* Rename toggleDeclareKeyword to setHasDeclareKeyword for consistency. ([0cecefe](https://github.com/dsherret/ts-simple-ast/commit/0cecefe))


### Features

* [#249](https://github.com/dsherret/ts-simple-ast/issues/249) - Remove TypeScript compiler peer dependency. ([db9f0fc](https://github.com/dsherret/ts-simple-ast/commit/db9f0fc))


### BREAKING CHANGES

* HeritageClause getTypes() renamed to getTypeNodes().

It was incorrectly named originally.
* ClassDeclaration & InterfaceDeclaration getAllMembers() renamed to getMembers().
* sourceFile.getImport is now getImportDeclaration for consistency.
* Access the TypeScript compiler via `import {ts} from "ts-simple-ast";`
* NewLineKind is now the TypeScript compiler's enum.
* toggleDeclareKeyword is now setHasDeclareKeyword.



<a name="6.13.0"></a>
# [6.13.0](https://github.com/dsherret/ts-simple-ast/compare/6.12.0...6.13.0) (2018-02-12)


### Bug Fixes

* Writing a statemented node would not respect the manipulation settings. ([179e327](https://github.com/dsherret/ts-simple-ast/commit/179e327))
* Writing enum member value that's a string should be surrounded in quotes. ([d5da5b6](https://github.com/dsherret/ts-simple-ast/commit/d5da5b6))


### Features

* [#240](https://github.com/dsherret/ts-simple-ast/issues/240) - Wrap JSX nodes. ([aa4d70a](https://github.com/dsherret/ts-simple-ast/commit/aa4d70a))



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

* project.addExistingSourceFiles now takes either a single glob or multiple globs passed as an array. ([fb5b930](https://github.com/dsherret/ts-simple-ast/commit/fb5b930))


### Features

* [#7](https://github.com/dsherret/ts-simple-ast/issues/7) - Ability to import files from tsconfig. ([b538537](https://github.com/dsherret/ts-simple-ast/commit/b538537))
* [#7](https://github.com/dsherret/ts-simple-ast/issues/7) - Some fixes to importing files from tsconfig. ([2a95bc2](https://github.com/dsherret/ts-simple-ast/commit/2a95bc2))
* [#7](https://github.com/dsherret/ts-simple-ast/issues/7) - Specified compiler options and tsconfig path are both used to determine added files. ([20e7b77](https://github.com/dsherret/ts-simple-ast/commit/20e7b77))
* Support multiple globs when getting source files. ([bb935d9](https://github.com/dsherret/ts-simple-ast/commit/bb935d9))


### BREAKING CHANGES

* Use an array when passing in multiple file globs to project.addExistingSourceFiles. This better expresses the intent of this method call.
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
* Add project.getFileSystem() ([3364349](https://github.com/dsherret/ts-simple-ast/commit/3364349))
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
* Add project.getPreEmitDiagnostics() ([a561994](https://github.com/dsherret/ts-simple-ast/commit/a561994))
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
