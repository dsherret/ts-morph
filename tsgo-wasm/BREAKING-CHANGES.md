# Breaking changes: moving to tsgo

Everything below is a consequence of replacing the `typescript` package with
tsgo (TypeScript 7+, the Go compiler) running in-process via WebAssembly. This
is a running list for the migration on the `tsgo-wasm` branch; it is not
complete until the migration is.

The single cause behind most of it: **tsgo owns parsing, module resolution, and
the file system.** The `typescript` package let you hand the compiler text and
host callbacks and get a parsed tree back. tsgo inverts that — you tell a session
what changed and read results back — so the entire host layer has nothing to
plug into.

## How to read this document

An earlier version of this list was built from what the tsgo **API** exposes, and
that made it far too pessimistic: it recorded as "removed, no counterpart" a long
run of things the Go compiler does implement and simply does not route through
`internal/api`. Every entry below is now in one of two categories, and the
distinction is the point:

- **Absent** — the Go compiler does not do this. A breaking change. It stays
  broken until tsgo itself changes.
- **Not exposed** — the Go compiler does it, but no API method carries it. Not a
  breaking change; a **TODO**, with the `file:line` of the Go code that already
  works. Restoring one is the three-layer exposure pattern (Go handler → protocol
  method → JS client → ts-morph wrapper), which has now been done a few dozen
  times.

Anything marked "not exposed" must not be quoted as evidence that tsgo cannot do
something.

---

## Removed

Each heading below says whether the capability is **absent** from the Go compiler
or merely **not exposed**. Several of these sections describe capabilities that
were restored after this list was first written; they are kept, rather than
deleted, to record what changed about them along the way.

### Custom module resolution — back, in a different shape

`ResolutionHost`, `ResolutionHostFactory`, `ResolutionHosts` (including
`ResolutionHosts.deno`) and `ProjectOptions#resolutionHost` are all back. The
fork grew the hook the first draft of this document said it would need: the
compiler asks the host where a specifier points before resolving it itself
(`internal/module/resolver.go`), over the same connection `callbackFS` uses.

What a host looks like now — the full list is under "The inventory, in full":

- It answers one specifier at a time, because that is how the compiler asks.
  `resolveModuleNames`, which took an array, is gone.
- It may hand back a _different specifier_ and let the compiler resolve that,
  which is what `ResolutionHosts.deno` now does — dropping the `.ts` says where
  to look, and the compiler still decides how.
- Its factory takes only `getCompilerOptions`; there is no module resolution
  host to hand it, because a host no longer resolves for itself.
- `getResolvedModuleWithFailedLookupLocationsFromCache` is gone — the compiler
  owns the cache.

Still absent: `resolveTypeReferenceDirectives`. Type reference directives
resolve down a separate path in the compiler that has no hook, so the
`custom type reference directive resolution` tests stay skipped.

### `Node#transform`

`Node#transform`, `TransformTraversalControl`, `ts.factory`, `ts.visitEachChild`
and the free `printNode` are all back. The transformation pipeline they were
thought to need was `ts.transform`, but that only drove the visitor — tsgo ships
the node factory and the visitor in JavaScript, and prints on the server, which
covers everything the API did.

Two differences remain, both from the factory:

- A `updateX` builds a fresh node rather than re-ranging the one it updates, so
  ts-morph's factory copies the original's range and parent onto the result. That
  is what makes leading comments and doc comments survive an update, exactly as
  `factory.update()` did.
- `ts.transform` itself is not exposed: emit transformers are built in Go from
  the compiler options and have no injection point (see `customTransformers`).

### Wrappers for node kinds tsgo does not produce — **absent**

`CommaListExpression`, `JSDocFunctionType`, `JSDocAuthorTag`, `JSDocClassTag`,
`JSDocEnumTag`, `JSDocMemberName`, `JSDocNamepathType`, and `JSDocUnknownType`
are removed. tsgo's parser emits no such kinds, so the wrappers could never be
instantiated.

### Compiler hosts

`createHosts` and `TsSourceFileContainer` are removed, as are the
`ts.LanguageServiceHost` and `ts.CompilerHost` types they implemented.

`createModuleResolutionHost`, `ts.ModuleResolutionHost` and
`Project#getModuleResolutionHost()` are back. Nothing in them ever touched the
compiler — they are file-system questions asked of the project's own caches and
`TransactionalFileSystem` — so the host is rebuilt on those, with its source
file container typed structurally rather than as `TsSourceFileContainer`. tsgo
resolves modules itself and does not consult this host; it exists for callers
that ask ts-morph the same questions.

### Symbol tables and node internals

`Symbol#getGlobalExport`, `Symbol#getGlobalExportOrThrow` and
`Symbol#getGlobalExports` work again. tsgo does have the table, it just hangs
off `ast.SourceFile.GlobalExports` rather than off the symbol, so the API
reaches it through the module symbol's value declaration.

`Node#getLocal`, `Node#getLocalOrThrow` and `Node#getLocals` work again. The
binder's `locals` table is on the Go node (`ast.Node.Locals()`) and is now
routed through the API; it is returned as an ordered array of symbols rather
than a map, so the `ts.SymbolTable` type stays removed. Because a Go map has no
order, the symbols are sorted by first-declaration position, which reproduces
declaration order.

### Signature documentation

`Signature#getDocumentationComments` and `Signature#getJsDocTags` work again.
tsgo renders documentation from a declaration rather than from a symbol, and a
signature has one, so both are routed on the signature's declaration.

The one change is the shape: tsgo renders a documentation comment or a JSDoc tag
as one plain string rather than a classified `SymbolDisplayPart[]`, so the whole
string comes back as a single part of kind `"text"` and empty text comes back as
no parts. `JSDocTagInfo#getText()` returns display parts again for the same
reason, which also affects `Symbol#getJsDocTags`.

### Node details tsgo does not record — **absent**

- `SourceFile#getLanguageVersion` — a parsed file carries its script kind and
  language variant, but not the script target it was parsed with, so this reports
  the project's configured `target` (defaulting to `ScriptTarget.Latest`) and
  follows later changes to the compiler options.
- `JSDocNullableType#isPostfix` and `JSDocNonNullableType#isPostfix` — tsgo does
  not record whether `?`/`!` was written before or after the type.

### `Type#getTargetType` returns a plain `Type`

`Type#getTargetType()` and `Type#getTargetTypeOrThrow()` returned
`Type<ts.GenericType>`. tsgo's `TypeReference.getTarget()` is typed as `Type`, so
the wrapper no longer narrows its compiler type. The runtime value is unchanged.
`Type#getBaseTypes()` lost the same narrowing: `Type<ts.BaseType>[]` is now
`Type<ts.Type>[]`.

### A variable initialized with a function prints as `typeof` in nested positions

tsgo widened when the checker writes `typeof x` instead of a signature: upstream
PR #4507 lets a variable assigned a function expression or arrow take the
`typeof` form, where the `typescript` package restricted it to static methods
and module-level function _declarations_
(`shouldWriteTypeOfFunctionSymbol`). ts-morph clears `UseTypeOfFunction` for
exactly that widened case, so `const f = (a: number) => a` reports
`(a: number) => number` as before.

The flag is all-or-nothing for a print, so an occurrence nested inside a larger
type still differs and cannot be corrected from this side:

|                      | `typescript` package            | tsgo               |
| -------------------- | ------------------------------- | ------------------ |
| `const t = [f]`      | `((a: number) => number)[]`     | `(typeof f)[]`     |
| `const w = { m: f }` | `{ m: (a: number) => number; }` | `{ m: typeof f; }` |

Reverting the widening belongs upstream; it was added deliberately for
declaration emit, and ts-morph's narrowing becomes a no-op if it ever is.

### `Node#getSymbol()` finds no symbol for an anonymous declaration

An arrow function, object literal, type literal, mapped type, function or
constructor type, call/construct/index signature, constructor, or export
assignment reported the binder's internal symbol — `__function`, `__type`,
`__object`, `__call`, `__new`, `__index`, `__constructor`, `default`. It now
reports `undefined`, and `getSymbolOrThrow()` throws.

`Node#getSymbol()` reads the binder symbol off the node first, and tsgo's nodes
carry no such field — see "Binder internals are not on nodes". Its checker
exposes no node-symbol accessor to ask instead, and `getSymbolAtLocation` is a
faithful port that answers nothing for these nodes in either compiler. The
symbol itself still exists: `node.getType().getSymbol()` returns it. Closing
this needs a `getSymbolOfDeclaration` on the API's checker.

### `Type#getLiteralValue` returns a `bigint`, and a `boolean`

It returned `string | number | ts.PseudoBigInt | undefined`. tsgo gives the
JavaScript values instead: a bigint literal type yields a `bigint` rather than a
`{negative, base10Value}` object, and a boolean literal type yields `true`/`false`
where the `typescript` package returned `undefined`. So
`getLiteralValueOrThrow()` no longer throws on a boolean literal type, and
`getLiteralValue() === undefined` is no longer a reliable "not a literal type"
test. `ts.PseudoBigInt` is gone.

### `readDirectory` and the TypeScript file-matching internals — **mostly not exposed**

`readDirectory`, `matchFiles`, `getFileMatcherPatterns`, `FileMatcherPatterns`
and `FileSystemEntries` are removed from `@ts-morph/common`.

They were thin wrappers over `ts.matchFiles` / `ts.getFileMatcherPatterns` —
unexported TypeScript internals reached through `(ts as any)`. The tsgo _client_
exposes neither, so all three evaluated to `undefined` and every call threw a
`TypeError`. Nothing in the repo used them: `readDirectory` was never in the
`tsconfig` barrel, and tsconfig include/exclude globbing is now tsgo's job, done
inside `parseConfigFile`.

