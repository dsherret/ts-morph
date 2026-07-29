# ts-morph on tsgo — migration report and decision document

Baseline: `latest` = published `ts-morph@28.0.0` / `@ts-morph/bootstrap@0.29.0`. Subject: the working tree
of `tsgo-wasm` (`packages/*/dist`, rebuilt after every `src` file — not stale). Compiler: the fork at
`submodules/typescript-go`, branch `ts-go`, pinned `d5adf73cb`, **17 commits ahead of and 0 behind
`origin/main`**.

"Measured" means run side-by-side in one process against both builds through the differential harness.
Everything else is marked. Line citations were re-anchored against the working tree while writing this.

> **Superseded in part.** This report was written before `f70c5c00`…`b6670dac`. The following
> recommendations have since landed and their findings below are historical: browser support (§2.2 —
> shipped, `node:wasi` is in no artifact), tsgo's lib files (§2.3 — adopted, and the `lib` form
> inversion is fixed in the other direction: file names work, short names now work too), the free-wins
> list (§2.1 a–e, g–j — `esModuleInterop` and friends restored as `boolean`, `JsxEmit`/
> `ModuleDetectionKind` exported, `forget()` fixed, stale handles wrapped in `InvalidOperationError`,
> diagnostics deduplicated, 5074 and the caller's own tsconfig diagnostics restored, TS18002
> suppressed, `printNode` comments restored), the per-file config rewrite (§2.0 — the bulk path is
> batched and linear; a `createSourceFile` loop is not), reference resolution by containment (§7.1 a–c
> — back to touching-token), the brace-spacing formatter no-op (§2.7), and the indenter's worst
> divergences (§2.6). Suite counts as of `b6670dac`: `ts-morph` 4480/2, `common` 431/0,
> `bootstrap` 85/4. See [TODO.md](./TODO.md) for what is actually left, and
> [BREAKING-CHANGES.md](./BREAKING-CHANGES.md) for the user-facing state, which is re-measured.

---

## 1. Summary

The migration replaced the npm `typescript` package with TypeScript 7 (tsgo) compiled to Wasm and run
in-process. The compiler now owns parsing, binding, checking, formatting, emit and most of the language
service; ts-morph talks to it over an in-process API and rebuilds, on the client, everything the old
services layer used to hand over for free.

What it cost, in order of size:

- **Project construction and file-add got 15–19× slower.** `new Project({ tsConfigFilePath })` over 300
  real files: 237 ms → 4514 ms in one harness run, 138 ms → 2065 ms in another; adding 800 files goes
  13 ms → 13 015 ms. Editing is flat (~1–1.5 ms/edit at any project size), which isolates the cost to
  the synthetic-tsconfig rewrite + project reopen that happens **per added file**.
- **`Type` and `Symbol` became snapshot handles.** They cannot outlive a manipulation. Today they fail
  with a raw compiler string (`api: client error: type handle 89 not found`).
- **Every enum renumbered.** 202 of 380 `SyntaxKind` members have different values; `NodeFlags`,
  `ObjectFlags`, `SymbolFlags`, `NewLineKind`, `JsxEmit`, `ModuleDetectionKind` all moved.
- **The `ts` namespace went from 2249 runtime keys to 401.** Most were internals that only leaked
  because 28.0.0 bundled the whole `typescript` module, but the loss includes `ts.createProgram`,
  `ts.transform`, `ts.createPrinter`, `ts.resolveModuleName`, `ts.sys`, `ts.version` and ~30 more
  genuinely public members.
- **Capabilities dropped outright:** refactors, `fixUnusedIdentifiers`, custom type-reference-directive
  resolution, `customTransformers`, `createDocumentCache`, services-layer suggestion diagnostics, and
  all but three code-fix providers.
- **A 45 MB Wasm binary** shipped in `@ts-morph/common/dist`, plus 2.8 MB of duplicate lib text, plus a
  permanent private compiler fork to rebase.

The suite is green: `ts-morph` 4437 passing / 3 pending, `bootstrap` 85 / 4, `common` 414 / 0.

### The decisions

1. **Fix the file-add path before shipping** (§2.0). Nothing else in this document is worth a tenth of
   it, and a batched-add fix is available client-side today without waiting on upstream.
2. **Decide whether browsers are supported.** `packages/common/package.json`'s `browser` map is
   byte-identical to `latest` and does not stub `node:wasi`, which the bundle imports. A browser bundle
   that worked on 28.0.0 will not resolve. This is a headline break or a bug — it cannot stay undecided.
3. **Delete the `UseTypeOfFunction` clearing and ship uniform `typeof` output** (§2.4). This is the
   clearest case of a shim that exists only to preserve TypeScript 5 output, and it is measurably
   incomplete, so it buys an inconsistency rather than compatibility.
4. **Adopt tsgo's lib files and drop the embedded TypeScript 6 copies** (§2.3). Today the TypeScript 7
   checker type-checks against TypeScript **6**'s `lib.d.ts` because ts-morph overrides tsgo's own
   bundled libs by default. Doing this inside a release where diagnostics already move is far cheaper
   than doing it in 28.1.
5. **Do one cleanup pass on breaks nobody chose** (§2.1) — an invented `CompilerOptions` narrowing, two
   unexported renumbered enums, duplicate diagnostics, one silently dropped diagnostic, a comment-losing
   `printNode` overload, and one live defect behind a new `it.skip`.

---

## 2. Recommendations

Ranked by value ÷ blast radius within each group. Every item states what changes for users and how they
find out.

### 2.0 Ship blocker: the per-file config rewrite

`packages/common/src/tsgo/documentRegistry.ts` writes a synthetic `/tsconfig.json` that names **every
file explicitly** (a wildcard drops `a.d.ts`/`a.js` when `a.ts` shares the stem, and ts-morph's contract
is that an added file is in the project). `#applyChange` (`:196`) rewrites that whole config via
`#configText` (`:214`) and calls `#openProject` (`:226`) eagerly — **once per added file**. All three
call sites (`CompilerFactory.ts:430`, `bootstrap/SourceFileCache.ts:124`, and the tsconfig-construction
path) add one file at a time.

| files added | 28.0.0 | subject      |
| ----------- | ------ | ------------ |
| 100         | 10 ms  | 520–571 ms   |
| 200         | 4 ms   | 994–1101 ms  |
| 400         | 10 ms  | 2919–3794 ms |
| 800         | 13 ms  | 13 015 ms    |

**The long-term fix is upstream** — a tsgo entry point taking a root-file list without round-tripping
through JSON config text, plus an add path that does not reopen the project. **A client-side fix is
available now**: a batch `createOrUpdateSourceFiles(entries)` that does one `#applyChange` and one
reopen. The only obstacle is that `createOrUpdateSourceFile` returns the parsed file, which the
construction path does not need per-add. Measure the batched version before the release notes concede a
15–19× regression.

Related, same cause: `TsConfigResolver` parses the config **twice** and constructs a throwaway Wasm API
instance per `#withApi` call — `getCompilerOptionsFromTsConfig` went 1.3 ms → 15.9 ms (12×), and
`new Project({ tsConfigFilePath })` instantiates two throwaway Wasm modules before the registry's own.

### 2.1 Free wins — nobody chose these

| # | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Action                                                                                                                                                                                                                                                                                          |
| - | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a | **`ts.CompilerOptions` lost `esModuleInterop`, `alwaysStrict`, `allowSyntheticDefaultImports`.** TS7 removed only the **`false`** value of these three. `esModuleInterop: true` — TS7's own default — is a compile error in ts-morph while measured working at runtime.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Restore the three as `boolean`. Purely additive. Do **not** restore `baseUrl`/`outFile`/`downlevelIteration`/`charset` — those are correctly adopted removals (§6).                                                                                                                             |
| b | **`ts.CompilerOptions` has no index signature.** Verified: `packages/common/lib/tsgo/api/compilerOptions.d.ts` ends at `maxNodeModuleJsDepth?: number; }`. Classic had one. Every option tsgo adds in future is a compile error until ts-morph revendors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Restore it. Note this does **not** contradict the `EditorSettings` decision (§6, H4): a dropped editor setting was a _silent no-op_, whereas an unknown compiler option produces a loud runtime diagnostic 5023. The compile-error-as-signal argument only applies where the runtime is silent. |
| c | **`ts.JsxEmit` and `ts.ModuleDetectionKind` are not exported, and both renumbered.** `JsxEmit` members 2/3 are transposed, so `jsx: 2` now emits `<div />` where it emitted `React.createElement`. `ModuleDetectionKind` went `Legacy=1,Auto=2,Force=3` → `None=0,Auto=1,Legacy=2,Force=3`. Both are imported one file over (`documentRegistry.ts:20,21`) and both type live `CompilerOptions` members. Zero occurrences of either in BREAKING-CHANGES.md. `ts.Extension`, `ts.OrganizeImportsMode` and `ts.SymbolFormatFlags` are also `undefined` on the subject.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Export them, add both rows to the renumbering table, and do **one sweep** for "enum referenced by a surviving public type but not re-exported" rather than fixing them one at a time.                                                                                                           |
| d | **`SourceFile#forget()` makes an existing importer stop resolving the file** — `getModuleSpecifierSourceFile()` → `undefined` plus TS2307, behind a **new** `it.skip` at `packages/ts-morph/src/tests/projectTests.ts:153`. `forget()` signals `deleted`; signalling `changed` fixes it and breaks `move` with overwrite.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | This is a defect, not a divergence. One call site needs two signals. Fix before release — a skip where `latest` had a passing test is a regression.                                                                                                                                             |
| e | **`Type#getText()` after one manipulation throws a raw compiler string.** Highest-frequency user-visible failure in the migration, and the message is unusable.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Wrap it in a ts-morph error naming the cause. Keep the model (§2.8).                                                                                                                                                                                                                            |
| f | ~~**`retiredSnapshotLimit = 2` (`documentRegistry.ts:46`) buys nothing measurable.**~~ **Withdrawn — re-measured, the limit is exactly how many edits a handle survives.** The original probe never asked the checker between its manipulations, so `#retire` disposed every superseded snapshot on the spot and only the first was ever retained — which is why n=1 and n=3 looked alike at any limit. Asking the checker each generation separates them cleanly: a handle taken before them answers `getProperties`/`getMembers` for exactly `retiredSnapshotLimit` generations and throws on the next, at 0, 1, 2 and 3 alike. At 0 the first edit costs `getProperties`, `getMembers`, `getExports`, `getDeclarations`, `getFlags`, `getSymbol`, `getCallSignatures` and a signature’s `getParameters`/`getDeclaration`; only the requests routed back through the current checker (`getText`, `getApparentType`, `getNonNullableType`, `getBaseTypes`, `Symbol#getDeclaredType`) fail on the first edit regardless. The cost is not measurable: 500 files edited 24 times, asking the checker each time, sits at ~199MB rss at 0 and at 2. | Keep it at 2. Pinned by a test and by the comment on the constant.                                                                                                                                                                                                                              |
| g | **Duplicate diagnostics.** `getPreEmitDiagnostics` (`ts.ts:687`) concatenates five categories with no dedupe; TS6059 and TS5055 each come back twice, indistinguishable in code/category/span/message. `latest` deduped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Dedupe.                                                                                                                                                                                                                                                                                         |
| h | **One diagnostic silently dropped.** `{incremental:true, composite:false}` → oracle `[5074]`, subject `[]`. Dedupe does not fix this; a lost diagnostic is a silent correctness loss. Also, the oracle's 5055 carries a `next` chain (`[5068]`) that both subject copies lose.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Investigate separately from (g).                                                                                                                                                                                                                                                                |
| i | **Spurious TS18002** ("`files` list is empty") naming ts-morph's own synthetic config on an empty in-memory project. The diagnostic carries **no source file** — the config path is only in the message text, so filtering by file will not work and filtering by message would also swallow 5023/5055/6046/5074.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Suppress code 18002 specifically when the registry's file list is empty, or stop emitting an empty `files` array.                                                                                                                                                                               |
| j | **Free `printNode(node)` silently drops comments.** `printNode.ts:60` passes `sourceText: sourceFile?.text`, and `sourceFile` is `undefined` on the 1-arg overload; `latest:.../printNode.ts:66-79` walked `node.parent` up to the source file. Verified the fix works: `compilerNode.getSourceFile()` on a parsed node returns the file with `.text` and restores `"/** doc */\nclass C {\n}"`; synthetic factory nodes return `undefined` cleanly.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Pass the node's own source file text when the caller supplied none. Two caveats: revert the 1-arg overload's jsdoc ("printed on its own, without the comments"), and supplying the node's real filename overrides `options.scriptKind`'s `printFileName()`.                                     |
| k | **`ts.EmitHint`** — inert const object, documented as such, zero readers in `packages/*/src`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Delete. Compile error for the two users who imported it.                                                                                                                                                                                                                                        |
| l | **Fork commit `15ff4accb` is mislabelled** ("expose getAmbientModules") and actually carries the `GetTypeArguments` guard, both `ScriptKind` fallbacks, the workgroup panic capture, `AllowNonTsExtensions`, `isRelevantFileName` and a deadlock fix.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Split it before any upstream PR. Auditability only, but this is the stack you rebase forever.                                                                                                                                                                                                   |

