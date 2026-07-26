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

/** The host tsconfig parsing reads the file system through. */
export interface ParseConfigHost {
  useCaseSensitiveFileNames: boolean;
  readDirectory(rootDir: string, extensions: readonly string[], excludes: readonly string[] | undefined, includes: readonly string[], depth?: number): readonly string[];
  fileExists(path: string): boolean;
  readFile(path: string): string | undefined;
}

export type { Diagnostic } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/types.js";

/*
 * Names ts-morph asks of the compiler namespace that tsgo spells differently.
 * The abstract expression hierarchy carries a `Base` suffix here, and a few
 * declarations are suffixed `Declaration`; the rest simply live in other modules.
 */
export type {
  Program,
  ReferencedSymbolEntry,
  Signature,
  Symbol,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/api.js";

export type {
  EmitResult,
  InterfaceType,
  IntersectionType,
  JSDocTagInfo,
  LiteralType,
  NumberLiteralType,
  ObjectType,
  StringLiteralType,
  TemplateLiteralType,
  TupleType,
  Type,
  TypeParameter,
  TypeReference,
  UnionOrIntersectionType,
  UnionType,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/types.js";

export type {
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/proto.js";

export type {
  IterationStatementBase as IterationStatement,
  JSDocTypeBase as JSDocType,
  MemberExpressionBase as MemberExpression,
  MethodSignatureDeclaration as MethodSignature,
  NodeWithTypeArgumentsBase as NodeWithTypeArguments,
  PrimaryExpressionBase as PrimaryExpression,
  PropertySignatureDeclaration as PropertySignature,
  StringLiteralLikeNode as StringLiteralLike,
  UnaryExpressionBase as UnaryExpression,
  UpdateExpressionBase as UpdateExpression,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.generated.js";

export type {
  CommentKind,
  CommentRange,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/scanner.js";

/*
 * Narrowed node types the `typescript` package declares but tsgo does not.
 *
 * These matter more than their size suggests: `CompilerNodeToWrappedType` is a
 * conditional chain over them, and a missing type resolves to `any`, which every
 * node satisfies — so one absent name silently routes every wrapped node to the
 * same branch. They are declared here exactly as the `typescript` package does.
 */
import type {
  ArrayLiteralExpression,
  AssignmentOperatorToken,
  BinaryExpression,
  ElementAccessExpression,
  EqualsToken,
  LeftHandSideExpression,
  ObjectLiteralExpression,
  PropertyAccessExpression,
  SuperExpression,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.generated.js";

export interface SuperPropertyAccessExpression extends PropertyAccessExpression {
  readonly expression: SuperExpression;
}

export interface SuperElementAccessExpression extends ElementAccessExpression {
  readonly expression: SuperExpression;
}

export type SuperProperty = SuperPropertyAccessExpression | SuperElementAccessExpression;

export interface AssignmentExpression<TOperator extends AssignmentOperatorToken> extends BinaryExpression {
  readonly left: LeftHandSideExpression;
  readonly operatorToken: TOperator;
}

export interface ObjectDestructuringAssignment extends AssignmentExpression<EqualsToken> {
  readonly left: ObjectLiteralExpression;
}

export interface ArrayDestructuringAssignment extends AssignmentExpression<EqualsToken> {
  readonly left: ArrayLiteralExpression;
}

/*
 * Plain data shapes the language service layer passes around. tsgo returns its
 * own equivalents (character offsets rather than LSP positions), but ts-morph's
 * tools layer is typed against these names, so they are declared here with the
 * shapes it consumes.
 */
export interface TextSpan {
  start: number;
  length: number;
}

export interface TextChange {
  span: TextSpan;
  newText: string;
}

export interface FileTextChanges {
  fileName: string;
  isNewFile?: boolean;
  textChanges: readonly TextChange[];
}

export interface DocumentSpan {
  textSpan: TextSpan;
  fileName: string;
  originalTextSpan?: TextSpan;
  originalFileName?: string;
  contextSpan?: TextSpan;
  originalContextSpan?: TextSpan;
}

export interface DefinitionInfo extends DocumentSpan {
  kind: string;
  name: string;
  containerKind: string;
  containerName: string;
}

export interface ImplementationLocation extends DocumentSpan {
  kind: string;
  displayParts: readonly SymbolDisplayPart[];
}

export interface ReferenceEntry extends DocumentSpan {
  isWriteAccess: boolean;
  isInString?: true;
}

export interface ReferencedSymbolDefinitionInfo extends DefinitionInfo {
  displayParts: readonly SymbolDisplayPart[];
}

export interface ReferencedSymbol {
  definition: ReferencedSymbolDefinitionInfo;
  references: readonly ReferenceEntry[];
}

export interface RenameLocation extends DocumentSpan {
  readonly prefixText?: string;
  readonly suffixText?: string;
}

export interface SymbolDisplayPart {
  text: string;
  kind: string;
}

export interface CodeAction {
  description: string;
  changes: FileTextChanges[];
}

export interface CodeFixAction extends CodeAction {
  fixName: string;
  fixId?: {};
  fixAllDescription?: string;
}

export interface CombinedCodeActions {
  changes: readonly FileTextChanges[];
}

export interface RefactorEditInfo {
  edits: readonly FileTextChanges[];
  renameFilename?: string;
  renameLocation?: number;
}

export interface OutputFile {
  name: string;
  writeByteOrderMark: boolean;
  text: string;
}

export interface EmitOutput {
  outputFiles: readonly OutputFile[];
  emitSkipped: boolean;
}

export interface DiagnosticMessageChain {
  messageText: string;
  category: number;
  code: number;
  next?: DiagnosticMessageChain[];
}

export interface OrganizeImportsArgs {
  type: "file";
  fileName: string;
}

/** Editor and user preferences accepted by the language service operations. */
export interface UserPreferences {
  readonly quotePreference?: "auto" | "double" | "single";
  readonly providePrefixAndSuffixTextForRename?: boolean;
  readonly [key: string]: unknown;
}

export interface FormatCodeSettings extends EditorSettings {
  readonly [key: string]: unknown;
}
