# Remaining work

Everything still open on the tsgo migration, in the order I would do it. Items are
marked **compiler** when the fix belongs in `submodules/typescript-go` (and so needs
a wasm rebuild), **upstream** when it belongs in microsoft/typescript-go rather than
our fork, and **ts-morph** when it does not.

Measured state: `ts-morph` 4503 passing / 2 pending, `bootstrap` 85 / 4,
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

**upstream, not our fork.** `getCodeFixesAtPosition` with `[2304]` returns one fix
where 28.0.0 returned two — "Add missing function declaration" has no provider.

Established: it is **unimplemented**, not unrouted. `internal/ls/codeactions.go:86`
registers exactly three providers — `ImportFixProvider`,
`IsolatedDeclarationsFixProvider`, `FixClassIncorrectlyImplementsInterfaceProvider`
— under a literal `// Add more code fix providers here as they are implemented`.
The `codeFixAddMissingFunctionDeclaration*` fourslash tests that name the fix assert
`VerifyCodeFixNotAvailable`, i.e. upstream currently expects it to be absent.

So this is a port of a whole code-fix provider from TypeScript into
microsoft/typescript-go, not something to route from here. Nothing to do in
ts-morph beyond documenting which fixes exist.

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

### 3.1 Adding files one at a time — done, and the earlier reading was wrong

**ts-morph.** Bulk paths are linear and within a constant factor of 28.0.0.
Re-measured side by side at 800 files, in-memory FS: `new Project({
tsConfigFilePath })` 90 ms → 367 ms, `addSourceFilesAtPaths` 21 ms → 218 ms
(0.27 ms/file), first `getPreEmitDiagnostics()` 370 ms → 605 ms, one edit
0.18 ms → 0.94 ms.

A `createSourceFile` loop is linear now too: 800 files, 11374 ms → **8 ms** for
the loop, 199 ms including the read that opens the project. Per file at
100/400/1600 the two together come to 1.31/0.41/0.18 ms against 4.69/7.86/25.85
before, and 3200 files — which the old build would have spent about four minutes
on — comes to 0.14 ms. The cost per file falls as the project grows, because what
is left is one project build with the fixed cost of standing one up spread over
more files.

**Two things this note used to say were wrong.**

The first was where the time went. It was not the O(n) rewrite of the synthetic
tsconfig — serializing it 800 times costs **11 ms of 11040**. Every millisecond
is inside `updateSnapshot`, and specifically inside a root-set change: measured
against a project of 800 files, an edit costs 1.0 ms and a snapshot with no
changes at all 0.2 ms, while adding one root costs 19.5 ms, growing about
0.025 ms for each file already there. **Switching the config to a wildcard does
not help** — measured at 5.26/4.63/7.64/13.15 ms per file for 100/200/400/800,
which is the explicit list to within noise, because the new file joins the root
set either way and that is what reloads the project. The `files` list stays
explicit, so the stem-collision contract `#configText` documents is untouched.

The second was that the reopen could not be deferred past the call because
`createOrUpdateSourceFile` returns the parsed file. What the caller needs from
that return is the file's _path_, and not until something asks for the tree does
it need the tree. So `DocumentRegistry#setSourceFileText` writes without parsing
and holds the change, `#flush` applies whatever is waiting the next time anything
reads the project, and `CompilerFactory` wraps a source file created from text
around a function that asks the registry for the node the first time one is
wanted. A run of creates is one reopen, and a caller that never reads the files
back pays for none.

Note that this makes batching an optimization rather than a complexity fix:
`addSourceFilesAtPaths` and `createSourceFile` in a loop are both linear now, and
the batch is faster only by the bookkeeping it skips.

**Three loops are still quadratic**, all because something asks for a tree while
the next file is still to come, which is the reopen the deferral exists to
collect. None is a regression — every one of them cost this before — and none is
worth chasing before someone reports it, but they are what "linear" above does
not cover:

