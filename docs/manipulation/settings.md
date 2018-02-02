---
title: Manipulation Settings
---

## Manipulation Settings

The manipulation settings can be set when creating the main AST object:

```ts
import * as ts from "typescript";
import TsSimpleAst, {QuoteType, NewLineKind, IndentationText} from "ts-simple-ast";

const ast = new TsSimpleAst({
    // these are the defaults
    manipulationSettings: {
        // TwoSpaces, FourSpaces, EightSpaces, or Tab
        indentationText: IndentationText.FourSpaces,
        // LineFeed or CarriageReturnLineFeed
        newLineKind: NewLineKind.LineFeed,
        // defines what ts.ScriptTarget source files are created with
        scriptTarget: ts.ScriptTarget.Latest,
        // Single or Double
        quoteType: QuoteType.Double
    }
});
```

You can only provide a partial of these settings if you wish:

```ts
const ast = new TsSimpleAst({
    manipulationSettings: { indentationText: IndentationText.TwoSpaces }
});
```

### Details

Get more details about the settings by looking at the `manipulationSettings` property on the main AST object:

```ts
ast.manipulationSettings.getIndentationText();
ast.manipulationSettings.getNewLineKind();
ast.manipulationSettings.getQuoteType();
ast.manipulationSettings.getScriptTarget();
```

### Updating

You can update these settings later if you wish by using the `set` method:

```ts
// set only one
ast.manipulationSettings.set({ quoteType: QuoteType.Single });

// or multiple
ast.manipulationSettings.set({
    quoteType: QuoteType.Single,
    indentationText: IndentationText.TwoSpaces
});
```
