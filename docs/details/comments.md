---
title: Comments
---

## Comments

*ts-morph* parses out certain kinds of comments to make them easier to work with. This breaks away from the behaviour in the compiler API because although comments are not very important for compiling, they can be important for programmatic refactoring tasks.

* **Comment Ranges** - Comments the compiler api parses out.
* **Comment Nodes** - Comments ts-morph parses out in certain scenarios. They extend from `ts.Node`.

## Comment Ranges

Comment ranges are not part of the AST and are generated on request.

* **Leading:** Comments that preceed the node after the previous significant token—between `node.getPos()` and `node.getStart()`.
* **Trailing:** Comments following the node before the next siginificant token or newline.

WARNING: Since comments are generated on demand and not part of the AST, using one after a
subsequent manipulation to the source file will throw an error.

### Retrieving

Leading and trailing comment ranges can be retrieved from any node by calling:

```ts
const leadingComments = node.getLeadingCommentRanges();
const trailingComments = node.getTrailingCommentRanges();
```

### Information

Once you have a comment range, there are several self explanatory methods:

* `.getKind()` - Returns `SyntaxKind.SingleLineCommentTrivia` or  `SyntaxKind.MultiLineCommentTrivia`.
* `.getPos()` - Position.
* `.getEnd()` - End position.
* `.getWidth()` - Width (`end - pos`)
* `.getText()` - Text.
* `.wasForgotten()` - Returns true if the node was forgotten because a manipulation occured to the source file or its associated node was forgotten.

### More Details

Read more about comments in the compiler API documentation here: https://github.com/Microsoft/TypeScript/wiki/Architectural-Overview#trivia

## Comment Nodes

These are nodes ts-morph parses out. They do not include all comments, but only the first comment on a line if there are no significant tokens on that line and only in certain contexts (ex. source file statements, class declaration body, function body, namespace body, etc..).

For example, in the following scenario:

```ts
// do something
functionCall(); // ok
```

...only the first comment will be parsed out. The second comment is considered a trailing comment range of the function call.

### Retrieving

Comment ranges can be retrieved using various `#getXWithComments()` methods.

For example:

```ts
sourceFile.getStatementsWithComments();
classDec.getMembersWithComments();
interfaceDec.getMembersWithComments();
objectLiteralExpression.getPropertiesWithComments();
```

They also may appear in the results of `#getChildren()` in certain scenarios. For example:

```ts
const children = sourceFile.getChildSyntaxListOrThrow().getChildren();
```

This extends the behaviour of the compiler API.

### Why?

The reason this is done is to make inserting before or after comments possible. For example, given the following source file:

```ts
// 1
// 2
functionCall();
```

It is possible to insert a statement after the first comment by specifying `sourceFile.insertStatement(1, "// new comment");`, which would modify the source file to be:

```ts
// 1
// new comment
// 2
functionCall();
```

### Removing Comments

To remove a comment node, call `#remove()` on it:

```ts
sourceFile.getStatementsWithComments()[0].remove();
```

This will remove the comment and any of its trailing comment nodes.

### Trailing comment ranges of comment nodes

Comment nodes may have trailing comment ranges. For example, given the following source file:

```ts
/* 1 */ // 2
```

...the text `/* 1 */` is considered the comment node, while `// 2` is the trailing comment range. `// 2` can be retrieved with the following code:

```ts
const secondComment = sourceFile.getStatementsWithComments()[0].getTrailingCommentRanges()[0];
```
