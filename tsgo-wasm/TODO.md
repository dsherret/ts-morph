# Remaining work

What is still open on the tsgo migration, in the order I would do it. Items are
marked **compiler** when the fix belongs in `submodules/typescript-go` (and so needs a
Wasm rebuild), **upstream** when it belongs in microsoft/typescript-go rather than our
fork, and **ts-morph** when it does not.

Finished work is not kept here. What a user needs to know from it is in
[BREAKING-CHANGES.md](./BREAKING-CHANGES.md); what it measured and how it was done is
in [MIGRATION-REPORT.md](./MIGRATION-REPORT.md) §8.

Measured state: `ts-morph` 4516 passing / 2 pending, `common` 461 / 0, `bootstrap`
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
loop is quadratic. What is left is constant factors, and one of them is a regression.

### 2.1 An edit followed by a semantic question is parsed twice

**ts-morph and compiler.** Holding the write back until something needs a program
made an edit on its own several times cheaper, but made the edit-then-ask shape
**dearer than it was before that change**: the file is parsed once on the client for
the tree the manipulation returns, and again when the flush opens a snapshot.

Measured at 400 files: an edit alone 0.53 ms (28.0.0: 0.20), an edit followed by a
`getType()` **5.13 ms** (28.0.0: 3.02) against ~4.4 ms before the write was held
back. So an editing loop that asks the compiler something every time round is the one
shape the change made worse. The `offer` path already hands the compiler the object
identity at no protocol cost; what it does not do is stop the compiler re-parsing.
Removing that second parse is the fix, and it closes the only perf regression in the
migration.

### 2.2 Delete-heavy loops still grow with the project

**compiler.** A create-and-delete step now costs about what a create and a delete cost
separately — 5.6 / 9.0 / 18.6 ms per step at 200 / 400 / 800 files before, 0.36 / 0.34 /
0.36 after. But it has not stopped growing, only stopped growing early. Measured on the
current build:

| project | ms per create-and-delete step |
| ------- | ----------------------------- |
| 800     | 0.362                         |
| 1600    | 0.678                         |
| 3200    | 1.391                         |

Flat to ~800 files and then doubling with each doubling of the project, which is still
quadratic over the run — it is just no longer visible at the sizes the earlier
measurements used. The cause is `Snapshot.Clone` copying ten `map[tspath.Path]…` fields,
which a step of this shape does twice. Delete-only and create-only loops stay within a
constant factor of themselves. Same ceiling as §2.3, and delete-heavy work is the only
workload that still binds on it.

### 2.3 Deferred: layered `processedFiles` maps

**compiler.** Cloning those ten maps is ~20% of an edit, and making them layered
rather than copied touches every reader in the compiler. Deliberately deferred, and
the case for it got weaker rather than stronger: a snapshot is now opened once per run
of edits rather than once per edit, so a share of one is a share of something rare.
Worth doing when something makes snapshots frequent again, or for §2.2 — not before.

---

## 3. Packaging and publishing

- **JSR — unsolved, on both halves.** _Size_: `deno/common` is 47.34 MiB against
  JSR's 20 MiB limit. Shipping the reactor gzipped did fit it — 13.7 MiB — and was
  taken back out, so this is open again and no longer has a known answer that the
  package is willing to pay for. Note that `deno publish --dry-run` exits 0 either
  way: it does not check the limit, so it never was evidence about size. _Loading_:
  the Wasm cannot be loaded over `https:` — a JSR consumer has no file to read
  beside the module. The likely answer is `initializeWasm` with a fetched
  `Response`, which already works, made to serve an `https:` default rather than
  only a `file:` one.
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