**`readDirectory` itself is not exposed rather than absent.** tsgo has it:
`vfsmatch.ReadDirectory(host, currentDir, path, extensions, excludes, includes, depth)`
at `internal/vfs/vfsmatch/vfsmatch.go:31` is the direct successor to
`ts.matchFiles`, and `NewSpecMatcher` (`:703`) is what replaced the pattern
struct. **TODO** if a caller wants it back. `getFileMatcherPatterns` /
`FileMatcherPatterns` as _shapes_ are absent — tsgo's matcher is an opaque
`*SpecMatcher`, not a bag of regexes.

`getEmitModuleResolutionKind` survives, reimplemented in
`packages/common/src/typescript/tsInternal.ts` against tsgo's rules rather than
forwarded to the compiler. **Its results differ**, because tsgo's
`CompilerOptions.GetModuleResolutionKind` differs:

- `Classic` and `Node10` are no longer returned. They are treated as _unset_ and
  resolved from the module kind, so an explicit `moduleResolution: "classic"`
  now answers `Bundler`.
- With no module kind and no target, the answer is `Bundler` rather than
  `Classic`.
- `Node16`, `Node18` and `Node20` module kinds answer `Node16`; `NodeNext`
  answers `NodeNext`.

### Compiler options a `tsconfig.json` cannot express are dropped, not blanked

`TsConfigResolver#getErrors` reports the real parse diagnostics again — the
protocol's `parseConfigFile` response carries them — and a `tsconfig.json` whose
syntax does not parse throws, as it always did. What changed is the options
object: where TypeScript kept the key with an `undefined` value for an option it
could not use (`{ "target": "FUN" }` gave `{ target: undefined }`), tsgo leaves
the key out entirely. The accompanying diagnostic is unchanged.

### Cross-project document caching — **absent**

`createDocumentCache` is removed. It worked by deep-cloning a parsed
`ts.SourceFile` and re-stamping its `fileName`; tsgo's nodes are lazy views over
a binary buffer with a circular back-reference to their source file, so they
cannot be cloned that way. The session's own snapshot cache serves this purpose.

---

## Changed shape

### The `ts` namespace is tsgo's, and its enum values differ

`SyntaxKind.ClassDeclaration` is a _different number_ than in the `typescript`
package. The same is true of every other enum.

Nodes and kinds must therefore come from the same backend. Mixing tsgo nodes
with `typescript`'s enums (or the reverse) does not fail loudly — it silently
misidentifies every node. Code comparing kinds against hard-coded numbers, or
persisting kind values across versions, will break.

### `DocumentRegistry`

| Before                                                                                | Now                                           |
| ------------------------------------------------------------------------------------- | --------------------------------------------- |
| `createOrUpdateSourceFile(fileName, compilationSettings, scriptSnapshot, scriptKind)` | `createOrUpdateSourceFile(fileName, text)`    |
| text supplied as `ts.IScriptSnapshot`                                                 | text supplied as a `string`                   |
| compiler options passed per call                                                      | set once via the constructor                  |
| constructed from a `TransactionalFileSystem`                                          | constructed with `{ compilerOptions, files }` |

`ts.IScriptSnapshot`, `ts.ScriptSnapshot`, and `ts.DocumentRegistryBucketKey`
no longer exist. Compiler options move to the registry because tsgo resolves
them per project.

A returned tree for an _edited_ file is only valid until the next change to that
file. Files the edit did not touch keep their nodes: the source file cache
carries their entries across snapshots, which is what preserves wrapper identity
for the rest of the project.

`getSourceFileVersion` returns `undefined` for a file the registry does not know
(a never-edited file is version `"0"`, so an unknown one must not report one),
and every method throws after `dispose()`.

A `Type`, `Symbol` or `Signature` is a handle into the snapshot whose checker
produced it, where classic TypeScript's were plain objects that stayed readable
forever. The registry keeps a superseded snapshot alive when the checker answered
from it, so a type obtained before a manipulation still answers questions after
it, but only the two most recent such snapshots are kept — every one pins a
program and a checker inside the wasm module. A type held across more than that
many checker generations throws `snapshot N not found`; re-read it from the node
instead.

### `ts.createSourceFile` parses in a scratch project

Standalone parsing works again, but not standalone: tsgo parses on the server and
every server-side parse belongs to a project, so `ts.createSourceFile` runs
against a scratch project that holds only the files handed to it. It opens no
checker, resolves no modules and loads no lib files.

Three differences follow from that:

- `languageVersion` is ignored. tsgo records no per-file script target —
  `ast.SourceFileParseOptions` carries only the file name, its path and the
  module-detection options — and its scanner always scans at the latest target.
- `setParentNodes` is ignored. tsgo's parser always links parents, so a node from
  here always has one, and asking for a parentless tree does not get you one.
- The returned tree is valid for the next 32 calls. After that its scratch path
  is reused and reparsed, and its nodes go stale — the same rule the document
  registry has for an edited file.

`scriptKind` is honoured, by choosing the file extension that implies it, since
tsgo derives the script kind from the file name.

### `getChildren` is reconstructed

tsgo's AST stores only real nodes — punctuation and keyword tokens, and the
`SyntaxList` nodes ts-morph exposes, are not in the tree. They are rebuilt by
scanning the gaps between the stored children.

`getChildren`, `getChildCount`, `getChildAt`, `getFirstToken` and `getLastToken`
are all methods on a compiler node, declared on the compiler `Node` interface
(`_packages/native-preview/src/ast/ast.ts`) and implemented twice — on
`RemoteNodeBase` in `src/api/node/node.infrastructure.ts` and on `NodeObject` in
`src/ast/factory.generated.ts`. `issues/1273tests.ts` exercises `getChildCount()`
and passes.

`getChildren(node, sourceFile)` and `getLastToken(node, sourceFile)` are also
exported as free functions from `@ts-morph/common`, and that is the form
ts-morph's own `Node#getLastToken` calls. Results are cached per node, since
ts-morph keys its wrapper cache on node identity, and share the source file's own
token cache so a token reached through `getTokenAtPosition` is the same object.

Output matches classic TypeScript's spans, order and token parents, with one
exception that comes from tsgo's AST rather than from the reconstruction: a doc
comment's prose is a `JSDocText` child node, where classic keeps plain prose as a
string on `JSDoc.comment` and so has no child at all.

A `JSDoc` node's span used to be a second exception. The compiler gives such a
node its **full start** — back to the previous node's end, comments included —
where classic starts it at the `/**`. That is invisible while the doc comment is
the only thing in that trivia, and wrong as soon as it is not: a `// …` line
closing the previous line, or a plain `/* … */` block, fell inside the doc
comment's span and so inside its text, its `getStart()`, and the
`includeJsDocComments` start of the node it documents; a position inside that
comment resolved to the `JSDoc` rather than to the documented node's first token.
`RemoteNodeBase`'s `pos` therefore walks a `JSDoc` node's leading trivia for the
comment that ends where the node does, and reports that comment's start instead
(`_packages/native-preview/src/api/node/node.infrastructure.ts`). The walk is the
scanner's own comment iteration, trailing ranges before leading ones, which is
how `parser.GetJSDocCommentRanges` found those comments to begin with — so a
shebang, a parameter's doc comment (a trailing range, not a leading one) and the
line separators only the scanner counts as line breaks are all handled the way
the parser handles them. Spans now agree with classic.

The Go `scanner.GetTokenPosOfNode` still carries the original assumption, and
`astnav.GetTokenAtPosition` goes through it, so a language service request whose
position falls inside a comment that precedes a doc comment resolves to the
`JSDoc` on the Go side. Nothing ts-morph exposes reads a position from that
range, and the fix belongs upstream in the Go scanner.

### `TypeFormatFlags` is aliased to `NodeBuilderFlags` — **not exposed, and the alias is wrong**

**tsgo has `TypeFormatFlags`.** `internal/checker/types.go,`TypeFormatFlags``declares the
whole enum, including all six members previously recorded as gone —
`AddUndefined` (1&nbsp;<<&nbsp;17), `WriteArrowStyleSignature` (1&nbsp;<<&nbsp;18),
`InArrayType` (1&nbsp;<<&nbsp;19), `InElementType` (1&nbsp;<<&nbsp;21),
`InFirstTypeArgument` (1&nbsp;<<&nbsp;22) — and `NodeBuilderFlagsMask`
(`types.go:79`). Every value matches the `typescript` package's. The checker reads
them (`internal/checker/printer.go:182,197,201,320`), and **the API already sends
the client's number through as one**: `internal/api/session.go, `TypeToStringEx`` calls
`setup.checker.TypeToStringEx(t, enclosingDeclaration, checker.TypeFormatFlags(params.Flags), nil)`.

So the server interprets the flags as `TypeFormatFlags` while ts-morph currently
hands callers a `NodeBuilderFlags` enum under that name
(`packages/common/src/tsgo/ts.ts, the`TypeFormatFlags`alias`). That alias is not merely imprecise, it is
backwards: classic `TypeFormatFlags` values are the correct thing to put on the
wire, and a `NodeBuilderFlags` member is what gets silently misread.

**TODO, not a breaking change.** `TypeFormatFlags` is missing only from the enum
generator's list in `submodules/typescript-go/Herebyfile.mjs, the`enumDefs`list` — a one-line
entry (`goPrefix: "TypeFormatFlags", goFile: "internal/checker/types.go"`)
generates it, after which the alias can be replaced with the real enum.

### `EditorSettings` and `FormatCodeSettings` are reduced — **mostly not exposed**

