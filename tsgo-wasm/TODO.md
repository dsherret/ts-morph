# Remaining work

Everything still open on the tsgo migration, in the order I would do it. Items are
marked **compiler** when the fix belongs in `submodules/typescript-go` (and so needs
a wasm rebuild), **upstream** when it belongs in microsoft/typescript-go rather than
our fork, and **ts-morph** when it does not.

Measured state: `ts-morph` 4500 passing / 2 pending, `bootstrap` 85 / 4,
`common` 435 / 0, both verification gates clean, 15/15 end-to-end scripts.

---

## 1. Browser support — done

Shipped in `feat: run in the browser` (14845d9e) and finished in b6670dac. The
compiler now runs against a `wasi_snapshot_preview1` shim written in the fork
against the web platform only, so `node:wasi` appears in no shipped artifact and
one artifact serves Node, Deno and the browser. A browser must load it in a Web
Worker (V8 refuses a >8 MB `WebAssembly.Module` on the main thread) and must
`await initializeWasm()` before the first `Project`. See
[browser/README.md](./browser/README.md).

What is still open is **delivery**, not support. The asset now ships gzipped —
9.50 MiB over the wire for a 43.02 MiB module, gunzipped through a
`DecompressionStream` into `compileStreaming`, at a cost of ~60 ms once per page —
which puts it under the size Chrome's HTTP cache refuses to keep. A compiled
`WebAssembly.Module` still cannot be stored in IndexedDB, so the documented answer
for a page loading it repeatedly is an explicit `Cache` entry plus `postMessage`
of the compiled module. Related: JSR publishing (§4).

---

## 2. Behaviour still diverging from 28.0.0

### 2.1 `findReferencesAtPosition` — done

**ts-morph.** Resolves to the token a position touches again, as 28.0.0 did.
Sweeping every offset of `class C { m(a: string) { return a; } }` now agrees at
every position; the wider corpus went from 558 differing positions of 2423 to 90,
and each of the 90 is a tsgo-side gap unrelated to position resolution (recorded
in BREAKING-CHANGES.md §8.5). The stray `class` entry on
`ConstructorDeclaration#findReferencesAsNodes()` went with it.

### 2.2 `getContainerName()` for a file-held declaration — done

**compiler.** `symbolToString` is exposed on the API's checker
(`MethodSymbolToString`), and a definition whose container is its own file's
module symbol is named with it. Measured over 11 definition lookups: 10 now match
28.0.0 exactly — `"../mod"`, `"./sub"`, `"pkg"` for a package under
`node_modules`, `"Cls"` for a member, `""` for a local. The eleventh is the one
28.0.0 got wrong: the same symbol read `"../mod"` at an import specifier and
`"./mod"` at a call site, and `"./mod"` does not resolve from the asking file.
It reads `"../mod"` at both now, so the divergence that remains is a fix.

### 2.3 `ImplementationLocation#getDisplayParts()`

**compiler.** `getKind()` is fixed; display parts need a protocol change:
`handleGetImplementations` returns `[]*FileSpan` and would have to return a new
struct, touching `internal/api/proto.go`, `session_ls.go`, both client `api.ts`
files and the copy `packages/common` re-vendors. Recipe and cost are in
BREAKING-CHANGES.md.

### 2.4 `Node#getSymbol()` on an anonymous declaration — done

**compiler.** `getSymbolOfDeclaration` is exposed on the API's checker
(`MethodGetSymbolOfDeclaration`) and asked as the last fallback in
`Node#getSymbol()`, so a declaration with no name to ask the checker with is
answered by asking the declaration itself. Sweeping every node of a source file
covering the affected kinds went from 370 of 388 agreeing with 28.0.0 to 384: the
14 that moved are arrow functions, anonymous function expressions, object
literals, type literals, mapped types, function and constructor types, export
declarations, call/construct/index signatures and constructors, each now reading
the same `__function` / `__object` / `__type` / `__call` / `__new` / `__index` /
`__constructor` the binder gave. Nothing that already answered changed. The four
still differing are unrelated — two are the `__@iterator@N` id a computed
property name carries, two are AST shape.