- Reading each file back inside the loop. 4.7/4.8/7.4/13.9 ms per file at
  100/200/400/800, which is what the whole loop cost before. Measured against a
  loop of `DocumentRegistry#createOrUpdateSourceFile`, which is what the eager
  path did: identical within noise, so this case did not get worse, it just did
  not get better.
- Forgetting or deleting the files as you go: 458/927/3509 ms to delete
  100/200/400 files that were never read, because each removal resolves the next
  file's node. Closing it means `Node#_forgetOnlyThis` not asking for a parent
  a source file cannot have, and `CompilerFactory#removeNodeFromCache` dropping
  an unresolved file by its path rather than by its node.
- Creating files alongside one with an unresolved import whose references have
  been asked for. `SourceFileReferenceContainer` subscribes to `onSourceFileAdded`
  while a literal is unresolved (`SourceFileReferenceContainer.ts:41`), and its
  handler runs a checker query, so every create reopens: 551/1173/4247 ms at
  100/200/400 against 2/3/4 ms without the seed file.

### 3.2 `TsConfigResolver` builds a throwaway wasm instance per call

**ts-morph.** `getCompilerOptionsFromTsConfig` measures ~32 ms warm against 1.3 ms
on 28.0.0. The cost is instantiating the reactor, not compiling it: the compiled
module is cached process-wide (84 ms on the first call, 0 ms after), so this is the
inherent price of standing up a fresh 43 MiB linear memory and Go runtime.

**Merging the two `#withApi` calls does not pay, for the reason first recorded here
rather than the one it looks like.** Nothing technical prevents sharing — the
session re-parses on every `parseConfigFile` with a nil `extendedConfigCache`, and
`callbackFS` delegates each call to the client without caching, so one instance
could serve both parses. What defeats it is call ordering:
`addSourceFilesForTsConfigResolver(project, resolver, resolver.getCompilerOptions())`
evaluates `getCompilerOptions()` as an argument, so the first instance is created
and closed before `getPaths()` runs. Making both parses share one instance would
mean parsing eagerly, which charges the probe parse to every caller that only wants
the options — the common case, and the one `getCompilerOptionsFromTsConfig` is.

What is left is instance pooling, and it is **not worth it**: ~30 ms against a
~1000 ms cold start, in exchange for holding a reactor instance and its linear
memory alive indefinitely, with no dispose hook on `TsConfigResolver` to release it.
Closing this unless a caller turns up that resolves configs in a loop.

### 3.3 `retiredSnapshotLimit` — done, and the earlier reading was wrong

**ts-morph.** Re-measured: the limit is exactly how many edits a `Type`, `Symbol`
or `Signature` taken before them keeps answering across, so it is observable and
stays at 2. The earlier reading missed it because its probe never asked the checker
between manipulations, and `#retire` only keeps a snapshot the checker was used on
— every other one was disposed on the spot, leaving one retained snapshot at any
limit. Asking the checker once per generation separates 0, 1, 2 and 3 exactly.
Cost: not measurable, ~199MB rss either way over 500 files edited 24 times.

### 3.4 A snapshot's cost grew with the project — mostly fixed, with a named ceiling

**tsgo fork.** Every read after a write opens a new snapshot, and four separate
pieces of that were proportional to the number of files in the project rather
than to the number that changed. Three are gone and one is halved:

- **The parse cache was counted per file, by identity.** A cloned program took a
  reference on every file it held and a disposed snapshot released one on every
  file it had held — once each per snapshot — and each of those was a `sync.Map`
  lookup keyed by `ParseCacheKey`, a struct of two file names plus a hash. Boxing
  that key into the map's `any` allocated, and hashing it walked the strings. The
  entry is now handed to the file that holds it (`ast.SourceFile.hostCacheEntry`)
  and carries the key it is filed under, so `RefValue`/`DerefValue` are a lock and
  an increment with nothing built and nothing hashed. Both sweeps removed entirely
  — leaking, to measure the ceiling — took 26% off an 800-file edit loop; keeping
  the refcounting honest costs a little of that back.
