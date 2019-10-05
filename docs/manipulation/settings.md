---
title: Manipulation Settings
---

## Manipulation Settings

The manipulation settings can be set when creating the main `Project` object:

```ts
import { Project, QuoteKind, NewLineKind, IndentationText } from "ts-morph";

const project = new Project({
    // these are the defaults
    manipulationSettings: {
        // TwoSpaces, FourSpaces, EightSpaces, or Tab
        indentationText: IndentationText.FourSpaces,
        // LineFeed or CarriageReturnLineFeed
        newLineKind: NewLineKind.LineFeed,
        // Single or Double
        quoteKind: QuoteKind.Double,
        // Whether to change shorthand property assignments to property assignments
        // and add aliases to import & export specifiers (see more information in
        // the renaming section of the documentation).
        usePrefixAndSuffixTextForRename: false,
        // Whether to use trailing commas in multi-line scenarios where trailing
        // commas would be used.
        useTrailingCommas: false
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

Get more details about the settings by looking at the `manipulationSettings` property on the main `Project` object:

```ts
project.manipulationSettings.getIndentationText();
project.manipulationSettings.getNewLineKind();
project.manipulationSettings.getQuoteKind();
project.manipulationSettings.getUsePrefixAndSuffixTextForRename();
```

### Updating

You can update these settings later if you wish by using the `set` method:

```ts
// set only one
project.manipulationSettings.set({ quoteKind: QuoteKind.Single });

// or multiple
project.manipulationSettings.set({
    quoteKind: QuoteKind.Single,
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
