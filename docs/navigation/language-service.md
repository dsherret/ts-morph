---
title: Language Service
---

## Language Service

Get the language service by calling:

```ts
const languageService = ast.getLanguageService();
```

### Underlying compiler object

The underlying `ts.LanguageService` can be retrieved as follows:

```ts
const tsLanguageService = languageService.compilerObject;
```

### Use

Generally you won't need to use the language service, because most of the functionality is exposed as methods on the wrapped `Node` objects.