- **Every snapshot described every project's whole root file list.** The response
  to `updateSnapshot` carried `rootFiles` and `parsedCommandLine.fileNames` — the
  same list twice — for each project, encoded to JSON in Go and parsed in JS, on
  every edit. A project's description now leaves the list off and the client asks
  for it with `getProjectRootFiles` when something reads it; nothing in ts-morph
  ever does. Worth another 13%. `ProjectResponse.parsedCommandLine` is a
  `ProjectConfig` rather than a `ParsedCommandLine` for it, and `Project.rootFiles`
  — already deprecated — is now `Project.getRootFileNames()`. Two things that were
  plain data are now a request, and the difference shows: the list is only readable
  while the snapshot the project came from is alive, where the field answered
  forever; and it is fetched from the project's command line, so a project whose
  program the typings installer added files to reports what its config named rather
  than what its program holds. Nothing in ts-morph reads either, and the second is
  what `rootFiles` reported anyway.
- **Module resolution looked for a `package.json` once per file.** Every file in
  every program build walked its ancestor directories asking for the package scope,
  and each step built a `<dir>/package.json` path to look up: 22% of the cost of
  adding a root, for an answer that is the same for every file in a directory. The
  resolver memoizes it per directory now (a traced resolution still does the
  lookups, because reporting them is what it is for).
- **The client re-fetched its per-snapshot bookkeeping map per file.** It still
  walks every path the previous snapshot referenced, but the destination it copies
  into is looked up once rather than three times per file.

Measured on the built bundle — this branch's compiler against the same branch with
these four changes stashed, both rebuilt — in-memory FS, one process per size.
Cost of one edit against a project of n files, in ms:

| n      | 200  | 400  | 800  | 1600 | 3200 |
| ------ | ---- | ---- | ---- | ---- | ---- |
| before | 1.70 | 2.14 | 2.59 | 3.79 | 6.68 |
| after  | 1.48 | 1.68 | 1.86 | 2.64 | 3.61 |

The part that grows with the project fell by 2.3x (0.00166 to 0.00072 ms per file
held), leaving ~1.3 ms that is the snapshot's own fixed cost. The same edit on 28.0.0 is
0.055 to 0.079 ms and gets cheaper as the project grows, because it opens no
snapshot at all.

Whole loops, in ms, against a real `ts-morph@28.0.0` install:

| files                                   | 200  | 800   | 1600  |
| --------------------------------------- | ---- | ----- | ----- |
| create, then manipulate — 28.0.0        | 8    | 38    | 79    |
| create, then manipulate — before        | 355  | 1566  | 4738  |
| create, then manipulate — after         | 304  | 1023  | 2350  |
| create and manipulate together — 28.0.0 | 27   | 48    | 84    |
| create and manipulate together — before | 1135 | 11236 | 40161 |
| create and manipulate together — after  | 1010 | 8629  | 30954 |

The first is the edit path and is now within a constant factor of itself: doubling
the project no longer doubles the work. The second is not — it pays a program
rebuild per file, which is the ceiling below.

**What was left** was that a root-set change rebuilt the program, which §3.5 closes.

Two smaller O(files) terms remain in an edit, ~4% each at 800 files and growing:
`computeSnapshotChanges` diffs the whole `FilesByPath` map of every changed project,
where a cloned program knows the one file that differs; and the client's
`SourceFileCache.retainForSnapshot` copies a ref onto every entry the previous
snapshot held. The first needs the compiler to say what a clone changed; the second
needs the client's refs to be carried by a shared generation rather than copied,
which is a redesign of that cache.

### 3.5 Adding a root rebuilt the program — done, with a named ceiling

