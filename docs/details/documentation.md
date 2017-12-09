---
title: JS Docs
---

## JS Docs

Certain nodes can have JS docs. For example:

```typescript
/**
 * Gets the name.
 * @param person - Person to get the name from.
 */
function getName(person: Person) {
    // ...
}
```

### Get string

Use `getDocumentationComment()` to return all the documentation comments separated by new lines as a string:

```typescript
functionDeclaration.getDocumentationComment(); // returns: string | undefined
```

This will return `undefined` if no documentation comment exists.

### Get all documentation comment nodes

Get all the documentation comment nodes by using `getDocumentationCommentNodes()`:

```typescript
functionDeclaration.getDocumentationCommentNodes(); // returns: JSDoc[]
```

### Add/insert docs

Add or insert documentation comments using the `addDoc()`, `addDocs()`, `insertDoc()`, and `insertDocs()` methods.

For example:

```typescript
const docNode = classDeclaration.addDoc({
    description: "Some description..."
});
```

Right now you can only add a description, but in the future support will be added for easily manipulating more JS doc syntax.

### JSDoc Nodes

Get the comment:

```typescript
// getting the node from the original example above
const jsDocNode = functionDeclaration.getDocumentationCommentNodes()[0];
jsDocNode.getComment(); // returns string: "Gets the name."
```

Get the tags:

```typescript
const tags = jsDocNode.getTags();
tags[0].getText(); // "@param person - Person to get the name from."
```

Get the inner text (the text without the surrounding comment):

```typescript
jsDocNode.getInnerText(); // "Gets the name.\n@param person - Person to get the name from."
```
