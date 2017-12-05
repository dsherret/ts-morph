# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