**Not on this list, and previously proposed:** deleting `setSourceFileProperty` (zero internal call
sites, confirmed — only `mutableSourceFile.ts:29` and the barrel at `tsgo/index.ts:17`), and deleting
`insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces`. Both were wrong. See §2.7.

### 2.2 Decide the browser story

`submodules/typescript-go/_packages/native-preview/src/api/wasm/node.ts:12` does
`import { WASI } from "node:wasi"`, and `node:wasi` appears in `packages/common/dist/ts-morph-common.js`.
`packages/common/package.json`'s `browser` map is byte-identical to `latest`, has no `node:wasi` entry,
and there is no `engines` field declaring the WASI requirement in either version. Combined with a 45 MB
Wasm, the honest position is probably "browsers are not supported in this release" — which is a bigger
break than most of §2.3–§2.6 and belongs at the top of the release notes, not in a list of doc fixes.
_(Unverified: I did not attempt a browser build.)_

### 2.3 Take tsgo's lib files; delete the embedded TypeScript 6 copies

_Files:_ `packages/common/src/data/libFiles.generated.ts` (2.8 MB), `packages/common/scripts/createLibFile.ts`,
`TransactionalFileSystem.ts:238-260`, `CompilerFactory.ts:98`, `SourceFileCache.ts:154-165`.

`createLibFile.ts:6` reads `node_modules/typescript/lib` — **`typescript@6.0.2`, a devDependency of
`packages/common`** (it was a devDependency on `latest` too; nothing regressed there) — and embeds it.
`defaultLibraryPath` then points at the in-memory `/node_modules/typescript/lib` **by default**, so
tsgo's own bundled libs, already inside the Wasm, are overridden on every project. The TypeScript 7
checker type-checks against TypeScript 6's `lib.d.ts` and the package ships two copies of the stdlib.

This is not a compat shim; it is an unfinished migration step that has hardened into behaviour.

**What it buys:** 2.8 MB, the last `typescript` devDependency, and correctness. **What it does not buy:**
two shims previously claimed as free deletions. `SourceFileCache.ts:153-158` documents that
`skipLoadingLibFiles` had to become `noLib` _because tsgo carries its own copies_ — that translation is
required regardless. And `bundled:///` filtering (`Project.ts:223`, `bootstrap/Project.ts:409`,
`fileSystemAdapter.ts:71`) becomes **more** load-bearing once every lib file arrives under that scheme.

**Users change:** nothing they write, **except** `@ts-morph/common` consumers — `packages/common/src/index.ts:6`
re-exports `getLibFiles()` and `libFolderInMemoryPath`, which would go. **They find out:** silently, as
type errors appear or disappear where TS6 and TS7 libs differ. That is the argument for doing it now.

**Settle in the same change:** `lib: ["lib.es2015.d.ts"]` is now rejected (6046 + 10× 2318) while
`lib: ["es2015"]` is now accepted — a full inversion of 28.0.0, and `lib.*.d.ts` is the form the
`typescript` package documented. `lib` and 6046 appear zero times in BREAKING-CHANGES.md. If tsgo really
narrowed what it accepts, that belongs upstream (§5).

### 2.4 Delete the `UseTypeOfFunction` clearing

_File:_ `packages/ts-morph/src/compiler/tools/TypeChecker.ts` — `#getDefaultTypeFormatFlags` (`:292`),
which clears the flag at `:303` when `isTypeOfModuleLevelFunctionExpression(type)` (`:330`) matches.

This is the purest instance of the liability: it exists solely to keep TypeScript 5 output for one
syntactic shape, its own commit (`b86ef734`) admits it half-works, and it must be re-audited every time
upstream touches `shouldWriteTypeOfFunctionSymbol`.

**The evidence conflict is settled — it is incomplete.** Measured on the current build:

```
const f = (a: number) => a;
f          oracle (a: number) => number          subject SAME
const t = [f]       oracle ((a: number) => number)[]      subject (typeof f)[]
const w = {m: f}    oracle { m: (a: number) => number; }  subject { m: typeof f; }
```

One residuals sweep failed to reproduce this on four probes; two independent measurements did reproduce
it with the forms above. Treat it as divergent.

A third inconsistency the shim introduces: it lives in `#getDefaultTypeFormatFlags`, so it only applies
when the caller passes **no** flags — `type.getText(undefined, flags)` prints `typeof` even at top level.

**Cost is smaller than previously claimed:** `isTypeOfModuleLevelFunctionExpression` early-returns on
`(symbol.flags & SymbolFlags.Function) === 0`, so a non-function type pays one `getSymbol()`, not a
declaration walk. The argument for deleting it is not cost — it is that the shim buys an _inconsistency_
rather than compatibility, and one documented uniform change beats a permanent partial one.

**Users change:** `const f = (a: number) => a; f_type.getText()` returns `typeof f`. **They find out:**
silently, mostly through snapshot tests.

### 2.5 Make `ManipulationSettings.newLineKind` a string union

_Files:_ `ts.ts:58-66`, `utils/newLineKindToString.ts`.

`NewLineKind.LineFeed` moved 1→2 and `CarriageReturnLineFeed` 0→1, so **a hard-coded `1` silently
switches a codebase from LF to CRLF**. The existing shim throws an explanatory error on `0`, which
catches one of the two hazards, and only on the manipulation path — `printNode(node, {newLineKind: 0})`
still silently emits LF. Guarding numbers whose meaning shifted is a losing game, and `newLineKind` is
ts-morph's own public API rather than a wire enum.

**Two things this recommendation must own:**

- `NewLineKind` is **also** the type of `CompilerOptions.newLine`, a real tsgo enum. Making
  `ManipulationSettings.newLineKind` a string leaves two similarly-named settings on the same `Project`
  with different types. Either accept that and document it, or rename ts-morph's setting.
- 99 occurrences across 27 files (`ManipulationSettingsContainer`, `printNode`, `getFormattingKindText`,
  `getNewInsertCode`, `insertion.ts`, three text manipulators, `JSDoc`, `JSDocTag`, `SyntaxList`, `Node`,
  `LanguageService`, `fillDefaultEditorSettings`). Not a one-line change.

**Users change:** `newLineKind: NewLineKind.LineFeed` → `newLineKind: "lf"`. **They find out:** TS users
by compile error; JS users by `newLineKindToString`'s `default:` → `NotImplementedError`. Both loud,
which is what a line-ending change deserves.

### 2.6 Route `format.GetIndentation` upstream, then delete the hand-rolled indenter

`internal/format/indent.go:24` (`GetIndentation`) and `:17` (`GetIndentationForNode`) exist and work;
they are simply not exposed through `internal/api`. Because of that,
`packages/ts-morph/src/compiler/ast/common/Node.ts:1316-1470` is a from-scratch text indenter
(`#getIndentationContainer`, `#getJsDocIndentationLevel`, `#getLineIndentationLevel`, a
`max(ownLevel, containerLevel + 1)` heuristic, a `{`/`}` special case).

It is **not** a query API. `setBodyText`, `addStatements`, `insertStatements` indent to it, and commit
`bf9527f7` records that an earlier version "moved a closing brace it never touched."

Two corrections to the case as previously stated:

- **Fractional levels are not new.** `latest:.../Node.ts:1312-1315` divided by `indentationText.length`
  too; measured on a mixed 2/4-space corpus at default settings the **oracle** returns `1.5`, `0.5`,
  `2.5`. The new hazard is reading _actual source columns_ rather than the smart indenter's _computed
  expected_ indentation.
- **The divergence is not one-directional.** ~24% of nodes differ (147/610 in one corpus, 11/45 in
  another), **in both directions** and by a full or a half level: `Block@99` oracle `0.5` → subject `1`;
  `IfStatement@105` oracle `1.5` → subject `2`. Only 7 of 11 in the smaller corpus are off by exactly
  one. "Always exactly one level low" — which would make it mechanically fixable — is wrong.

One handler plus one protocol method deletes ~150 lines and removes an indenter that writes files.

### 2.7 Two previously-proposed deletions that must not happen

- **`insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces` is not inert.** It is read at eight non-test
  call sites: `ImportDeclaration.ts:387`, `ExportDeclaration.ts:285`, `ExportDeclarationStructurePrinter.ts:35`,
  `NamedImportExportSpecifierStructurePrinter.ts:23,26`, `printStructure.ts:22,36,40`, plus
  `ManipulationSettingsContainer.ts:54,70,95`. It drives named-import/export spacing on every
  manipulation. What is true is narrower: it is **honoured by ts-morph's writers and ignored by tsgo's
  `formatText()`** — `formatText({insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces:false})` on
  `import { a } from "./b";` changes nothing where 28.0.0 produced `import {a}`. Document that split on
  the member, or route the option upstream. Removing it from the type is a live regression.
- **`setSourceFileProperty` has zero internal call sites — that is the point.** It is exported from
  `@ts-morph/common`'s public index and is the **documented replacement** for
  `sourceFile.compilerNode.fileName = x`, which now throws `TypeError`. Either keep it as the escape
  hatch or delete it _and_ the migration advice that points at it; the docs cannot say both.

### 2.8 Adopt the snapshot-handle model for `Type`/`Symbol`

`Type` and `Symbol` are handles into the snapshot that produced them and cannot outlive a manipulation.
This is forced and correct. Do not try to make handles survive edits — but do not remove
`retiredSnapshotLimit` either: per §2.1(f) it is exactly how many edits a handle keeps answering
across, and dropping it to 0 takes `getProperties`, `getMembers` and the rest away on the first edit
for no measurable saving. Ship the model, ship a comprehensible error, document "re-query after
manipulating".

### 2.9 Two removals worth deprecating rather than deleting

The document defaults to removal because this is a major, but these two are better served by a
deprecation cycle:

- **`Project#getModuleResolutionHost()`** (`packages/common/src/tsgo/moduleResolutionHost.ts`, 74 lines,
  plus the interface restated at `ts.ts:640-662`). The compiler never consults it, and `ts.resolveModuleName`
  no longer exists, so the object looks like a façade with no counterparty. **But** the new
  `ResolutionHostFactory` is `(getCompilerOptions) => ResolutionHost` (verified,
  `resolutionHost.ts:64`) — where 28.0.0 passed the module resolution host as the first argument. A user
  who needs "does this file exist, counting files added only in memory" has no other API:
  `createModuleResolutionHost` answers from the project's caches first and falls back to the FS;
  `project.getFileSystem()` does not. Removing the getter removes the only replacement for a capability
  taken away in the same release. **Keep it, or hand the host to the new factory.** Do not remove both.
