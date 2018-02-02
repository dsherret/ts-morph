---
title: Formatting
---

## Formatting

Sometimes you might encounter code that looks terrible. For example:

```ts
// BadlyFormattedFile.ts
var myVariable     :      string |    number;
function myFunction(param    : MyClass){
return "";
}
```

Automatically format the text of this file by calling format text on it:

```ts
sourceFile.formatText();
// or provide optional formatting settings
sourceFile.formatText({
    placeOpenBraceOnNewLineForFunctions: true
});
```

This will run the source file's text through the TypeScript compiler's formatting API, which will change the source file to contain the following text:

```ts
// BadlyFormattedFile.ts (not anymore!)
var myVariable: string | number;
function myFunction(param: MyClass) {
    return "";
}
```

### Individual Nodes

Individual nodes can also be formatted. For example, say you have a file that looks like this:

```ts
// file.ts
export class MyClass {
    prop  : string   ;

    myMethod(    example: string    ) {
  console.log(    example    );
    }
}
```

You can select down to the specific node you want to format:

```ts
ast.getSourceFileOrThrow("file.ts")
    .getClassOrThrow("MyClass")
    .getInstanceMethodOrThrow("myMethod")
    .getStatements()[0]
    .formatText();
```

Which would selectively only format the first statement in the method:

```ts
// file.ts
export class MyClass {
    prop  : string   ;

    myMethod(    example: string    ) {
        console.log(example);
    }
}
```
