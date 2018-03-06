---
title: Manipulation Settings
---

## Manipulation Settings

The manipulation settings can be set when creating the main AST object:

```ts
import Project, {QuoteType, NewLineKind, IndentationText, ScriptTarget} from "ts-simple-ast";

const project = new Project({
    // these are the defaults
    manipulationSettings: {
        // TwoSpaces, FourSpaces, EightSpaces, or Tab
        indentationText: IndentationText.FourSpaces,
        // LineFeed or CarriageReturnLineFeed
        newLineKind: NewLineKind.LineFeed,
        // defines what ts.ScriptTarget source files are created with
        scriptTarget: ScriptTarget.Latest,
        // Single or Double
        quoteType: QuoteType.Double
    }
});
```

You can only provide a partial of these settings if you wish:

```ts
const project = new Project({
    manipulationSettings: { indentationText: IndentationText.TwoSpaces }
});
```

### Details

Get more details about the settings by looking at the `manipulationSettings` property on the main AST object:

```ts
project.manipulationSettings.getIndentationText();
project.manipulationSettings.getNewLineKind();
project.manipulationSettings.getQuoteType();
project.manipulationSettings.getScriptTarget();
```

### Updating

You can update these settings later if you wish by using the `set` method:

```ts
// set only one
project.manipulationSettings.set({ quoteType: QuoteType.Single });

// or multiple
project.manipulationSettings.set({
    quoteType: QuoteType.Single,
    indentationText: IndentationText.TwoSpaces
});
```