- **`CompilerOptionsContainer#getEncoding()`** (`:22-28`) and `Project`'s internal one (`Project.ts:159-162`)
  are constant `return "utf-8"` because `charset` is gone (measured: oracle `"utf16le"`, subject `"utf-8"`).
  A method that can only return one value is a lie. But `getEncoding` threads through ~15 non-test call
  sites (`bootstrap/Project.ts:123,326,607`, `bootstrap/SourceFileCache.ts:52,100,111`,
  `ts-morph/Project.ts:107,161,374`, `ProjectContext.ts:141`, `CompilerFactory.ts:92,255,298`,
  `SourceFile.ts:789,800`, `CreateModuleResolutionHostOptions.getEncoding`), so the real decision is
  whether `encoding` stays on the public `FileSystemHost.readFile` / `SourceFile#save` surface. Decide
  that; the public getter is the small part.

### 2.10 Adopt array-only `JSDoc#getComment()` — lowest confidence call

`packages/ts-morph/src/compiler/ast/doc/utils/getJSDocComment.ts:22-26` re-joins an all-`JSDocText`
array into a plain string purely to preserve the classic `string | parts[]` union. The union was always
a wart and tsgo dropped it; narrowing to the array is an API improvement and deletes a normalizer.

Counter-arguments, both real: the shim is ~5 lines and does not drift with the compiler; and the union
is widely consumed. Note also that `getCommentText()` already exists and `getComment()`'s own jsdoc
points users to it, so the string branch is already the documented wrong way — which cuts both ways
(little to gain, little to lose). **Call: adopt, ranked last.** A breaking release is the only chance,
but this is the one item where "keep" is entirely defensible.

### 2.11 Confirm the already-adopted breaks

Listed so they are not accidentally re-shimmed under review pressure:

- Enum renumbering across the board. The values _are_ the wire format. Non-negotiable.
- Removed TS7 options reaching users as diagnostics. **Two of these are silent output changes** with a
  diagnostic alongside: `outFile` now emits per-file, `target: ES5` now emits untranspiled classes.
  Those two belong at the top of the release notes, not in a table.
- `EditorSettings`/`FormatCodeSettings` with no index signature (§6, H4) — dropped options are compile
  errors instead of silent no-ops. Correct, because the runtime is silent here. See §2.1(b) for why the
  same rule does not transfer to `CompilerOptions`.
- `SourceFile#saveSync()` under `/node_modules/typescript/lib` now working — deliberately more correct
  than 28.0.0.
- Whole-project `noEmit` reporting `emitSkipped: true` — more correct; document it.

---

## 3. Behavioural differences

Classification: **(a)** forced by tsgo · **(b)** deliberate ts-morph choice · **(c)** accident.

### 3.1 Nodes and navigation

| #   | API                                              | 28.0.0                                                                                                                                                                          | Subject                                                                                                                                                                                                                                                                  | Class             |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| N1  | `SyntaxKind`                                     | classic                                                                                                                                                                         | **202 of 380 members renumbered**; 16 removed (`EndOfFileToken`, `JSDocTag`, `CommaListExpression`, 6 JSDoc kinds, `AssertClause`, `Bundle`, …), 6 added. `Identifier` 80→79, `SyntaxList` 353→344. `ClassDeclaration` coincidentally unchanged — not a valid smoke test | a                 |
| N2  | `NodeFlags`                                      | —                                                                                                                                                                               | 29/42 renumbered, 5 removed (`Namespace`, `GlobalAugmentation`, `Deprecated`, …), 4 added                                                                                                                                                                                | a                 |
| N3  | `ObjectFlags`                                    | —                                                                                                                                                                               | 18 renumbered (`SingleSignatureType` 134217728→33554432, …), 3 added                                                                                                                                                                                                     | a                 |
| N4  | `SymbolFlags`                                    | —                                                                                                                                                                               | `All` `-1`→`536870912`; `PropertyExcludes` `0`→`13243`; 3 accessor-excludes masks changed                                                                                                                                                                                | a                 |
| N5  | `TypeFlags`                                      | —                                                                                                                                                                               | only `Intrinsic` (402431→393983); `None` added                                                                                                                                                                                                                           | a                 |
| N6  | `ScriptTarget`                                   | `ES3`,`ES5`,`LatestStandard`                                                                                                                                                    | removed; `target: 1` → TS5108 "has been removed" (was TS5107 "deprecated")                                                                                                                                                                                               | a                 |
| N7  | `ModuleResolutionKind.NodeJs`                    | 2                                                                                                                                                                               | removed; `Unknown` added                                                                                                                                                                                                                                                 | a                 |
| N8  | node wrappers                                    | `CommaListExpression`, `JSDocFunctionType`, `JSDocAuthorTag`, `JSDocClassTag`, `JSDocEnumTag`, `JSDocMemberName`, `JSDocNamepathType`, `JSDocUnknownType` + 8 `Node.isX` guards | gone. No other `Node.isX` differs over a 610-node corpus                                                                                                                                                                                                                 | a                 |
| N9  | `JSDoc.getChildren()`                            | `[]` for prose                                                                                                                                                                  | `[JSDocText]`; descendant counts rise (18→20 on a 6-line file)                                                                                                                                                                                                           | a                 |
| N10 | array binding elision                            | `OmittedExpression`                                                                                                                                                             | zero-width `BindingElement`; `getNameNode()`/`getName()` throw `InvalidOperationError`; new `isElision()`. Array _literal_ elisions unchanged                                                                                                                            | a shape / b error |
| N11 | `getIndentationLevel()` / `getIndentationText()` | LS smart indenter                                                                                                                                                               | ~150-line text reimplementation; ~24% of nodes differ, both directions, by a full or half level (§2.6)                                                                                                                                                                   | b                 |
| N12 | `Node#getSymbol()` on anonymous declarations     | `__function`, `__object`, `__type`, `__call`, `__new`, `__index`, `__constructor`, `default`                                                                                    | `undefined`; `getSymbolOrThrow()` throws. `ClassKeyword`/`ConstructorKeyword` lost the class symbol. `node.getType().getSymbol()` still works                                                                                                                            | a                 |
| N13 | computed-member symbol names                     | `__computed` / `__@iterator@47`                                                                                                                                                 | both `__@iterator@26`                                                                                                                                                                                                                                                    | a                 |
| N14 | `compilerNode.fileName = x`                      | assignable                                                                                                                                                                      | getter-only, throws `TypeError`; `setSourceFileProperty()` is the replacement                                                                                                                                                                                            | a                 |
| N15 | `.symbol` / `.locals` / `.emitNode`              | present                                                                                                                                                                         | absent (lazy views over a Wasm buffer). `Node#getLocals()`/`getLocal()` restored, returning an **array sorted by first-declaration position**, not a `ts.SymbolTable`                                                                                                    | a                 |
| N16 | reconstructed tokens / `SyntaxList`              | real AST nodes                                                                                                                                                                  | rebuilt client-side; guarded by `reconstructedNodes.ts`. **Parity measured** — `getType()` over every descendant matches                                                                                                                                                 | b, working        |
| N17 | `JSDoc` span vs preceding comment                | starts at `/**`                                                                                                                                                                 | corrected in the fork's `RemoteNodeBase.pos`. **Parity measured**                                                                                                                                                                                                        | b, working        |

### 3.2 Manipulation and printing

| #   | API                                                                                  | 28.0.0                                   | Subject                                                                                                                                                                                                                                                                                   | Class                |
| --- | ------------------------------------------------------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| M1  | manipulation generally                                                               | —                                        | **no differences found.** `addClass`, `setBodyText` (incl. 2-space files), `insertStatements`, `formatText` (+options, +`newLineCharacter`), `getStructure`, `printStructure`, `fixMissingImports` (+`quoteKind`), rename cascade, `SourceFile#move`, `Directory#move` all byte-identical | —                    |
| M2  | `newLineKind: 1`                                                                     | LF                                       | **CRLF, silently**                                                                                                                                                                                                                                                                        | a values / c silence |
| M3  | `newLineKind: 0`                                                                     | CRLF                                     | explanatory throw — **only on the manipulation path**; `printNode(node,{newLineKind:0})` silently emits LF                                                                                                                                                                                | b guard / c gap      |
| M4  | `printNode(node)` 1-arg                                                              | comments preserved                       | comments dropped (§2.1 j)                                                                                                                                                                                                                                                                 | c                    |
| M5  | empty block print                                                                    | `m() { }`                                | `m() {\n    }`                                                                                                                                                                                                                                                                            | a                    |
| M6  | `PrintNodeOptions.emitHint`                                                          | required `EmitHint` member               | gone; `ts.EmitHint` is an inert const object, so any in-range numeric is assignable                                                                                                                                                                                                       | a / b                |
| M7  | `PrintNodeOptions.scriptKind`                                                        | decided `<T>x` as assertion vs JSX       | only names the read-back file                                                                                                                                                                                                                                                             | a                    |
| M8  | new `PrintNodeOptions`                                                               | —                                        | `preserveSourceNewlines`, `neverAsciiEscape`, `terminateUnterminatedLiterals`                                                                                                                                                                                                             | a                    |
| M9  | `Node#transform` / `visitEachChild`                                                  | tokens went to a separate `tokenVisitor` | same visitor sees tokens: `const x = 1 + 2;` visits **10** nodes, not 8                                                                                                                                                                                                                   | a                    |
| M10 | `ts.transform`, `ts.createPrinter`, `customTransformers`, `ts.TransformationContext` | present                                  | gone                                                                                                                                                                                                                                                                                      | a                    |

### 3.3 Types, symbols, checker

| #   | API                                          | 28.0.0                                                                    | Subject                                                                                                                                                                                                                                                                                                                                                                                                    | Class                  |
| --- | -------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| T1  | `Type`/`Symbol` across a manipulation        | readable forever                                                          | `Type#getText()` throws `api: client error: type handle N not found` after **one** manipulation; `Symbol#getDeclaredType()`/`getTypeAtLocation()` throw `symbol handle N not found`. `getFlags`, `isObject`, `getProperties`, `getApparentType`, `getSymbol`, `getCallSignatures`, `getBaseTypes`, `getAliasSymbol`, `getNonNullableType`, `Symbol#getName/getDeclarations/getFlags/getExports` still work | a model / c raw error  |
| T2  | `Type#getLiteralValue()`                     | `string \| number \| ts.PseudoBigInt \| undefined`; boolean → `undefined` | `… \| bigint \| boolean \| undefined`; `1n`→`1n`, `true`→`true`. `=== undefined` is no longer a "not a literal" test                                                                                                                                                                                                                                                                                       | a                      |
| T3  | function-valued variable, nested             | `((a:number)=>number)[]`, `{m:(a:number)=>number;}`                       | `(typeof f)[]`, `{ m: typeof f; }` (§2.4)                                                                                                                                                                                                                                                                                                                                                                  | a, partly papered over |
| T4  | `Type#getConstraint()` on a conditional type | `1 \| 2`                                                                  | `undefined`. **Indexed access measured SAME** — the doc over-claims                                                                                                                                                                                                                                                                                                                                        | a                      |
| T5  | `getTargetType()`/`getBaseTypes()`           | `Type<ts.GenericType>` / `Type<ts.BaseType>[]`                            | `Type` / `Type<ts.Type>[]`; runtime values identical                                                                                                                                                                                                                                                                                                                                                       | a, declaration-only    |
| T6  | union member order in type text              | `readonly string[] \| ArrayLike<string>`                                  | `ArrayLike<string> \| readonly string[]`                                                                                                                                                                                                                                                                                                                                                                   | a                      |
| T7  | unresolved identifier type text              | `/*unresolved*/ any`                                                      | `any`                                                                                                                                                                                                                                                                                                                                                                                                      | a                      |
| T8  | `Signature#getDocumentationComments()`       | classified parts; `{@link Foo}` split                                     | one `text` part, link flattened                                                                                                                                                                                                                                                                                                                                                                            | a                      |
| T9  | `getJsDocTags()` part shapes                 | `[{parameterName},{space},{text}]`                                        | `[{text:"a the a"}]`                                                                                                                                                                                                                                                                                                                                                                                       | a                      |
| T10 | reference-definition display parts           | classic vocabulary, fine-grained                                          | LSP vocabulary, coarser runs, qualified name in one part                                                                                                                                                                                                                                                                                                                                                   | a                      |
| T11 | `getExportedDeclarations()` order            | `c`, `B`                                                                  | `B`, `c`                                                                                                                                                                                                                                                                                                                                                                                                   | a/c                    |
| T12 | restored and **measured at parity**          | —                                                                         | `getSymbolsInScope`, `Symbol#getExportSymbol`, `getGlobalExports`, `Node#getLocals`, `getFullyQualifiedName`, `getAwaitedType`, `getAmbientModules`, `getDefinitionNodes`, `getImplementations`, `Type#getText(flags)`, signature docs presence                                                                                                                                                            | —                      |
| T13 | `TypeChecker#getLocals(node)`                | —                                                                         | new public method                                                                                                                                                                                                                                                                                                                                                                                          | b                      |

