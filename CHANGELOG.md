# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
