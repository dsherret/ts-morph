# Remaining work

What is still open on the tsgo migration, in the order I would do it. Items are
marked **compiler** when the fix belongs in `submodules/typescript-go` (and so needs a
Wasm rebuild), **upstream** when it belongs in microsoft/typescript-go rather than our
fork, and **ts-morph** when it does not.

Finished work is not kept here. What a user needs to know from it is in
[BREAKING-CHANGES.md](./BREAKING-CHANGES.md); what it measured and how it was done is
in [MIGRATION-REPORT.md](./MIGRATION-REPORT.md) §8.

Measured state: `ts-morph` 4520 passing / 2 pending, `common` 461 / 0, `bootstrap`
85 / 4, both verification gates clean, 16/16 end-to-end scripts, `go test ./...`
clean, all four `typescript.wasm` copies identical.

---

## 1. Behaviour still diverging from 28.0.0

### 1.1 `ImplementationLocation#getDisplayParts()`

**compiler.** `getKind()` is fixed; display parts need a protocol change.
`handleGetImplementations` returns `[]*FileSpan` and would have to return a new
struct, touching `internal/api/proto.go`, `session_ls.go`, both client `api.ts` files
and the copy `packages/common` re-vendors.

### 1.2 `getIndentationLevel` — the per-kind indent table

**ts-morph, or compiler.** Over 112 snippets under three indentation settings, **287
of 8217 probed positions differ**, down from 2771. No manipulation output is affected —
this is the query, not the emitted text.

What is left is mostly `SmartIndenter.nodeWillIndentChild`: the compiler's per-kind
table of which parents indent which children, which the text gives no hint of.
Routing `format.GetIndentation` (MIGRATION-REPORT §5.2) deletes the hand-rolled
indenter and closes this properly, and is the better fix than modelling more rules.

### 1.3 `typeof` in nested positions

