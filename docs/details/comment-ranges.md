---
title: Comment Ranges
---

## Comment Ranges

Comment ranges are not part of the AST and are generated on request.

* **Leading:** Comments that preceed the node after the previous significant token—between `node.getPos()` and `node.getStart()`.
* **Trailing:** Comments following the node before the next siginificant token or newline.

WARNING: Since comments are generated on demand and not part of the AST, using one after a
subsequent manipulation to the source file will throw an error.

### Retreiving

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
