---
title: Literals
---

## Literals

Supported literals:

* `StringLiteral` (ex. `"some string"`)
* `NumericLiteral` (ex. `5`, `10.53`)
* `RegularExpressionLiteral` (ex. `/pattern/gi`)

Methods:

* `.getLiteralValue()` - Returns the string, number, or RegExp value.
* `isTerminated()` - If the literal is terminated.
* `hasExtendedUnicodeEscape()` - If the literal has a unicode escape (ex. `\u{20bb7}`)