### 2.5 `typeof` in nested positions

**upstream.** `const t = [f]` prints `(typeof f)[]` where 28.0.0 printed
`((a: number) => number)[]`. typescript-go widened `shouldWriteTypeOfFunctionSymbol`
deliberately (PR #4507) for declaration emit. ts-morph clears the flag for the
top-level case; the flag is all-or-nothing per print, so nested occurrences cannot
be reached from this side. Reverting belongs upstream, if anywhere.

### 2.6 `getIndentationLevel` — the per-kind indent table

**ts-morph.** Four more of the smart indenter's rules are modelled (b6670dac), so
over 112 snippets under three indentation settings **287 of 8217 probed positions
differ**, down from 2771; list continuation, `ImportSpecifier` and `Parameter` on
their brace's line are among the fixed ones. No manipulation output regressed.

What is left is mostly `SmartIndenter.nodeWillIndentChild` — the compiler's
per-kind table of which parents indent which children, which the text gives no
hint of. Routing `format.GetIndentation` (§5.2 of the migration report) deletes
the whole indenter and closes this.

### 2.7 `insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces` — done

**ts-morph.** Reaches the formatter's edits as of b6670dac; `formatText` output
matches 28.0.0. Three things it still does not reach, all recorded in
BREAKING-CHANGES.md §8.4: braces inside a string, template, comment or JSX text;
a comment sitting between the two tokens; and the edits tsgo writes itself
(`fixMissingImports`, `organizeImports`).

### 2.8 `fixMissingFunctionDeclaration` is absent

**compiler.** `getCodeFixesAtPosition` with `[2304]` returns one fix where 28.0.0
returned two — "Add missing function declaration" has no provider in tsgo. Establish
whether it is unrouted or unimplemented before deciding.

### 2.9 Diagnostic spans and codes

**upstream.** Unused-import 6133 covers just the identifier where TypeScript covered
the statement; an unused type parameter is 6196 where TypeScript said 6133, so a
caller filtering on 6133 silently stops seeing it. Checker behaviour, no correctness
consequence. Document rather than diverge the fork.

### 2.10 Smaller reported divergences, unowned

- A constructor definition reports `name: "constructor(a: number);"` / `kind:
  "class"` where 28.0.0 said `"__constructor"` / `"constructor"`. The kind is not
  the flag order the next bullet fixed: the symbol the checker answers with at a
  constructor's span is the class's, which has no `Constructor` flag to read.
- `getScriptElementKind` now orders the flags the way `getSymbolKind` did and
  reads `const`/`let`/`var`/`parameter` off the declaration rather than off the
  symbol, which cannot tell them apart. That fixed 20 measured rows — among them
  `const x = 1` reading `var`, `let x = 1` reading `var`, `var x = 1` reading
  `parameter`, and a function merged with a namespace reading `module`. Seven rows
  still differ, all in BREAKING-CHANGES.md §8.5: `using`/`await using`, a variable
  or function local to a function body and a named class expression, whose kinds
  did not survive into `ts.ScriptElementKind`; `this`, which TypeScript classified
  by the position rather than by the symbol; and a namespace import, an
  `import x = require(…)` and a call through a variable holding a function, where
  the definition tsgo answers with is a different node than the one 28.0.0
  classified. Two more are the checker rather than the classification: a `.js`
  `exports.f = function () {}` and a property that only exists on a union.
- `JSDocSignature#getTypeNode()` is declared `TypeNode` but holds a
  `JSDocReturnTag`; the declaration is wrong, not the value. **compiler**

---

## 3. Performance

### 3.1 Adding files one at a time is still quadratic

**ts-morph.** Bulk paths are linear now and within a constant factor of 28.0.0.
Re-measured side by side at 800 files, in-memory FS: `new Project({
tsConfigFilePath })` 90 ms → 367 ms, `addSourceFilesAtPaths` 21 ms → 218 ms
(0.27 ms/file), first `getPreEmitDiagnostics()` 370 ms → 605 ms, one edit
0.18 ms → 0.94 ms.

A `createSourceFile` loop is still quadratic — 800 files, 10 ms → **8254 ms**
(5.3 ms/file at 200, 10.3 at 800) — and cannot be fixed the same way:
`createOrUpdateSourceFile` returns the parsed file, so the reopen cannot be
deferred past the call. The registry already has the batched
`createOrUpdateSourceFiles(entries)` that makes the bulk path linear; what is
missing is a public entry point on `Project` that can use it. Either add one or
accept it. BREAKING-CHANGES.md §6 documents the write-then-`addSourceFilesAtPaths`
workaround in the meantime.

### 3.2 `TsConfigResolver` builds a throwaway wasm instance per call

**ts-morph.** `createInProcessApi` + `close` measured at 11.7 ms against ~1.5 ms for
the parse itself, so `getCompilerOptionsFromTsConfig` costs 12.2 ms against 2.2 ms
on 28.0.0 (re-measured side by side). Merging the two `#withApi` calls does not pay — `getCompilerOptions()`
necessarily precedes `getPaths()`. Wants instance pooling or a persistent session,
and `TsConfigResolver` has no dispose hook to hold one safely.

### 3.3 `retiredSnapshotLimit` — done, and the earlier reading was wrong

**ts-morph.** Re-measured: the limit is exactly how many edits a `Type`, `Symbol`
or `Signature` taken before them keeps answering across, so it is observable and
stays at 2. The earlier reading missed it because its probe never asked the checker
between manipulations, and `#retire` only keeps a snapshot the checker was used on
— every other one was disposed on the spot, leaving one retained snapshot at any
limit. Asking the checker once per generation separates 0, 1, 2 and 3 exactly.
Cost: not measurable, ~199MB rss either way over 500 files edited 24 times.

---

## 4. Packaging and publishing

- **JSR** — half solved. The size half is: the reactor ships gzipped, so
  `deno/common` is 13.7 MiB against the 20 MiB limit rather than ~48 MB, and
  `deno publish --dry-run` is green. What remains is that the wasm cannot be
  loaded over `https:` — a JSR consumer has no file to read beside the module —
  so publishing is still not solved. The answer is likely `initializeWasm` with a
  fetched `Response`, which now handles the compressed asset, made to work for a
  `https:` default rather than only a `file:` one.
- **Fork maintenance** — the fork is 17 commits ahead of upstream. Split the
  mislabelled commit (`15ff4accb` says "expose getAmbientModules" and carries six
  unrelated changes) before proposing anything upstream, and decide which changes to
  send there rather than carry.
- **Restatements to retire** — `TupleTypeNode.elements`, `JSDocTemplateTag.constraint`
  and `NoSubstitutionTemplateLiteral` are restated in `packages/common/src/tsgo/ts.ts`
  only because the fork's generated AST is wrong. Fixing them there deletes the
  restatements. **compiler**

---

## 5. Documentation

- **The comment sweep**, deliberately deferred: shipped source still carries
  `Breaking change:` comments and notes about what tsgo no longer has — including
  in the generated `.d.ts` files consumers read. Those belong in
  BREAKING-CHANGES.md, not in the API's doc comments, and they will read as noise
  to anyone who never used 28.0.0.
- **`docs/emitting.md`** documents `project.emit({ customTransformers })`, which is
  removed and now fails silently — the transformer is never called. Rewrite that
  section.
- **BREAKING-CHANGES.md** was rewritten as a migration guide and every load-bearing
  claim in it re-measured against published 28.0.0. Three claims in it are still
  stated from source rather than measured and are marked as such in its Appendix B.
  It has been found stale or inverted repeatedly in the past; keep treating a claim
  nobody has re-run as a hypothesis.
- **`docs/setup/index.md`** — done in b6670dac; the resolution example is current.
- **`removed-capabilities/`** — done in b6670dac; the README and `.mocharc.yml` now
  agree on three files.
