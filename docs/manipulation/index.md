---
title: Manipulating the AST
---

## Manipulating the AST

Most information about manipulation can be found in the [Details](../details) section. This section only contains general information about manipulation.

### Settings

The manipulation settings can be set when creating the main AST object:

```typescript
import * as ts from "typescript";
import TsSimpleAst, {StringChar, NewLineKind, IndentationText} from "ts-simple-ast";

const ast = new TsSimpleAst({
    // these are the defaults
    manipulationSettings: {
        // TwoSpaces, FourSpaces, EightSpaces, or Tab
        indentationText: IndentationText.FourSpaces,
        // LineFeed or CarriageReturnLineFeed
        newLineKind: NewLineKind.LineFeed,
        // defines what ts.ScriptTarget source files are created with
        scriptTarget: ts.ScriptTarget.Latest,
        // SingleQuote or DoubleQuote
        stringChar: StringChar.DoubleQuote
    }
});
```

You can provide only a partial of these settings:

```typescript
const ast = new TsSimpleAst({
    manipulationSettings: { indentationText: IndentationText.TwoSpaces }
});
```

#### More Details

You can get more details about it by looking at the `manipulationSettings` property:

```typescript
ast.manipulationSettings.getIndentationText();
ast.manipulationSettings.getNewLineKind();
ast.manipulationSettings.getStringChar();
ast.manipulationSettings.getScriptTarget();
```

Then update these settings later if you wish by using the `set` method:

```
// set only one
ast.manipulationSettings.set({ stringChar: StringChar.SingleQuote });

// or multiple
ast.manipulationSettings.set({
    stringChar: StringChar.SingleQuote,
    indentationText: IndentationText.TwoSpaces
});
```
