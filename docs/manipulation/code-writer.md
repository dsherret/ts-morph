---
title: Code Writer
---

## Code Writer

With manipulation methods that accept a `string` for the new code, it's possible to write text using a provided [code-block-writer](https://github.com/dsherret/code-block-writer).

Using the writer is very useful because it will write code out using the indentation and newline settings of the AST. It's also easier to use.

### Example

```ts
functionDeclaration.setBodyText(writer => writer.writeLine("let myNumber = 5;")
    .write("if (myNumber === 5)").block(() => {
        writer.writeLine("console.log('yes')");
    }));
```