### 3.4 Language service

| #   | API                                                           | Change                                                                                                                                                                                                                                        | Class      |
| --- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| L1  | `getEditsForRefactor` + `RefactorEditInfo`                    | **removed** — tsgo has zero refactor surface                                                                                                                                                                                                  | a          |
| L2  | `SourceFile#fixUnusedIdentifiers`                             | **removed** — needs a code-fix provider tsgo does not have                                                                                                                                                                                    | a          |
| L3  | `getIdentationAtPosition`                                     | **removed** — tsgo _has_ it; not routed. Forced N11                                                                                                                                                                                           | b          |
| L4  | `ImplementationLocation#getKind`/`getDisplayParts`            | **removed** — tsgo builds display parts; the implementations response carries spans only                                                                                                                                                      | b          |
| L5  | `CodeFixAction#getFixName`/`getFixId`/`getFixAllDescription`  | all three **removed**. `FixName` genuinely absent from the fork; `FixID`/`FixAllDescription` exist in Go and are dropped by the API struct                                                                                                    | a / b      |
| L6  | `findRenameLocations(node, options)`                          | `newName` now required, 3rd positional shifted                                                                                                                                                                                                | a          |
| L7  | `getCodeFixesAtPosition`                                      | 6 params → 4; format settings and user preferences dropped. `quoteKind` and `usePrefixAndSuffixTextForRename` still reach the compiler on dedicated request fields                                                                            | a          |
| L8  | `getCombinedCodeFix`                                          | `fixId: string`; only 3 ids exist; preferences dropped                                                                                                                                                                                        | a          |
| L9  | `organizeImports`                                             | `(file, mode?)`; `SourceFile#organizeImports()` takes none; `ts.OrganizeImportsMode` is type-only                                                                                                                                             | a          |
| L10 | organizeImports edit granularity                              | 3 deletions → 1 coalesced                                                                                                                                                                                                                     | a          |
| L11 | `DefinitionInfo#getContainerName()` for a module-level export | `"\"./mod\""` → `""`                                                                                                                                                                                                                          | a          |
| L12 | `DefinitionInfo#getKind()` for a `const`                      | `"const"` → `"var"`                                                                                                                                                                                                                           | a          |
| L13 | `DefinitionInfo#getContainerKind()`                           | `undefined` → `""`, typed `string`                                                                                                                                                                                                            | c, trivial |
| L14 | suggestion/syntactic/declaration diagnostics                  | `DiagnosticWithLocation[]` → `Diagnostic[]`; code 80005 never emitted; services-layer suggestions gone (`require`→import 80001 measured oracle `[80001]` / subject `[]`)                                                                      | a          |
| L15 | `LanguageService#compilerObject`                              | now the tsgo `Project`; `ProjectContext#getSourceFileContainer()` gone                                                                                                                                                                        | a          |
| L16 | code fixes available                                          | spelling (2551), unused-import removal, missing-member, `fixMissingFunctionDeclaration` all measured **absent**; import fix works                                                                                                             | a          |
| L17 | rename / references / definitions / emit output               | **measured at parity**: `findReferences` (`isDefinition`, `isWriteAccess`, spans), rename cascade, rename under `node_modules`, rename of a lib symbol, `getDefinitions`, `getImplementations`, `getCodeFixesAtPosition([])`, `getEmitOutput` | —          |

### 3.5 Diagnostics

| #   | API                                     | Change                                                                                             | Class |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------- | ----- |
| D1  | `getMessageText()`                      | `string \| DiagnosticMessageChain` → always `string`; chain under new `getMessageChain()`          | a/b   |
| D2  | `getSource()`                           | **removed**, deliberately not stubbed                                                              | a + b |
| D3  | `DiagnosticMessageChain#compilerObject` | `ts.DiagnosticMessageChain` → `ts.Diagnostic`; `getNext()` reads `messageChain`                    | a     |
| D4  | duplicates                              | TS6059 and TS5055 each returned twice (§2.1 g)                                                     | **c** |
| D5  | dropped                                 | `{incremental:true, composite:false}` → 5074 lost (§2.1 h)                                         | **c** |
| D6  | `formatDiagnosticsWithColorAndContext`  | ANSI + source line + caret → `"/a.ts(1,7): error TS2322: …"`. tsgo has the real writer; not routed | b     |
| D7  | unused-import 6133 span                 | statement `[0,26]` → identifier `[9,1]`                                                            | a     |
| D8  | unused type parameter                   | 6133 → **6196**. A caller filtering on 6133 silently stops seeing it                               | a     |
| D9  | TS18002 on an empty in-memory project   | new (§2.1 i)                                                                                       | c     |
| D10 | codes and spans generally               | measured **identical** across 8 error cases                                                        | —     |

### 3.6 Project, file system, config

| #   | API                                                          | Change                                                                                                                                                                                                                                                                                                                                    | Class          |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| P1  | `SourceFile#forget()`                                        | an existing importer stops resolving the file: `undefined` + TS2307; new `it.skip` (§2.1 d)                                                                                                                                                                                                                                               | **c**          |
| P2  | `ts.createSourceFile(text, target, setParentNodes:false)`    | parents always linked; `languageVersion` ignored; parsed in a 32-slot rotating scratch project                                                                                                                                                                                                                                            | a              |
| P3  | `lib: ["lib.es5.d.ts"]`                                      | 0 diagnostics → 6046 + 10× 2318; short names now required (§2.3)                                                                                                                                                                                                                                                                          | a              |
| P4  | in-memory lib files                                          | prefix-matched by path → asked of the file system; a user file under `/node_modules/typescript/lib` no longer silently fails to save                                                                                                                                                                                                      | b, fix         |
| P5  | `getModuleResolutionHost()`                                  | rebuilt over ts-morph's own caches, never consulted by the compiler (§2.9)                                                                                                                                                                                                                                                                | b façade       |
| P6  | `ProjectOptions#resolutionHost`                              | `(moduleResolutionHost, getCompilerOptions)` → `(getCompilerOptions)`; `resolveModuleNames(array)` → `resolveModuleName(request)` one at a time, plus new `resolutionMode`; `resolveTypeReferenceDirectives` and `getResolvedModuleWithFailedLookupLocationsFromCache` gone; `ResolutionHosts.deno` now **rewrites** rather than resolves | a              |
| P7  | custom type-reference-directive resolution                   | gone; tests quarantined; `bootstrap/src/tests/projectTests.ts:171` is `describe.skip`                                                                                                                                                                                                                                                     | a              |
| P8  | `TsConfigResolver`                                           | no directory list from tsgo — recovered by a double parse with synthetic probe files; unusable option keys omitted rather than `undefined`; `getErrors()` restored                                                                                                                                                                        | a/b            |
| P9  | `getEmitModuleResolutionKind`                                | `Classic(1)` and `NodeJs(2)` → `Bundler(100)`. `{}` measured **100 on both** — the doc's claim that `{}` used to be `Classic` is wrong                                                                                                                                                                                                    | a              |
| P10 | `CompilerOptions.charset` / `getEncoding()`                  | removed / constant `"utf-8"` (§2.9)                                                                                                                                                                                                                                                                                                       | a              |
| P11 | `createDocumentCache`                                        | removed from `@ts-morph/common`                                                                                                                                                                                                                                                                                                           | a              |
| P12 | `Directory#getRelativePathAsModuleSpecifierTo`               | mode switch removed; measured SAME both cases (`c4d92a7d` reverted an earlier wrong change)                                                                                                                                                                                                                                               | b              |
| P13 | default lib files                                            | still generated from `typescript@6.0.2` (§2.3)                                                                                                                                                                                                                                                                                            | **c** leftover |
| P14 | `createSourceFile("")`, `("/")`, `(".")`, `("./")`, `("//")` | throw `Invalid file path` where 28.0.0 created a file. Path-tree builder in the VFS layer, not deliberate validation                                                                                                                                                                                                                      | c              |

### 3.7 Emit

| #  | API                                                               | Change                                                                                                                                                                    | Class |
| -- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| E1 | `EmitOutput#compilerObject.outputFiles`                           | `Array` → `Map` keyed by output path; the `getOutputFiles()` wrapper still returns an array (SAME)                                                                        | a     |
| E2 | `ProgramEmitOptions.writeFile` `sourceFiles`                      | whole originating set → at most one file. Measured SAME for a single-file project; **unverified at >1**                                                                   | a     |
| E3 | single-file emit + `noEmit`/`noEmitOnError`/`emitDeclarationOnly` | reimplemented client-side in `Program#_getEmitOutputForFilePath`; measured SAME. **Declaration-emit diagnostics are not reproduced**, so `noEmitOnError` can under-report | b     |
| E4 | whole-project `noEmit`                                            | `emitSkipped` `false` → `true` (more correct, undocumented)                                                                                                               | b     |
| E5 | BOM, `emitToMemory`, `Directory#emit`, `Project#emit`             | measured SAME                                                                                                                                                             | —     |

### 3.8 The `ts` namespace

- **2249 runtime keys → 401** (1938 removed, 90 added). Most were internals leaked by bundling
  `typescript`, but the losses include `ts.sys`, `ts.version`, `ts.createProgram`, `ts.createLanguageService`,
  `ts.createPrinter`, `ts.transform`, `ts.resolveModuleName`, `ts.parseJsonConfigFileContent`,
  `ts.ScriptSnapshot`, `ts.getLineAndCharacterOfPosition`, `ts.getPositionOfLineAndCharacter`,
  `ts.displayPartsToString`, `ts.flattenDiagnosticMessageText`, `ts.formatDiagnostics`,
  `ts.sortAndDeduplicateDiagnostics`, `ts.getJSDocTags`, `ts.createTextSpan`, `ts.setTextRange`,
  `ts.getModifiers`, `ts.isWhiteSpaceLike`, `ts.JsxEmit`, `ts.ModuleDetectionKind`, `ts.Extension`,
  `ts.ExitStatus`, `ts.EmitFlags`, `ts.SymbolDisplayPartKind`, `ts.SymbolFormatFlags`, `ts.SignatureKind`,
  `ts.IndexKind`, `ts.OrganizeImportsMode`, `ts.QuotePreference`, `ts.SemicolonPreference`.
  Kept: `factory`, `visitEachChild`, `visitNode`, `forEachChild`, `skipTrivia`, `tokenToString`,
  `getLeading/TrailingCommentRanges`, `getDecorators`, `getCombinedModifierFlags`,
  `escape/unescapeLeadingUnderscores`, every `isX` guard (+90 new).
- **`ts.TypeFormatFlags` is an alias of `NodeBuilderFlags`** (`ts.ts:341`). 6 members gone, 15
  `NodeBuilderFlags`-only members added, 18 shared. Five of the six removed values are **live under other
  meanings**, so a persisted numeric mask silently changes behaviour. Classed **(c)** — see §5.
- `ts.EmitHint` kept as an inert const object (§2.1 k).
- `EditorSettings`/`FormatCodeSettings` reduced to `{tabSize, indentSize, convertTabsToSpaces, indentStyle,
  newLineCharacter, trimTrailingWhitespace}` with **no index signature** — deliberate (§2.11).
  `ts.UserPreferences` reduced to `{quotePreference, providePrefixAndSuffixTextForRename}`.