`EditorSettings` is
`{ tabSize?, indentSize?, convertTabsToSpaces?, indentStyle?, newLineCharacter?,
trimTrailingWhitespace? }`. Every one of those is read by tsgo's formatter — its
`lsutil.EditorSettings` declares them all — and the API now carries them, so
`ts.IndentStyle` exists again with its classic `None`/`Block`/`Smart` values.
`FormatCodeSettings` adds nothing to it.

**The rest are not exposed rather than gone.** `baseIndentSize`, `semicolons`,
`indentSwitchCase`, `indentMultiLineObjectLiteralBeginningOnBlankLine` and the
entire `insertSpaceAfter...` / `insertSpaceBefore...` /
`placeOpenBraceOnNewLineFor...` family are all declared on tsgo's
`lsutil.FormatCodeSettings` (`internal/ls/lsutil/formatcodeoptions.go:70-92`) and
are all really read by the formatter — see `internal/format/rulecontext.go:23`
(`Semicolons`), `:27` (`InsertSpaceAfterCommaDelimiter`), `:79`
(`InsertSpaceBeforeFunctionParenthesis`), `:83`
(`PlaceOpenBraceOnNewLineForFunctions`), and `internal/format/indent.go:26,43`
(`BaseIndentSize`).

What is missing is the wire: the API's `FormattingOptions`
(`internal/api/proto.go,`api.FormattingOptions``) carries only the six that ts-morph now
declares. **TODO:** widen that struct and `toFormatCodeSettings`
(`internal/api/session_ls.go`) and the whole family comes back. Until then,
neither interface has an index signature, so passing one is a compile error
rather than a silent no-op.

Two options survive as ts-morph's own, applied by ts-morph rather than by the
formatter: `ensureNewLineAtEndOfFile` and
`insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces` (which drives ts-morph's
structure printers). Line endings are normalized by ts-morph after formatting,
from its manipulation settings.

### `EmitHint` — **absent**

`ts.EmitHint` is retained for shape only (`packages/common/src/tsgo/ts.ts,`EmitHint``),
and nothing consumes it: `PrintNodeOptions#emitHint` is gone, because tsgo's
printer dispatches on `node.Kind` and its entry point
`Emit(node *ast.Node, sourceFile *ast.SourceFile)`
(`internal/printer/printer.go, `Printer.Emit``) takes no hint. There is no `EmitHint` type in
tsgo at all — the five occurrences of the name in `internal/` are commented-out
`PrintHandlers` fields (`printer.go:77,99,102`) and prose about Strada's behaviour
(`internal/transformers/estransforms/classfields.go:264,1096`,
`internal/transformers/tstransforms/legacydecorators.go:85`). The hint-specific
entry points TypeScript exposes are unexported kind-driven methods here
(`emitIdentifierName` `printer.go:1117`, `emitExpression` `:3213`,
`emitEmbeddedStatement` `:4122`).

Because the retained `EmitHint` is a `const` object rather than an enum, it is not
a nominal type: any numeric literal in range is assignable where a member
reference used to be required.

### Removed compiler options

`charset` no longer exists. `CompilerOptionsContainer#getEncoding()` therefore
always returns `"utf-8"`.

`ts.CompilerOptions` is TypeScript 7's option set, so `baseUrl`, `outFile` and
`downlevelIteration` are gone from the type as well as from the compiler.

`alwaysStrict`, `esModuleInterop` and `allowSyntheticDefaultImports` are **not**
gone, though an earlier draft of this migration dropped them. TypeScript 7
removed only their `false` value: the option is still read, `true` is
`esModuleInterop`'s own default, and setting one to `false` produces a
removed-option diagnostic (5108) rather than being unrepresentable. Reporting
that at compile time would have been ts-morph inventing a stricter rule than the
compiler's, so the three are typed `boolean` and the compiler is left to object.

### The default library files come from tsgo

They are the compiler's own copies, taken from
`submodules/typescript-go/internal/bundled/libs`, so the checker resolves globals
against the library it was built against. Until this change they were embedded
from `node_modules/typescript/lib` — a TypeScript 7 checker type-checking against
TypeScript 6's declarations. Expect small differences in global types and in the
diagnostics that mention them.

### Diagnostics

`Diagnostic#getMessageText()` now always returns a `string`. tsgo puts the
message on `text` and nests any elaborating messages under `messageChain`, so a
chain no longer arrives in place of the text — use the new
`Diagnostic#getMessageChain()`. `Diagnostic#getSource()` is gone — **absent**:
`ast.Diagnostic` (`internal/ast/diagnostic.go:33-48`) has no source field and no
`Source()` accessor among its methods (`:50-63`), and neither
`api.DiagnosticResponse` (`internal/api/proto.go,`DiagnosticResponse``) nor the client's
`Diagnostic` carries one. The only source string tsgo produces anywhere is a
constant synthesized on the way into LSP —
`internal/ls/lsconv/converters.go:319-328` sets `source = new("ts")` for
non-Visual-Studio clients — which is not per-diagnostic data.

Note that the one test of this (`diagnosticTests.ts:59-63`) asserts `getSource()`
is `undefined`, which is also what the `typescript` package returns for program
diagnostics; `source` is a tsserver/editor field there too. Plumbing the `"ts"`
constant through would break the test, and the only test-satisfying accessor is
one that always returns `undefined` — a stubbed empty return, which this project's
rules forbid. So the method stays off the surface.

`DiagnosticMessageChain` now wraps a `Diagnostic` (tsgo has no distinct chain
type) and `getNext()` reads `messageChain` rather than `next`.

`ts.getPreEmitDiagnostics(program, sourceFile?)` is kept, but the adapter
assembles it: tsgo reports config-file, program, syntactic, global and semantic
diagnostics separately, and this concatenates them in that order. It takes no
cancellation token.

### Emit output

`EmitOutput#getOutputFiles()` still returns wrappers, but the underlying
`emitOutput.outputFiles` is a `ReadonlyMap` keyed by output path, not an array,
and the path is the key rather than a field on the file.
`OutputFile#getWriteByteOrderMark()` reports `emitBOM` again: the Go emitter now
carries the flag out with the file, and the API reports the text without the
mark so the two are separate the way `ts.OutputFile` had them.

### Removed node wrappers — **absent**

