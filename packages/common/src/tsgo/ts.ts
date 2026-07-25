/**
 * The `ts`-shaped surface, backed by tsgo.
 *
 * ts-morph reaches the compiler through a single namespace (see
 * `src/typescript/public.ts`), so replacing the backend means providing that
 * namespace from tsgo instead of the `typescript` package. This module assembles
 * the parts tsgo can supply directly today; see "Not yet available" below for
 * what still has no equivalent.
 *
 * Note that the enums are *not* value-compatible with the `typescript` package:
 * `SyntaxKind.ClassDeclaration` has a different number here. Nodes and kinds
 * must therefore come from the same backend — mixing tsgo nodes with
 * `typescript`'s enums (or vice versa) silently misidentifies every node.
 */

// Enums. Every enum ts-morph re-exports has a tsgo counterpart except EmitHint
// and TypeFormatFlags, which belong to the printer/checker surface below.
export { DiagnosticCategory } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/diagnosticCategory.js";
export { LanguageVariant } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/languageVariant.js";
export { ModifierFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/modifierFlags.js";
export { ModuleKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleKind.js";
export { ModuleResolutionKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleResolutionKind.js";
export { NewLineKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/newLineKind.js";
export { NodeFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/nodeFlags.js";
export { ObjectFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/objectFlags.js";
export { ScriptKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/scriptKind.js";
export { ScriptTarget } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/scriptTarget.js";
export { SymbolFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/symbolFlags.js";
export { SyntaxKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/syntaxKind.js";
export { TypeFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/typeFlags.js";

// Node types and the `isXxx` guards, which ts-morph uses for narrowing.
export type * from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.js";
export * from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/is.js";

// Trivia and token scanning. ts-morph uses these to find comments and to walk
// tokens when appending to lists.
export {
  createScanner,
  getLeadingCommentRanges,
  getShebang,
  getTrailingCommentRanges,
  isIdentifierText,
  skipTrivia,
  tokenToString,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/scanner.js";

export {
  escapeLeadingUnderscores,
  formatSyntaxKind,
  unescapeLeadingUnderscores,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/utils.js";

export type { CompilerOptions } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/compilerOptions.js";

// Token-inclusive children (which the tsgo AST does not store) are not part of
// this namespace; import them from ./getChildren directly.

import type { Node } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.js";

/**
 * Visits each stored child of a node, mirroring the free `ts.forEachChild`.
 * Tokens and syntax lists are not stored in the tree; use {@link getChildren}
 * for those.
 */
export function forEachChild<T>(node: Node, cbNode: (node: Node) => T | undefined): T | undefined {
  return node.forEachChild(cbNode);
}

/*
 * Not yet available from tsgo, and still sourced from `typescript`:
 *
 * - Parsing: `createSourceFile` / `createLanguageServiceSourceFile`. tsgo parses
 *   on the server; source files are obtained from a project's program, so the
 *   document registry and its ScriptSnapshot model have no direct counterpart.
 * - `LanguageService` / `Program` / `TypeChecker` as objects. The equivalents
 *   hang off a tsgo `Project` (`project.program`, `project.checker`) and are
 *   reached through `createInProcessApi`.
 * - Printer and transforms: `createPrinter`, `EmitHint`, `transform`,
 *   `visitEachChild`, and `factory` (which ts-morph only exposes to users of
 *   `Node#transform`). tsgo has a server-side `printNode` instead.
 * - `TypeFormatFlags`; tsgo's `typeToString` takes NodeBuilderFlags.
 * - Config parsing: `parseJsonConfigFileContent`, `parseConfigFileTextToJson`,
 *   and `resolveModuleName`. tsgo exposes `parseConfigFile` on the API instead.
 * - Binder internals ts-morph reads off nodes (`.symbol`, `.locals`,
 *   `.emitNode`), which must be routed through the checker.
 */
