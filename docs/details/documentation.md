---
title: JS Docs
---

## JS Docs

Certain nodes can have JS docs. For example:

```ts setup: interface Person {}
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
// adds /** Some description... */
const docNode = classDeclaration.addJsDoc({
  description: "Some description...",
});
// or to force it to be multi-line, add a newline to the front of the string
classDeclaration.addJsDoc({
  description: "\nSome description...",
});
// or with tags
classDeclaration.addJsDoc({
  description: "Some description...",
  tags: [{
    tagName: "param",
    text: "value - My value.",
  }],
});
```

### JSDoc Nodes

Get the description:

```ts
// Getting the node from the example at the top of this file.
const jsDoc = functionDeclaration.getJsDocs()[0];
jsDoc.getDescription(); // returns string: "Gets the name."
```

Get the tags:

```ts
const tags = jsDoc.getTags();
tags[0].getText(); // "@param person - Person to get the name from."
```

Get the inner text (the text without the surrounding comment):

```ts
jsDoc.getInnerText(); // "Gets the name.\n@param person - Person to get the name from."
```