`SyntaxKind.JSDocTag` (classic's catch-all) is now `SyntaxKind.JSDocUnknownTag`;
the `JSDocUnknownTag` wrapper is still reachable under the new kind. The kinds
`CommaListExpression`, `JSDocAuthorTag`, `JSDocClassTag`, `JSDocEnumTag`,
`JSDocFunctionType`, `JSDocMemberName`, `JSDocNamepathType` and
`JSDocUnknownType` do not exist in tsgo, so their wrappers are unreachable.

---

## Nodes behave differently

### Array binding pattern elisions are `BindingElement`s

The hole in `const [, a] = x` was an `OmittedExpression`. tsgo parses it as a
zero-width `BindingElement` with no name, so `ArrayBindingPattern#getElements()`
is declared `BindingElement[]` (was `(BindingElement | OmittedExpression)[]`) and
a `Node.isOmittedExpression` filter over a binding pattern no longer matches
anything. Array _literal_ elisions (`[1, , 3]`) are still `OmittedExpression`.

Because the compiler's `BindingElement.name` is not optional, that element's name
cannot be typed away: `BindingElement#getNameNode()` and `#getName()` throw an
`InvalidOperationError` on one. `BindingElement#isElision()` is new, and tells
them apart. Nothing in ts-morph that walks a binding pattern looking for a name —
`SourceFile#getVariableDeclaration(name)`, `Function#getParameter(name)` and the
rest — is affected; they skip elisions.

### `sourceFile.fileName` cannot be assigned

`fileName` (and most other source-file data) is a getter with no setter.
Assigning throws. `setSourceFileProperty(sourceFile, "fileName", value)` defines
an own data property on the file that shadows the getter.

It re-stamps the file itself rather than returning a view of it. A prototype view
does not work: `getSourceFile()` returns a stored field, so every node would keep
reporting the original name; `path` would disagree with `fileName` on the same
object; the file's memo fields would be duplicated onto the view; and because
`getChildren`'s caches are keyed by object identity, a view mints a second set of
synthesized tokens and `SyntaxList`s for the same file.

### Binder internals are not on nodes

`.symbol`, `.locals`, and `.emitNode` are not properties of a client-side node:
the node is a lazy view over a buffer, and the binder's tables live on the Go
side. Symbol lookups go through the checker (`getSymbolAtLocation`), and the
`locals` table is reachable as `Node#getLocals()` / `getLocal()` — routed through
the API over `ast.Node.Locals()` and returned as an ordered array rather than a
`ts.SymbolTable`.

`.emitNode` has no counterpart _as a property_, because synthesized comments and
emit flags are the printer's concern and the printer runs in Go. The capability
itself is **not exposed** rather than absent: `printer.EmitContext` keeps that
state off to the side and offers
`AddSyntheticLeadingComment(node, kind, text, hasTrailingNewLine)`
(`internal/printer/emitcontext.go:965`) and `SetSyntheticLeadingComments` (`:960`).
Exposing `ts.addSyntheticLeadingComment` means threading an `EmitContext` through
the print request, which is since done; `issues/1273tests.ts` exercises it and
passes.

### Nodes are lazy views

Nodes are materialized on demand over a binary buffer and hold a circular
reference back to their source file. They are not plain objects and do not
survive a recursive deep clone.

---

## Language service

The methods below now come from tsgo (routed out of its internal language
service in the fork), and return **character offsets**, not LSP positions:

`formatDocument` · `formatDocumentRange` · `organizeImports` · `rename` ·
`getDefinition` · `getImplementations` · `getCodeFixes`

### `LanguageService` is the tsgo project

There is no `ts.LanguageService`. Formatting, organize-imports, rename,
definitions, implementations and code fixes are methods on the session's
project, and the program and checker hang off it too, so
`LanguageService#compilerObject` returns that project.
`ProjectContext#getSourceFileContainer()` is gone with the hosts it fed;
`#getModuleResolutionHost()` and `Project#getModuleResolutionHost()` are back —
see "Compiler hosts" above.

### Language service operations that are off the surface

Split by cause. The "not exposed" ones are TODOs, not breaking changes.

**Absent from tsgo:**

- **`LanguageService#getEditsForRefactor`** and the **`RefactorEditInfo`**
  wrapper — there is no refactor surface anywhere in the fork. No `refactor*`
  directory; `GetApplicableRefactors` / `GetEditsForRefactor` have zero hits
  across `*.go`; so does every individual refactor name (`extractFunction`,
  `convertNamedImportsToNamespace`, `addOrRemoveBracesToArrowFunction`, …). The
  only mentions of "refactor" in `internal/ls/` and `internal/api/` are a porting
  comment (`internal/ls/codeactions_fixmissingtypeannotation.go:1366`) and one
  never-read user preference (`internal/ls/lsutil/userpreferences.go:27,154`,
  marked `// !!!`). The LSP server registers `textDocument/codeAction` only
  (`internal/lsp/server.go:806,813` → `:1678`), and `codeFixProviders`
  (`internal/ls/codeactions.go,`codeFixProviders``) has exactly three entries, all quickfix.
  Separately, the change infrastructure cannot express the result: `CreateNewFile`
  / `newFileChanges` / `IsNewFile` have zero hits across `internal/`, so "Move to
  a new file" has nowhere to put the new file, and `api.FileTextEdits` has no
  `isNewFile` field to say so.
- **`CodeFixAction#getFixName`** — there is no `fixName` concept in the fork;
  `FixName` has zero hits across `internal/`. TypeScript's `fixName` is a distinct
  string from `fixId` (the import fix is fixName `"import"`, fixId
  `"fixMissingImport"`), so `FixID` is not a stand-in. The specific fix its only
  test wants is absent too: `convertToEsModule` has zero hits, and error 80001
  (`File_is_a_CommonJS_module_it_may_be_converted_to_an_ES_module`) is never
  emitted — the message exists only in the table
  (`internal/diagnostics/diagnostics_generated.go:3761`).
- **The `require`-to-import suggestion (code 80005)** — `getSuggestionDiagnostics`
  _is_ routed (`internal/api/session.go,`handleGetSuggestionDiagnostics`` over
  `Program.GetSuggestionDiagnostics`, `internal/compiler/program.go:672`), but
  tsgo's checker never emits this one: `X_require_call_may_be_converted_to_an_import`
  appears only in the message table
  (`internal/diagnostics/diagnostics_generated.go:3769`). A compiler gap, not a
  routing gap.
- **`CompilerOptions.charset`** — no tsgo counterpart; files are read as utf-8.

**Not exposed (TODO):**

- **`SourceFile#fixUnusedIdentifiers`** — tsgo has the unused-identifier
  diagnostics (`internal/checker/checker.go:7123,7128,7181`) and the deletion
  machinery (`internal/ls/change/delete.go`), but no code fix provider joins them:
  `unusedIdentifier` has zero hits in `internal/ls/`, so the fix ids
  `unusedIdentifier_delete` and `unusedIdentifier_deleteImports` do not exist yet.
  This one is a real body of work in the fork — a new provider — not just a route.
- **`LanguageService#getIdentationAtPosition`** (that spelling is the name
  ts-morph shipped) — tsgo has the smart indenter:
  `format.GetIndentation(position, sourceFile, options, assumeNewLineBeforeCloseBrace)`
  at `internal/format/indent.go:24`, with `GetIndentationForNode` at `:17`. It
  needs a handler and a protocol method, nothing more. In the meantime
  `Node#getIndentationLevel()` is worked out from the text instead. A node that
  begins its own line reports the deeper of the indentation that line has and one
  level past the ancestor that opened it; a node that starts partway through a
  line reports whatever indentation that line already has; and a node starting
  with `{` or `}` reports its container's indentation rather than a level past it,
  so a brace lines up with the construct it delimits. The level is fractional when
  the file's indentation is not a whole multiple of
  `manipulationSettings.indentationText` — a two-space file read with the default
  four-space setting puts a method body at level `0.5` — and the writers reproduce
  that fraction literally. This is not only a query: the level is what
  `setBodyText`, `addStatements`, `insertStatements` and `set({ statements })`
  indent inserted code to, so a wrong level shows up in emitted text.

  What still differs from the smart indenter is list-continuation positions. Where
  the formatter reports the level a wrapped list item would be written at, the
  text-based version reports the line's own indentation, one level less: an
  `ImportSpecifier` or `Parameter` written on the same line as its braces or
  parens, the empty `SyntaxList`/`CloseParenToken` of an argument or parameter
  list, and the `;` or `}` trailing a construct whose contents were wrapped over
  several lines.
- **`CodeFixAction#getFixId` / `getFixAllDescription`** — `ls.CodeAction` carries
  both (`internal/ls/codeactions.go:55-60`: `FixID`, `FixAllDescription`), and
  `GetCombinedCodeFix` already matches on the fix id. The API's `CodeFixAction`
  (`internal/api/proto.go,`api.CodeFixAction``) simply drops them, carrying only
  `Description` and `Changes`. Two fields on that struct and its client mirror.
- **`ImplementationLocation#getKind`/`getDisplayParts`** — tsgo does build
  classified display parts: `displayPartsWriter`
  (`internal/ls/displaypartswriter.go:19`) and
  `getQuickInfoAndDeclarationAtLocation` (`internal/ls/hover.go:327`, the port of
  `getSymbolDisplayPartsDocumentationAndSymbolKind`) produce exactly the parts and
  the symbol kind this wrapper wants, and hover and signature help already use
  them. What is missing is that the implementations response carries spans alone
  (`internal/api/session_ls.go:160`). The equivalent was done for references, so
  this is the same change again. The `SymbolDisplayPart` wrapper itself is
  already back, for the documentation comments and JSDoc tag text described
  above.

**Restored:**

- **`ReferencedSymbolDefinitionInfo#getDisplayParts`/`getName`** and
  **`ReferenceEntry#isWriteAccess()`** — `api.ReferencedSymbolEntry` now carries
  the display parts and the write-access flag, so all three read as they did.
  `SymbolDisplayPart#getKind()` on one of these parts reports the LSP
  classification name (`"method name"`, `"whitespace"`) where the `typescript`
  package reported a `SymbolDisplayPartKind` name (`"functionName"`, `"space"`).
- `TypeChecker#getAmbientModules` (and `Project#getAmbientModule(s)` /
  `getAmbientModuleOrThrow`), `#getAwaitedType` (and `Type#getAwaitedType`),
  `#getFullyQualifiedName` (and `Symbol#getFullyQualifiedName`),
  `#getExportSymbolOfSymbol` (and `Symbol#getExportSymbol`) and
  `#getSymbolsInScope` (and `Node#getSymbolsInScope`) all work again. tsgo's
  checker implements every one of them; they were simply not routed through the
  API. `getExportSymbolOfSymbol` goes through the symbol rather than the checker,
  which has no such method in tsgo — it is the same call `Symbol#getExportSymbol`
  makes. One gap remains: `getAmbientModules` reports nothing for `@types`
  packages added to the file system after the project was created unless some
  file imports them.
- **`ProjectOptions.resolutionHost`** and the `ResolutionHostFactory` type —
  see "Custom module resolution" above.

### Language service operations whose signature changed

- **`LanguageService#findRenameLocations(node, newName, options)`** — `newName`
  is now required, because tsgo computes a rename as the edits that perform it.
  The `prefixText`/`suffixText` a `RenameLocation` reports are recovered from
  the edit's replacement text.
- **`LanguageService#findReferencesAtPosition`** resolves from the node at the
  position, because that is what tsgo's `getReferencedSymbolsForNode` takes; a
  position with no node under it yields no references. A reference's
  `isDefinition()` is now "this reference is the entry's definition node".
  `isWriteAccess()` works — `api.ReferencedSymbolEntry` carries the flag, from
  `ast.IsWriteAccessForReference`, the same classification TypeScript uses.
  A definition's `getKind()` is derived from the definition symbol's flags; see
  `ts.ScriptElementKind` for the members that survive.
- **`DefinitionInfo#getContainerName()`** names the declaration the definition is
  written in rather than the definition symbol's parent, because tsgo reports a
  definition as a span alone and its checker has no `symbolToString`. A class,
  interface or enum member, a namespaced or ambient-module declaration, and a
  declaration written in an object literal all read as they did. Two things do
  not. What a file itself declares — including everything a module exports —
  reads `""`, where the `typescript` package named the file's module specifier
  (`"./mod"`, `"pkg"`); naming it here would mean reimplementing module specifier
  resolution against the requesting file. And a namespace container is always
  written out in full (`Outer.Inner`), where the `typescript` package qualified it
  only as far as the position asking needed — a reference from outside the
  namespace agrees, one from inside it now reads the qualified name. Both want the
  same thing of the fork: a `symbolToString` on the API's checker.
  `getContainerKind()` is `""` rather than the `undefined` the `typescript`
  package left it as — neither ever classifies the container.
- **`LanguageService#organizeImports(filePathOrSourceFile, mode?)`** and
  **`SourceFile#organizeImports()`** — the format settings and user preferences
  parameters are gone; tsgo takes only a mode.
- **`LanguageService#getCodeFixesAtPosition(file, start, end, errorCodes)`** —
  the format settings and user preferences parameters are gone.
- **`LanguageService#getCombinedCodeFix(file, fixId, formatSettings?)`** — the
  user preferences parameter is gone, and `fixId` is typed `string` rather than
  `{}`. The only ids that exist are tsgo's three: `"fixMissingImport"`,
  `"fixMissingTypeAnnotationOnExports"` and
  `"fixClassIncorrectlyImplementsInterface"` (`internal/ls/codeactions.go,`codeFixProviders``).
- **`SourceFile#fixMissingImports(formatSettings?)`** — the user preferences
  parameter is gone, following `getCombinedCodeFix`.

Losing the user preferences parameter does **not** mean the settings stopped
working. `ManipulationSettingsContainer#getUserPreferences()` still carries the
two ts-morph ever populated, and both still reach the compiler, each on its own
request field the fork added: `quoteKind` decides the quotes an inserted import
is written with (`quotePreference` on `getCodeFixes` / `getCombinedCodeFix`), and
`usePrefixAndSuffixTextForRename` reaches rename as `useAliasesForRename`. What
is gone is passing _arbitrary_ `ts.UserPreferences` per call — the API has no
field for the rest.

- **`LanguageService#getSuggestionDiagnostics`** and
  **`Program#getSyntacticDiagnostics`/`getDeclarationDiagnostics`** return
  `Diagnostic`, not `DiagnosticWithLocation`; tsgo has no separate type.

### Emit

- **`ProgramEmitOptions.writeFile`** works as before — `emit()` throws when it is
  given and `emitSync()` calls it per output file — but its `sourceFiles`
  argument holds at most one file, because tsgo names a single originating source
  file per output rather than the whole set that fed it.
- **`EmitOptionsBase.customTransformers`** — tsgo's emitter does not run
  JavaScript transforms.
- **A single-file emit answers `noEmit`, `noEmitOnError` and
  `emitDeclarationOnly` in ts-morph, not in the compiler.**
  `Directory#emit`/`emitSync`, `SourceFile#emit`/`emitSync`/
  `getEmitOutput`, `LanguageService#getEmitOutput` and `Project#emit`/
  `emitToMemory` with `targetSourceFile` go through tsgo's `getJavaScriptEmit` /
  `getDeclarationEmit`, which the API calls with `ForceEmit`. Left alone that
  writes output where TypeScript reported `emitSkipped: true` and wrote nothing,
  so `Program#_getEmitOutputForFilePath` checks those options itself and reports
  a skipped emit, matching TypeScript's `handleNoEmitOptions`.
  `emitDeclarationOnly` is answered the same way: the targeted emit asks only for
  the declaration half, and skips entirely when neither `declaration` nor
  `composite` is on and there are no declarations to produce. Declaration-emit
  diagnostics are **not** replicated: tsgo does not report one for the case
  TypeScript did (an exported class extending a private name), on either the
  targeted or the whole-project path, so there is nothing to gate on.
- A `targetSourceFile` emit goes through tsgo's per-file `getJavaScriptEmit` /
  `getDeclarationEmit` and writes the result out itself, because a project emit
  cannot be restricted to one file.

### Printing

The free `printNode` is back. Printing runs on the server, but the request
carries no snapshot or project, so any session can print any node; the free
function uses the same scratch session `ts.createSourceFile` parses in.

`PrintNodeOptions` keeps `removeComments`, `newLineKind` and `scriptKind`, and
gains tsgo's `preserveSourceNewlines`, `neverAsciiEscape` and
`terminateUnterminatedLiterals`. Two changes:

- **`emitHint` is gone.** tsgo's printer dispatches on the node's kind and takes
  no hint.
- **`scriptKind` only names the file** the supplied source text is read back
  under, so it no longer decides whether `<T>x` prints as a type assertion or as
  JSX — that follows from the node. A node the caller names no file for is
  printed against the file it was parsed from, which is what keeps its comments,
  and that file names itself unless a `scriptKind` says otherwise.

`newLineKind` is now applied by the printer rather than by rewriting the printed
text, so a line break the program owns (inside a template literal, say) keeps
whatever the source gave it.

### `Project#formatDiagnosticsWithColorAndContext` is plain text — **not exposed**

ts-morph formats the diagnostics itself, so the source line, the caret and the
ANSI colouring are gone; what remains is
`path(line,column): category TScode: message`.

**tsgo does have the real thing.**
`diagnosticwriter.FormatDiagnosticsWithColorAndContext(output, diags, formatOpts)`
lives at `internal/diagnosticwriter/diagnosticwriter.go:122` (with
`WriteFormatDiagnostics` at `:461`), and `tsc` itself uses that package
(`internal/execute/tsc/diagnostics.go:42`). It writes to an `io.Writer`, so
exposing it means a handler that renders to a buffer and returns the string.
**TODO.**

### `TypeScriptVersionChecker` is gone — **absent**

It existed to gate behaviour on the TypeScript release in use. There is one
compiler now, so there is nothing to branch on.

The version itself is available: `ts.getVersion()` returns the Go compiler’s own
version (`core.Version()`, e.g. `7.1.0-dev`), carried on the session’s initialize
response. It is a **function** where the `typescript` package had a `version`
constant, because reaching it means having a session to ask, which is not
something to do at module load.

### In-memory lib files are read-only — unchanged, but the test was too broad

Not a breaking change: 28.0.0 already rejected every write, move and delete onto
an in-memory lib file, at both layers. Recorded here only because the fix below
changes which files count as one.

Whether a file is an in-memory lib file is now decided by asking the file system,
which holds the map, rather than by testing whether its path starts with the lib
folder. 28.0.0 used the prefix, with no trailing separator and no awareness of
the options, so a user's own file at `/node_modules/typescript/libfoo.ts` — or
any file under that folder when `skipLoadingLibFiles` or a custom
`libFolderPath` meant there were no in-memory lib files at all — was mistaken for
one and silently failed to save.

What the prohibition covers, unchanged: `SourceFile#copy`, `#move`, `#delete`,
`#deleteImmediately` and `#deleteImmediatelySync` throw an
`InvalidOperationError`, `#save`/`#saveSync` do nothing, and `#isSaved()` is
therefore always `false`. These files are reachable by navigating to a
declaration inside one
(`type.getSymbol().getDeclarations()[0].getSourceFile()`), not from
`Project#getSourceFiles()`.

### `Type#getConstraint()` and `Type#getDefault()` are narrower

tsgo resolves a constraint only for type parameters and substitution types, and
a default only for type parameters. An indexed access, index or conditional type
now returns `undefined` from `getConstraint()` where the `typescript` package
returned a type.

### `Diagnostic#getSourceFile()` only sees wrapped files

tsgo reports a diagnostic's file by name rather than handing back the parsed
file, so this resolves the name against the files the project has wrapped. A
diagnostic on a file the program pulled in but the project never added (a lib
file, an implicit dependency) yields `undefined` where the `typescript` package
returned a `SourceFile`.

Rename and implementations resolve against a single project. Code fixes prepare
the auto-import registry, which makes the first call more expensive.

The session declares no LSP client capabilities, so `WorkspaceEdit.DocumentChanges`
is never populated — the API returns plain per-file edit lists and cannot carry
versioned edits or create/rename/delete-file operations. A code fix that would
touch a file outside the program is dropped whole rather than applied in part;
rename raises an error instead of returning a partial edit set. Only a
declaration source map can put rename in that position, by mapping an edit back
onto a source file the program never loaded.

Rename rewrites every file the project holds, `node_modules` included, matching
`findRenameLocations` — the "you cannot rename elements defined in a node_modules
folder" rule, and the standard-library and `default`-keyword rules beside it, are
tsserver's `getRenameInfo` rules, which is to say an editor's, and the API is not
an editor. The standard library is nonetheless never written to: its source files
are left out of the search, so renaming a symbol declared in `lib.*.d.ts` rewrites
the project's own references and leaves the lib files alone. The `typescript`
package splits `getRenameInfo` from `findRenameLocations` in exactly this way.

---

## `@ts-morph/bootstrap`

The package's whole purpose is handing back raw compiler objects, so it takes the
brunt of the compiler's own API changes.

### The program is the project's, and is not created

`Project#createProgram()` no longer creates anything and no longer takes
`ts.CreateProgramOptions`: tsgo keeps one program per project and updates it as
files change, so the call returns the program for the project's current state.
`configFileParsingDiagnostics` can no longer be injected into it — the
diagnostics from the project's own `tsconfig.json` are on the new
`Project#getConfigFileParsingDiagnostics()` instead. (The program's own
`getConfigFileParsingDiagnostics()` answers for the session's synthetic config,
not the user's.)

### `getLanguageService()` returns the tsgo project

Same change as ts-morph's: tsgo has no `LanguageService`, and the operations hang
off the compiler's project. See "`LanguageService` is the tsgo project".

### Removed with the compiler hosts — **not exposed**

`ProjectOptions#isKnownTypesPackageName`. tsgo resolves type acquisition inside
the compiler with no host callback to override.

`ProjectOptions#resolutionHost` and the `ResolutionHost`, `ResolutionHostFactory`
and `ResolutionHosts` re-exports are **back** — see "Custom module resolution".

`Project#getModuleResolutionHost()` is **back**, rebuilt over `SourceFileCache`
(adapting its `ts.SourceFile` to the container's `getFullText()`), the same way
ts-morph's was. Nothing in it ever touched the compiler.

### `updateSourceFile(sourceFile)` re-parses the text

tsgo owns parsing, and a tree it did not produce cannot be put into a project, so
the overload taking a source file now re-creates the file from its `text` and
returns the new object rather than storing the one it was given.

### `scriptKind` has no effect

`SourceFileOptions#scriptKind` is accepted so existing calls compile, but tsgo
derives the script kind from the file extension and cannot be told otherwise.

### `resolveSourceFileDependencies()` returns the files it added

It used to create a program for its side effect of populating the source file
container through the compiler host. There is no such callback now, so it walks
`program.getSourceFileNames()` until the program stops growing, and returns the
files that walk added.

### The encoding is always utf-8

`CompilerOptions#charset` is gone from tsgo, and it was the only thing
`ProjectOptions#compilerOptions` fed the file reads.

---

## Runtime and packaging

- Requires a runtime with WebAssembly and `node:wasi`.
- Ships a large (~43 MB) `.wasm` artifact.
- Single-threaded: one request runs to completion at a time.
- The compiler is no longer a plain-JS dependency, so environments that bundled
  `typescript` as source are affected.
- `@ts-morph/common`'s bundle now ships `dist/typescript.wasm` beside
  `dist/ts-morph-common.js`, emitted by `packages/common/rollup.config.mjs`. The
  wasm loader is inlined into the bundle, which invalidates its in-package
  relative path to the reactor, so it falls back to a copy sitting next to
  whatever module loads it.
- **Working on this means rebuilding twice.** The tests run against
  `packages/common/dist/`, and that directory holds its own copy of the reactor.
  A change in the fork therefore needs `_scripts/build-wasm.mjs` **and** then
  `deno task build:node` in `packages/common`, or the suite keeps exercising the
  previous wasm and the change looks like it did nothing. `deno task build` also
  runs `build:declarations`, which currently fails on the tsgo client’s
  `#enums/*` specifiers — the packaging item below.
- That same config resolves the tsgo client's package-internal `#enums/*`,
  `#getExePath` and `#vscode-jsonrpc/node` specifiers. Without it the bundle
  loads and immediately throws `Cannot find module '#enums/modifierFlags'`,
  because those are only resolvable through the tsgo package's own `imports`
  map, which no longer applies once its modules are inlined here.

---

## The inventory, in full

Everything still off ts-morph's public surface, verified absent from shipped source
(grep over `packages/*/src` excluding tests returns no hits). The tests covering
each are preserved rather than deleted, so the record survives: they fail, and the
two whose imports would abort the whole mocha run at module load are quarantined
under `packages/ts-morph/src/tests/removed-capabilities/` and excluded in
`.mocharc.yml`.

### Genuinely absent — the Go compiler does not do this

| Off the surface                                                                                                                                           | Was on                     | Evidence                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getEditsForRefactor`, `RefactorEditInfo`                                                                                                                 | `LanguageService`          | no refactor surface at all; `codeFixProviders` (`internal/ls/codeactions.go,`codeFixProviders``) is three quickfix providers, and `CreateNewFile`/`IsNewFile` have zero hits in `internal/`                                                                                                                                                                     |
| `getFixName`                                                                                                                                              | code fix results           | no `fixName` concept; `FixName` has zero hits in `internal/`. Its test also wants `convertToEsModule`, which is absent, and error 80001, which is never emitted                                                                                                                                                                                                 |
| `Diagnostic#getSource`                                                                                                                                    | `Diagnostic`               | `ast.Diagnostic` (`internal/ast/diagnostic.go:33-63`) has no source field or accessor; the `"ts"` string is synthesized in the LSP layer (`internal/ls/lsconv/converters.go:319-328`)                                                                                                                                                                           |
| `PrintNodeOptions#emitHint`                                                                                                                               | printing                   | no `EmitHint` type; `printer.Emit` (`internal/printer/printer.go,`Printer.Emit``) dispatches on `node.Kind`                                                                                                                                                                                                                                                     |
| `EmitOptionsBase.customTransformers`, `ts.TransformationContext`                                                                                          | emit                       | `getScriptTransformers` (`internal/compiler/emitter.go:104-171`) is a hard-coded list; `EmitOptions` (`internal/compiler/program.go,`EmitOptions``) has no transformer slot, and the JS transformer would need a per-node round trip mid-emit over a single-threaded request/response transport                                                                 |
| `JSDocFunctionType`, `CommaListExpression`, `JSDocAuthorTag`, `JSDocClassTag`, `JSDocEnumTag`, `JSDocMemberName`, `JSDocNamepathType`, `JSDocUnknownType` | AST wrappers               | tsgo's parser emits no such kinds. `KindJSDocFunctionType` is explicitly retired: `internal/checker/nodecopy.go:544` reads `// if node.Kind == ast.KindJSDocFunctionType {} // !!! no longer exists`, and `internal/checker/nodebuilderimpl.go:1879-1880` is commented out                                                                                      |
| `SyntaxKind.JSDocTag` (classic's catch-all)                                                                                                               | enum                       | tsgo names it `JSDocUnknownTag` (`syntaxKind.enum.ts:326`); there is no catch-all kind                                                                                                                                                                                                                                                                          |
| `ScriptTarget.ES3`, `ScriptTarget.ES5`                                                                                                                    | enum                       | tsgo's `ScriptTarget` starts at `ES2015 = 2` (`_packages/native-preview/src/enums/scriptTarget.enum.ts`), so there is no downlevel-to-`var` emit                                                                                                                                                                                                                |
| `ModuleResolutionKind.NodeJs`                                                                                                                             | enum                       | renamed `Node10` (`moduleResolutionKind.enum.ts`), and `GetModuleResolutionKind` (`internal/core/compileroptions.go:223-237`) folds both `Classic` and `Node10` into `Bundler`/`Node16`/`NodeNext`                                                                                                                                                              |
| the 80005 `require`-to-import suggestion                                                                                                                  | `getSuggestionDiagnostics` | the method is routed; the diagnostic is never emitted (`internal/diagnostics/diagnostics_generated.go:3769` is the only hit)                                                                                                                                                                                                                                    |
| `ts.IScriptSnapshot`, `ts.ScriptSnapshot`, `ts.DocumentRegistryBucketKey`                                                                                 | `ts` namespace             | tsgo takes file text directly; there is no snapshot-of-a-file concept to wrap                                                                                                                                                                                                                                                                                   |
| `createDocumentCache`                                                                                                                                     | `@ts-morph/common`         | it deep-cloned a parsed `ts.SourceFile` and re-stamped `fileName`; tsgo's nodes are lazy views over a binary buffer with a circular back-reference to their file                                                                                                                                                                                                |
| `fixUnusedIdentifiers`                                                                                                                                    | `SourceFile`               | it drove the `unusedIdentifier_delete` and `unusedIdentifier_deleteImports` fix-alls. The suggestion diagnostics and the deletion machinery (`internal/ls/change/delete.go`) both exist, but no provider joins them: `codeFixProviders` (`internal/ls/codeactions.go`) is import fixes, isolated declarations and class-implements. A new provider, not a route |
| `setParentNodes: false`                                                                                                                                   | `ts.createSourceFile`      | tsgo's parser always links parents; a parentless tree cannot be produced                                                                                                                                                                                                                                                                                        |
| `SourceFile#getLanguageVersion` (per file)                                                                                                                | `SourceFile`               | `ast.SourceFileParseOptions` (`internal/ast/parseoptions.go:8-12`) records only file name, path and module-detection options — no script target. Reports the project's `target` instead                                                                                                                                                                         |
| `JSDocNullableType#isPostfix`, `JSDocNonNullableType#isPostfix`                                                                                           | AST                        | `JSDocNullableType` (`internal/ast/ast_generated.go:6985-6988`) records only the type; whether `?`/`!` was prefix or postfix is not kept                                                                                                                                                                                                                        |
| `CompilerOptions.charset`                                                                                                                                 | options                    | removed from tsgo; files are read as utf-8                                                                                                                                                                                                                                                                                                                      |
| `ts.parseJsonConfigFileContent`, `ts.parseConfigFileTextToJson`, `ts.ParseConfigHost`                                                                     | `ts` namespace             | tsgo parses config server-side through `parseConfigFile`                                                                                                                                                                                                                                                                                                        |
| `ts.LanguageServiceHost`, `ts.CompilerHost`, `createHosts`, `TsSourceFileContainer`                                                                       | hosts                      | tsgo owns the file system and parsing; there is no host to implement                                                                                                                                                                                                                                                                                            |
| `TypeScriptVersionChecker`                                                                                                                                | `ts` namespace             | it compared against `ts.version` to gate behaviour by TypeScript release; there is one compiler now and nothing to branch on. `ts.version` itself is back, as `ts.getVersion()`, from `core.Version()` (`internal/core/version.go`)                                                                                                                             |
| `getFileMatcherPatterns`, `FileMatcherPatterns`                                                                                                           | `@ts-morph/common`         | tsgo's matcher is an opaque `*vfsmatch.SpecMatcher` (`internal/vfs/vfsmatch/vfsmatch.go:703`), not a bag of regexes                                                                                                                                                                                                                                             |

### Not exposed — tsgo does this; it is a TODO, not a breaking change

| Off the surface                                                               | Was on               | What already works in Go                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ts.resolveModuleName`                                                        | `ts`                 | `Resolver.ResolveModuleName` (`internal/module/resolver.go`) resolves, but the entry point is not exposed to a client; `ProjectOptions#resolutionHost` now covers the case it existed for                                                                                |
| `getIdentationAtPosition`                                                     | `LanguageService`    | `format.GetIndentation` (`internal/format/indent.go:24`), `GetIndentationForNode` (`:17`)                                                                                                                                                                                |
| `getFixId`, `getFixAllDescription`                                            | code fix results     | `ls.CodeAction.FixID` / `.FixAllDescription` (`internal/ls/codeactions.go:55-60`); `api.CodeFixAction` (`internal/api/proto.go,`api.CodeFixAction``) drops them                                                                                                          |
| `TypeFormatFlags` as a real enum                                              | `ts` namespace       | `checker.TypeFormatFlags` (`internal/checker/types.go,`TypeFormatFlags``), all members present; `typeToString` already takes it (`internal/api/session.go, `TypeToStringEx``); missing only from the generator list (`Herebyfile.mjs, the`enumDefs`list`)                |
| `baseIndentSize`, `semicolons`, `insertSpace*`, `placeOpenBraceOnNewLineFor*` | `FormatCodeSettings` | `lsutil.FormatCodeSettings` (`internal/ls/lsutil/formatcodeoptions.go:70-92`), read at `internal/format/rulecontext.go:23,27,79,83` and `internal/format/indent.go:26,43`; `api.FormattingOptions` (`internal/api/proto.go,`api.FormattingOptions``) carries six of them |
| `formatDiagnosticsWithColorAndContext`                                        | `Project`            | `diagnosticwriter.FormatDiagnosticsWithColorAndContext` (`internal/diagnosticwriter/diagnosticwriter.go:122`), used by `tsc` itself (`internal/execute/tsc/diagnostics.go:42`)                                                                                           |
| `readDirectory`, `matchFiles`                                                 | `@ts-morph/common`   | `vfsmatch.ReadDirectory` (`internal/vfs/vfsmatch/vfsmatch.go:31`)                                                                                                                                                                                                        |
| `@types` added after project creation, for `getAmbientModules`                | `TypeChecker`        | `Checker.GetAmbientModules` is routed and works; the gap is that nothing re-scans the file system for unimported `@types` packages                                                                                                                                       |

#### Routed since this table was written

Removed from the table above rather than left in it, so that it keeps meaning
“still to do”:

- A definition’s display parts, and the display-string `getName()` that is built
  from them.
- `getChildCount`, `getChildAt`, `getFirstToken`, `getLastToken`.
- `ReferenceEntry#isWriteAccess()`, from `ast.IsWriteAccessForReference`.
- `ts.addSyntheticLeadingComment` and the rest of the synthetic-comment API,
  carried to the printer beside the encoded node.
- `ts.version`, as `ts.getVersion()` — a function, because the version comes from
  the compiler and reaching it means having a session to ask.
- `Program#getSourceFiles()` and `Program#getTypeChecker()` on bootstrap's program.
- `ProjectOptions#resolutionHost` on `@ts-morph/bootstrap`, alongside ts-morph's.

`fixUnusedIdentifiers` is also gone from the table, but in the other direction:
it needs a code fix provider that tsgo does not have, so it belongs under
“genuinely absent”, not under “not exposed”.

### Renamed enum members

The classic names are kept as aliases where they are part of ts-morph's own
public surface, but **the numeric values changed**, which matters for code that
hard-codes them:

| Member                                           | Classic           | tsgo                                                             |
| ------------------------------------------------ | ----------------- | ---------------------------------------------------------------- |
| `NewLineKind.CarriageReturnLineFeed`             | `0`               | `1` (aliased to `CRLF`)                                          |
| `NewLineKind.LineFeed`                           | `1`               | `2` (aliased to `LF`)                                            |
| —                                                | —                 | `NewLineKind.None = 0` is new                                    |
| `SyntaxKind.EndOfFileToken`                      | `1`               | renamed to `EndOfFile`; no alias                                 |
| `JsxEmit.React`                                  | `2`               | `3`                                                              |
| `JsxEmit.ReactNative`                            | `3`               | `2`                                                              |
| `ModuleDetectionKind.Legacy`                     | `1`               | `2`                                                              |
| `ModuleDetectionKind.Auto`                       | `2`               | `1`                                                              |
| —                                                | —                 | `ModuleDetectionKind.None = 0` is new                            |
| `OuterExpressionKinds.ExcludeJSDocTypeAssertion` | `1 << 31`         | `64`                                                             |
| —                                                | —                 | `OuterExpressionKinds.Assignments = 128`, `.Comma = 256` are new |
| `CheckFlags.Discriminant`                        | `192`             | renamed to `NonUniformAndLiteral`; same value                    |
| `InternalSymbolName.Resolving`                   | `"__resolving__"` | removed; `AssignmentDeclaration` and `ModuleExports` are new     |

Passing a hard-coded `0` for a newline kind now means `None`;
`newLineKindToString` rejects it with an explanatory error rather than silently
emitting the wrong ending.

`JsxEmit` and `ModuleDetectionKind` are the two that transpose rather than shift:
a hard-coded `jsx: 2` asked for `React.createElement` under the `typescript`
package and asks for `react-native` here, and `moduleDetection: 1` moves the
other way, from `legacy` to `auto`. Neither is rejected, because both numbers are
valid members — only the meaning changed. Name the member.

Two of the classic enums have no run-time value at all here, because tsgo
declares them as unions of string literals rather than as enums:
`OrganizeImportsMode` (`"all" | "sortAndCombine" | "removeUnused"`, where classic
had `.All` / `.SortAndCombine` / `.RemoveUnused`) and `QuotePreference`
(`"auto" | "double" | "single"`, where classic had `.Single = 0` / `.Double = 1`).
`ts.OrganizeImportsMode.All` is therefore a `TypeError`; pass the string.

`ts.Extension` and `ts.SymbolFormatFlags` are gone outright rather than reshaped:
tsgo generates neither, and nothing left on ts-morph's surface names either one.

### Measured state

Run on the working tree this document describes:

|                      | passing | pending | failing | `ensure-no-project-compile-errors` |
| -------------------- | ------- | ------- | ------- | ---------------------------------- |
| `packages/common`    | 424     | 0       | 0       | 0                                  |
| `packages/ts-morph`  | 4441    | 2       | 0       | 0                                  |
| `packages/bootstrap` | 85      | 4       | 0       | no such task                       |

All 15 end-to-end scripts under `tsgo-wasm/` pass, as do the Go tests for every
package the fork touches.

`packages/ts-morph`’s pending tests are the two `elementAccessExpressionTests`
cases.
`packages/bootstrap`’s 4 are its `custom type reference directive resolution`
describe, twice over — once for each of the async and sync constructors. Neither
package skips anything for want of a `resolutionHost`. `packages/bootstrap` has
no `ensure-no-project-compile-errors` task; `npx tsc --noEmit -p tsconfig.json`
reports 8 errors, all inside that skipped describe.

#### What the last 29 failures turned out to be

Worth recording, because the split was not what the earlier list predicted. Only
a handful were genuinely absent; most were exposure gaps or expectations carried
over from TypeScript 5.

- **Restored by exposing what Go already had — 10.** A definition’s display parts
  and each reference’s write access (`getDefinitionKindAndDisplayParts` and
  `ast.IsWriteAccessForReference` were both already written), synthetic comments
  through `printNode` (`EmitContext.AddSyntheticLeadingComment`), `getChildCount`
  and the rest of the `Node` surface, and `ts.version` from `core.Version()`.
- **Expectations that were TypeScript 5’s — 12.** `target: ES5` and downlevel
  `var` emit, `moduleResolution: classic`/`node10`, `ModuleResolutionKind.NodeJs`,
  the `JSDocTag` kind name, a lib-file diagnostic count, and `setParentNodes:
  false`. The authority for the first three is the “Removed in TS7” block in
  `internal/compiler/program.go`, which errors on each of them by name.
- **Genuinely absent — 5.** `getEditsForRefactor` (tsgo has no refactor
  providers at all), `fixUnusedIdentifiers` (its two fix-all ids are not among
  tsgo’s three code fix providers, `internal/ls/codeactions.go`),
  `convertToEsModule` and the 80005 suggestion (both from TypeScript’s
  services-layer `suggestionDiagnostics.ts`, not ported — tsgo’s suggestions come
  from the checker only), `Diagnostic#getSource` (`ast.Diagnostic` has no such
  field; the LSP layer stamps a constant `"ts"`), and `customTransformers` (a
  JavaScript transform cannot join a Go emit pipeline).
- **Deferred — 2.** The `custom type reference directive resolution` describes.
  Those resolve down a separate path in the compiler with no hook; module
  resolution itself was since restored, and its describes pass.

#### Divergences found while closing them

- **`visitEachChild` visits token children.** The `typescript` package reserved
  tokens for a separate `tokenVisitor` and skipped them otherwise; tsgo’s
  generated visitor hands them to the same visitor as every other child. A
  transform that annotates every childless node therefore also annotates a
  binary operator and a file’s end-of-file token.
- **Display parts are coarser.** A keyword run carries the space that follows
  it rather than the space being a run of its own.
- **Organize-imports coalesces.** Two adjacent import deletions come back as one
  text change spanning both.
- **A raw file-system write after the first read is not seen.** tsgo builds the
  program when the first file is added, where TypeScript built its program
  lazily; a write that bypasses ts-morph’s own file system therefore has to
  happen before anything reads the project.
- **`getRelativePathAsModuleSpecifierTo` no longer depends on the resolution
  mode.** `node10` was the only mode that wanted an implicit index, and it is
  removed, so every remaining mode spells the index out. The switch on
  `moduleResolution` is gone from `Directory`.

## Still in flight

Not yet resolved, listed so they are not mistaken for finished work:

- **tsconfig parsing** — shipped: `TsConfigResolver` now goes through the API's
  `parseConfigFile`. What users lose is `ts.parseJsonConfigFileContent`,
  `ts.parseConfigFileTextToJson` and `ts.ParseConfigHost`, none of which have a
  tsgo equivalent; `getTsParseConfigHost` is gone with them. `packages/common`
  type-checks clean.
- **Packaging — done.** `npm run build` at the root exits 0 for all three
  packages, and both publish a package that works on a consumer’s disk: packed
  with `npm pack`, installed into an empty project and type-checked against
  TypeScript 7 with `skipLibCheck: false`, they report no errors, and the program
  runs — project, checker, enums, `ts.getVersion()` and manipulation all work.
  What it took:
  - The tsgo client’s declarations are vendored into `packages/common/lib/tsgo`
    by `scripts/vendorTsgoTypes.ts`, with `#enums/*` rewritten to relative paths.
    Nothing outside the tsgo package can follow a `#` specifier, and once these
    files are vendored they are outside it.
  - `lib/typescript.d.ts` is now generated and is four lines: it re-exports the
    `ts` namespace from `lib/tsNamespace.d.ts`, which is `src/tsgo/ts.ts` as
    emitted. It used to be a copy of TypeScript’s own 588 KB `typescript.d.ts`,
    which `bundleLocalTs.ts` kept copying long after nothing read it; that script
    is deleted.
  - Both flatteners had to learn where the compiler surface lives. They keyed on
    `node_modules/typescript`, so every compiler name either vanished or was
    restated against import aliases (`TsgoCompilerOptions`) that mean nothing
    once flattened.
  - `packages/bootstrap` could not emit declarations at all: its tsconfig said
    `noEmit`, so the declaration project produced nothing and the build died
    looking for `dist/index.d.ts`. It now emits, and resolves `@ts-morph/common`
    to the built package rather than to source — which is what a published
    declaration has to be stated against.

  One thing is worth knowing about the result: the published tarball is 10.6 MB
  (49 MB unpacked), almost entirely `dist/typescript.wasm`.
- **`packages/ts-morph` source** — type-checks clean, its suite is green (see
  “Measured state” for the counts, which live in one place) and
  `tsgo-wasm/project.mts` drives a real `Project` end to end (create, read,
  checker, manipulate, rename, format, emit) against the tsgo session. That
  script runs against the rollup bundles, because ts-morph’s sources use
  extensionless relative imports that Node cannot resolve directly; it rebuilds
  them when they are stale.
  Two runtime gaps this list used to claim are **not** real, and were removed
  after being tested rather than re-read: the registry does read through
  `createFileSystemAdapter` (`CompilerFactory` passes it), and it _is_ rebuilt
  when `CompilerOptionsContainer#onModified` fires. A real on-disk project at a
  Windows path, with a `node_modules` dependency, resolves that dependency,
  picks its files up from `include`, reports no diagnostics and infers types
  through it. One gap does remain: `SourceFileCreateOptions.scriptKind` is
  accepted and ignored, because tsgo derives the script kind from the file
  extension — it should be removed from the public surface.
- **`NoSubstitutionTemplateLiteral`'s position in the AST** — tsgo puts it
  straight on `ExpressionBase` rather than on the primary-expression chain,
  unlike the `typescript` package, which would leave ts-morph's
  `LiteralExpression` (a `PrimaryExpression`) unable to describe it. It is
  restated on that chain in `packages/common/src/tsgo/ts.ts`, along with the
  four unions that name it (`LiteralExpression`, `TemplateLiteral`,
  `StringLiteralLike`, `PropertyName`). The real fix is in the fork's generated
  AST — `NoSubstitutionTemplateLiteral` should embed `LiteralExpressionBase`
  like every other literal — after which the restatement can go.
- **`JSDocSignature#getTypeNode()`** — declared `TypeNode | undefined`, where the
  `typescript` package had `JSDocReturnTag | undefined`. The runtime value really
  is a `JSDocReturnTag` (`parseJSDocSignature` in `internal/parser/jsdoc.go`
  passes the return tag as the signature's type), so the declaration is wrong
  rather than the value. Not restated, because overriding the member means
  reshaping `JSDocSignature` around `FunctionLikeBase`, which declares
  `type?: TypeNode`; the fix belongs in the fork's generated AST.
- **`TupleTypeNode.elements`** — tsgo types it `NodeArray<TypeNode>`, where the
  `typescript` package had `NodeArray<TypeNode | NamedTupleMember>`. A named
  member (`[a: string]`) is one at runtime and is returned as one, so it is
  restated in `packages/common/src/tsgo/ts.ts` for the same reason and with the
  same real fix: the union belongs in the fork's generated AST.
- **`getChildren-parity.mts` no longer fails on every mismatch** — it gained an
  `alignKnownAstDivergence()` carve-out for one documented case (`JSDocText`
  prose nodes). It reclassifies 6 span mismatches as non-failing divergences.
  The carve-out returns the aligned children and the walk recurses through them,
  so only the diverging child list itself goes unverified, not the subtree below
  it.
- **`packages/bootstrap`** — its source is migrated: `SourceFileCache` now owns a
  tsgo `DocumentRegistry` built over `createFileSystemAdapter`, and `Project`
  takes its program, its language service and its lib files from that session.
  `src` type-checks clean and the suite is green (see "Measured state"). What was
  a list of 31 failures here is closed: `Program#getSourceFiles()` and
  `getTypeChecker()` are routed, `findRenameLocations`/`getDefinitionAtPosition`
  are retargeted onto the tsgo project's `rename`/`getDefinition`, and
  `ProjectOptions#resolutionHost` is wired through `SourceFileCache` the way
  ts-morph's is. `packages/bootstrap` has no
  `ensure-no-project-compile-errors` task, so its type errors can only be
  counted with `npx tsc --noEmit -p tsconfig.json`: **8**, all in the still-skipped
  `custom type reference directive resolution` describe.
- **Custom module resolution — restored, with a different shape.**
  `ProjectOptions#resolutionHost` and `ResolutionHosts.deno` are back, and the
  compiler asks the host before resolving anything itself. What changed:
  - A host answers one specifier at a time, because that is how the compiler
    asks. `resolveModuleNames` taking an array is gone.
  - A host that only rewrites hands back a different specifier and lets the
    compiler resolve that, which is what `ResolutionHosts.deno` now does.
    Previously it called `ts.resolveModuleName` itself; there is no such entry
    point now, and rewriting is a better fit anyway.
  - The factory takes only `getCompilerOptions`. There is no module resolution
    host to hand it, because a host no longer resolves for itself.
  - A host is told the `resolutionMode` of the import — `ModuleKind.CommonJS` or
    `ModuleKind.ESNext`, or `undefined` when the compiler has no opinion — so it
    can answer one specifier differently for an ESM and a CommonJS importer. That
    is finer than `resolveModuleNames` gave it, which discriminated per file.
    Neither `containingSourceFile` nor `redirectedReference` is surfaced.
  - `getResolvedModuleWithFailedLookupLocationsFromCache` is gone; the compiler
    owns the cache.
  - **Type reference directives are still not covered.** They resolve down a
    separate path in the compiler with no hook, so the
    `custom type reference directive resolution` tests stay skipped.
- **Forgetting a file made imports of it stop resolving — fixed.** `forget()`
  reported the file to the compiler as deleted, which made that path missing for
  the snapshot, so an import of it failed even though the file was still on the
  file system. Diagnosed rather than guessed:
  - It was not about custom resolution — it happened with no resolution host.
  - It was not the file being invisible — a _new_ session over the same file
    system resolved it, and so did a new importer in a later snapshot.
  - It was the `deleted` signal itself, and the next snapshot recovered,
    including for the original importer.

  `deleted` is nonetheless the right signal wherever the caller is vacating the
  path rather than handing it back: `move` with `overwrite` removes a destination
  whose stale on-disk content has to be dropped rather than re-read, every `move`
  leaves an old path the file is no longer at, and `delete` on a `SourceFile` or
  `Directory` forgets before the file system is told. All of those reach
  `DocumentRegistry#removeSourceFile` through the same call site,
  `CompilerFactory#removeCompilerNodeFromCache`, so it now takes the signal from
  its caller: a `discardContents` option, off by default — a file merely leaving
  the registry hands its path back to the file system, and whatever is there
  speaks for it. It is carried down through `Node#_forgetOnlyThis`, and the
  callers that vacate a path reach it through `SourceFile#`/
  `Directory#_forgetDiscardingContents` or, for the path a move leaves behind,
  `CompilerFactory#replaceCompilerNode`.

  Still outstanding, and older than this: `SourceFile#move` with `overwrite` onto
  a path that exists only on the file system keeps the stale text when the
  compiler has already resolved that path. Nothing removes the destination —
  `_moveInternal` only forgets one that is in the source file cache — and the
  write that follows is classified `created`, because `#versions` tracks only the
  registry's own files while the compiler may hold the path from the base file
  system, and a `created` for a path already read leaves the old contents. It
  would take the registry keeping the base file system to hand so it could call
  that write a `changed`.
- **Sweep the source comments into this document before the PR lands.** The
  migration left explanatory notes scattered through the code — anything opening
  with "Breaking change:", and every aside about what tsgo no longer has or does
  not implement. They were useful while the shape of the port was still being
  worked out, but they do not belong in shipped source: a reader of
  `LanguageService.ts` does not need a history of what the `typescript` package
  used to return. Every one of them should be deleted and, where it says
  something this document does not already, folded in here first. Comments that
  explain why the _current_ code is written the way it is stay.