### 3.9 `@ts-morph/common` and `@ts-morph/bootstrap`

| #  | API                                                | Change                                                                                                                                                                                                                                                                                                                                                                                                        | Class           |
| -- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| C1 | common exports removed                             | `createHosts`, `CreateHostsOptions`, `TsSourceFileContainer`, `matchFiles`, `getFileMatcherPatterns`, `FileMatcherPatterns`, `FileSystemEntries`, `createDocumentCache`. (`matchFiles`/`getFileMatcherPatterns` were `(ts as any)` internals — already broken)                                                                                                                                                | a               |
| C2 | `DocumentRegistry`                                 | no longer `implements ts.DocumentRegistry`; `createOrUpdateSourceFile(name, text)`; ctor takes `{compilerOptions, files, fs, cwd, …}`; new `dispose()`, `setCompilerOptions()`, `getSourceFileVersion()`. `ts.IScriptSnapshot`/`ScriptSnapshot`/`DocumentRegistryBucketKey` gone                                                                                                                              | a               |
| C3 | bootstrap `resolveSourceFileDependencies()`        | returns `ts.SourceFile[]` (was `void`), and with lib files **loaded** the file count collapses: two harness runs measured `83→1` and `20→1`. With `skipLoadingLibFiles: true` both builds report 1. Commit `d459308d` states this and is accurate; the change is real, defensible and **undocumented**. The exact default-config baseline (20 vs 83) is **unverified** — the two runs used different fixtures | b, undocumented |
| C4 | bootstrap `createSourceFile(..., {scriptKind: 1})` | `1` → `3`; derived from the extension, option ignored                                                                                                                                                                                                                                                                                                                                                         | a               |
| C5 | bootstrap `sourceFile.languageVersion`             | `99` → `undefined`                                                                                                                                                                                                                                                                                                                                                                                            | a               |
| C6 | bootstrap `getLanguageService()`                   | `rename` only; no `findRenameLocations`, no `getProgram`                                                                                                                                                                                                                                                                                                                                                      | a               |
| C7 | bootstrap `createProgram(options?)`                | takes nothing, returns the current program; new `getConfigFileParsingDiagnostics()`                                                                                                                                                                                                                                                                                                                           | a               |
| C8 | bootstrap `updateSourceFile(sourceFile)`           | re-parses from `text`, returns a new object                                                                                                                                                                                                                                                                                                                                                                   | a               |
| C9 | `ProjectOptions#isKnownTypesPackageName`           | gone                                                                                                                                                                                                                                                                                                                                                                                                          | a               |

### 3.10 Packaging

- `packages/common/dist/typescript.wasm` is **45 087 913 bytes**; the bundle imports `node:wasi`.
- No `browser` stub for `node:wasi`, no `engines` field (§2.2).
- 2.8 MB of duplicate lib text (§2.3); `typescript@6.0.2` still a devDependency of `packages/common`.
- Single-threaded (one request at a time) and "first code-fix call is more expensive" — **unverified**,
  taken from BREAKING-CHANGES.md.

---

## 4. Hacks carried

Ranked by how much I would want each gone. "Deleted by" is the concrete thing that removes it.

