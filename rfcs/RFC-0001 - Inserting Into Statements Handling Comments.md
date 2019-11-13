# RFC-0001 - Inserting Into Statements Handling Comments

Ported from: https://github.com/dsherret/ts-morph/issues/575

## Prerequisites

* Understand comment ownership: https://github.com/Microsoft/TypeScript/wiki/Architectural-Overview#trivia
* Current api is for inserting statements: `insertStatements(index: number, statements: string | WriterFunction | (string | WriterFunction)[]): Statement[];` where `index` is the `node.statements` array index of the node.

## Issues

* [#189](https://github.com/dsherret/ts-morph/issues/189) - Node inserted before comment when calling `addClass`-like methods
* [#565](https://github.com/dsherret/ts-morph/issues/565) - Inserting at a specific position

## Overview

The parser rightfully excludes comments from the AST in order to reduce complexity in the compiler. The compiler API then provides a way to get the comments via the `ts.getLeadingCommentRanges` and `ts.getTrailingCommentRanges` functions. These functions are provided the source file text and position to know where to start parsing at.

Although not so useful for the compilation process, comments are useful to know about for programmatic refactoring purposes in certain scenarios.

For example, given the following code:

```ts
// initialize
const u = 5;
```

How could one say to insert after the comment?

```ts
// initialize
const t = 4;
const u = 5;
```

Or before?

```ts
const t = 4;
// this value is special
const u = 5;
```

Right now, there doesn't exist an easy way to do this in ts-morph (possible by inserting with `insertText`, which takes a position).

## Option 1: Insert API Change

One option would be to change the API for `insertStatements` to take a position.

### Upsides

* Close functionality to the compiler API.

### Downsides

* API is not intuitive.
* Users confused why comments aren't a statement (had people ask about this multiple times).
* Users will need to parse for comments themselves in order to find out they're there.

## Option 2: Leading Comments as Statements

Given the following code:

```ts
// comment 1
/* comment 2 */
/* comment 3 */ const t = 4; // comment 4
const u = 5;
```

Calling `.getStatementsWithComments()` would return any leading comments that are on a different line at the start of the line.

```
{
    kind: ts.SyntaxKind.SingleLineCommentTrivia,
    text: "// comment 1"
}, {
    kind: ts.SyntaxKind.MultiLineCommentTrivia,
    text: "/* comment 2 */"
}, {
    kind: ts.SyntaxKind.VariableStatement,
    // ...etc...
}
```

So in other words, trailing comments are never included as well as leading comments on the same line. 

### JS Docs

JS docs will not be considered a statement unless they do not have a following declaration.

### Comment on same line as header

```ts
function getResult() { // description
    return 5;
}
```

This comment should be ignored and considered as a trialing comment of the header. Most of the time these are a description of the header and not useful to know about for statemented purposes.

### No actual statements, but has comments

For example, given the following source file:

```ts
// comment 1
/* comment 2 */
```

It should return both comments when calling `#getStatementsWithComments()`.

### Multiple comments on same line

This is an edge case, but if someone does the following:

```ts
/* comment 1 */ // comment 2
/* comment 3 */ /* comment 4 */ // comment 5
```

Then it should just return comment 1 and 3. Comment 2, 4, and 5 should return as a trailing comments of their respective comment nodes.

### Preceding comment on same line as close brace token

This comment should be parsed as if it's a member if it has no other token on the same line.

```ts
class C {
    prop;
    /* test */ }
```

The reason is that generally if someone writes this they would have meant to place it on the next line and so it shouldn't hide the comment.

### Other areas

It is also useful, but less so, to know about comments in nodes that have members (ex. class, interface, enum, object literal expression, type element expression, etc. members). In these cases, a separate `#getMembersWithComments()`/`#getPropertiesWithComments()`-like methods will be added.

### Node methods

One annoyance might be that standard `Node` methods like `#getStart()` aren't available. To fix this, the compiler node should actually be parsed to extend `ts.Node` then have an `ExtendedCommentNode` class that extends from `Node`.

### `#getPos()`

Behaviour should always stay the same as the compiler api. That means node positions may overlap comment positions (as already occurs). This behaviour is similar to JS doc comments.

### `#getChildren()`

`#getChildren()` should be updated in order to return these newly parsed comments.

Ultimately I have decided to break away from the compiler API here because the code becomes too complex when I don't consider these as children. Returning the comments with `#getChildren()` also ensures the comments are counted when calling `#getChildIndex()`.

### `#forEachChild`

`#forEachChild` will remain the same. It's better to keep this change as limited as possible.

### `#getChildIndex()`

This method will return the index in the result of `#getChildren()`.

### `#getChildCount()`

Should be updated to instead return the result of `#getChildren().length` (not use the compiler api value).

### Conditional behaviour?

Should this behaviour be conditional (ex. `parseComments: false` or something in the project options)? No, that would increase the complexity far too much.

### Benefits

* Users approaching the problem for the first time do not understand why comments are not considered statements. It might be more intuitive to do this.
* Makes it very easy to deal with comments and decide whether to insert before or after one (or remove them).

### Drawbacks

* Might confuse some users who are used to the compiler api behaviour when using `#getChildren()`.
  * This is slightly unfortunate, but users would be even more confused about methods like `#getChildIndex()` not including comments. It would also increase complexity internally within the library.
  * Most users won't have any experience with the compiler API so this is probably not an issue.