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
export { DiagnosticCategory } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/diagnosticCategory.enum.js";
export { LanguageVariant } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/languageVariant.enum.js";
export { ModifierFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/modifierFlags.enum.js";
export { ModuleKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleKind.enum.js";
export { ModuleResolutionKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleResolutionKind.enum.js";
export { NewLineKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/newLineKind.enum.js";
export { NodeFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/nodeFlags.enum.js";
export { ObjectFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/objectFlags.enum.js";
export { ScriptKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/scriptKind.enum.js";
export { ScriptTarget } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/scriptTarget.enum.js";
export { SymbolFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/symbolFlags.enum.js";
export { SyntaxKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/syntaxKind.enum.js";
export { TypeFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/typeFlags.enum.js";

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

/**
 * How a node is printed. tsgo prints via the API's `printNode`, which has no
 * hint parameter, so this exists to keep the shape ts-morph exposes.
 */
export const EmitHint = {
  SourceFile: 0,
  Expression: 1,
  IdentifierName: 2,
  MappedTypeParameter: 3,
  Unspecified: 4,
  EmbeddedStatement: 5,
  JsxAttributeValue: 6,
  ImportTypeNode: 7,
} as const;
export type EmitHint = typeof EmitHint[keyof typeof EmitHint];

/**
 * Formatting settings, as accepted by the formatter.
 *
 * Breaking change: this is a reduced form of the `typescript` package's
 * `EditorSettings` — tsgo's formatter takes tab size, spaces-versus-tabs, and
 * trailing whitespace trimming.
 */
export interface EditorSettings {
  tabSize?: number;
  insertSpaces?: boolean;
  trimTrailingWhitespace?: boolean;
  newLineCharacter?: string;
}

/**
 * Flags controlling how a type is rendered as text.
 *
 * Breaking change: tsgo's `typeToString` takes NodeBuilderFlags, so that is what
 * this is. The `typescript` package's separate TypeFormatFlags enum has no
 * counterpart.
 */
export { NodeBuilderFlags, NodeBuilderFlags as TypeFormatFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/nodeBuilderFlags.enum.js";

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