**tsgo fork.** Creating a file and manipulating it in the same breath is the
commonest codegen loop there is, and it was the one thing still quadratic: a
created file joins the root set, a changed root set changes the command line, and
a changed command line failed `CreateProgram`'s reuse test, so **every create
rebuilt the whole program**. Profiled on a native harness that replays ts-morph's
request sequence (`internal/api/addrootsperf_test.go`, `TSPERF=1`), at 1600 files
that rebuild was 65% of a create, the config reload 12%, and the garbage it made
another 15%.

A program can now be **added to** rather than built again.
`Program.AddRootFiles` takes a command line that differs from the one the program
was built with in nothing but root files appended to the end of its list, and
returns the program a build from scratch would have produced. What makes that
sound is that a root appended at the end can only reach files that are already in
the program or are new, so nothing already there moves and nothing already
resolved resolves differently. The walk is the same `filesParser`, given the old
`processedFiles` as a base: it stops at every file the base already holds,
recording only the added root's reason for wanting it, and the ten
`map[tspath.Path]…` fields are cloned and extended rather than rebuilt. Files the
added roots bring in are spliced in at `rootFilesEnd` — after everything the roots
before them reached, before whatever an automatic type directive brought in —
which is where a rebuild would have put them.

The same call replaces files whose text changed in the same snapshot, because
that is what the loop actually does: manipulating file _n_ and creating file
_n+1_ arrive together. It uses the same `canReplaceFileInProgram` test the
single-file `UpdateProgram` path does, so `Project.dirtyFilePath` became
`dirtyFiles []tspath.Path` plus a `dirtyFilesKnown` flag — a list of what changed
rather than "one file, or give up" — and a config change no longer discards it.

**Where it refuses**, because these are the ways an addition would not be the
program a rebuild gives, each a fallback to `NewProgram`:

- a compiler option that differs, a project reference, roots that moved rather
  than arrived, or a program with none yet (the first build is where the lib
  files and the automatic type directives are settled);
- a file the added roots reach that is a **lib file**, new or already present:
  libs are sorted and put ahead of every other file, so one arriving or changing
  hands moves everything;
- a file an **automatic type directive** brought in that an added root reaches.
  Those sit past `rootFilesEnd`, and a rebuild would place one an added root
  reaches among that root's own files instead — the premise that nothing already
  there moves holds for the files earlier roots reached, and only for those;
- a file the base only found by **searching node_modules** that the walk reaches
  without searching. How deep a file was found is the lowest depth over the whole
  walk, and it decides whether the program counts the file as coming from a
  library, so reaching one at depth 0 would drop it from a set the base put it in;
- a **package installed twice** under `node_modules`: which instance wins is
  decided over the whole walk, and the base does not record the decision;
- a file the base holds under a **different casing**, a new file that collides
  with one under `ToFileNameLowerCase` (which is why `processedFiles` now keeps
  `filesByLowerCasePath` on a case-sensitive file system), or a new file reached
  under two casings at once, which the walk acquires and the caller would then
  reference a second time as a duplicate;
- a program that already has redirects;
- anything arriving with a **deletion**, a **package.json**, or more changes than
  `maxDirtyFilesTracked` files, which clears `dirtyFilesKnown`;
- and the one the compiler cannot see, checked in `Project.addRootFilesToProgram`:
  an added path the previous program's host had already **looked for and not
  found**. A rebuild would resolve that lookup to the new file and the file that
  made it would mean something different. The host records every path it read or
  probed, so this is `sourceFS.SeenFileOrMissingParentDirectory`, asked of every
  added root before the walk and of every file the walk acquired after it.

`verifyCompilerOptions` is deliberately **re-run in full** on the added-to
program rather than made incremental. It reads only the file set and the options,
both of which the new program has right, so running it is a proof rather than an
argument; it costs ~6% of what a create now costs. The common source directory is
carried over when `rootDir` or `configFilePath` names it — the only cases where
it does not depend on the file set. Both of those produce diagnostics after the
parse and over whatever files the program holds by then, so `includeProcessor`
keeps three buckets rather than one: the parse's own, which are carried;
`rootDirDiagnostics`; and `optionsDiagnostics`. Carrying either of the last two
would report them twice, since the program that carried them computes them again.

