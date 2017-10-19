---
title: Manipulation Settings
---

## Manipulation Settings

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

You can only provide a partial of these settings if you wish:

```typescript
const ast = new TsSimpleAst({
    manipulationSettings: { indentationText: IndentationText.TwoSpaces }
});
```

### Details

Get more details about the settings by looking at the `manipulationSettings` property on the main AST object:

```typescript
ast.manipulationSettings.getIndentationText();
ast.manipulationSettings.getNewLineKind();
ast.manipulationSettings.getStringChar();
ast.manipulationSettings.getScriptTarget();
```

### Updating

You can update these settings later if you wish by using the `set` method:

```typescript
// set only one
ast.manipulationSettings.set({ stringChar: StringChar.SingleQuote });

// or multiple
ast.manipulationSettings.set({
    stringChar: StringChar.SingleQuote,
    indentationText: IndentationText.TwoSpaces
});
```
