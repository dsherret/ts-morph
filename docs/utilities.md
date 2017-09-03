---
title: Utilities
---

## Utilities

This is an outline of any utilities currently available in the library.

### Get compiler options from tsconfig.json

You can get the compiler options from a file by using the `getCompilerOptionsFromTsConfig` function:

```typescript
import {getCompilerOptionsFromTsConfig} from "ts-simple-ast";

const compilerOptions = getCompilerOptionsFromTsConfig("file/path/to/tsconfig.json");
```
