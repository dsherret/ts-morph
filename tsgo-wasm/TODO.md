# Remaining work

Everything still open on the tsgo migration, in the order I would do it. Items are
marked **compiler** when the fix belongs in `submodules/typescript-go` (and so needs
a wasm rebuild), **upstream** when it belongs in microsoft/typescript-go rather than
our fork, and **ts-morph** when it does not.

Measured state at the time of writing: `ts-morph` 4459 passing / 2 pending,
`bootstrap` 85 / 4, `common` 424 / 0, both verification gates clean, 15/15
end-to-end scripts.

---

## 1. Browser support — wanted

28.0.0 was plain JavaScript and ran wherever a bundler could reach. The compiler is
now a wasm reactor instantiated with Node's WASI, so a browser build fails to
resolve `node:wasi`, which both the node and deno bundles require at the top level.

**Why WASI is involved at all:** tsgo is Go, and `GOOS=wasip1 GOARCH=wasm` — what
`_scripts/build-wasm.mjs` builds with — is Go's wasm target for non-browser hosts.
It emits imports against the `wasi_snapshot_preview1` ABI, which Node implements in
`node:wasi`. Nothing chose WASI for ts-morph's sake.

**This is smaller than it sounds.** The module's import list is 25 WASI functions
and exactly **two** host functions (`ts_host.callback`, `ts_host.read_result`),
because the file system is already delegated to JavaScript through the callback
bridge. The `fd_*` and `path_*` WASI imports are linked in by the Go runtime, not
driven by the compiler. A browser host must _supply_ all 25 for instantiation to
succeed, but most can be stubs that return `ENOSYS`; the ones needing real
behaviour are `args_get`/`args_sizes_get`, `environ_get`/`environ_sizes_get`,
`clock_time_get`, `random_get`, `fd_write` (stderr only), `proc_exit`,
`sched_yield` and `poll_oneoff`.

Work:

- A minimal WASI shim, and a browser wasm loader beside the node one in the fork's
  `api/wasm/`. **compiler** (the loader lives there; the shim could live either
  side).
- Route it through the `browser` field so bundlers pick it up, and stop
  `getRuntime()` implying support that cannot load.
- Confirm which of the 25 are genuinely reached — instrument the node host first,
  rather than guessing from the import list.
- Decide how the 45 MB wasm is delivered to a browser: bundled, fetched, or
  streamed. This is the part with no obvious answer, and probably decides whether
  the feature is worth it.
- Alternative worth costing first: a `GOOS=js` build, which needs no shim but is a
  second artifact and a different Go target. **upstream**

---

## 2. Behaviour still diverging from 28.0.0

### 2.1 `findReferencesAtPosition` resolves by containment, not by touching token

**ts-morph.** Sweeping every offset of `class C { m(a: string) { return a; } }`:
26 positions agree, **13 differ**, in both directions. Offsets 0–4, 7, 11, 13, 21,
33 answer in 28.0.0 and return `[]` now; offsets 9, 14, 31 answer now and returned
`[]` before. Re-measured after the reconstructed-node fix, so this is current.

The fallback added for rebuilt nodes resolves a position to the node that
_contains_ it; TypeScript resolved to the token the position _touches_. Same root
cause as the extra `class` keyword in
`ConstructorDeclaration#findReferencesAsNodes()`, which reports
`isDefinition() === false` and so cannot be dropped by the existing filter.

Deciding question: is "touching token" reproducible from the stored-node fallback?
If yes, match it. If not, document the containment rule and accept it.

### 2.2 `getContainerName()` for a file-held declaration

**compiler.** Reads `""` where TypeScript named the module specifier. The baseline
value is whatever `getModuleSpecifiers` would write at the asking file — `"pkg"`
for a package under `node_modules`, not a relative path — and it is cached per
context file, so 28.0.0 is itself inconsistent (same symbol, `"../mod"` at an
import specifier and `"./mod"` at a call site). Wants `symbolToString` on the API's
checker. Low value given the baseline's own inconsistency.

### 2.3 `ImplementationLocation#getDisplayParts()`

**compiler.** `getKind()` is fixed; display parts need a protocol change:
`handleGetImplementations` returns `[]*FileSpan` and would have to return a new
struct, touching `internal/api/proto.go`, `session_ls.go`, both client `api.ts`
files and the copy `packages/common` re-vendors. Recipe and cost are in
BREAKING-CHANGES.md.

