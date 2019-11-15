# RFC-0002 - Comment Nodes For All Comments

## Prerequisites

* Understand comment ownership: https://github.com/Microsoft/TypeScript/wiki/Architectural-Overview#trivia
* Understand the difference between `getChildren()` and `forEachChild` in the compiler API.

## Issues

* [#737](https://github.com/dsherret/ts-morph/issues/737) - Parse out all comments as children.
* [#721](https://github.com/dsherret/ts-morph/issues/721) - `file.getDescendantsOfKind(SyntaxKind.SingleLineCommentTrivia)` does not return all comments

## Problem

For programmatic refactoring, it is very important to know about comments. In the past, all comments had to be requested via `Node#getLeadingCommentRanges()` and `Node#getTrailingCommentRanges()`. These returned objects would be forgotten after each manipulation and it was difficult to tell how these comments fit together with the nodes around them.

RFC-0001 made it somewhat easier by introducing the concept of "comment nodes", which had "comment statement" and "comment member" implementations, but it didn't go far enough. There are still many comments that need to be requested on demand from `#getLeading/TrailingCommentRanges()`.

## `Node#getChildrenWithComments()`

This RFC proposes the following:

1. Comment statements & members will be changed to "comment list statements" and "comment list members".
2. `Node#getChildren()` will return these comment lists instead of just a single comment statement/member.
3. Add new `Node#getChildrenWithComments()` method that works the same as `Node#getChildren()`, but additionally parses out and returns comments as objects that implement the `ts.Node` interface.

### Example

Given the following code:

```ts
// 1
/*2*/ // 3
/*4*/ test/*5*/; //6
/*7*/ //8
```

The current tree representation using `Node#getChildren()` in ts-morph is the following as per RFC-0001:

```
SourceFile
  SyntaxList
    CommentStatement (// 1)
    CommentStatement (/*2*/)
    ExpressionStatement
      Identifier
      SemiColonToken
    CommentStatement (/*7*/)
  EndOfFileToken
```

The new implementation of `Node#getChildren()` will return the following:

```
SourceFile
  SyntaxList
    CommentListStatement
      SingleLineCommentTrivia
    CommentListStatement
      MultiLineCommentTrivia
      SingleLineCommentTrivia
    ExpressionStatement
      Identifier
      SemiColonToken
    CommentListStatement
      MultiLineCommentTrivia
      SingleLineCommentTrivia
  EndOfFileToken
```

Then `#getChildrenWithComments()` would return the following:

```
SourceFile
  SyntaxList
    CommentListStatement
      SingleLineCommentTrivia
    CommentListStatement
      MultiLineCommentTrivia
      SingleLineCommentTrivia
    MultiLineCommentTrivia
    ExpressionStatement
      Identifier
      MultiLineCommentTrivia
      SemiColonToken
    SingleLineCommentTrivia
    CommentListStatement
      MultiLineCommentTrivia
      SingleLineCommentTrivia
  EndOfFileToken
```

## Comment Node

Comment nodes are any single line or multi-line comment in the file. They will work the same as the comment nodes described in RFC-0001. The only difference now is that any comment can be represented by a comment node and there is now an introduction of "comment lists".

## Comment Lists

Comment lists are a collection of comments located in the statements of a node or members of interfaces, class declarations & expressions, type elements, object literals, and enums. They must be on one line without any other tokens on that line. The exception is when a close brace token directly follows them and no token preceeds them. Additionally, comments that are between a jsdoc and the declaration it describes are children of the class declaration and therefore not comment lists.

They show up in methods like `#getStatementsWithComments()`, `#getChildren()`, and the new `#getChildrenWithComments()`. For example, the following is a comment list:

```ts
/*1*/ /*2*/ //3
```

Tree representation:

```
CommentListStatement
  MultiLineCommentTrivia (/*1*/)
  MultiLineCommentTrivia (/*2*/)
  SingleLineCommentTrivia (//3)
```

**Examples of comment lists**

There is one comment list per line with a comment:

```ts
// 1
/* 2 */ // 3
class Test {
  // 4
  prop;
  // 5
/* 6 */ }
```

**Examples of comments that aren't comment lists**

```ts
/*1*/ a; // these two lines have tokens, so not comment lists
test/*3*/; /*4*/ // 5
class test
// not comment lists because these comments do not appear
// in the position of a statement or member
{

}

/* not a comment list because it ends
on the same line as a token */ b;
```

As described in RFC-0001 about comment statements & members, this is done to allow inserting before and after certain comments.

### JS Docs

JS docs are special and are not comment lists. They are included as children of the declaration they describe in the compiler API.

Additionally, any comments that appear after a JS doc and before the declaration start are not comment lists.

For example the following code:

```ts
// 1

/** My function. */
//2
function myFunction() {}
```

Has the following tree when using `#getChildrenWithComments()`:

```
SourceFile
  SyntaxList
    CommentListStatement
      SingleLineCommentTrivia
    FunctionDeclaration
      JSDocComment
      SingleLineCommentTrivia
      FunctionKeyword
      Identifier
      OpenParenToken
      SyntaxList
      CloseParenToken
      Block
        OpenBraceToken
        SyntaxList
        CloseBraceToken
  EndOfFileToken
```

### Types

```ts
export enum CommentListKind {
    Statement,
    ClassElement,
    TypeElement,
    ObjectLiteralElement,
    EnumMember
}
```

Base type:

```ts
interface CompilerCommentList implements ts.Node {
    kind: ts.SyntaxKind.Unknown;
    commentListKind: CommentListKind;
    comments: CompilerCommentNode[];
    // ...etc..
}
```

Example comment list type:

```ts
export declare class CompilerCommentListStatement extends CompilerCommentList implements ts.Statement {
    _statementBrand: any; // this brand is from ts.Statement
    commentListKind: CommentListKind;
}
```

### `kind` property value

The major downside here is that unlike comment nodes which use either `ts.SyntaxKind.MultiLineCommentTrivia` or `ts.SyntaxKind.SingleLineCommentTrivia`, there is no existing `ts.SyntaxKind` that works well for comment lists. The only available option seems to be to use a custom number or `ts.SyntaxKind.Unknown` (`0`), which I think is what I'm going to go with because that is in the set of `ts.SyntaxKind`.

## Comments inside syntax lists with statements or members

For example:

```ts
{
    //1
    a;
    //2
}
```

The syntax list of the block ends at the semi-colon of `a;`, but when calling `#getChildrenWithComments()` on the syntax list, it should return all the comments up to the close brace token.

## Comment children ownership

Child comments are any comment that is found within `Node#.getStart(true)` (`true` meaning the start pos including js docs) and `Node#end` where no descendant node is true for that condition. The only exception to this is syntax lists with statements or members as described above.
