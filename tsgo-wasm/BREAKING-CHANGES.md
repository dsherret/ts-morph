# Migrating from ts-morph 28

This release replaces the npm `typescript` package with **tsgo** — TypeScript 7,
the Go compiler — compiled to WebAssembly and run in-process. One cause is behind
almost everything below: **tsgo owns parsing, binding, checking, module
resolution and the file system.** The `typescript` package let you hand the
compiler text and host callbacks and get a parsed tree back; tsgo inverts that —
you tell a session what changed and read results back — so the entire host layer
has nothing to plug into.

**Most code does not change.** `ts-morph`'s own runtime exports went from 538 to
528: eleven removed, one added. Manipulation output is byte-identical to 28.0.0
across every case measured — `addClass`, `setBodyText`, `insertStatements`,
`formatText`, `organizeImports`, `fixMissingImports`, rename, `SourceFile#move`,
`getStructure`. Diagnostic codes and spans are identical except for the handful
listed in §5. Find-references resolves a position to the same node it did on
28.0.0 at every offset of a one-line class.

What follows is ordered by how likely it is to bite you, not by subsystem.
Sections 1–7 are the ones worth reading before you upgrade; §8 is the reference.

Where something is a known unfinished gap rather than an intended change it says
so and points at [TODO.md](./TODO.md). Implementation history and the analysis
behind these decisions are in [MIGRATION-REPORT.md](./MIGRATION-REPORT.md).

---

## Contents