Equivalence is tested rather than argued.
`internal/compiler/addrootfiles_test.go` and
`internal/compiler/addrootfilesprobe_test.go` build a project both ways over
thirty-nine shapes and compare `ExplainFiles` (every file, in order, with every
reason it is in the program), every include reason's own data — a root file's is
its index in the config's file list, which `ExplainFiles` does not render — every
module and type resolution, every file's metadata, the missing files, the lib
files, the redirect maps, the lower-case index, the common source directory, the
program diagnostics, the emit-blocking set and every semantic diagnostic. The
probe suite additionally fingerprints the **base** program before and after, since
an addition that wrote into a map the program it came from still holds would
corrupt every snapshot behind it. `internal/api/addroots_test.go` and
`internal/project/addrootsproject_test.go` do the same through the session,
driving it the way ts-morph's document registry does, assert which cases refuse,
and check the parse cache's reference ledger after every step: one reference per
file the program holds and one per duplicate it reports, and nothing else left
behind. That ledger is what catches an addition that acquires a file the caller
then references again.

Measured on the built bundle — this branch against the same branch with these
changes stashed, both rebuilt — in-memory FS, one process per size, in ms:

| files                                       | 200  | 800  | 1600  |
| ------------------------------------------- | ---- | ---- | ----- |
| create and manipulate together — 28.0.0     | 26   | 45   | 86    |
| create and manipulate together — before     | 1240 | 9210 | 30794 |
| create and manipulate together — after      | 686  | 3219 | 10201 |
| create, then read each file back — before   | 903  | 7994 | 28967 |
| create, then read each file back — after    | 408  | 2006 | 6337  |
| create, then manipulate (two loops) — after | 269  | 1070 | 2386  |

A create-and-manipulate loop is 3.0x faster at 1600 files, and the loop that only
creates and reads — the addition on its own, with no edit in it — is 4.6x. Neither
is linear yet: at 1600 the loop is 4.3x what the same work costs in two loops,
where the two-loop cost is the floor, being one config write and one program build
for the whole run. Bulk paths are unchanged: `addSourceFilesAtPaths` measures
133–149 / 198–215 / 266–279 ms at 200/800/1600 over three runs, and a create loop
that reads nothing back is 1–11 ms.

**What is left is the config, and it is ts-morph's shape rather than the
compiler's.** The registry's tsconfig names every file it holds (see
`#configText` for why the list has to be explicit), so a create rewrites a file
that grows with the project and the session parses it again: at 1600 files that
round trip is ~28% of what a create still costs — ~22% parsing it in Go, the rest
building the text in JS, of which `getCommonDirectory` over every file name is the
larger half. Cloning the ten maps is another ~21%, which is the price of a
snapshot the previous one keeps answering from. Closing the first means letting a
client name root files for a project through the API rather than through the
config — `Project.getCommandLineWithTypingsFiles` already augments a command line
with files that are not in it — and then keeping the config honest for the times
it _is_ re-read (a compiler option changing, a file being removed). That is a
protocol and lifetime change in the document registry, not a compiler one.
Closing the second means the per-file maps becoming layered rather than copied,
which is a change to every reader of `processedFiles`.

One thing came out of the profile that was not the compiler's: computing the
watch globs for a config walks every root file, and the API session does not
watch. `configFileRegistryBuilder.updateRootFilesWatch` now returns early when
`SessionOptions.WatchEnabled` is false, which is the only condition under which
`Session.updateWatches` ever reads them.