| #   | Hack                                                                        | Where                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Cost                                                                                                                                                                                                                                                                                                                                                                  | Deleted by                                                                                                                                      |
| --- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | **Synthetic tsconfig with an explicit file list, rewritten per add**        | `documentRegistry.ts` (434 lines; `#configText:214`, `#applyChange:196`, `toConfigCompilerOptions:301`)                                                                                                                                                                                                                                                                                                                                                           | 15–19× on construction; superlinear on add (§2.0). Also: a hand-maintained enum→config-string table, synthesized `typeRoots` (reimplementing the compiler's @types walk) and `rootDir` (computed common directory), `internalOptionNames` stripping, and `target: {1:"es5"}` deliberately re-emitted so a removed target is _reported_ rather than silently defaulted | A tsgo entry point taking a root-file list, plus add-without-reopen                                                                             |
| H2  | **~86 exported type restatements**                                          | `ts.ts` (1268 lines; restatements run from ~line 100 to 1268)                                                                                                                                                                                                                                                                                                                                                                                                     | Zero runtime, maximum maintenance. Load-bearing: `CompilerNodeToWrappedType` is a conditional chain and **a missing name resolves to `any`, which every node satisfies — one absent name routes every wrapped node to the same branch.** `CompilerNodeToWrappedType.ts:21` carries a second ordering hack for the same reason                                         | The fork's AST generator emitting the classic hierarchy, narrowed field types and union aliases. Every restatement is already annotated as such |
| H3  | **Re-deriving definitions and references**                                  | `LanguageService.ts` (731 lines): `getScriptElementKind:691` (20-branch `SymbolFlags` cascade), `getDefinitionContainerName:541-653` (~112 lines reimplementing binder container naming), `#toDefinitionInfo` reading the name back out of file text, `#toReferencedSymbol` re-deriving `isDefinition`                                                                                                                                                            | Every rule is a note about what the `typescript` package did. `ts.ScriptElementKind` had to be reduced to what the cascade can produce                                                                                                                                                                                                                                | tsgo exposing definition classification and container names (it already computes display parts)                                                 |
| H4  | **`Node#getIndentationLevel` from raw text**                                | `Node.ts:1316-1470`                                                                                                                                                                                                                                                                                                                                                                                                                                               | ~24% of nodes diverge; **feeds emitted text** (§2.6)                                                                                                                                                                                                                                                                                                                  | Routing `format.GetIndentation` (§5)                                                                                                            |
| H5  | **Rename in strings and comments**                                          | `LanguageService.ts` `#findRenameLocationsInStringsAndComments` + helpers (~75 lines)                                                                                                                                                                                                                                                                                                                                                                             | Whole-word regex scan + AST re-walk per hit. ASCII-only identifiers; only searches files the _code_ rename already reached, so a comment in an untouched file is missed                                                                                                                                                                                               | Porting the commented-out Go block in `internal/ls/findallreferences.go`                                                                        |
| H6  | **`Program#_getEmitOutputForFilePath`**                                     | `Program.ts:172-230, 322-380`                                                                                                                                                                                                                                                                                                                                                                                                                                     | Reimplements `handleNoEmitOptions` in JS: `noEmit`, the full `noEmitOnError` diagnostic gauntlet, `emitDeclarationOnly`. Plus `orderOutputFiles` restoring emit order from **file-extension suffix tables**. Declaration-emit diagnostics not reproduced                                                                                                              | A tsgo emit entry point that honours options per file and reports order                                                                         |
| H7  | **`TsConfigResolver` directory probe**                                      | `TsConfigResolver.ts:79-130`                                                                                                                                                                                                                                                                                                                                                                                                                                      | Parses twice, injecting `__ts_morph_directory_probe__.ts` into each walked directory; a whole Wasm API instance per `#withApi`. 12× on `getCompilerOptionsFromTsConfig`. Plus `withRejectedValuesAsUndefined` regex-matching diagnostic codes 5024/6046 to recover option names, and a manual 1000–1999 scan to restore "invalid JSON throws"                         | `parseConfigFile` reporting matched directories; an API that parses a config on an existing session                                             |
| H8  | **Lib files from `typescript@6.0.2`, overriding tsgo's**                    | `libFiles.generated.ts` (2.8 MB), `createLibFile.ts:6`                                                                                                                                                                                                                                                                                                                                                                                                            | TS7 checker against TS6 libs; two stdlib copies (§2.3)                                                                                                                                                                                                                                                                                                                | Sourcing from tsgo                                                                                                                              |
| H9  | **`UseTypeOfFunction` clearing**                                            | `TypeChecker.ts:292-345`                                                                                                                                                                                                                                                                                                                                                                                                                                          | One `getSymbol()` per `getText()` on function-flagged symbols, for _partial_ parity (§2.4)                                                                                                                                                                                                                                                                            | Adopting the break                                                                                                                              |
| H10 | **`getChildren()` reconstruction — KEEP**                                   | fork, `_packages/native-preview/src/ast/children.ts` (213 lines)                                                                                                                                                                                                                                                                                                                                                                                                  | **Measured faithful and cheap**: identical node counts, full walk ×20 14 ms → 19 ms. Real cost is memory — two unbounded caches (`childrenCache` WeakMap, per-file `pos_end`→node Map) never invalidated for a file's lifetime                                                                                                                                        | Nothing. `getChildren`/`getChildAt`/sibling navigation _are_ ts-morph. Already in the fork, which is the right place                            |
| H11 | **Reconstructed-node guards — KEEP**                                        | `reconstructedNodes.ts` (32 lines) + `TypeChecker.ts:70,107,145`, `LanguageService.ts:177`                                                                                                                                                                                                                                                                                                                                                                        | Measured at parity. Cannot go while H10 exists                                                                                                                                                                                                                                                                                                                        | —                                                                                                                                               |
| H12 | **`Proxy` façades in bootstrap**                                            | `bootstrap/Project.ts:439` (program), `:473` (language service)                                                                                                                                                                                                                                                                                                                                                                                                   | Re-resolve the registry's current project on every property access, plus a `.bind()` allocation. `instanceof`/identity checks fail. The program proxy also substitutes the caller's tsconfig diagnostics for the synthetic one's                                                                                                                                      | tsgo project handles that survive a snapshot change                                                                                             |
| H13 | **`ModuleResolutionHost` façade**                                           | `moduleResolutionHost.ts` (74 lines) + `ts.ts:640-662`                                                                                                                                                                                                                                                                                                                                                                                                            | Live object the compiler never consults — but the only surviving way to ask "does this file exist counting in-memory adds" (§2.9)                                                                                                                                                                                                                                     | A replacement handed to `ResolutionHostFactory`                                                                                                 |
| H14 | **Node factory wrappers — KEEP**                                            | `ts.ts:171-245` (`rangePreserving`, `namesFromStrings`, `withDefaultTokenFlags`)                                                                                                                                                                                                                                                                                                                                                                                  | Two parallel hand-maintained lists of the 16 "text-taking" function names. **Without `rangePreserving` every `Node#transform` silently drops comments** — data loss                                                                                                                                                                                                   | tsgo's `updateX` preserving ranges                                                                                                              |
| H15 | **BOM re-read**                                                             | `CompilerFactory.ts:295-301`                                                                                                                                                                                                                                                                                                                                                                                                                                      | tsgo strips a BOM when parsing and never reports it, so ts-morph re-reads every compiler-discovered file off disk just to check                                                                                                                                                                                                                                       | tsgo reporting `hasBOM`                                                                                                                         |
| H16 | **Program source-file fixpoint loop**                                       | `ts-morph/Project.ts:207-226`, `bootstrap/Project.ts:397-425`                                                                                                                                                                                                                                                                                                                                                                                                     | No host callback reports a file the compiler loaded, so the program is polled until it stops growing                                                                                                                                                                                                                                                                  | A host callback                                                                                                                                 |
| H17 | **`getPreEmitDiagnostics` reimplementation — KEEP**                         | `ts.ts:687`                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Concatenates 5 categories in classic order; no cancellation token; **no dedupe** (§2.1 g)                                                                                                                                                                                                                                                                             | Nothing to adopt — tsgo has no such API                                                                                                         |
| H18 | **`getEmitModuleResolutionKind`/`getEmitScriptTarget`/`getEmitModuleKind`** | `common/src/typescript/tsInternal.ts` (74 lines)                                                                                                                                                                                                                                                                                                                                                                                                                  | Hand-mirrors `internal/core/compileroptions.go`; will drift silently                                                                                                                                                                                                                                                                                                  | Routing the real functions                                                                                                                      |
| H19 | **Smaller compensations**                                                   | `toSymbolDisplayParts` (forges `kind:"text"` on every part); `getJSDocComment` re-join; `ModuleDeclaration#getDeclarationKind` reading the keyword; `Symbol#getName` demangling `__#1@#prop`; `SourceFile#getLanguageVersion` resolving the project's current target; `getCodeFixesAtPosition` empty-array guard; `getFormattedDocumentText` newline handling; `#getFilledSettings` renaming `convertTabsToSpaces`→`insertSpaces`; the `NewLineKind` alias object | —                                                                                                                                                                                                                                                                                                                                                                     | —                                                                                                                                               |
| H20 | **Inert public API**                                                        | `EmitHint`; `TypeFormatFlags`; `ManipulationSettingsContainer#getUserPreferences()` (everything but `quotePreference` "has nowhere to go"); `ts.getVersion()` (spins up the scratch Wasm session — **80 ms cold**, 0 ms warm, where 28.0.0 had a constant); `ts.createSourceFile` (32-slot rotating scratch project, ignores `languageVersion`/`setParentNodes`, expresses `scriptKind` by choosing a file extension — **0.03 ms → 0.91 ms, 30×**)                | Promises rather than cycles                                                                                                                                                                                                                                                                                                                                           | —                                                                                                                                               |

**Structural cost underneath all of it:** a 43 MB Wasm plus 2.8 MB duplicate lib text; a private compiler
fork to rebase indefinitely; and working on the seam requires **building twice** (`_scripts/build-wasm.mjs`,
then `deno task build:node` in `packages/common`) or the suite silently exercises the previous Wasm.

---

## 5. The fork

`submodules/typescript-go`, `.gitmodules` → `https://github.com/dsherret/typescript-go`, branch `ts-go`,
pinned `d5adf73cb`. **17 commits ahead, 0 behind `origin/main`** — a clean stack on upstream, not a stale
branch. **58 files, +4815/−561.**

| Layer                                                                           | Files | Nature                                   |
| ------------------------------------------------------------------------------- | ----- | ---------------------------------------- |
| `cmd/tsgo-wasm/`, `internal/api/inprocess.go`, `wasmChannel.ts`, `wasm/node.ts` | 4 new | new build target, additive               |
| `internal/api/{proto,session,session_ls}.go` + `native-preview/src/api/**`      | ~10   | routing ~25 existing Go capabilities out |
| `internal/{checker,compiler,core,printer,ls,project,module}/`                   | 20    | behavioural changes inside the compiler  |
| `_packages/native-preview/src/ast/{children,comments}.ts` + generator           | 5     | Strada's services layer re-hosted        |
| `internal/api/session_*_test.go`                                                | 3 new | 498 lines of Go tests                    |

### 5.1 Send upstream — genuine compiler fixes

| Change                                                                                      | Location                                                   | Argument                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getTypeFromTypeNodeWorker` missing `Identifier`/`QualifiedName`/`PropertyAccessExpression` | `checker.go:22875-22883` (`fbacfa6ff`, +9)                 | **An entity name in type position resolved to `errorType`.** Affects `tsc`, not just the API. Strada has the same three kinds in the same switch. Highest-value PR in the stack — send it today                                                                                          |
| `Printer.Write` panicked on `KindEndOfFile`                                                 | `printer.go:957-969,5237` (`9ed72990e`)                    | Crash fix                                                                                                                                                                                                                                                                                |
| `GetTypeArguments` dereferenced non-reference types                                         | `checker/exports.go:301-305` (`15ff4accb`)                 | Crash fix                                                                                                                                                                                                                                                                                |
| Work-group goroutine panic was unrecoverable by `RunAndWait`'s caller                       | `core/workgroup.go` (`15ff4accb`, +37)                     | Upstream wants this regardless of Wasm                                                                                                                                                                                                                                                   |
| `emitBOM` never reached `WriteFile`                                                         | `emitter.go:335-341`, `program.go:1611-1613` (`e9e966b9e`) | Correctness                                                                                                                                                                                                                                                                              |
| Change tracker now prefers `formatOptions.NewLineCharacter`                                 | `ls/change/tracker.go:108-115`                             | Matches `getNewLineOrDefaultFromHost`. **Caveat:** the commit says "the LSP path leaves this unset", true only by default — `FormatCodeSettings.NewLineCharacter` is bindable from editor config (`lsutil/formatcodeoptions.go:64`), so this does change LSP output for users who set it |
| `RenameOptions{ApplyEditorEligibilityChecks}`                                               | `ls/rename.go`, `lsp/server.go:1446` (`d5adf73cb`)         | Restores Strada's split — stdlib/`default`/node_modules guards belong to `prepareRename`. LSP opts in; clean shape                                                                                                                                                                       |
| `lib.*.d.ts` vs short-name acceptance                                                       | —                                                          | If tsgo narrowed what classic accepted (§2.3), that is a compatibility bug                                                                                                                                                                                                               |

**The API routing work is the single largest upstreamable body** (`e09a85656`, `df70079a0`, `3b5902743`,
`6af081264`, `15ff4accb`, `e9e966b9e`, `47894f69d`): formatting, formatDocumentRange, organizeImports,
rename, definitions, implementations, code fixes, combined code fix, `getAmbientModules`,
`getSymbolsInScope`, `getLocalsOfNode`, `getGlobalExportsOfSymbol`, `getAwaitedType`,
`getFullyQualifiedName`, signature JSDoc, synthetic comments through `printNode`, reference display
parts, `isWriteAccess`, `core.Version()`, `Program#getSourceFiles`/`getTypeChecker`. Every one is
plumbing over Go that already existed, and upstream's `internal/api` is explicitly a work in progress.
New entry points sit _beside_ existing ones, so conflict surface is low.

### 5.2 Missing routes — each is a handler plus a protocol method

| Missing route                                           | Go that already works                                                                                                      | ts-morph pays                                                                                                                                                                                                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format.GetIndentation` / `GetIndentationForNode`       | `internal/format/indent.go:24, :17`                                                                                        | **The from-scratch indenter that writes files** (H4). Highest-value missing route                                                                                                                                                                          |
| `checker.TypeFormatFlags` in the generator's `enumDefs` | all members present, and `internal/api/session.go:2393` **already casts the client's number to `checker.TypeFormatFlags`** | The `NodeBuilderFlags` alias is not merely imprecise — it is **inverted**. Classic values were the correct wire values all along; it is a `NodeBuilderFlags` member that gets misread. **Blocked on one line.** Best value-to-effort ratio in the document |
| `ls.CodeAction.FixID` / `.FixAllDescription`            | `internal/ls/codeactions.go:55-60`; the fork's own `GetCombinedCodeFix` _takes a fix id_                                   | `api.CodeFixAction` (`proto.go:1223-1227`) drops both — **two struct fields**. Also correct the false comment at `packages/common/src/tsgo/ts.ts:1203-1206` ("tsgo does not group fixes into fix-alls, so there is no id to report")                       |
| `diagnosticwriter.FormatDiagnosticsWithColorAndContext` | `:122`                                                                                                                     | `Project#formatDiagnosticsWithColorAndContext` emits neither colour nor context. **Route it or rename the method**                                                                                                                                         |
| display parts for `ImplementationLocation`              | `displayPartsWriter` + `getQuickInfoAndDeclarationAtLocation`                                                              | `getKind`/`getDisplayParts` dropped                                                                                                                                                                                                                        |
| `vfsmatch.ReadDirectory`                                | `internal/vfs/vfsmatch/vfsmatch.go:31` (0 hits in `internal/api/`)                                                         | `readDirectory`/`matchFiles` gone from common                                                                                                                                                                                                              |
| `checker.symbolToString`                                | `checker.go:1545` — unexported, **no wrapper and no route** (needs both)                                                   | display-name gaps                                                                                                                                                                                                                                          |
| `lsutil.FormatCodeSettings` fields                      | read by `format/rulecontext.go`, `indent.go`                                                                               | `api.FormattingOptions` carries six of them                                                                                                                                                                                                                |

### 5.3 Genuinely absent from tsgo — verified by grep at `ts-go` tip

- Refactors: `GetApplicableRefactors`, `GetEditsForRefactor`, `extractFunction` — **zero hits across
  `internal/`**. Unrecoverable without a new subsystem; `api.FileTextEdits` also has no `isNewFile`, so
  "move to new file" has nowhere to write.
- `FixName` — zero hits. `getFixName()` cannot be restored. **Adopt that removal.**
- `codeFixProviders` (`ls/codeactions.go:86-90`) has **exactly three** entries. No `unusedIdentifier`
  provider, so `SourceFile#fixUnusedIdentifiers` needs a _new provider_, not a route.
- `ast.SourceFileParseOptions` records only `FileName`, `Path`, `ExternalModuleIndicatorOptions` — no
  script target, so per-file `SourceFile#getLanguageVersion` cannot be restored without changing the
  struct.
- Named by `b86ef734` as needing compiler work: `Node#getSymbol()` on anonymous declarations ("tsgo's
  nodes carry no binder symbol and its checker exposes no accessor"), and the nested `typeof` form.

### 5.4 ts-morph-specific extensions to carry

1. **The module resolution hook** — `internal/module/types.go:19-48`, hook point at `resolver.go:287-306`,
   `project/compilerhost.go:85-98`, `project/autoimport.go:88-113`, `SessionOptions.ResolveModuleName`,
   `internal/api/callbackresolver.go`. **Verified absent upstream** (zero hits at the merge-base). Exists
   solely to restore `ResolutionHosts.deno` / `ProjectOptions#resolutionHost`. Well designed (three-way
   answer: decline / resolve / rewrite) and the fork's best-tested change (`session_resolution_test.go`,
   213 lines). It is also **the only fork change on the compiler's hot path** — worth an upstream attempt
   precisely because carrying it forever is expensive.
2. `SessionOptions.AllowNonTsExtensions`, forced `true` for every API session.
3. Quote preference on a code-fix request (`efdef3285`) — exists only because `manipulationSettings.quoteKind`
   is public ts-morph surface. Small, tested.
4. `children.ts` (213 lines) + generated `getChildren`/`getChildCount`/`getChildAt`/`getFirstToken`/
   `getLastToken` injected into `_scripts/generate-ts-ast.ts:724-743`. tsgo dropped `SyntaxList`
   deliberately; **every upstream AST regeneration must carry this patch**.
5. `RemoteNodeBase.pos` special-casing `SyntaxKind.JSDoc` and rescanning trivia
   (`node.infrastructure.ts:143-176`) — a per-read override of a wire field, for Strada parity. Fixes a
   real span bug; measured at parity.
6. `apiClientCapabilities()` returning an all-off `ResolvedClientCapabilities` and rename/code-fix
   handlers hard-erroring on `DocumentChanges` — a wall the API cannot cross without extending
   `FileTextEdits`.

### 5.5 Fork liabilities — fix before any upstream PR

| # | Liability                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| - | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a | **`ScriptKindUnknown → ScriptKindTS` is patched into the compiler, not the API** — `internal/compiler/host.go:83-89`, `internal/project/overlayfs.go:397-405`, plus `snapshotfs.go:598-612` treating any already-read file as relevant. With forced `AllowNonTsExtensions` this changes what a `.vue`/`.svelte`/extensionless file means **for `tsc` and `tsserver` too**. Widest blast radius in the fork; **zero tests**. Move it behind a session option |
| b | **Default-library files are filtered out of every rename, LSP included** — `internal/ls/findallreferences.go:694-699`, sitting in the rename branch but _not_ gated by `RenameOptions`, unlike the eligibility checks in the same commit. **No baselines were regenerated** (no `testdata` changes in the diff). Gate it                                                                                                                                    |
| c | **The fork's CI never runs.** Inherited `.github/workflows/ci.yml:5-12` triggers on `main` only, so `ts-go` is never tested by upstream's Go suite; ts-morph's own CI builds the Wasm and type-checks `native-preview` but **does not run `go test`**. Five compiler packages are validated by nothing but ts-morph's TypeScript suite. One-line fix guarding the entire compiler diff                                                                      |
| d | **Test coverage is asymmetric.** Covered: resolution hook, quote preference, rename. Uncovered: the ScriptKind fallback, `AllowNonTsExtensions`, the workgroup panic capture, the `GetTypeArguments` guard, the change-tracker newline change, the default-library rename filter, `emitEndOfFileNode`, and the `getTypeFromTypeNodeWorker` fix                                                                                                              |
| e | **Rebase surface is concentrated in upstream's most active files** — `internal/api/session.go` +303, `proto.go` +477, `native-preview/src/api/proto.ts` +761, and upstream is actively rewriting `internal/api`. `internal/module/resolver.go` is the other hot spot                                                                                                                                                                                        |
| f | **Commit `15ff4accb` is mislabelled** (§2.1 l)                                                                                                                                                                                                                                                                                                                                                                                                              |

---

## 6. TypeScript 7 changes: adopted / worked around / broken by

### 6.1 The `// Removed in TS7` block (`internal/compiler/program.go:820-878`)

All **ADOPTED at runtime** — `toConfigCompilerOptions` (`documentRegistry.ts:301-350`) forwards the
option verbatim, so the compiler's removal diagnostic reaches `getPreEmitDiagnostics()`.

| TS7 change                                                                                  | Measured                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl` removed                                                                           | oracle 5101 (deprecation) → subject **5102** "has been removed"                                                                                                           |
| `outFile` removed                                                                           | **silent output change**: oracle one `/out.js`; subject `/a.js` + `/b.js`. 5102 present, emit still runs                                                                  |
| `target: ES5` + ES5 downlevel emit removed                                                  | **silent output change**: oracle `var C = /** @class */ (function(){…}())`; subject `class C { m() { } }`. 5108                                                           |
| `module` AMD/System/UMD removed                                                             | 5108 plus a _new_ 5095 ("'bundler' can only be used when 'module' is…") — origin not isolated, **unverified** whether that comes from ts-morph's synthetic config or tsgo |
| `moduleResolution` Classic/Node10 removed                                                   | 5107 → 5108, plus downstream adoption (below)                                                                                                                             |
| `alwaysStrict:false`, `esModuleInterop:false`, `allowSyntheticDefaultImports:false` removed | all → 5108 at runtime. **Over-adopted at the type level** — §2.1(a)                                                                                                       |
| `downlevelIteration` removed (any value)                                                    | `true` and `false` both → 5102                                                                                                                                            |
| `charset` removed                                                                           | oracle 5102 → subject **5023** "Unknown compiler option" — tsgo's parser does not know the name                                                                           |

Deliberate adoption aid: `documentRegistry.ts:416-420` keeps `1 → "es5"` in the target table
specifically so an ES5 project is _told_ the option is gone rather than silently compiling at the
default. `ScriptTarget` has no ES5 member left to name it with.

**Downstream of `moduleResolution`:** `tsInternal.ts:12-31` `getEmitModuleResolutionKind` was
`(ts as any).getEmitModuleResolutionKind.apply(…)` on `latest`; it is now a hand-written mirror treating
Classic and Node10 as unset. `Directory.ts:880-887` deleted the whole `switch (moduleResolution)` in
`getRelativePathAsModuleSpecifierTo`.

| options                                      | `getEmitModuleResolutionKind()` | specifier to `/dir`         | to `/dir2/index.ts`           |
| -------------------------------------------- | ------------------------------- | --------------------------- | ----------------------------- |
| `{}`, `{module:CommonJS}`, `{module:ESNext}` | 100 → 100                       | `./dir/index` → same        | `./dir2/index` → same         |
| `{moduleResolution: Classic}`                | 1 → **100**                     | same                        | same                          |
| `{moduleResolution: Node10}`                 | 2 → **100**                     | `./dir` → **`./dir/index`** | `./dir2` → **`./dir2/index`** |

Narrow blast radius: ts-morph's default project was already Bundler on 28.0.0.

### 6.2 Enum renumbering — ADOPTED wholesale, one exception

`ts.ts:26-38` re-exports twelve enums verbatim; the header states why they cannot be renumbered (the
values are the wire format shared with the Go compiler). `ModuleResolutionKind` retains `Classic` and
`Node10` as members even though the program errors on them; `ModuleKind` keeps AMD/System/UMD nameable.

**Exception — `NewLineKind`, WORKED AROUND** (§2.5): it is ts-morph's own public API, so `ts.ts:58-66`
rebuilds it as a const object aliasing the old names. Values still moved.

**`TypeFormatFlags` — WORKED AROUND, and the workaround is backwards** (§5.2).

### 6.3 AST shape

| TS7 change                                                                                                            | Disposition                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Array-binding elisions are zero-width `BindingElement`s                                                               | **ADOPTED**, softened by `isElision()` + a named `InvalidOperationError`                                                                                                                                                                                                              |
| `JSDocTag` catch-all renamed `JSDocUnknownTag`; Author/Class/Enum tags collapse into it                               | **ADOPTED**                                                                                                                                                                                                                                                                           |
| `JSDocFunctionType`, `JSDocMemberName`, `JSDocNamepathType`, `JSDocUnknownType`, `CommaListExpression` never produced | **ADOPTED** (wrappers deleted, `9c991e0e`)                                                                                                                                                                                                                                            |
| JSDoc `comment` is always a parts array                                                                               | **WORKED AROUND** (`getJSDocComment.ts:22-26`) — §2.10                                                                                                                                                                                                                                |
| JSDoc prose is a `JSDocText` child                                                                                    | **ADOPTED**; `getChildren-parity.mts` carries an `alignKnownAstDivergence()` carve-out for 6 span mismatches                                                                                                                                                                          |
| `JSDoc` node reports its full start                                                                                   | **WORKED AROUND in the fork**. Go's `scanner.GetTokenPosOfNode` still has the old behaviour, so a Go-side position request inside such a comment still resolves to the `JSDoc`                                                                                                        |
| `JSDocNullableType#isPostfix` / `JSDocNonNullableType#isPostfix` not recorded                                         | **BROKEN**, accepted. **Unverified** — my probe did not isolate it                                                                                                                                                                                                                    |
| Tokens and `SyntaxList` are not in the tree                                                                           | **WORKED AROUND** — the largest one (H10). Cost: reconstructed nodes have no Go-side handle, so `getTypeAtLocation` returns the **`any` type**, `getSymbolAtLocation` returns `undefined`, and `getSymbolsInScope`/`findReferencesAtPosition` retarget to the nearest stored ancestor |
| Binder internals off the nodes                                                                                        | **ADOPTED**, mostly re-routed (`.locals` → `Node#getLocals()`, `.symbol` → checker, synthetic comments → `EmitContext`). Residue: N12                                                                                                                                                 |
| Nodes are lazy views over a binary buffer                                                                             | **ADOPTED**; kills `createDocumentCache` — **BROKEN**                                                                                                                                                                                                                                 |
| `sourceFile.fileName` is a getterless setter                                                                          | **WORKED AROUND** (`setSourceFileProperty`; `path` deliberately not re-stamped)                                                                                                                                                                                                       |
| Narrowed node types tsgo does not declare                                                                             | **WORKED AROUND** — H2                                                                                                                                                                                                                                                                |

### 6.4 Services layer

**BROKEN, accepted:** refactors; the missing code-fix providers (spelling 2551, unused-import removal,
missing-member, `fixMissingFunctionDeclaration` — all measured absent, import fix works); services-layer
suggestion diagnostics (`require`→import 80001 measured `[80001]` → `[]`); `customTransformers`;
`createDocumentCache`; `ts.version`; `ts.matchFiles`/`getFileMatcherPatterns` (already `(ts as any)`).

**BROKEN/deferred:** `formatDiagnosticsWithColorAndContext` (§5.2); type reference directive resolution.

**WORKED AROUND:** the smart indenter (H4); definition classification (H3); `getPreEmitDiagnostics`
(H17); per-file emit option semantics (H6).

**ADOPTED:** `LanguageService#compilerObject` is a tsgo `Project`. **Diagnostic codes and spans are
identical** — measured `[code, start, length]` SAME across 8 error cases (type error, unknown name,
missing prop, syntax, unused local, implicit any, unreachable, require).

### 6.5 Printer / factory / checker

| Change                                                                        | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `factory.updateX` builds a fresh node, losing position and therefore comments | **WORKED AROUND** — `rangePreserving`, `ts.ts:219-232`. Keep                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| tsgo factory requires name _nodes_ where classic took bare strings            | **WORKED AROUND** — `namesFromStrings` with a 16-name allowlist                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Literal creators take token flags                                             | **WORKED AROUND** — defaulted to `None`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `visitEachChild` hands token children to the same visitor                     | **ADOPTED** (10 visits vs 8)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `EmitHint` gone                                                               | **ADOPTED**, shape-only façade (§2.1 k)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| No free-standing parser                                                       | **WORKED AROUND** — the scratch-project `ts.createSourceFile`, with adopted losses (`languageVersion`, `setParentNodes`). The documented 32-call staleness window is **unverified as an observable effect** — after 40–70 rotations the retained node still answered correctly                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Checker widened `typeof x` for function-valued variables                      | **WORKED AROUND partially, and it cannot be completed** (§2.4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Compiler falls back to ES2025 when no `target`                                | **WORKED AROUND** — `tsInternal.ts:46-59` `getParseScriptTarget` returns `ScriptTarget.Latest` "because ts-morph has always parsed at Latest". **Keep it.** This was proposed for removal on the grounds that it preserves ts-morph's history against the compiler; the argument fails its own test. `ScriptTarget.Latest === ESNext === 99`, `ES2025 === 12`, `getLanguageVersion()` is measured **SAME** as 28.0.0, and tsgo ignores per-file targets entirely — so adopting `getEmitScriptTarget` would silently change a public getter from 99 to 12 to align with a value the compiler declines to have an opinion about. If anything, deprecate `getLanguageVersion()`, which now _follows_ option changes (`SourceFile.ts:600`) and no longer describes how the file was parsed |
| Options that cannot be expressed in JSON                                      | **WORKED AROUND** infrastructurally — H1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Documentation is one plain string, not classified parts                       | **WORKED AROUND** (shape kept; every part is `kind: "text"`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `ts.ModuleResolutionHost` not declared by tsgo                                | **WORKED AROUND** (façade) — §2.9                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `UserPreferences` / `FormatCodeSettings` reduced                              | **ADOPTED loudly** — no index signature, so a dropped option is a compile error                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

---

## 7. Still open

### 7.1 Divergences with no owner

| # | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Note                                                                                                                                        |
| - | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| a | **`findReferencesAtPosition` boundaries moved, in both directions.** Sweep over every offset of `class C { m(a: string) { return a; } }`: 26 SAME, **13 DIFF**. Offsets 0–7, 11, 13, 21 answer in the oracle and return `[]` in the subject; offsets 9, 14, 31 answer in the subject and `[]` in the oracle. The reconstructed-node fallback resolves by **containment** where TypeScript resolved by **touching token**. BREAKING-CHANGES.md:672-674 describes neither behaviour | _Deciding question: is "touching token" reproducible from the stored-node fallback?_ If yes, match it. If no, document the containment rule |
| b | **`ConstructorDeclaration#findReferencesAsNodes()` returns an extra `class` keyword.** oracle `[["Identifier",33,"C"]]`, subject `[["ClassKeyword",0,"class"],["Identifier",33,"C"]]`. The prior state was a hard throw, so this is strictly better — but the entry reports `isDefinition() === false` (oracle: `ConstructorKeyword@10, isDefinition:true`), so `LanguageService.ts:148`'s filter cannot drop it                                                                  | Same root cause as (a)                                                                                                                      |
| c | **`getDefinitions()` on an overload returns a superset, overload first.** Function: oracle `[["f",38]]`, subject `[["f",9],["f",38]]`. `getDefinitions()[0]` now yields the signature where it yielded the implementation                                                                                                                                                                                                                                                         | Same root cause as (a) — **treat (a)(b)(c) as one work item**                                                                               |
| d | `getIndentationLevel` at list-continuation positions: `ImportSpecifier` in `import { a } from "./b";` oracle `1`, subject `0`                                                                                                                                                                                                                                                                                                                                                     | Subsumed by §2.6                                                                                                                            |
| e | `Node#getSymbol()` on anonymous declarations                                                                                                                                                                                                                                                                                                                                                                                                                                      | Needs the compiler (§5.3)                                                                                                                   |

### 7.2 Skipped and quarantined tests

| Location                                                        | Status                                                                                                                                                                                                                                           |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/ts-morph/src/tests/projectTests.ts:153`               | **New, migration-caused, unresolved.** `forget()` → `getModuleSpecifierSourceFile()`. §2.1(d)                                                                                                                                                    |
| `packages/bootstrap/src/tests/projectTests.ts:171`              | `describe.skip`, custom type reference directive resolution — legitimately deferred; `Resolver.ResolveTypeReferenceDirective` has no hook. Counts as 4 pending (async + sync ctors) and accounts for all 8 `tsc --noEmit` errors in that package |
| `compiler/ast/expression/elementAccessExpressionTests.ts:22,33` | **Pre-existing**, identical in `git show latest:` — not migration-related                                                                                                                                                                        |
| `removed-capabilities/refactorEditInfoTests.ts`                 | Genuinely absent from tsgo                                                                                                                                                                                                                       |
| `removed-capabilities/jsDocFunctionTypeTests.ts`                | Kind retired by tsgo's parser                                                                                                                                                                                                                    |
| `removed-capabilities/typeReferenceDirectiveResolutionTests.ts` | **A TODO, not a removal** — and the README's first line says "These **two**" while listing three; `.mocharc.yml` says "two files, both for capabilities the Go compiler genuinely lacks" while excluding three                                   |

One TODO in shipped source: `compiler/tools/results/CodeAction.ts:35` — pre-existing in `latest`.

### 7.3 Documentation to correct before publishing

> **Done for BREAKING-CHANGES.md.** It has since been rewritten as a migration guide and every
> load-bearing claim re-measured against published 28.0.0; all six items below are fixed, and the
> "undocumented entirely" list is covered. The list is kept as the record of what a re-read missed
> and a measurement caught. Two further inversions were found in the same pass and are not in the
> list: `matchFiles`/`getFileMatcherPatterns` were described as already broken on 28.0.0 and are
> measured **working** there, and "browsers are not supported" survived three commits after browser
> support shipped.

BREAKING-CHANGES.md has repeatedly been found stale or inverted. These specific claims were
contradicted by measurement:

1. "A type obtained before a manipulation still answers questions after it… the two most recent snapshots
   are kept" — **false**; it fails at one (T1), and the retention buys nothing (§2.1 f).
2. "`getEmitModuleResolutionKind` with no options used to answer `Classic`" — **false**; 28.0.0 already
   answered `Bundler` for `{}` (P9).
3. "An indexed access, index or conditional type now returns `undefined` from `getConstraint()`" — only
   the **conditional** case reproduces (T4).
4. `ts.ts:1203-1206` "tsgo does not group fixes into fix-alls, so there is no id to report" — **false**;
   the fork's own `GetCombinedCodeFix` takes a fix id (§5.2).
5. `packages/ts-morph` passing count says 4390; actual is **4437**.
6. **Undocumented entirely:** duplicate diagnostics (D4), the dropped 5074 (D5), `printNode` 1-arg
   comment loss (M4), `JsxEmit` and `ModuleDetectionKind` (§2.1 c), the `lib` form inversion (P3),
   bootstrap `resolveSourceFileDependencies` (C3), empty-block print (M5), `getExportedDeclarations`
   ordering (T11), whole-project `emitSkipped` (E4), TS18002 (D9), 6196-vs-6133 (D8),
   `getContainerKind` (L13), the `createSourceFile("/")` throw (P14), and most of the `ts` namespace's
   public-member losses (§3.8).

Outside BREAKING-CHANGES.md:

- `docs/setup/index.md:50-80` is TypeScript 5 code (array-form `resolveModuleNames`, `ts.ResolvedModule`,
  `ts.resolveModuleName`) and claims type-reference-directive support — the one explicitly deferred
  capability.
- `docs/emitting.md:74-100` documents `project.emit({ customTransformers })`, which is removed.
- `FormatCodeSettings.ts`'s own doc comment promises application "to the formatter's output", which is
  no longer true for `insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces` (§2.7).

### 7.4 Unverified

| Claim                                                                                               | Why                                                                                               |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Browser bundle resolution failure (§2.2)                                                            | Read the `browser` map and the `node:wasi` import; did not attempt a build                        |
| bootstrap default-config file count baseline: 20 or 83 (C3)                                         | Two harness runs, different fixtures. The direction (collapse to 1) is certain                    |
| `ProgramEmitOptions.writeFile` `sourceFiles` at >1 input (E2)                                       | Measured SAME for a single-file project only                                                      |
| `ts.createSourceFile` 32-call staleness window                                                      | Could not reproduce an observable failure at 40 or 70 rotations                                   |
| `JSDocNullableType#isPostfix` / `JSDocNonNullableType#isPostfix` loss                               | Documented; my probe did not isolate it                                                           |
| `SourceFileCreateOptions.scriptKind` "accepted and ignored"                                         | Claimed in the doc; not measured                                                                  |
| `alwaysStrict:false` semantics beyond the diagnostic                                                | Whether `"use strict"` emission changed — not measured                                            |
| Origin of the extra 5095 on `module: AMD/System/UMD` (§6.1)                                         | Not isolated between ts-morph's synthetic config and tsgo                                         |
| Single-threaded API / expensive first code-fix call                                                 | Taken from BREAKING-CHANGES.md                                                                    |
| Whether the fork breaks upstream fourslash/LSP baselines                                            | No `testdata` regenerated; the Go suite has not been run on `ts-go` (running it would be a build) |
| Whether `resolutionMode` is populated end-to-end by the compiler                                    | Read the type and the test title; did not drive a host                                            |
| Watch/incremental behaviour, project-reference builds beyond a `composite` smoke check, concurrency | Not probed                                                                                        |

---

## 8. Implementation history, moved out of BREAKING-CHANGES.md

BREAKING-CHANGES.md was rewritten as a migration guide for users of 28.0.0. What follows was in it
and is archaeology rather than migration advice, so it lives here instead.

### 8.1 What the last 29 test failures turned out to be

Worth recording, because the split was not what the first breaking-changes list predicted. Only a
handful were genuinely absent; most were exposure gaps or expectations carried over from TypeScript 5.

- **Restored by exposing what Go already had — 10.** A definition's display parts and each
  reference's write access (`getDefinitionKindAndDisplayParts` and `ast.IsWriteAccessForReference`
  were both already written), synthetic comments through `printNode`
  (`EmitContext.AddSyntheticLeadingComment`), `getChildCount` and the rest of the `Node` surface, and
  `ts.version` from `core.Version()`.
- **Expectations that were TypeScript 5's — 12.** `target: ES5` and downlevel `var` emit,
  `moduleResolution: classic`/`node10`, `ModuleResolutionKind.NodeJs`, the `JSDocTag` kind name, a
  lib-file diagnostic count, and `setParentNodes: false`. The authority for the first three is the
  "Removed in TS7" block in `internal/compiler/program.go`, which errors on each of them by name.
- **Genuinely absent — 5.** `getEditsForRefactor` (tsgo has no refactor providers at all),
  `fixUnusedIdentifiers` (its two fix-all ids are not among tsgo's three code fix providers,
  `internal/ls/codeactions.go`), `convertToEsModule` and the 80005 suggestion (both from TypeScript's
  services-layer `suggestionDiagnostics.ts`, not ported — tsgo's suggestions come from the checker
  only), `Diagnostic#getSource` (`ast.Diagnostic` has no such field; the LSP layer stamps a constant
  `"ts"`), and `customTransformers` (a JavaScript transform cannot join a Go emit pipeline).
- **Deferred — 2.** The `custom type reference directive resolution` describes. Those resolve down a
  separate path in the compiler with no hook; module resolution itself was since restored.

### 8.2 Divergences found while closing them

- **`visitEachChild` visits token children.** The `typescript` package reserved tokens for a separate
  `tokenVisitor`; tsgo's generated visitor hands them to the same visitor as every other child.
- **Display parts are coarser.** A keyword run carries the space that follows it rather than the
  space being a run of its own.
- **Organize-imports coalesces.** Two adjacent import deletions come back as one text change spanning
  both.
- **A raw file-system write after the first read is not seen.** tsgo builds the program when the
  first file is added, where TypeScript built its program lazily.
- **`getRelativePathAsModuleSpecifierTo` no longer depends on the resolution mode.** `node10` was the
  only mode that wanted an implicit index, and it is removed, so the switch on `moduleResolution` is
  gone from `Directory`.

### 8.3 The `forget()` diagnosis, and what is left of it

`forget()` reported the file to the compiler as deleted, which made that path missing for the
snapshot, so an import of it failed even though the file was still on the file system. Diagnosed
rather than guessed: it was not about custom resolution (it happened with no resolution host); it was
not the file being invisible (a new session over the same file system resolved it, and so did a new
importer in a later snapshot); it was the `deleted` signal itself, and the next snapshot recovered.

`deleted` is nonetheless right wherever the caller is _vacating_ the path rather than handing it
back: `move` with `overwrite` removes a destination whose stale on-disk content has to be dropped
rather than re-read, every `move` leaves an old path, and `delete` forgets before the file system is
told. All of those reach `DocumentRegistry#removeSourceFile` through
`CompilerFactory#removeCompilerNodeFromCache`, so it takes the signal from its caller: a
`discardContents` option, off by default, carried down through `Node#_forgetOnlyThis` and reached by
the vacating callers through `SourceFile#`/`Directory#_forgetDiscardingContents` or, for the path a
move leaves behind, `CompilerFactory#replaceCompilerNode`.

### 8.4 Working on the seam means rebuilding twice

The tests run against `packages/common/dist/`, and that directory holds its own copy of the reactor.
A change in the fork therefore needs `_scripts/build-wasm.mjs` **and** then `deno task build:node` in
`packages/common`, or the suite keeps exercising the previous wasm and the change looks like it did
nothing.

`packages/common`'s rollup config also resolves the tsgo client's package-internal `#enums/*`,
`#getExePath` and `#vscode-jsonrpc/node` specifiers. Without it the bundle loads and immediately
throws `Cannot find module '#enums/modifierFlags'`, because those are only resolvable through the
tsgo package's own `imports` map, which no longer applies once its modules are inlined here.

The tsgo client's declarations are vendored into `packages/common/lib/tsgo` by
`scripts/vendorTsgoTypes.ts`, with `#enums/*` rewritten to relative paths. `lib/typescript.d.ts` is
now generated and is four lines re-exporting the `ts` namespace from `lib/tsNamespace.d.ts`; it used
to be a copy of TypeScript's own 588 KB `typescript.d.ts`, which `bundleLocalTs.ts` kept copying long
after nothing read it.

### 8.5 Restatements carried only because the fork's generated AST is wrong

- **`NoSubstitutionTemplateLiteral`** sits on `ExpressionBase` rather than on the primary-expression
  chain, which would leave ts-morph's `LiteralExpression` unable to describe it. Restated in
  `packages/common/src/tsgo/ts.ts` along with the four unions that name it. The real fix is for it to
  embed `LiteralExpressionBase` like every other literal.
- **`TupleTypeNode.elements`** is typed `NodeArray<TypeNode>` where the `typescript` package had
  `NodeArray<TypeNode | NamedTupleMember>`. A named member is one at runtime and is returned as one.
- **`JSDocSignature#getTypeNode()`** is declared `TypeNode | undefined` where the `typescript` package
  had `JSDocReturnTag | undefined`. The runtime value really is a `JSDocReturnTag`, so the
  declaration is wrong rather than the value. Not restated, because overriding the member means
  reshaping `JSDocSignature` around `FunctionLikeBase`, which declares `type?: TypeNode`.

### 8.6 The `move` with `overwrite` defect, since fixed

`SourceFile#move` with `overwrite` onto a path that exists only on the file system used to keep the
stale text when the compiler had already resolved that path. The registry now asks the base file
system, and a path it already has is reported as `changed` rather than `created`, which fixes it.
