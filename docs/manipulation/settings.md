---
title: Manipulation Settings
---

## Manipulation Settings

The manipulation settings can be set when creating the main AST object:

```ts
import Project, {QuoteType, NewLineKind, IndentationText} from "ts-simple-ast";

const project = new Project({
    // these are the defaults
    manipulationSettings: {
        // TwoSpaces, FourSpaces, EightSpaces, or Tab
        indentationText: IndentationText.FourSpaces,
        // LineFeed or CarriageReturnLineFeed
        newLineKind: NewLineKind.LineFeed,
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

### Formatting

There are some additional manipulation settings that are taken from the `ts.FormatCodeSettings`.
They will slowly be supported and added to the manipulation settings. For example:

```ts
project.manipulationSettings.set({
    // only one for now... will add more in the future
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false // default: true
});
```
