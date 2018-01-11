---
title: Literals
---

## Literals

Literals:

* `StringLiteral` (ex. `"some string"`)
* `NumericLiteral` (ex. `5`, `10.53`)
* `BooleanLiteral` (ex. `true`)
* `NoSubstitutionTemplateLiteral` (ex. `` `some string` ``)
* `RegularExpressionLiteral` (ex. `/pattern/gi`)

Methods:

* `.getLiteralValue()` - Returns the string, number, boolean, or RegExp value.
* `isTerminated()` - If the literal is terminated.
* `hasExtendedUnicodeEscape()` - If the literal has a unicode escape (ex. `\u{20bb7}`)