1. [Enum values changed — the silent one](#1-enum-values-changed--the-silent-one)
2. [`Type`, `Symbol` and `Signature` cannot outlive a manipulation](#2-type-symbol-and-signature-cannot-outlive-a-manipulation)
3. [The `ts` namespace is much smaller](#3-the-ts-namespace-is-much-smaller)
4. [Capabilities that are gone](#4-capabilities-that-are-gone)
5. [Diagnostics moved](#5-diagnostics-moved)
6. [Performance](#6-performance)
7. [Runtime, packaging and the browser](#7-runtime-packaging-and-the-browser)
8. [The rest, by area](#8-the-rest-by-area)
9. [Known gaps](#9-known-gaps-not-design-decisions)

- [Appendix A: enum renumbering in detail](#appendix-a-enum-renumbering-in-detail)
- [Appendix B: how this was measured](#appendix-b-how-this-was-measured)

---

## 1. Enum values changed — the silent one

**This is the highest-risk change in the release, because nothing tells you.**

The enums are tsgo's, and the numbers are the wire format shared with the Go
compiler, so they cannot be renumbered back. Measured against 28.0.0:

| Enum                   | 28.0.0 members | Now | Values changed               | Removed | Added |
| ---------------------- | -------------- | --- | ---------------------------- | ------- | ----- |
| `SyntaxKind`           | 396            | 386 | **202** of the 380 that stay | 16      | 6     |
| `NodeFlags`            | 42             | 41  | 29                           | 5       | 4     |
| `ObjectFlags`          | 44             | 47  | 18                           | 0       | 3     |
| `SymbolFlags`          | 65             | 68  | 5 (including `All`)          | 0       | 3     |
| `TypeFlags`            | 72             | 73  | 1 (`Intrinsic`)              | 0       | 1     |
| `NewLineKind`          | 2              | 5   | 2 — **both of them**         | 0       | 3     |
| `JsxEmit`              | 6              | 6   | 2 — **transposed**           | 0       | 0     |
| `ModuleDetectionKind`  | 3              | 4   | 2 — **transposed**           | 0       | 1     |
| `ScriptTarget`         | 17             | 14  | 0                            | 3       | 0     |
| `ModuleResolutionKind` | 6              | 6   | 0                            | 1       | 1     |

`SyntaxKind.Identifier` is `79`, not `80`. `SyntaxKind.SyntaxList` is `344`, not
`353`. `SyntaxKind.ClassDeclaration` is `264` in both — coincidence, and a
useless smoke test.

### The symptom

Code that names a member keeps working. Code that stores or hard-codes a _number_
breaks, and breaks quietly:

- A persisted `SyntaxKind` — in a cache, a fixture, a JSON rule file, a database —
  now names a different node kind. Nothing throws; you get wrong answers.
- `if (node.getKind() === 264)` is now a different test.
- A bit mask built by hand from `NodeFlags`, `ObjectFlags` or `SymbolFlags`
  values means something else. `SymbolFlags.All` moved from `-1` to `536870912`,
  so `flags & SymbolFlags.All` no longer matches everything.

### The three traps that keep their numbers valid

These are the worst, because the number stays in range and the compiler accepts
it — only the meaning changed:

| Setting           | `1` used to mean | `1` now means | `2` used to mean      | `2` now means    |
| ----------------- | ---------------- | ------------- | --------------------- | ---------------- |
| `newLineKind`     | `LineFeed`       | **CRLF**      | —                     | `LineFeed`       |
| `jsx`             | `Preserve`       | `Preserve`    | `React.createElement` | **react-native** |
| `moduleDetection` | `Legacy`         | **`Auto`**    | `Auto`                | **`Legacy`**     |

`NewLineKind` also gained `None = 0`, so a hard-coded `0` — which used to be
CRLF — is now `None`. That one is caught: `newLineKindToString` throws an
explanatory error rather than emitting the wrong ending. `jsx` and
`moduleDetection` are **not** caught, because both numbers are valid members.

### What to do

1. Grep your codebase for numeric literals compared against `getKind()`,
   `ts.SyntaxKind`, `getFlags()` or any `*Flags` value. Replace them with member
   references.
2. Invalidate anything that persisted a kind or a flag mask across the upgrade.
3. Never mix nodes and kinds from different backends. A tsgo node tested against
   a `typescript` package enum does not fail loudly — it misidentifies every node.

Full renumbering detail, including the members that were renamed or removed, is
in [Appendix A](#appendix-a-enum-renumbering-in-detail).

---

## 2. `Type`, `Symbol` and `Signature` cannot outlive a manipulation

In 28.0.0 these were plain JavaScript objects that stayed readable forever. They
are now **handles into the compiler snapshot whose checker produced them**. The
snapshot is inside the Wasm module; when a manipulation replaces the program, the
handle can go stale.

### The symptom

```
InvalidOperationError: This type came from a program that a manipulation has
since replaced. Types, symbols, and signatures are snapshots of the program that
created them, so they cannot be used once a source file has been manipulated —
get the type again from the manipulated code.
```

The compiler's own message — `api: client error: type handle 87 not found`, or
`snapshot 1 not found`, depending on which lookup failed — is kept as the error's
`cause`.

### What survives what

Measured on a handle taken before any manipulation, over several fixtures and
generation counts:

| Call                                                                                                                                                                       | Survives                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Type#getText()`, `#getApparentType()`, `#getNonNullableType()`, `Symbol#getDeclaredType()` — anything routed back through the **current** checker                         | **nothing you can rely on.** Throws from the first manipulation, and _which_ generations throw is not stable across fixtures |
| `Type#getProperties()`, `#getSymbol()`, `#getBaseTypes()`, `#getCallSignatures()`, `Symbol#getDeclarations()` — anything that resolves the handle against its own snapshot | at most **two** manipulations, then throws                                                                                   |
| `Type#getFlags()`, `Symbol#getName()`, `Symbol#getFlags()` — values already materialized on the client                                                                     | never throws                                                                                                                 |

The two-manipulation window exists because the registry keeps a superseded snapshot
alive when the checker answered from it (`retiredSnapshotLimit = 2`); every retained
snapshot pins a program and a checker inside the Wasm module. It is observable but not
a contract. **Treat a `Type`, `Symbol` or `Signature` as invalid the moment you
manipulate anything.**

Two is now counted in manipulations rather than in how often you asked the compiler
anything, and that is a **tightening**: while a manipulation opened a snapshot of its
own, a run of edits with no semantic query between them retired nothing, and a handle
taken before them went on answering however many there were. It no longer does — it
fails at the third, the same as it always did when the compiler was asked in between.
The window that a `Type` reliably survived was never wider than two; it was only
accidentally wider when nothing was asked.

### The pattern

```ts
// breaks
const type = decl.getType();
sourceFile.addStatements("const extra = 1;");
console.log(type.getText()); // InvalidOperationError

// works
sourceFile.addStatements("const extra = 1;");
console.log(decl.getType().getText()); // re-query after manipulating
```

If you need a value across an edit, read it out — `getText()`, `getName()`,
`getFlags()` — before the edit and keep the primitive, not the handle.

`Node` wrappers are not affected: they keep working across manipulations exactly
as they did.

---

## 3. The `ts` namespace is much smaller

`ts` is now tsgo's surface, not a re-export of the whole `typescript` module.
Measured: **2249 runtime keys → 411** (1930 removed, 92 added).

That headline number overstates the damage. Most of the 1930 were compiler
internals that only leaked because 28.0.0 bundled all of `typescript`. Of the
2249 keys, roughly **560 were names `typescript.d.ts` actually declares** — the
documented public API — and about **270 of those are gone.** (The exact split
depends on how you scrape `typescript.d.ts`; two independent passes gave 559/269
and 563/273.)

### What you would actually notice is missing

- **Programs and services:** `createProgram`, `createLanguageService`,
  `createDocumentRegistry`, `createCompilerHost`, `createIncrementalProgram`,
  `createWatchProgram`, `createSolutionBuilder`, `createClassifier`.
- **Printing and transforms:** `createPrinter`, `transform`, `transpile`,
  `transpileModule`, `transpileDeclaration`.
- **Module resolution:** `resolveModuleName`, `nodeModuleNameResolver`,
  `classicNameResolver`, `bundlerModuleNameResolver`,
  `createModuleResolutionCache`, `resolveTypeReferenceDirective`.
- **Config:** `parseJsonConfigFileContent`, `parseConfigFileTextToJson`,
  `readConfigFile`, `findConfigFile`, `convertCompilerOptionsFromJson`,
  `getParsedCommandLineOfConfigFile`, `getDefaultCompilerOptions`.
- **Diagnostics helpers:** `formatDiagnostics`,
  `formatDiagnosticsWithColorAndContext`, `flattenDiagnosticMessageText`,
  `sortAndDeduplicateDiagnostics`, `displayPartsToString`.
- **Positions and spans:** `getLineAndCharacterOfPosition`,
  `getPositionOfLineAndCharacter`, `createTextSpan`, `createTextSpanFromBounds`,
  `textSpanEnd`, `textSpanContainsPosition`, and the rest of the `textSpan*`
  family.
- **Node utilities:** `setTextRange`, `setOriginalNode`, `getOriginalNode`,
  `getNameOfDeclaration`, `getModifiers`, `findAncestor`, `idText`,
  `getCombinedNodeFlags`, `getJSDocTags` and the whole `getJSDoc*Tag` family,
  `setEmitFlags`, `setCommentRange`, `getSupportedCodeFixes`.
- **`ts.sys`** and **`ts.version`** (see below).
- **Enums:** `Extension`, `ExitStatus`, `EmitFlags`, `SymbolDisplayPartKind`,
  `SymbolFormatFlags`, `IndexKind`, `OrganizeImportsMode`, `QuotePreference`,
  `SemicolonPreference`, `ClassificationType`, and the watch/build enums.

`ts.OrganizeImportsMode` and `ts.QuotePreference` are gone because tsgo declares
them as unions of string literals rather than enums. `ts.OrganizeImportsMode.All`
is a `TypeError`; pass `"all"`, `"sortAndCombine"` or `"removeUnused"`.

### `ts.version` → `ts.getVersion()`

`ts.version` was a constant string; `ts.getVersion()` is a **function**, because
the version comes from the compiler and reaching it means having a session to ask.
It reports the Go compiler's version (`7.1.0-dev` at time of writing), where
28.0.0 reported `6.0.2`. `TypeScriptVersionChecker` is gone: there is one
compiler now, so there is nothing to branch on.

### Type guards: 671 → 349

Most `ts.isX` guards survive, but not all. Measured: 407 of 28.0.0's 671 guards
are gone and 85 are new.

One is a straight rename, and the old name is not aliased:
**`isParameter` → `isParameterDeclaration`.**

Three more look like renames and are **not** — the replacement already existed in
28.0.0 alongside the removed name, with a narrower meaning. Swapping them
silently changes what you match:

| Gone             | Nearest survivor            | Do not assume they are the same                                                                                           |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `isGetAccessor`  | `isGetAccessorDeclaration`  | both existed in 28.0.0                                                                                                    |
| `isSetAccessor`  | `isSetAccessorDeclaration`  | both existed in 28.0.0                                                                                                    |
| `isFunctionLike` | `isFunctionLikeDeclaration` | measured on 28.0.0: a `MethodSignature` and a `FunctionType` are `isFunctionLike` but **not** `isFunctionLikeDeclaration` |

Gone with no counterpart, among the ones you are most likely to have used:
`isPropertySignature`, `isMethodSignature`, `isTypeElement`, `isClassElement`,
`isStringLiteralLike`, `isAccessor`, `isObjectLiteralElement`,
`isDeclarationStatement`, `isIterationStatement`, `isOptionalChain`,
`isWhiteSpaceLike`, `isLineBreak`, `isIdentifierStart`/`isIdentifierPart`, and
the guards for the node kinds tsgo does not produce (§8.1).

ts-morph's own guards — `Node.isPropertySignature(node)` and the rest — are
unaffected. Prefer them.

### What is still there

`factory` and the whole node factory, `visitEachChild`, `visitNode`,
`forEachChild`, `skipTrivia`, `createScanner`, `tokenToString`,
`getLeadingCommentRanges`/`getTrailingCommentRanges`, `getDecorators`,
`getCombinedModifierFlags`, `escapeLeadingUnderscores`/`unescapeLeadingUnderscores`,
`getTextOfJSDocComment`, `addSyntheticLeadingComment` and the rest of the
synthetic-comment API, `createSourceFile`, `getPreEmitDiagnostics`, `printNode`,
and 264 of the `isX` guards.

---

## 4. Capabilities that are gone

| Capability                                                                              | Status                                                                                                                                                                                                                                                                                                                                            | What to do                                                                                                                                                                            |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`LanguageService#getEditsForRefactor`**, `RefactorEditInfo`                           | **Gone.** tsgo has no refactor subsystem at all — no providers, and its edit format cannot express "create a new file", so "move to a new file" has nowhere to write.                                                                                                                                                                             | No workaround. Perform the edit with ts-morph's own manipulation API.                                                                                                                 |
| **`SourceFile#fixUnusedIdentifiers`**                                                   | **Gone.** tsgo has the unused-identifier diagnostics and the deletion machinery, but no code-fix provider joins them, so the `unusedIdentifier_delete` fix-alls do not exist.                                                                                                                                                                     | Read the unused-identifier diagnostics (6133, 6196, …) and delete the nodes yourself. Tracked in [TODO.md](./TODO.md) — this needs a new provider in the compiler, not a route.       |
| **Most code fixes**                                                                     | tsgo ships **three** providers: `"fixMissingImport"`, `"fixMissingTypeAnnotationOnExports"`, `"fixClassIncorrectlyImplementsInterface"`. Spelling suggestions (2551), unused-import removal, missing-member and "add missing function declaration" are all measured absent — whether each is unimplemented or merely unrouted is not established. | `fixMissingImports` and `organizeImports` work. Everything else must be hand-rolled.                                                                                                  |
| **`resolveTypeReferenceDirectives`** on a resolution host                               | **Gone.** Type reference directives resolve down a separate path in the compiler with no hook. Module resolution itself is back (§8.6).                                                                                                                                                                                                           | No workaround. The `custom type reference directive resolution` tests are skipped.                                                                                                    |
| **`customTransformers`** on emit                                                        | **Gone**, and it fails _silently_: the option is removed from the types, but at runtime a transformer passed anyway is simply never called and the output is untransformed. tsgo's emit pipeline is built in Go from the compiler options and has no injection point.                                                                             | Transform the AST with `Node#transform` before emitting, or post-process the emitted text. `docs/emitting.md` still documents this option and is wrong.                               |
| **`createDocumentCache`** (`@ts-morph/common`)                                          | **Gone.** It deep-cloned a parsed `ts.SourceFile` and re-stamped its `fileName`; tsgo's nodes are lazy views over a binary buffer with a circular back-reference to their file, so they cannot be cloned that way.                                                                                                                                | The session's own snapshot cache serves the same purpose within a process. There is no cross-project reuse.                                                                           |
| **Services-layer suggestion diagnostics**                                               | **Gone.** tsgo's suggestions come from the checker only. Measured: `getSuggestionDiagnostics` on a `require()` call returns `[80001]` on 28.0.0 and `[]` now.                                                                                                                                                                                     | None.                                                                                                                                                                                 |
| **`CodeFixAction#getFixName`**                                                          | **Gone.** There is no `fixName` concept in tsgo. `getFixId()` and `getFixAllDescription()` are also off the surface, but those are a routing gap rather than an absence — see [TODO.md](./TODO.md).                                                                                                                                               | Match on the description, or on the fix ids listed above.                                                                                                                             |
| **`createHosts`, `TsSourceFileContainer`, `ts.CompilerHost`, `ts.LanguageServiceHost`** | **Gone.** tsgo owns the file system and parsing; there is no host to implement.                                                                                                                                                                                                                                                                   | `createModuleResolutionHost` and `Project#getModuleResolutionHost()` still exist for the file-system questions (§8.6).                                                                |
| **`matchFiles`, `getFileMatcherPatterns`** (`@ts-morph/common`)                         | **Gone.** They were thin wrappers over unexported `typescript` internals reached through `(ts as any)`, which worked on 28.0.0 only because it bundled the whole `typescript` module — measured working there, absent here. Their `FileMatcherPatterns` / `FileSystemEntries` types go with them.                                                 | tsgo does the equivalent internally; tsconfig include/exclude globbing is now its job. Exposing tsgo's own directory matcher is a route, not a capability — see [TODO.md](./TODO.md). |
| **`Project#formatDiagnosticsWithColorAndContext`**                                      | Still there, but ts-morph formats the diagnostics itself: no ANSI colour, no source line, no caret. You get `path(line,column): category TScode: message`.                                                                                                                                                                                        | tsgo has the real writer and it is not routed — [TODO.md](./TODO.md). Format the diagnostics yourself if you need the display.                                                        |
| **`LanguageService#getIdentationAtPosition`**                                           | **Gone** from the surface. `Node#getIndentationLevel()` still works but is now computed from the file's text rather than by the compiler's smart indenter.                                                                                                                                                                                        | See §8.4 for how close it gets and where it differs.                                                                                                                                  |
| **`ImplementationLocation#getDisplayParts`**                                            | **Gone.** `getKind()` is back. The implementations response carries spans only.                                                                                                                                                                                                                                                                   | Resolve the span to a node and ask ts-morph.                                                                                                                                          |

---

## 5. Diagnostics moved

Codes and spans are **identical** to 28.0.0 across every error case measured
except the ones below.

### Spans and codes that moved

| Case                                       | 28.0.0                                     | Now                                       |
| ------------------------------------------ | ------------------------------------------ | ----------------------------------------- |
| Unused import (`import { a } from "./b";`) | `6133` over the whole statement, `[0, 24]` | `6133` over just the identifier, `[9, 1]` |
| Unused type parameter                      | `6133` over `<T>`                          | **`6196`** over `T`                       |

The second one is the dangerous one: **a caller filtering on 6133 silently stops
seeing unused type parameters.** This is checker behaviour, not a ts-morph
choice.

### `Diagnostic` shape

- `getMessageText()` now always returns a `string`. tsgo puts the message on
  `text` and nests elaborating messages under `messageChain`, so a chain no
  longer arrives in place of the text — use the new `Diagnostic#getMessageChain()`.
- `DiagnosticMessageChain` wraps a `Diagnostic` (tsgo has no distinct chain type)
  and `getNext()` reads `messageChain` rather than `next`.
- **`Diagnostic#getSource()` is gone.** `ast.Diagnostic` has no source field. The
  only source string tsgo produces anywhere is a constant `"ts"` synthesized on
  the way into LSP, which is not per-diagnostic data. Note that 28.0.0 returned
  `undefined` here for program diagnostics too.
- `Diagnostic#getSourceFile()` resolves the diagnostic's file _by name_ against
  the files the project has wrapped, because tsgo reports a name rather than
  handing back the parsed file. A diagnostic on a file the program pulled in but
  the project never added yields `undefined`.
- `LanguageService#getSuggestionDiagnostics` and
  `Program#getSyntacticDiagnostics`/`getDeclarationDiagnostics` return
  `Diagnostic`, not `DiagnosticWithLocation`; tsgo has no separate type.

### Ordering

`ts.getPreEmitDiagnostics(program, sourceFile?)` is kept, but ts-morph assembles
it: tsgo reports config-file, program, syntactic, global and semantic diagnostics
separately and this concatenates them in that order, deduplicated. It takes no
cancellation token.

The result is in category order rather than sorted by file and position as
28.0.0's was — it sorted as part of deduplicating — so code that reads a
diagnostic out of the array by index may find a different one there. In practice
the two orders agree on the cases probed: file diagnostics come out by file and
position, and a file-less project diagnostic comes first on both builds.

### Removed TypeScript 6 options are now reported, and two of them change output silently

TypeScript 7 removed a set of options outright, and ts-morph forwards them
verbatim so the compiler's own diagnostic reaches you. Measured on a
programmatically configured project:

| Option                                                                                 | 28.0.0            | Now                                                                                     |
| -------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| `baseUrl`                                                                              | 5101 (deprecated) | **5102** (removed)                                                                      |
| `outFile`                                                                              | 5101              | **5102**, and **emit changes**: one bundle → one file per input                         |
| `downlevelIteration`                                                                   | 5101              | 5102                                                                                    |
| `target: ES5`                                                                          | 5107              | **5108**, and **emit changes**: `var C = (function(){…})()` → untranspiled `class C {}` |
| `moduleResolution: classic`/`node10`                                                   | 5107              | 5108                                                                                    |
| `module: AMD`/`System`/`UMD`                                                           | 5107              | 5108, plus a new 5095                                                                   |
| `alwaysStrict: false`, `esModuleInterop: false`, `allowSyntheticDefaultImports: false` | 5107              | 5108                                                                                    |
| `charset`                                                                              | 5102              | **5023** "unknown compiler option" — tsgo's parser does not know the name               |

The two marked "emit changes" are the ones to watch: the diagnostic is a warning,
emit still runs, and the output is different. `outFile` and `target: ES5` are
real behaviour changes, not just a stricter message.

`alwaysStrict`, `esModuleInterop` and `allowSyntheticDefaultImports` are **not**
removed from the type — TypeScript 7 removed only their `false` value, `true` is
`esModuleInterop`'s own default, so all three stay typed `boolean` and the
compiler is left to object. `baseUrl`, `outFile`, `downlevelIteration` and
`charset` are gone from `ts.CompilerOptions` as well as from the compiler.

### Two diagnostics that changed by _not_ appearing

- **`incremental: true` with no `tsBuildInfoFile`** reported 5074 and now reports
  nothing. The document registry opens its project from a `tsconfig.json` it
  writes itself, so there _is_ a configuration file to hold the build info
  beside. The option itself behaves the same.
- **18002** ("the `files` list in config file … is empty") is suppressed for the
  registry's own synthetic config, which is bookkeeping rather than anything the
  caller did.

Diagnostics from parsing a `tsconfig.json` the caller wrote **do** reach
`getPreEmitDiagnostics()`, as they did in 28.0.0 — measured identical
(`5023, 18003` on both for an unknown option). They are also on
`Project#getConfigFileParsingDiagnostics()` and
`Program#getConfigFileParsingDiagnostics()`.

An options diagnostic may carry fewer elaborating messages than the `typescript`
package attached: 5055 ("cannot write file … because it would overwrite input
file") arrived there with a 5068 chain suggesting a `tsconfig.json`; tsgo reports
the message alone.

### The default library files come from tsgo

They are the compiler's own copies, taken from the fork's
`internal/bundled/libs`, so the checker resolves globals against the library it
was built against. Until this release they were embedded from
`node_modules/typescript/lib` — a TypeScript 7 checker type-checking against
TypeScript 6's declarations. Expect small differences in global types and in the
diagnostics that mention them. `packages/common` no longer depends on
`typescript` at all.

---

## 6. Performance

Measured on this machine, in-memory file system, against a published 28.0.0 install
driven through the identical benchmark.

| Operation                                          | 28.0.0  | Now     |
| -------------------------------------------------- | ------- | ------- |
| `new Project({ tsConfigFilePath })`, 800 files     | 167 ms  | 512 ms  |
| `addSourceFilesAtPaths`, 800 files                 | 38 ms   | 309 ms  |
| First `getPreEmitDiagnostics()`, 800 files         | 547 ms  | 1003 ms |
| One edit, and reading the edited file back         | 0.38 ms | 0.79 ms |
| `createSourceFile` in a loop, 800 files            | 27 ms   | 20 ms   |
| `createSourceFile` and read each back, 1600 files  | 45 ms   | 127 ms  |
| `createSourceFile` and manipulate each, 1600 files | 129 ms  | 306 ms  |
| `getCompilerOptionsFromTsConfig`, repeated         | 0.4 ms  | 10.3 ms |

Every row is a constant factor, and everything on the editing side is **independent of
how many files the project holds**: one edit and a read costs 0.77/0.79/0.87/0.76 ms at
100/400/1600/3200 files.

**Why an edit costs what it costs.** ts-morph no longer owns the parser: the tree comes
from the compiler, over a wire, as a binary encoding that has to be decoded on this side.
28.0.0 re-parsed the file into JavaScript objects in the same heap, which is the whole of
the difference. What an edit does **not** do any more is open a compiler snapshot — a
manipulation is a text edit and a re-parse of one file, so the write is held and the
compiler is not told about it until something asks a question that needs a program.

**That is the one thing worth designing around: keep the semantic questions out of the
editing loop.** Types, symbols, diagnostics, references, rename, formatting, organize
imports and emit all need a program, and asking for one applies everything waiting.
Asking after every edit costs a snapshot per edit; asking once at the end costs one:

```ts
// slow: every edit is followed by a question that needs a program
for (const declaration of declarations)
  declaration.addJsDoc({ description: describe(declaration.getType()) });

// fast: read the types first, then edit
const described = declarations.map(d => [d, describe(d.getType())] as const);
for (const [declaration, description] of described)
  declaration.addJsDoc({ description });
```

At 400 files, an edit alone measures 1.23 ms and an edit followed by a `getType()` 4.39 ms
— against 0.38 and 2.04 on 28.0.0. The advice is the same on both; it costs more here.

**Creating files in a loop is fine, and so is reading them back.** Both are linear:
1600 files created and each one's statements read comes to 127 ms, 0.08 ms per file and
falling as the project grows. Creating and manipulating each file in the same breath —
the commonest codegen loop there is — is 306 ms at 1600 files, 0.19 ms per file.

**One shape still costs a reopen per file**, and it is worth knowing because nothing
about it looks expensive: creating files alongside a file with an _unresolved_ import
whose references have been asked for. `SourceFile#getReferencingSourceFiles` and friends
re-resolve on every file added, and re-resolving needs the compiler. With such a file in
the project a `createSourceFile` loop measures 2.9/2.6/4.0 ms per file at 100/400/1600 —
rising — where 28.0.0 measures 3.0/3.0/6.0, so this one is not a regression so much as a
trap both versions share. Name the whole batch in one call and it goes away:
`Project#createSourceFiles` takes the same text, structure or writer function
`createSourceFile` does, hands the files back in the order they were given, and writes
every file's text before the first of them is reported as added — so the re-resolve costs
one reopen for the run rather than one per file:

```ts
const created = project.createSourceFiles(files.map(([filePath, text]) => ({ filePath, text })));
for (const sourceFile of created)
  doSomethingWith(sourceFile.getStatements());
```

Files that are already on the file system are better added in one call still, which skips
the create bookkeeping too:

```ts
const project = new Project({ useInMemoryFileSystem: true });
const fs = project.getFileSystem();
for (const [path, text] of files)
  fs.writeFileSync(path, text);
project.addSourceFilesAtPaths("/**/*.ts");
```

Two smaller regressions worth knowing:

- `getCompilerOptionsFromTsConfig` builds a throwaway Wasm instance per call, so it does
  not get cheaper when repeated: ~8× slower on the first call and ~26× slower on
  subsequent ones. Do not call it in a loop.
- `ts.createSourceFile` went from ~0.03 ms to ~0.9 ms, because every parse now goes to
  the server.

**A `Type`, `Symbol` or `Signature` still survives exactly two manipulations** — see §2 —
and that is counted in manipulations, not in how often you ask the compiler anything.

---

## 7. Runtime, packaging and the browser

- **Requires WebAssembly.** Node, Deno and browsers are all supported. The
  compiler is a Wasm reactor with a `wasi_snapshot_preview1` shim written against
  the web platform only — `node:wasi` is not imported by any shipped artifact.
- **A 9.50 MiB `typescript.wasm.gz` ships beside the bundle.** The module is
  43.02 MiB and ships gzipped; the loader gunzips it on first use, which costs
  **about 60 ms once per process** — measured 30 ms to read and compile the raw
  file against 83 ms to read, gunzip and compile the compressed one, so **+53 ms**
  net on Node 24, and the same order in Chrome. `WebAssembly.compile` is only
  ~20 ms of either, because V8 compiles Wasm functions lazily, so the gunzip is
  genuinely the dominant cost on the load path rather than noise on an already
  slow step. What those 60 ms buy is 33.5 MiB off everything that stores the file
  unpacked: **`@ts-morph/common` installs at 18.3 MB rather than ~53 MB**, and so
  do the Docker layers, CI caches and bundled lambdas carrying it, while a browser
  downloads 9.5 MiB instead of 43. The npm tarball itself is ~11 MB either way —
  npm always gzipped it in transit, so this is what it costs once unpacked.
  `ts-morph`'s own tarball is ~0.2 MB.
- **Bytes and responses handed to `initializeWasm` may be gzipped or not** — which
  they are is read off the gzip magic number, so the shipped asset, a decompressed
  copy, and a response a host already unwrapped all work. Node and Deno also
  accept an unwrapped `typescript.wasm` sitting beside the `.gz`, for a build that
  cannot carry the compressed file through.
- **Single-threaded:** one compiler request runs to completion at a time.
- **The compiler is no longer a plain-JS dependency,** so setups that bundled
  `typescript` from source are affected.
- **JSR publishing is still unsolved.** Compression takes the package from ~48 MB
  to 13.7 MiB, under JSR's 20 MiB limit, and `deno publish --dry-run` is green —
  but the wasm still cannot be loaded over `https:`, which is the other half of
  the problem and untouched. See [TODO.md](./TODO.md) §4.

### Browsers

ts-morph runs in a browser, with two requirements that are not optional:

1. **It must run in a Web Worker, not on the main thread.** V8 refuses both
   `new WebAssembly.Module` and `new WebAssembly.Instance` above 8 MB on the main
   thread, so no arrangement of async initialisation helps — every entry point is
   synchronous below the surface. In a worker the browser behaves as Node does:
   ~27 ms to compile, ~4 ms to instantiate.
2. **`await initializeWasm()` before the first `Project`.** Node and Deno read
   `typescript.wasm.gz` from beside the bundle synchronously; a browser has no
   synchronous way to reach an asset that size, so it fetches, gunzips and
   compiles it once, up front.

```js
import { initializeWasm, Project } from "ts-morph";

await initializeWasm(); // once, at worker startup
const project = new Project({ useInMemoryFileSystem: true });
```

`initializeWasm({ wasm })` accepts a `Response`, a `URL`, bytes, or an
already-compiled `WebAssembly.Module` — a module survives `postMessage`, so one
thread can compile the reactor and hand it to every worker.

There is **no file system** in a browser: use `useInMemoryFileSystem: true`.
Every Node built-in is stubbed out of the browser build and touching one throws
with the name of the module it wanted. No cross-origin isolation is required.

The full browser guide — serving, caching, bundler behaviour, the acceptance test
— is [tsgo-wasm/browser/README.md](./browser/README.md).

---

## 8. The rest, by area

### 8.1 Nodes and the AST

**Node kinds tsgo does not produce.** These wrappers, their `Node.isX` guards and
their kinds are removed: `CommaListExpression`, `JSDocFunctionType`,
`JSDocAuthorTag`, `JSDocClassTag`, `JSDocEnumTag`, `JSDocMemberName`,
`JSDocNamepathType`, `JSDocUnknownType`. tsgo's parser emits no such kinds, so
the wrappers could never be instantiated. `SyntaxKind.JSDocTag` — classic's
catch-all — is now `SyntaxKind.JSDocUnknownTag`, and the `JSDocUnknownTag`
wrapper is reachable under the new kind.

**Binder internals are not on nodes.** `.symbol`, `.locals` and `.emitNode` are
not properties of a client-side node: the node is a lazy view over a binary
buffer and the binder's tables live on the Go side.

- Symbol lookups go through the checker (`getSymbolAtLocation`).
- `Node#getLocals()` / `getLocal()` / `getLocalOrThrow()` work, returning an
  **ordered array** of symbols rather than a `ts.SymbolTable` — a Go map has no
  order, so they are sorted by first-declaration position, which reproduces
  declaration order. `ts.SymbolTable` is removed.
- `Symbol#getGlobalExport(s)` works, reached through the module symbol's value
  declaration.
- Synthetic comments and emit flags reach the printer through the print request
  rather than through an `.emitNode` property; `ts.addSyntheticLeadingComment`
  and friends work.

**`Node#getSymbol()` on an anonymous declaration answers as it did.** An arrow
function, object literal, type literal, mapped type, function or constructor
type, call/construct/index signature and constructor all report the binder's
internal symbol again — `__function`, `__object`, `__type`, `__call`, `__new`,
`__index`, `__constructor` — measured identical to 28.0.0. It gets there by a
different road: `Node#getSymbol()` used to read the binder symbol off the node,
and tsgo's nodes carry no such field, so a declaration with no name to ask the
checker with is now answered by asking the checker about the declaration itself.

One case moved the other way: an **anonymous `FunctionExpression`** now reports
`__function` where 28.0.0 reported `undefined`.

**Array binding pattern elisions are `BindingElement`s.** The hole in
`const [, a] = x` was an `OmittedExpression`; tsgo parses it as a zero-width
`BindingElement` with no name. `ArrayBindingPattern#getElements()` is now
declared `BindingElement[]`, and a `Node.isOmittedExpression` filter over a
binding pattern matches nothing. Array _literal_ elisions (`[1, , 3]`) are still
`OmittedExpression` — measured unchanged. Because the compiler's
`BindingElement.name` is not optional, `#getNameNode()` and `#getName()` throw an
`InvalidOperationError` on an elision; the new `BindingElement#isElision()` tells
them apart. Nothing in ts-morph that walks a binding pattern looking for a name is
affected — they skip elisions.

**`sourceFile.fileName` cannot be assigned.** `fileName`, and most other
source-file data, is a getter with no setter. In strict mode — which is to say in
an ES module or in compiled TypeScript — assigning throws
`TypeError: Cannot set property fileName of #<RemoteSourceFile> which has only a
getter`. **In sloppy-mode CommonJS it silently does nothing**, which is the worse
case. Use `setSourceFileProperty(sourceFile, "fileName", value)` from
`@ts-morph/common`, which defines an own data property that shadows the getter.

**Nodes are lazy views.** They are materialized on demand over a binary buffer and
hold a circular reference back to their source file. They are not plain objects
and do not survive a recursive deep clone.

**`getChildren` is reconstructed.** tsgo's AST stores only real nodes —
punctuation and keyword tokens, and the `SyntaxList` nodes ts-morph exposes, are
not in the tree. They are rebuilt on the client by scanning the gaps between the
stored children, and results are cached per node so wrapper identity holds.
Output matches 28.0.0's spans, order and token parents, with one exception: a doc
comment's prose is a `JSDocText` child node, where 28.0.0 kept plain prose as a
string on `JSDoc.comment` and so had no child at all. Measured: `getChildren()`
on a `/** prose */` returns `[]` on 28.0.0 and `[JSDocText]` now, and descendant
counts rise accordingly.

A rebuilt node has no compiler-side handle. Positional questions still have an
answer — the answer for the nearest stored ancestor — but `getTypeAtLocation` on
one returns the `any` type and `getSymbolAtLocation` returns `undefined`.
`@ts-morph/common` exports `isReconstructedNode(node)` and `getStoredNode(node)`
if you need to know.

**`SourceFile#getLanguageVersion()`** reports the project's configured `target`
(defaulting to `ScriptTarget.Latest`) and follows later option changes, because
tsgo records no per-file script target. Measured `99` on both builds for a
default project, so the common case is unchanged — but it no longer describes how
the file was parsed.

**`JSDocNullableType#isPostfix` / `JSDocNonNullableType#isPostfix`** are gone;
tsgo does not record whether `?`/`!` was written before or after the type.
_(Documented from the compiler's AST definition; not isolated by a runtime
probe.)_

### 8.2 Types and the checker

- **`Type#getLiteralValue()` returns JavaScript values.** A bigint literal type
  yields a `bigint` (`1n`) rather than a `{negative, base10Value}` object, and a
  boolean literal type yields `true`/`false` where 28.0.0 returned `undefined`.
  So `getLiteralValueOrThrow()` no longer throws on a boolean literal type, and
  `getLiteralValue() === undefined` is no longer a reliable "not a literal type"
  test. `ts.PseudoBigInt` is gone.
- **`Type#getConstraint()` is narrower.** tsgo resolves a constraint only for
  type parameters and substitution types. Measured against 28.0.0 on
  `declare function g<T extends keyof Obj>(ia: Obj[T], idx: keyof Obj, cond: T extends string ? 1 : 2)`:
  the **indexed access** returned `string | number`, the **index** type returned
  `keyof Obj` and the **conditional** returned `1`; all three now return
  `undefined`. A type parameter still resolves (`keyof Obj`).

  Measure this with a type that is genuinely deferred, as above. Written against
  a resolved instantiation instead — `type Cond<T> = T extends string ? 1 : 2`
  queried as `Cond<string>` — every case reads `undefined` on _both_ builds,
  because the type has already collapsed to its result and is no longer
  conditional. That fixture reports "unchanged" for differences that are real.

  `Type#getDefault()` resolves only for type parameters.
- **`Type#getTargetType()` returns a plain `Type`.** It was `Type<ts.GenericType>`;
  `Type#getBaseTypes()` was `Type<ts.BaseType>[]` and is now `Type<ts.Type>[]`.
  Declaration-only — measured identical runtime values.
- **A variable initialized with a function prints as `typeof` in nested
  positions.** tsgo widened when the checker writes `typeof x`: upstream lets a
  variable assigned a function expression or arrow take the `typeof` form, where
  the `typescript` package restricted it to static methods and module-level
  function _declarations_. ts-morph clears the flag for exactly that widened case,
  so the top-level form is unchanged, but the flag is all-or-nothing per print,
  so a nested occurrence still differs and cannot be corrected from this side:

  |                              | 28.0.0                          | Now                |
  | ---------------------------- | ------------------------------- | ------------------ |
  | `const f = (a: number) => a` | `(a: number) => number`         | same               |
  | `const t = [f]`              | `((a: number) => number)[]`     | `(typeof f)[]`     |
  | `const w = { m: f }`         | `{ m: (a: number) => number; }` | `{ m: typeof f; }` |

  All three measured. Reverting the widening belongs upstream.
- **`TypeFormatFlags` is an alias of `NodeBuilderFlags`, and the alias is
  backwards.** tsgo's `typeToString` takes `NodeBuilderFlags`, so that is what
  ts-morph declares under the name `TypeFormatFlags`. Measured: 18 members shared
  with 28.0.0's `TypeFormatFlags`, 6 gone (`AddUndefined`,
  `WriteArrowStyleSignature`, `InArrayType`, `InElementType`,
  `InFirstTypeArgument`, `NodeBuilderFlagsMask`), 15 `NodeBuilderFlags`-only
  members added. **Five of the six removed values are live under other meanings**,
  so a persisted numeric mask silently changes behaviour. The Go compiler does
  have a real `TypeFormatFlags` whose values match 28.0.0's and which the API
  already casts the client's number to — the alias is a routing gap, not a
  design decision ([TODO.md](./TODO.md)).
- **Documentation comes back as one plain string.** tsgo renders a documentation
  comment or a JSDoc tag as one string rather than a classified
  `SymbolDisplayPart[]`, so the whole string arrives as a single part of kind
  `"text"` and empty text arrives as no parts. Measured on `@param a the a`:
  28.0.0 gave `[{parameterName:"a"}, {space:" "}, {text:"the a"}]`; now
  `[{kind:"text", text:"a the a"}]`. Affects `Signature#getDocumentationComments`
  and `#getJsDocTags`, `Symbol#getJsDocTags`, and `JSDocTagInfo#getText()`. Plain
  prose is unchanged: a one-sentence doc comment gives one `"text"` part on both.
- **Restored, and measured at parity with 28.0.0:** `TypeChecker#getAmbientModules`
  (and `Project#getAmbientModule(s)`), `#getAwaitedType`, `#getFullyQualifiedName`,
  `#getExportSymbolOfSymbol`, `#getSymbolsInScope`, `Node#getSymbolsInScope`,
  `Symbol#getExportSymbol`, `Symbol#getGlobalExports`, `Node#getLocals`,
  `Signature#getDocumentationComments`/`getJsDocTags`. One gap remains:
  `getAmbientModules` reports nothing for `@types` packages added to the file
  system after the project was created unless some file imports them.
  `TypeChecker#getLocals(node)` is new.

### 8.3 Printing and transforms

`Node#transform`, `TransformTraversalControl`, `ts.factory`, `ts.visitEachChild`
and the free `printNode` all work. The transformation pipeline they were thought
to need was `ts.transform`, but that only drove the visitor — tsgo ships the node
factory and the visitor in JavaScript and prints on the server.

- **`visitEachChild` visits token children.** The `typescript` package reserved
  tokens for a separate `tokenVisitor` and skipped them otherwise; tsgo's
  generated visitor hands them to the same visitor as every other child. A
  transform over `const x = 1 + 2;` visits 10 nodes where 28.0.0 visited 8, so a
  transform that annotates every childless node also annotates the binary operator
  and the end-of-file token.
- **`factory.updateX` builds a fresh node** rather than re-ranging the one it
  updates. ts-morph's factory copies the original's range and parent onto the
  result, which is what makes leading comments and doc comments survive an update
  exactly as `factory.update()` did.
- **`PrintNodeOptions#emitHint` is gone.** tsgo's printer dispatches on the node's
  kind and takes no hint. `ts.EmitHint` is retained for shape only, as a `const`
  object rather than an enum — so it is not a nominal type, and any numeric
  literal in range is assignable where a member reference used to be required.
- **`PrintNodeOptions#scriptKind` only names the file** the supplied source text
  is read back under, so it no longer decides whether `<T>x` prints as a type
  assertion or as JSX — that follows from the node. A node the caller names no
  file for is printed against the file it was parsed from, which is what keeps its
  comments.
- `PrintNodeOptions` gains tsgo's `preserveSourceNewlines`, `neverAsciiEscape` and
  `terminateUnterminatedLiterals`, and keeps `removeComments`, `newLineKind` and
  `scriptKind`.
- `newLineKind` is applied by the printer rather than by rewriting the printed
  text, so a line break the program owns — inside a template literal, say — keeps
  whatever the source gave it.
- The free `printNode(node)` preserves comments, as it did on 28.0.0 (measured
  identical output for `/** doc */ class C {}`).

**`ts.createSourceFile` parses in a scratch project.** tsgo parses on the server
and every server-side parse belongs to a project, so this runs against a scratch
project holding only the files handed to it. It opens no checker, resolves no
modules and loads no lib files. Three differences:

- `languageVersion` is ignored — tsgo records no per-file script target and its
  scanner always scans at the latest. `sourceFile.languageVersion` is `undefined`
  where 28.0.0 reported the value passed.
- `setParentNodes` is ignored — tsgo's parser always links parents, so a node from
  here always has one and asking for a parentless tree does not get you one
  (measured: `setParentNodes: false` still yields linked parents).
- The scratch path rotates over 32 slots, so a tree held across many later calls
  can in principle be reparsed out from under you. _Unverified as an observable
  effect: a tree retained across 40 rotations still answered correctly._ Do not
  rely on either outcome.

`scriptKind` is honoured, by choosing the file extension that implies it, since
tsgo derives the script kind from the file name.

### 8.4 Formatting and manipulation settings

**`EditorSettings` and `FormatCodeSettings` are reduced** to
`{ tabSize?, indentSize?, convertTabsToSpaces?, indentStyle?, newLineCharacter?,
trimTrailingWhitespace? }`. `FormatCodeSettings` adds nothing to `EditorSettings`.
`ts.IndentStyle` still exists with its classic `None`/`Block`/`Smart` values.

Gone: `baseIndentSize`, `semicolons`, `indentSwitchCase`,
`indentMultiLineObjectLiteralBeginningOnBlankLine` and the entire
`insertSpaceAfter…` / `insertSpaceBefore…` / `placeOpenBraceOnNewLineFor…`
family. tsgo's formatter reads all of them; the API's wire struct carries only
the six above, so this is a routing gap ([TODO.md](./TODO.md)). Neither interface
has an index signature, so passing a dropped option is a **compile error** rather
than a silent no-op — deliberate, because the runtime would otherwise say nothing.

`ts.UserPreferences` is reduced to
`{ quotePreference, providePrefixAndSuffixTextForRename }`.

**Two options survive as ts-morph's own,** applied by ts-morph rather than by the
formatter: `ensureNewLineAtEndOfFile` and
`insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces`. The brace option drives
ts-morph's structure printers and is also applied to the formatter's edits, since
tsgo's formatter always writes `{ a }`. It reaches `SourceFile#formatText`,
`Node#formatText`, `LanguageService#getFormattedDocumentText` and both
`getFormattingEdits…` methods; measured identical to 28.0.0 for
`formatText({ insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false })`.

Three things it does not reach:

- A brace written inside a string, a template, a comment or JSX text — only the
  gap between two real tokens is rewritten. That includes the braces of a jsdoc
  `{@link}` or `{number}`, which are real brace tokens and are skipped with the
  rest of the jsdoc.
- A comment sitting between the two tokens (`const o = { a: 1 /* c */ };`), which
  the `typescript` package closed up. What sits between them is then not a space,
  and the formatter's own spacing stands.
- The edits tsgo writes itself. An import added by `SourceFile#fixMissingImports`
  or rewritten by `organizeImports` is written `import { a } from "./b"` whatever
  the option says — those are code-fix edits, whose text is tsgo's rather than a
  span of the file ts-morph can point at.

A `}` that closed a code block keeps the space after it (`class C {m() {} }`),
matching the `typescript` package's higher-priority `SpaceAfterCloseBrace` rule.
Line endings are normalized by ts-morph after formatting, from its manipulation
settings.

**`Node#getIndentationLevel()` is computed from the text.** tsgo's smart indenter
is not routed through the API ([TODO.md](./TODO.md)), so ts-morph models it from
the file's own text: a node is a level past the line the innermost construct that
opened before it starts on, or level with that construct when they share a line;
a node starting with `{` or `}` lines up with the construct it delimits, except
an object literal's opening brace; at either bracket of a tracked list, and at the
start of each of its entries and separators, the level is one past the line the
list opened on; a `,` or bracket following a wrapped list lines up under the entry
before it; and a keyword resuming a construct after its brace (`else`, `catch`,
`finally`, the `while` of a `do`, the `from` of an `import`) stays level with the
construct.

This is **not only a query**: `setBodyText`, `addStatements`, `insertStatements`
and `set({ statements })` indent inserted code to it, so a wrong level shows up in
emitted text.

How close it gets: over 112 snippets read under three indentation settings — brace
styles, 2/3/4-space and tab indents, generics, wrapped lists, JSDoc, JSX — **287 of
8217 probed positions differ from 28.0.0**, down from 2771 before the rules were
modelled, and no manipulation output regressed. What is left is mostly the
compiler's per-kind table of which parents indent which children, which the text
gives no hint of: the `;` closing an `export { … };`, a `default:` clause holding
a block, the branches of a wrapped union type, the statement of a
`LabeledStatement`, the mid-line tokens of `switch` and `PropertySignature`, the
tokens of a JSX closing tag, the `EndOfFile` token after a trailing statement, and
the second `else` of an `else if` chain.

The level is fractional when the file's indentation is not a whole multiple of
`manipulationSettings.indentationText` — a two-space file read with the default
four-space setting puts a method body at level `0.5` — and the writers reproduce
that fraction literally. 28.0.0 did this too.

### 8.5 Language service

**There is no `ts.LanguageService`.** Formatting, organize-imports, rename,
definitions, implementations and code fixes are methods on the tsgo session's
project, and the program and checker hang off it too, so
`LanguageService#compilerObject` returns that project.
`ProjectContext#getSourceFileContainer()` is gone with the hosts it fed.

These methods return **character offsets**, not LSP positions: `formatDocument`,
`formatDocumentRange`, `organizeImports`, `rename`, `getDefinition`,
`getImplementations`, `getCodeFixes`.

**Signatures that changed:**

| Method                                                 | Change                                                                                                                                                                                                                                                           |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `findRenameLocations(node, newName, options?)`         | `newName` is now **required** and is the second parameter, so a third positional argument shifted. tsgo computes a rename as the edits that perform it; the `prefixText`/`suffixText` a `RenameLocation` reports are recovered from the edit's replacement text. |
| `organizeImports(fileOrPath, mode?)`                   | Format settings and user preferences parameters are gone. `SourceFile#organizeImports()` takes none.                                                                                                                                                             |
| `getCodeFixesAtPosition(file, start, end, errorCodes)` | Format settings and user preferences parameters are gone.                                                                                                                                                                                                        |
| `getCombinedCodeFix(file, fixId, formatSettings?)`     | User preferences parameter is gone; `fixId` is typed `string` rather than `{}`. The only ids that exist are `"fixMissingImport"`, `"fixMissingTypeAnnotationOnExports"` and `"fixClassIncorrectlyImplementsInterface"`.                                          |
| `SourceFile#fixMissingImports(formatSettings?)`        | User preferences parameter is gone.                                                                                                                                                                                                                              |

Losing the user preferences parameter does **not** mean the settings stopped
working. `ManipulationSettingsContainer#getUserPreferences()` still carries the
two ts-morph ever populated and both still reach the compiler on their own request
fields: `quoteKind` decides the quotes an inserted import is written with, and
`usePrefixAndSuffixTextForRename` reaches rename. What is gone is passing
_arbitrary_ `ts.UserPreferences` per call.

**Find-references resolves to the token a position touches,** as it did on
28.0.0. A position at the end of a name, a keyword or a private identifier still
belongs to that token, so `class C|` still asks about `C`; a position in leading
trivia belongs to no token and yields nothing. Measured: sweeping every offset of
`class C { m(a: string) { return a; } }`, `findReferencesAtPosition` resolves to
the same node and returns the same reference spans at every one.

**But `isDefinition()` changed meaning, and that changes what a filter returns.**
It now means "this reference is the entry's definition node". Measured on the
parameter `a` in that fixture: both builds return the same two spans, 12 and 32;
28.0.0 reported `isDefinition()` as `undefined` for both, and the new build
reports `true` for 12 and `false` for 32. `findReferencesAsNodes()` filters
definitions out, so it returns `[32]` where 28.0.0 returned `[12, 32]`. If you
filter on `isDefinition()`, re-check what you get.

`isWriteAccess()` works, from the same classification TypeScript uses.

**A definition's `getKind()` is derived from the definition symbol,** because
tsgo does not classify a definition at all. It is derived the way
`getSymbolKind` derived it — what the symbol is as a value first, then what it is
as a type — so a merged declaration reads as it did (a function merged with a
namespace is a `function`, a namespace merged with a `const` is a `const`, and a
namespace reads `module` only when it is nothing else), and `const`, `let`, `var`
and `parameter` are told apart by the declaration, as TypeScript told them apart.
Seven rows read differently from 28.0.0:

| Written                                              | 28.0.0                      | Now             |
| ---------------------------------------------------- | --------------------------- | --------------- |
| `using x = …` / `await using x = …`                  | `using` / `await using`     | `var`           |
| a variable in a function body                        | `local var`                 | `var`           |
| a function in a function body                        | `local function`            | `function`      |
| a named class expression, from its own name          | `local class`               | `class`         |
| `this`                                               | `parameter`                 | `class`         |
| `import * as ns from "…"`, `import x = require("…")` | `alias` / `module`          | `""`            |
| a call through a variable holding a function         | `function`/`local function` | `const` / `let` |

The first four are kinds `ts.ScriptElementKind` no longer declares — a kind that
did not survive reads as the kind it is a special case of. `this` differs because
the kind is derived from the symbol alone, and TypeScript classified `this` by the
position rather than by the symbol it resolves to. The last two are not about the
kind but about the definition tsgo answers with: a namespace import is answered
with the imported file itself, which the checker has no symbol at, and
`const f = () => {}` called as `f()` is answered with the variable declaration
where 28.0.0 answered with the arrow function. A constructor definition reads
`class` for the same reason — the symbol at its span is the class's.

Two more, both the checker rather than the classification. In a `.js` file
`exports.f = function () {}` reads `var` where 28.0.0 read `property`, because
tsgo's binder gives that symbol `FunctionScopedVariable` where TypeScript gave it
`Property`. A property that only exists on a union — `{ m(): void } | { m: number }`
— is classified per definition, so `u.m` reads `["method", "property"]` where
28.0.0 read `["property", "property"]` from the one synthetic symbol.

Five residues remain, all of them tsgo not storing a node to ask about:

- A search starting at a `constructor` keyword drops the declaration's own
  keyword from the results, so a constructor's entry holds its call sites and not
  its declaration. (`ConstructorDeclaration#findReferencesAsNodes()` dropped the
  declaration anyway.)
- Type keywords tsgo does not store as nodes — `keyof`, `readonly` as a type
  operator, `typeof` in a type query, `unique`. Where the adjustment reaches
  through, the answer is the same: `keyof U` answers with `U`'s references. Where
  it does not — `keyof { a: 1 }`, `readonly string[]`, and `typeof`/`unique`
  always — the position yields nothing, where 28.0.0 answered with every other
  occurrence of that keyword. Type keywords that _are_ nodes (`string`, `number`,
  `void`, …) answer as before, except that the `void` of `void 0` is left out.
- The `default` of `export default someValue` yields nothing.
- An unnamed `export default class {}` or `export default function () {}` answers
  nothing where 28.0.0 answered with the `default` keyword.
- The `static` of a class static block, an `export =` reached through
  `require("…")`, and the path of a `/// <reference path="…" />` are outside
  tsgo's reference search.

**`DefinitionInfo#getContainerName()`** names the declaration the definition is
written in rather than the definition symbol's parent, because tsgo reports a
definition as a span alone. A class, interface or enum member, a namespaced or
ambient-module declaration, a declaration written in an object literal, a
namespace container and a module-level export all read as they did — measured
`"./mod"` for a module export, `"Cls"` for a member, `""` for a local, on both
builds. A namespace is qualified only as far as the asking position needs, so
`Outer.Inner.iv` reads `Outer.Inner` from a file's top level and `Inner` from
inside `Outer`. One residue: a namespace shadowed at the asking position is
trimmed as if it were not. `getContainerKind()`
is `""` rather than `undefined`; neither build ever classifies the container.

**Rename and implementations resolve against a single project.** Code fixes
prepare the auto-import registry, which makes the first call more expensive.

The session declares no LSP client capabilities, so the API returns plain per-file
edit lists and cannot carry versioned edits or create/rename/delete-file
operations. A code fix that would touch a file outside the program is dropped
whole rather than applied in part; rename raises an error instead of returning a
partial edit set. Only a declaration source map can put rename in that position.

Rename rewrites every file the project holds, `node_modules` included, matching
`findRenameLocations` — the "you cannot rename elements defined in a node_modules
folder" rule and the standard-library and `default`-keyword rules beside it are
tsserver's, which is to say an editor's, and this API is not an editor. The
standard library is nonetheless never written to: its source files are left out of
the search.

**Organize-imports coalesces edits:** two adjacent import deletions come back as
one text change spanning both.

**Reference display parts use the LSP vocabulary.**
`SymbolDisplayPart#getKind()` on a reference definition's parts reports
`"method name"`, `"whitespace"` where the `typescript` package reported
`"functionName"`, `"space"`, and a keyword run carries the space that follows it
rather than the space being a run of its own.

### 8.6 Project, tsconfig and the file system

**Custom module resolution is back, in a different shape.** `ResolutionHost`,
`ResolutionHostFactory`, `ResolutionHosts` (including `ResolutionHosts.deno`) and
`ProjectOptions#resolutionHost` all exist; the compiler asks the host where a
specifier points before resolving it itself. What changed:

- A host answers **one specifier at a time**, because that is how the compiler
  asks. `resolveModuleNames`, which took an array, is gone.
- A host may hand back a **different specifier** and let the compiler resolve
  that, which is what `ResolutionHosts.deno` now does — dropping the `.ts` says
  where to look and the compiler still decides how.
- The factory takes only `getCompilerOptions`:
  `(getCompilerOptions: () => ts.CompilerOptions) => ResolutionHost`. There is no
  module resolution host to hand it, because a host no longer resolves for itself.
- A host is told the `resolutionMode` of the import — `ModuleKind.CommonJS` or
  `ModuleKind.ESNext`, or `undefined` when the compiler has no opinion — which is
  finer than `resolveModuleNames` gave it. Neither `containingSourceFile` nor
  `redirectedReference` is surfaced.
- `getResolvedModuleWithFailedLookupLocationsFromCache` is gone; the compiler owns
  the cache.
- **`resolveTypeReferenceDirectives` is not covered** (§4).

`docs/setup/index.md` has the current example.

**`createModuleResolutionHost`, `ts.ModuleResolutionHost` and
`Project#getModuleResolutionHost()`** still exist. Nothing in them ever touched
the compiler — they are file-system questions asked of the project's own caches
and `TransactionalFileSystem` — so the host is rebuilt on those, with its source
file container typed structurally rather than as `TsSourceFileContainer`. tsgo
resolves modules itself and does not consult this host; it exists for callers that
want "does this file exist, counting files added only in memory", which nothing
else answers.

**tsconfig parsing goes through tsgo.** `ts.parseJsonConfigFileContent`,
`ts.parseConfigFileTextToJson`, `ts.ParseConfigHost` and `getTsParseConfigHost`
are gone; `TsConfigResolver` uses the API's `parseConfigFile`.
`TsConfigResolver#getErrors()` reports the real parse diagnostics, and a
`tsconfig.json` whose syntax does not parse throws, as it always did. What changed
is the options object: where TypeScript kept the key with an `undefined` value for
an option it could not use (`{ "target": "FUN" }` gave `{ target: undefined }`),
tsgo leaves the key out entirely. The accompanying diagnostic is unchanged.

**`lib` accepts short names as well as file names.** `CompilerOptions#lib` is
typed `string[]` and the `typescript` package filled it with library _file_ names
(`lib.es2015.d.ts`); a `tsconfig.json`'s `lib` is an enum of short names, and that
config is what the registry hands the compiler, so the adapter maps
`lib.<name>.d.ts` to `<name>` on the way through. Measured: `lib:
["lib.es2015.d.ts"]` reports no diagnostics on either build, and `lib: ["es2015"]`
— which failed to find the library on 28.0.0, giving eleven diagnostics — now works. A
widening; no existing setting changes meaning.

**`getEmitModuleResolutionKind`** survives as a `@ts-morph/common` export,
reimplemented against tsgo's rules rather than forwarded to the compiler. **Its
results differ**, because `CompilerOptions.GetModuleResolutionKind` differs:
`Classic` and `Node10` are treated as _unset_ and resolved from the module kind,
so an explicit `moduleResolution: "classic"` now answers `Bundler`; `Node16`,
`Node18` and `Node20` module kinds answer `Node16`, and `NodeNext` answers
`NodeNext`. With no options at all it answers `Bundler` — as 28.0.0 also did.
`getEmitScriptTarget` is a new export. Neither is on the `ts` namespace.

**`Directory#getRelativePathAsModuleSpecifierTo` no longer depends on the
resolution mode.** `node10` was the only mode that wanted an implicit index and it
is removed, so every remaining mode spells the index out. Measured identical for
the default project on both builds.

**In-memory lib files are read-only,** which 28.0.0 also enforced. What changed is
_which_ files count as one: it is now decided by asking the file system, which
holds the map, rather than by testing whether a path starts with the lib folder.
28.0.0 used the prefix with no trailing separator and no awareness of the options,
so a user's own file at `/node_modules/typescript/libfoo.ts` — or any file under
that folder when `skipLoadingLibFiles` or a custom `libFolderPath` meant there
were no in-memory lib files at all — was mistaken for one and silently failed to
save. The prohibition itself is unchanged: `SourceFile#copy`, `#move`, `#delete`,
`#deleteImmediately` and `#deleteImmediatelySync` throw an
`InvalidOperationError`, `#save`/`#saveSync` do nothing, `#isSaved()` is always
`false`.

**A raw file-system write after the first read is not seen.** tsgo builds the
program when the first file is added, where TypeScript built its program lazily,
so a write that bypasses ts-morph's own file system has to happen before anything
reads the project.

**The encoding is always utf-8.** `CompilerOptions#charset` is gone from tsgo, so
`CompilerOptionsContainer#getEncoding()` always returns `"utf-8"`.

### 8.7 Emit

- **`EmitOutput#getOutputFiles()` still returns wrappers** and the same files, but
  the underlying `emitOutput.outputFiles` is a `ReadonlyMap` keyed by output path,
  not an array, and the path is the key rather than a field on the file.
- **`OutputFile#getWriteByteOrderMark()`** reports `emitBOM` again; the API
  reports the text without the mark so the two are separate the way
  `ts.OutputFile` had them.
- **`EmitOptionsBase.customTransformers` is gone** (§4).
- **`ProgramEmitOptions.writeFile` works as before** — `emit()` throws when it is
  given and `emitSync()` calls it per output file. Its `sourceFiles` argument
  holds at most one file, because tsgo names a single originating source file per
  output rather than the whole set that fed it. _Measured the same as 28.0.0 for
  the fixtures probed; the >1 case is unverified._
- **A single-file emit answers `noEmit`, `noEmitOnError` and `emitDeclarationOnly`
  in ts-morph, not in the compiler.** `Directory#emit`, `SourceFile#emit`,
  `SourceFile#getEmitOutput`, `LanguageService#getEmitOutput` and `Project#emit`
  with a `targetSourceFile` go through tsgo's per-file emit, which the API calls
  with `ForceEmit`; `Program#_getEmitOutputForFilePath` checks those options
  itself and reports a skipped emit, matching TypeScript's `handleNoEmitOptions`.
  **Declaration-emit diagnostics are not replicated** — tsgo does not report one
  for the case TypeScript did (an exported class extending a private name) — so
  `noEmitOnError` can under-report.
- **Whole-project `noEmit` now reports `emitSkipped: true`** where 28.0.0 reported
  `false`. More correct; measured.

### 8.8 `@ts-morph/common`

Runtime exports: 53 → 62. **Removed:** `createDocumentCache`, `createHosts`,
`getFileMatcherPatterns`, `matchFiles` (§4). Also gone as types:
`CreateHostsOptions`, `TsSourceFileContainer`, `FileMatcherPatterns`,
`FileSystemEntries`.

**Added:** `initializeWasm`, `createInProcessApi`, `createFileSystemAdapter`,
`getChildren`, `getLastToken`, `getStoredNode`, `isReconstructedNode`,
`setSourceFileProperty`, `toModuleNameResolver`, `getEmitScriptTarget`,
`getParseScriptTarget`, `IndentStyle`, `TokenFlags`.

**`DocumentRegistry` is not `ts.DocumentRegistry` any more:**

| Before                                                                                | Now                                                       |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `createOrUpdateSourceFile(fileName, compilationSettings, scriptSnapshot, scriptKind)` | `createOrUpdateSourceFile(fileName, text)`                |
| text supplied as `ts.IScriptSnapshot`                                                 | text supplied as a `string`                               |
| compiler options passed per call                                                      | set once via the constructor                              |
| constructed from a `TransactionalFileSystem`                                          | constructed with `{ compilerOptions, files, fs, cwd, … }` |

`ts.IScriptSnapshot`, `ts.ScriptSnapshot` and `ts.DocumentRegistryBucketKey` no
longer exist. New: `createOrUpdateSourceFiles(entries)` (the batched add — §6),
`setSourceFileText(fileName, text)` (adds without parsing, so the project is only
reopened when something reads it), `dispose()`, `setCompilerOptions()`,
`getSourceFileVersion()`.

A returned tree for an _edited_ file is only valid until the next change to that
file. Files the edit did not touch keep their nodes, which is what preserves
wrapper identity for the rest of the project. `getSourceFileVersion` returns
`undefined` for a file the registry does not know — a never-edited file is version
`"0"`, so an unknown one must not report one — and every method throws after
`dispose()`.

The bundle ships `dist/typescript.wasm.gz` beside `dist/ts-morph-common.js` and
`dist/ts-morph-common.browser.mjs`. The browser build is an ES module reached
through the `browser` field and imports nothing at all.

### 8.9 `@ts-morph/bootstrap`

The package's whole purpose is handing back raw compiler objects, so it takes the
brunt of the compiler's own API changes.

- **`Project#createProgram()` no longer creates anything** and no longer takes
  `ts.CreateProgramOptions`: tsgo keeps one program per project and updates it as
  files change, so the call returns the program for the project's current state.
  `configFileParsingDiagnostics` can no longer be injected — the diagnostics from
  the project's own `tsconfig.json` are on the new
  `Project#getConfigFileParsingDiagnostics()`. (The program's own
  `getConfigFileParsingDiagnostics()` answers for the session's synthetic config,
  not the user's.)
- **`getLanguageService()` returns the tsgo project** — same change as ts-morph's.
- **`updateSourceFile(sourceFile)` re-parses the text.** tsgo owns parsing and a
  tree it did not produce cannot be put into a project, so the overload taking a
  source file re-creates the file from its `text` and returns the new object
  rather than storing the one it was given.
- **`SourceFileOptions#scriptKind` has no effect.** It is accepted so existing
  calls compile, but tsgo derives the script kind from the file extension.
  (It should come off the public surface — [TODO.md](./TODO.md).)
- **`sourceFile.languageVersion` is `undefined`** where 28.0.0 reported `99`.
- **`resolveSourceFileDependencies()` returns the files it added** (was `void`).
  It used to create a program for its side effect of populating the source file
  container through the compiler host; there is no such callback now, so it walks
  `program.getSourceFileNames()` until the program stops growing. With lib files
  loaded the count it reports collapses — the lib files are inside the Wasm module
  rather than being added to the container.
- **`ProjectOptions#isKnownTypesPackageName` is gone.** tsgo resolves type
  acquisition inside the compiler with no host callback to override.
- **`ProjectOptions#resolutionHost` and `Project#getModuleResolutionHost()` are
  there,** in the shapes described in §8.6.
- The encoding is always utf-8.

---

## 9. Known gaps (not design decisions)

These are unfinished, not chosen. They are tracked in [TODO.md](./TODO.md) and
several are one routing change in the compiler fork away:

- `TypeFormatFlags` as a real enum rather than a `NodeBuilderFlags` alias.
- `format.GetIndentation`, which would delete the text-based indenter.
- The rest of `FormatCodeSettings` (`insertSpace…`, `semicolons`,
  `baseIndentSize`, `placeOpenBraceOnNewLineFor…`).
- `CodeFixAction#getFixId` / `getFixAllDescription`.
- `ImplementationLocation#getDisplayParts`.
- `formatDiagnosticsWithColorAndContext` with real colour and context.
- `readDirectory` / `matchFiles`.
- `SourceFile#fixUnusedIdentifiers` (needs a new provider, not a route).
- `@types` packages added to the file system after the project was created, for
  `getAmbientModules`.

---

## Appendix A: enum renumbering in detail

### Members removed

| Enum                   | Removed                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SyntaxKind`           | `EndOfFileToken` (renamed `EndOfFile`, no alias), `JSDocTag` (renamed `JSDocUnknownTag`), `JSDocComment`, `ShebangTrivia`, `AssertClause`, `AssertEntry`, `ImportTypeAssertionContainer`, `Bundle`, `CommaListExpression`, `JSDocAuthorTag`, `JSDocClassTag`, `JSDocEnumTag`, `JSDocFunctionType`, `JSDocMemberName`, `JSDocNamepathType`, `JSDocUnknownType` |
| `ScriptTarget`         | `ES3` (0), `ES5` (1), `LatestStandard` (12) — there is no downlevel-to-`var` emit                                                                                                                                                                                                                                                                             |
| `ModuleResolutionKind` | `NodeJs` (2), renamed `Node10`; `Unknown = 0` is new                                                                                                                                                                                                                                                                                                          |
| `NodeFlags`            | `Namespace`, `GlobalAugmentation`, `HasAggregatedChildData`, `TypeCached`, `Deprecated`                                                                                                                                                                                                                                                                       |
| `CheckFlags`           | `Discriminant` (192), renamed `NonUniformAndLiteral` at the same value                                                                                                                                                                                                                                                                                        |
| `InternalSymbolName`   | `Resolving` (`"__resolving__"`); `AssignmentDeclaration` and `ModuleExports` are new                                                                                                                                                                                                                                                                          |

`SyntaxKind` also gains `EndOfFile`, `ImmediateKeyword`, `JSDocUnknownTag`,
`JSTypeAliasDeclaration`, `JSImportDeclaration` and `LastUnaryOperator`.

### Members whose value moved

| Member                                           | 28.0.0      | Now                  |
| ------------------------------------------------ | ----------- | -------------------- |
| `NewLineKind.CarriageReturnLineFeed`             | `0`         | `1` (aliased `CRLF`) |
| `NewLineKind.LineFeed`                           | `1`         | `2` (aliased `LF`)   |
| `NewLineKind.None`                               | —           | `0` (new)            |
| `JsxEmit.React`                                  | `2`         | `3`                  |
| `JsxEmit.ReactNative`                            | `3`         | `2`                  |
| `ModuleDetectionKind.Legacy`                     | `1`         | `2`                  |
| `ModuleDetectionKind.Auto`                       | `2`         | `1`                  |
| `ModuleDetectionKind.None`                       | —           | `0` (new)            |
| `SymbolFlags.All`                                | `-1`        | `536870912`          |
| `SymbolFlags.PropertyExcludes`                   | `0`         | `13243`              |
| `SymbolFlags.GetAccessorExcludes`                | `46015`     | `46011`              |
| `SymbolFlags.SetAccessorExcludes`                | `78783`     | `78779`              |
| `SymbolFlags.AccessorExcludes`                   | `13247`     | `111547`             |
| `TypeFlags.Intrinsic`                            | `402431`    | `393983`             |
| `OuterExpressionKinds.ExcludeJSDocTypeAssertion` | `1 << 31`   | `64`                 |
| `ObjectFlags.SingleSignatureType`                | `134217728` | `33554432`           |
| `SyntaxKind.Identifier`                          | `80`        | `79`                 |
| `SyntaxKind.SyntaxList`                          | `353`       | `344`                |

…plus 200 more `SyntaxKind` members, 29 `NodeFlags` members and 17 more
`ObjectFlags` members. Do not enumerate them by hand — the rule is simply _never
persist or hard-code a value_.

### Enums with no runtime value

`ts.OrganizeImportsMode` (`"all" | "sortAndCombine" | "removeUnused"`) and
`ts.QuotePreference` (`"auto" | "double" | "single"`) are unions of string
literals in tsgo, so there is no object to reference. `ts.Extension`,
`ts.SymbolFormatFlags`, `ts.SymbolDisplayPartKind`, `ts.IndexKind`,
`ts.SemicolonPreference`, `ts.EmitFlags` and `ts.ExitStatus` are gone outright.

---

## Appendix B: how this was measured

Every number and every "measured" claim above comes from running published
`ts-morph@28.0.0` and this working tree's `packages/ts-morph/dist` side by side in
one Node process and comparing answers, or from running the suites.

Suite state on the tree this document describes:

|                      | passing | pending | failing |
| -------------------- | ------- | ------- | ------- |
| `packages/common`    | 435     | 0       | 0       |
| `packages/ts-morph`  | 4500    | 2       | 0       |
| `packages/bootstrap` | 85      | 4       | 0       |

`packages/ts-morph`'s two pending tests are the `elementAccessExpressionTests`
cases, which are pending in 28.0.0 too. `packages/bootstrap`'s four are its
`custom type reference directive resolution` describe, once for each of the async
and sync constructors.

Tests for capabilities that were removed are **kept** rather than deleted, so the
record survives: they fail, and the three whose imports would abort the whole
mocha run at module load are quarantined under
`packages/ts-morph/src/tests/removed-capabilities/` and excluded in `.mocharc.yml`.

### Claims that were not verified by running something

These are stated from the compiler's source, from type declarations, or from the
repo's own harnesses rather than from a differential run. Treat them as weaker
than the rest of the document:

- The `JSDocNullableType#isPostfix` / `JSDocNonNullableType#isPostfix` loss —
  read from tsgo's AST definition; no runtime probe isolates it.
- The 32-slot `ts.createSourceFile` staleness window — a tree held across 40
  rotations still answered correctly, so the window is not reproducible as an
  observable failure.
- `ProgramEmitOptions.writeFile`'s `sourceFiles` argument at more than one input
  file — measured as one file per output on both builds for the fixtures probed,
  which does not distinguish the two behaviours.
- Every browser figure in §7 — the worker requirement, V8's 8 MB main-thread
  limit, the ~27 ms compile / ~4 ms instantiate, and "no cross-origin isolation
  required". These come from `browser/README.md` and its acceptance test; none of
  them is reproducible from Node.
- The indentation corpus count — 287 differing positions of 8217 (§8.4). That
  comes from the repo's own sweep, whose corpus is not published here.

Two figures move with every compiler rebuild and are approximate by nature: the
wasm size and the published tarball sizes in §7.