**Two things to know before building on this.** The first is that a project with
`types` in its config gives up the fast path whenever a created file reaches one
of those packages — a new file importing `"fs"` in a project with
`types: ["node"]`, say — because of the automatic type directive rule above.
Correct, and slower than it needs to be: the way to fix it is to move such a file
out of the directive region and reorder its include reasons, rather than refuse.
Nothing ts-morph does with an in-memory file system meets it, since there are no
`@types` there to bring anything in. The second is that
`includeProcessor.getDiagnostics` reads `rootDirDiagnostics` under a `sync.Once`
while `CommonSourceDirectory` can be appending to it from another goroutine. The
race predates this — the same append went to `processingDiagnostics` before — but
splitting the field made it easier to see, and it is worth closing.

---

### 3.6 What is left, and the order to do it in

The shape of the cost has changed, so the priorities have too. Measured per edit
and read on an already-built project:

| project    | per edit + read | 28.0.0   |
| ---------- | --------------- | -------- |
| 100 files  | 1.00 ms         | ~0.06 ms |
| 400 files  | 1.65 ms         |          |
| 1600 files | 1.93 ms         |          |
| 3200 files | 2.02 ms         |          |

A 32x increase in project size now costs 2x per edit, so **the size-dependent term
is largely dealt with** and roughly 90% of what remains is a fixed ~1 ms paid on
every read-after-write. Chasing per-file terms has hit diminishing returns; the
question is why an edit opens a snapshot at all.

#### a. Stop opening a semantic snapshot for a syntactic operation — the one that matters

**ts-morph and fork.** `addClass`, `addStatements` and `rename` are a text edit
followed by a re-parse of **one file**. Nothing semantic is needed. Every one of
them currently opens a compiler snapshot: a program clone, a Wasm round trip, an
AST re-encode. 28.0.0 did none of that — it re-parsed the changed file with
`ts.createSourceFile` and left the program alone until something asked a semantic
question, which is the whole of its 0.06 ms.

The change: a **parse-only endpoint** in the fork — text in, encoded AST out, no
project, no snapshot, no binding — used for the tree a manipulation hands back,
with the session update deferred to the next genuinely semantic query (types,
diagnostics, references, symbols). The deferral machinery already exists from
§3.1; this extends it from creation to editing.

The risks, in order: node identity for a tree with no snapshot handle (though
`RemoteNode` versus reconstructed nodes already draws that distinction, see
`isReconstructedNode`); classifying every public method as syntactic or semantic,
where getting one wrong yields a stale answer rather than a slow one; and keeping
the stale-handle errors honest. This is a design change, not a patch.

#### b. Send root files to the API directly, not through a synthetic tsconfig

**ts-morph and fork.** The registry writes a `/tsconfig.json` naming every file,
which the compiler re-parses on every reopen — the largest measured item left
(~28% of a create at 1600 files, counting `getCommonDirectory` on the JS side).
Taking root files as root files removes it, and deletes the stem-collision
workaround `#configText` documents as a side effect. Needs the protocol and the
registry's project lifetime to change together.

#### c. Make deletion incremental

**fork.** The last genuinely quadratic path: creating while deleting measures
5.6 / 9.0 / **18.6** ms per file at 200 / 400 / 800, still doubling. Deletion
falls back to a full rebuild (§3.5). The machinery is the one `AddRootFiles`
already established — the hard part is that removing a file can move what other
files resolve to, so the refusal conditions need at least as much care as the
addition's did.

#### d. A public batch create entry point

**ts-morph.** The documented fast path is currently advice in
BREAKING-CHANGES.md §6 rather than an API. `DocumentRegistry#createOrUpdateSourceFiles`
already exists underneath; `Project` should expose the same shape.

#### e. Two per-file loops that a clone already knows the answer to

**fork and client.** `computeSnapshotChanges` diffs the whole `FilesByPath` map
when a clone knows the one file that differs, and `retainForSnapshot` copies a
reference onto every entry. ~4% each at 800 files.

#### Deferred: layered `processedFiles` maps

Cloning ten `map[tspath.Path]…` fields per snapshot is ~21% — the largest single
item after (b) — but making them layered rather than copied touches every reader
in the compiler. Deliberately left until the above have landed and been measured,
since (a) may make the snapshot rare enough that this stops mattering.

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