### 2.4 `Node#getSymbol()` on an anonymous declaration

**compiler.** Returns `undefined` for arrow functions, object literals, type
literals, call/construct/index signatures, constructors and export assignments,
where 28.0.0 gave the binder's internal symbol. tsgo's nodes carry no binder symbol
and its checker exposes no accessor to ask instead. The only client-side workaround
covers 6 of 11 kinds and invents new wrong answers in the other direction
(`ArrayLiteralExpression` → `Array`). Wants `getSymbolOfDeclaration` on the API's
checker.

### 2.5 `typeof` in nested positions

**upstream.** `const t = [f]` prints `(typeof f)[]` where 28.0.0 printed
`((a: number) => number)[]`. typescript-go widened `shouldWriteTypeOfFunctionSymbol`
deliberately (PR #4507) for declaration emit. ts-morph clears the flag for the
top-level case; the flag is all-or-nothing per print, so nested occurrences cannot
be reached from this side. Reverting belongs upstream, if anywhere.

### 2.6 `getIndentationLevel` at list-continuation positions

**ts-morph.** 11 query positions report one level less than the smart indenter did
— empty parameter and argument lists, `ImportSpecifier` and `Parameter` on their
brace's line, and the punctuation trailing a wrapped list. No effect on emitted
text: all 40 probed manipulation operations match 28.0.0 byte for byte.

### 2.7 `insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces` is a formatter no-op

**ts-morph.** Still honoured by the structure printers, silently ignored by
`formatText` and `fixMissingImports`. Either post-process the formatter's output as
the option's own doc comment promises, or remove it from `FormatCodeSettings`. It
has 8 non-test call sites, so removal is not free.

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
  "class"` where 28.0.0 said `"__constructor"` / `"constructor"`.
- `getScriptElementKind` tests `Module` before `Function`, so a function merged with
  a namespace reads `module`.
- `JSDocSignature#getTypeNode()` is declared `TypeNode` but holds a
  `JSDocReturnTag`; the declaration is wrong, not the value. **compiler**

---

## 3. Performance

### 3.1 Adding files one at a time is still quadratic

**ts-morph.** Bulk paths are linear now (~0.11 ms/file, flat from 800 to 3200
files). A `createSourceFile` loop is not, and cannot be fixed the same way:
`createOrUpdateSourceFile` returns the parsed file, so the reopen cannot be
deferred past the call. Either accept it, or offer a batching entry point in the
public API and say so in the docs.

### 3.2 `TsConfigResolver` builds a throwaway wasm instance per call

**ts-morph.** `createInProcessApi` + `close` measured at 11.7 ms against ~1.5 ms for
the parse itself, so `getCompilerOptionsFromTsConfig` costs 13.2 ms against 1.3 ms
on 28.0.0. Merging the two `#withApi` calls does not pay — `getCompilerOptions()`
necessarily precedes `getPaths()`. Wants instance pooling or a persistent session,
and `TsConfigResolver` has no dispose hook to hold one safely.

### 3.3 `retiredSnapshotLimit`

**ts-morph.** Measured to buy nothing: `Type#getText()` routes through the current
checker, and across 0/1/2/3/5 manipulations no operation distinguishes n=1 from
n=3, so it pins up to two Go-side programs and checkers per editing loop. Deferred
once because stale-handle work was in flight; that has landed, so re-measure and
set it to 0 or delete `#retire`.

---

## 4. Packaging and publishing

- **JSR** — the package is ~48 MB against a 20 MiB limit, and the wasm cannot be
  loaded over `https:`. `deno publish --dry-run` is green; actually publishing is
  not solved.
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
  `Breaking change:` comments and notes about what tsgo no longer has. Those belong
  in BREAKING-CHANGES.md, not in the API's doc comments, and they will read as
  noise to anyone who never used 28.0.0.
- **`docs/setup/index.md`** is TypeScript 5 code — array-form `resolveModuleNames`,
  `ts.ResolvedModule`, `ts.resolveModuleName` — and claims type-reference-directive
  support, which is the one thing explicitly deferred.
- **BREAKING-CHANGES.md has been found stale or inverted repeatedly.** Treat every
  claim in it as a hypothesis until measured. The migration report lists the specific
  claims known to be contradicted.
- **`removed-capabilities/`** — its README says "these two" while listing three, and
  `.mocharc.yml` says the same. One of the three is a TODO rather than a removal.