**upstream.** `const t = [f]` prints `(typeof f)[]` where 28.0.0 printed
`((a: number) => number)[]`. typescript-go widened `shouldWriteTypeOfFunctionSymbol`
deliberately (PR #4507) for declaration emit. ts-morph clears the flag for the
top-level case; the flag is all-or-nothing per print, so nested occurrences cannot be
reached from this side. Reverting belongs upstream, if anywhere.

### 1.4 Two small ones with no owner

- A constructor definition reports `name: "constructor(a: number);"` / `kind: "class"`
  where 28.0.0 said `"__constructor"` / `"constructor"`. The symbol the checker
  answers with at a constructor's span is the class's, which has no `Constructor`
  flag to read, so this is not the flag ordering that fixed the other definition
  kinds.
- `JSDocSignature#getTypeNode()` is declared `TypeNode` but holds a `JSDocReturnTag`.
  The declaration is wrong, not the value. **compiler**

### 1.5 Capabilities that are missing rather than removed

BREAKING-CHANGES.md §9 lists these as unfinished rather than chosen, and says they are
tracked here — so here they are. Each is a compiler route or a provider, not a design
decision, and each would restore something 28.0.0 had:

- `TypeFormatFlags` as a real enum rather than a `NodeBuilderFlags` alias. Today the
  two are the same nominal type, and five of the members that no longer exist have
  values that are live in `NodeBuilderFlags` under other meanings — so a persisted
  bitmask silently changes behaviour. **compiler**
- The rest of `FormatCodeSettings`: the `insertSpace…` family, `semicolons`,
  `baseIndentSize`, `placeOpenBraceOnNewLineFor…`. The formatter accepts tab size,
  spaces-versus-tabs and trailing-whitespace trimming and nothing else. **compiler**
- `CodeFixAction#getFixId()` / `getFixAllDescription()`. The compiler does not group
  fixes into fix-alls, so there is no id to report or to feed back in. **compiler**
- `formatDiagnosticsWithColorAndContext` with real colour and context. ts-morph
  formats diagnostics itself now, without the source line, the caret or the ANSI
  colouring. **compiler**
- `readDirectory` / `matchFiles`. **compiler**
- `SourceFile#fixUnusedIdentifiers()`. This one needs a new provider rather than a
  route — the compiler implements three, and removing unused declarations is not among
  them. **upstream**
- `@types` packages added to the file system _after_ the project was created, for
  `getAmbientModules`. **compiler**

---

## 2. Performance

The size-dependent costs are gone: an edit no longer grows with the project, and no
loop is quadratic. What is left is constant factors.

### 2.1 Delete-heavy loops still grow with the project

**ts-morph.** Partly fixed, and the cause was twice attributed wrongly, so both dead
ends are recorded here to save the next person repeating them.

| ms per create-and-delete step | 800   | 1600  | 3200  |
| ----------------------------- | ----- | ----- | ----- |
| originally                    | 18.6  | —     | —     |
| after the incremental removal | 0.362 | 0.678 | 1.391 |
| after the fix below           | 0.264 | 0.421 | 0.723 |

**Two wrong attributions.** It was recorded as `Snapshot.Clone` copying ten
`map[tspath.Path]…` fields in the compiler. Measurement says otherwise: a 10-step
create-and-delete loop opens **zero** snapshots (the registry's own `snapshotsOpened`
counter), so that clone never runs in this shape at all. Before that it was thought to
be the synthetic tsconfig, which was 11 ms of 11 040.

**What it actually was:** `DocumentRegistry#recomputeCommonDirectory`, called by every
removal and folding over every file the registry holds, because a removal is the one
change that can _lengthen_ the common directory and so cannot be folded incrementally.
Fixed — the value is only read when the config is written, so a removal marks it stale
and the fold happens once per flush.

**It still grows**, 2.7× for 4× the files, so a third thing in this loop is not constant
either and has not been found. Whatever it is, it is not the two above and not the
snapshot. Profile the loop rather than reasoning about it: that is what settled the last
two.

### 2.2 What the remaining gap actually is, and the floor under it

Measured against published 28.0.0, checking is **a flat ~2× slower**, and the ratio does
not move with the amount of work:

| workload                              | 28.0.0     | now        | ratio |
| ------------------------------------- | ---------- | ---------- | ----- |
| one file, `lib: ["lib.es2022.d.ts"]`  | 34–42 ms   | 72–78 ms   | ~2.0× |
| one file, default libs (DOM included) | 326–484 ms | 804–846 ms | ~2.2× |
| 300 files, first diagnostics          | 387 ms     | 711 ms     | ~1.8× |
| an edit then a `getType()`, 400 files | 2.80 ms    | 5.67 ms    | ~2.0× |

That last row used to be recorded here as its own regression, on the grounds that the
edited file was parsed twice. It genuinely was, and that is fixed — but fixing it moved
the row rather than removing it. What is left in that shape is the snapshot the semantic
question needs, and it lands on the same ~2× as everything else. Removing the second
parse is worth what parsing that one file costs: on ~120-line files an edit-then-ask went
11.9 ms to 8.8 ms, and on one-line files it measures nothing at all.

**That flatness is the finding.** If the cost were lost parallelism — tsgo parallelises
parse, bind and check through `core.NewWorkGroup`, and Go's `wasip1` target runs on one
thread, so those goroutines interleave with no CPU parallelism — the gap would widen as
more files became available to work on concurrently. It does not. A constant factor
across one file and three hundred is the signature of uniform per-unit execution
overhead, which is what running Go in Wasm costs.

So **this ~2× is a floor, not a defect**, and no amount of work in ts-morph or in the
fork's API layer will move it. The only route past it is a different backend: the
in-process API is deliberately the `@typescript/native-preview` sync API so the Wasm
reactor could be swapped for a subprocess or native build without changing callers (see
`inProcessApi.ts`). That trades away the single artifact, the browser, and synchronous
construction — so it is a product decision, not an optimisation.

Two things not to spend more on:

- **`SingleThreaded: true` was tried and is worse.** It looked like a correctness-shaped
  change with a free win attached — `wasip1` runs on one thread, so the work groups can
  only interleave — and it measures the wrong way round. Declaring it cost ~15% on first
  diagnostics over 300 files: 538/560 ms best-of-eight and ~710 ms median parallel,
  against 642/645 ms best and ~800 ms median single-threaded, on the same build otherwise.
  Reverted. `singleThreadedWorkGroup` collects every task and runs them at `RunAndWait`
  in **reverse** order, where `parallelWorkGroup` starts each one as it is queued; for
  `processAllProgramFiles`, where a task queues more tasks, that is a different traversal
  and not just a different schedule. Anyone retrying this should fix the ordering first.
  See MIGRATION-REPORT.md §8.7.
- **Nothing about lib count.** Chasing it looked promising and is a dead end: default
  libs cost ~10× the explicit `lib: ["lib.es2022.d.ts"]` case, but 28.0.0 pays the same
  penalty (326 ms against 35 ms), because pulling in DOM is what TypeScript does when
  `lib` is unset. It is a real lever _for users_ — worth documenting as advice — but
  there is nothing here to fix.

### 2.2a A chatty operation costs a multiple of the floor — but not for the reason recorded here

**compiler and ts-morph.** §2.2 says the gap is a flat ~2× floor. That holds for
_checking_, and it is not the whole story: an operation that asks the compiler many
small questions pays a multiple of it. Measured on the commonest codemod shape there is
— 200 files, 40 exports each, ask each file what it exports, warm, median of eight in
one process:

|                                   | total  | program setup | the other 199 files |
| --------------------------------- | ------ | ------------- | ------------------- |
| 28.0.0                            | 140 ms | ~123 ms       | 17 ms (0.09 /file)  |
| before                            | 827 ms | ~360 ms       | 480 ms (2.4 /file)  |
| after `getExportedSymbolsOfFiles` | 725 ms | ~360 ms       | 390 ms (1.95 /file) |

Setup lands where §2.2 says it should — ~2.5×, and 28.0.0 parses the same files. The
whole excess is in the second column: **28.0.0 answers 199 files in 17 ms and this
answers them in 390**.

**The attribution that used to be here was wrong, and it is the third wrong attribution
on this codebase, so it is written out.** It said 8000 exported names cost ~159 µs each
against a ~7 µs round trip, so "tens of crossings per name". Counted rather than
reasoned — by tallying every call into `WasmChannel#request` — the old code made **four
crossings per file and none per name**: `parseSourceFile`, `getSourceFile`,
`getSymbolAtLocation`, `getExportsOfModule`. 796 crossings for 8000 names. Round trips
were never the cost. **80% of the time is spent _inside_ those four calls**, each of
which costs 300–850 µs of Go-side work — so what a request costs is what it does, not
that it happened.

**What was built.** `MethodGetExportedSymbolsOfFiles` /
`Checker#getExportedSymbolsOfFiles`: one request naming any number of files, answering
with each file's exported names and the node handles of the symbol each is declared on.
`getExportedDeclarations` uses it for a source file; a namespace or ambient module still
goes the symbol route, having no file to name. The resolution of re-export chains stays
on the client untouched — Go reports each exported symbol's _own_ declarations, so an
export specifier comes back as itself and the existing walk follows it exactly as
before. That split is decided by the declaration's node kind, which is total and
syntactic, not by hoping the awkward cases are rare.

It removes two of the four crossings and every `Symbol` object that used to be built to
carry them. **It is worth ~12% of the workload** — 827 ms to 725 ms — against 28.0.0's
140. The round trips did not collapse, because they were not what the time was.

**Batching across files buys nothing, and this is the cleanest evidence that per-request
overhead is not the problem.** The same 199 files asked one at a time cost 84 ms of
request time; asked in a single request, 72 ms. End to end the two are within noise
(398 ms batched against 422 ms per-file). Do not spend more on coalescing requests.

**Where the remaining 390 ms is: the same tree, fetched twice per file.** 260 ms of it,
two thirds:

| per-file crossings, after   | n   | ms  | each   | bytes over the wire |
| --------------------------- | --- | --- | ------ | ------------------- |
| `parseSourceFile`           | 199 | 130 | 655 µs | 7.6 MiB             |
| `getSourceFile`             | 199 | 108 | 544 µs | 7.6 MiB             |
| `getExportedSymbolsOfFiles` | 199 | 84  | 422 µs | 0.4 MiB             |

The two tree fetches are the _same tree_: `documentRegistry#parseSourceFileAt` fetches
it for the ts-morph `SourceFile`, and then resolving a declaration handle asks
`program.getSourceFile` for it again. The client already knows they are the same — the
`offer` in `SourceFileCache` makes the second call return the first call's object, and
node identity holds (`getExportedDeclarations()` and `getClasses()` hand back the same
object). So the second fetch's payload is encoded in Go, copied out, and discarded.

So the tree materialisation of §2.2c is not only still paid, it is paid twice, and it is
now the majority of what is left. Two things follow, in this order:

1. **Stop fetching the tree twice.** `Project#getSourceFile` cannot use an offered entry
   because it does not know the program took the file at that text — only the server's
   own content hash and parse options key settle it, and today the only way to get them
   is to fetch the whole tree. A request answering _just those two_ would let the offer
   be used: ~110 ms of the 390 here, and it applies to every semantic question asked of
   a file the client has already parsed, not only this one. Read the doc comment on
   `SourceFileCache#offer` before touching it — retaining the offer outright is unsafe
   and it says why.
2. **Then encode lazily** (§2.2c). Once the tree is fetched once, the remaining 130 ms
   is the encode itself, and ~92% of these nodes are inside class bodies nobody reads.

Measure against this workload rather than a single-file microbenchmark, and **count the
crossings before attributing anything to them** — patching `WasmChannel#request` to tally
method names and round-trip times takes ten minutes and would have prevented the
paragraph above.

### 2.2c Bringing a file over from Go is all-or-nothing

**compiler and ts-morph.** A file's whole tree is encoded, sent and decoded the first
time anything touches it, however little of it the caller wants. On a 367 KB file of
5000 classes (65 002 nodes):

|                                                | ms     |
| ---------------------------------------------- | ------ |
| first touch of the file                        | 83     |
| — of which the Go-side parse                   | ~59    |
| — of which encode + transfer + decode          | ~24    |
| `getClassOrThrow("C0")`, which needs one class | **69** |
| walking all 65 002 nodes afterwards            | 11     |

Asking for one class costs what materialising the file costs. The nodes themselves are
cheap once over — walking every one of them is 11 ms against 24 ms to bring them across
— so the cost is in the crossing, not in the representation.

**Two things it is not.** It is not the wire format: base64 plus JSON for an AST that
size measures ~2 ms of the 24. And it is not extra work relative to 28.0.0 in the parse
half — 28.0.0 parsed the file too, in JavaScript. The genuinely additional cost is the
~24 ms of crossing, plus the Wasm tax on the parse (§2.2).

**What would help:** encode lazily — the top level eagerly, bodies on demand. In this
shape ~92% of the nodes are inside class bodies (65 002 for 5001 top-level nodes), so a
caller that only reads exported declarations, which is a very common shape, would skip
most of the crossing.

**What to weigh before doing it:** it is a protocol change, and it is a _loss_ for a
caller that walks everything, which is the other very common shape — subtree requests
would be round trips where today there is one. Worth prototyping against both shapes
before committing, and worth knowing that it caps out at 29% of a large file's first
touch.

### 2.3 Deferred: layered `processedFiles` maps

**compiler.** Cloning those ten maps is ~20% of an edit, and making them layered
rather than copied touches every reader in the compiler. Deliberately deferred, and
the case for it got weaker rather than stronger: a snapshot is now opened once per run
of edits rather than once per edit, so a share of one is a share of something rare.
Worth doing when something makes snapshots frequent again, or for §2.1 — not before.

---

## 3. Packaging and publishing

- **JSR — one half is not ours to solve.** _Size_: `deno/common` is 47.34 MiB against
  JSR's default 20 MiB limit. **This is settled: the scope owner is requesting an
  increased quota, so size is not a constraint to engineer around.** Do not propose
  compressing, splitting or trimming the reactor to fit it — that was tried, and
  shipping it gzipped was deliberately reverted because npm and any HTTP server
  already compress in transit. (For the record, `deno publish --dry-run` exits 0 at
  either size: it does not check the limit, so it is not evidence about size either
  way.) _Loading_: the real remaining work is that the Wasm cannot be loaded over
  `https:` — a JSR consumer has no file to read beside the module. The likely answer
  is `initializeWasm` with a fetched `Response`, which already works, made to serve
  an `https:` default rather than only a `file:` one.
- **Fork maintenance.** The fork is well ahead of upstream. Split the mislabelled
  commit (`15ff4accb` says "expose getAmbientModules" and carries six unrelated
  changes) before proposing anything upstream, and decide which changes to send there
  rather than carry. MIGRATION-REPORT §5.1 lists the candidates.
- **Restatements to retire.** `TupleTypeNode.elements`,
  `JSDocTemplateTag.constraint` and `NoSubstitutionTemplateLiteral` are restated in
  `packages/common/src/tsgo/ts.ts` only because the fork's generated AST is wrong.
  Fixing them there deletes the restatements. **compiler**

---

## 4. A standing caution

BREAKING-CHANGES.md has been found stale or inverted repeatedly, and twice more while
being rebuilt: a claim that browsers were unsupported, and a `getConstraint` entry
whose fixture used a resolved instantiation and so reported "unchanged" for
differences that were real. Three of its claims are still stated from source rather
than measured and are marked as such in its Appendix B.

Treat any claim in it that nobody has re-run as a hypothesis, and measure against a
genuinely deferred type — or a genuinely merged declaration, or whatever the case
needs — rather than against a fixture that has already collapsed.
