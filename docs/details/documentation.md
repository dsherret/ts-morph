---
title: JS Docs
---

## JS Docs

Certain nodes can have JS docs. For example:

```ts
/**
 * Gets the name.
 * @param person - Person to get the name from.
 */
function getName(person: Person) {
    // ...
}
```

### Get all JS doc nodes

Get all the JS doc nodes by using `getJsDocs()`:

```ts
functionDeclaration.getJsDocs(); // returns: JSDoc[]
```

### Add/insert docs

Add or insert JS doc comments using the `addJsDoc()`, `addJsDocs()`, `insertJsDoc()`, and `insertJsDocs()` methods.

For example:

```ts
const docNode = classDeclaration.addJsDoc({
    description: "Some description..."
});
```

Right now you can only add a description, but in the future support will be added for easily manipulating more JS doc syntax.

### JSDoc Nodes

Get the comment:

```ts
// getting the node from the original example above
const jsDoc = functionDeclaration.getJsDocs()[0];
jsDoc.getComment(); // returns string: "Gets the name."
```

Get the tags:

```ts
const tags = jsDocNode.getTags();
tags[0].getText(); // "@param person - Person to get the name from."
```

Get the inner text (the text without the surrounding comment):

```ts
jsDocNode.getInnerText(); // "Gets the name.\n@param person - Person to get the name from."
```
