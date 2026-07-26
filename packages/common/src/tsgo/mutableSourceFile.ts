/**
 * Re-stamping fields on a tsgo `SourceFile`.
 *
 * `RemoteSourceFile` exposes `fileName` (and most other data) as prototype
 * getters with no setters, but ts-morph assigns to them — the document cache
 * re-stamps `fileName` when reusing a parsed file across projects, and the
 * document registry stamps a `version`. Assigning directly throws.
 *
 * The override is written onto the file itself rather than onto a prototype view
 * of it. A view looks tempting but does not work: `RemoteNode.getSourceFile()`
 * returns a stored field, so every node in the file would keep reporting the
 * original name; `path` (which the source file cache and node ids key on) would
 * disagree with `fileName` on the same object; the file's memo fields
 * (`_cachedText`, `_lineStarts`, …) would be duplicated onto the view; and
 * because getChildren's caches are keyed by object identity, a view would mint a
 * second set of synthesized tokens and SyntaxLists for the same file.
 *
 * Note that `path` is deliberately not re-stamped: it is the identity the
 * compiler resolves against, and changing it would detach the file from the
 * program that produced it. A caller that needs a different path needs a
 * different file.
 */
import type { SourceFile } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/index.js";

/**
 * Assigns `value` to `key` even when the prototype exposes it as a getter with
 * no setter, by defining an own data property that shadows it.
 */
export function setSourceFileProperty(sourceFile: SourceFile, key: string, value: unknown): void {
  Object.defineProperty(sourceFile, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}
