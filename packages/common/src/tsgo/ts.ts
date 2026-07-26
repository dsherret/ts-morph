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
//
// These are re-exported verbatim, which means tsgo owns both the member names
// and the member values. Both changed relative to the `typescript` package —
// see "Enums" in tsgo-wasm/BREAKING-CHANGES.md for the full rename, removal and
// renumbering table. They cannot be re-declared with the classic names because
// ts-morph uses members such as `SyntaxKind.ClassDeclaration` in type position,
// which only a real `enum` declaration supports; and they cannot be renumbered
// because the values are the wire format shared with the Go compiler.
export { DiagnosticCategory } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/diagnosticCategory.enum.js";
export { LanguageVariant } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/languageVariant.enum.js";
export { ModifierFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/modifierFlags.enum.js";
export { ModuleKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleKind.enum.js";
export { ModuleResolutionKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleResolutionKind.enum.js";
export { NodeFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/nodeFlags.enum.js";
export { ObjectFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/objectFlags.enum.js";
export { ScriptKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/scriptKind.enum.js";
export { ScriptTarget } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/scriptTarget.enum.js";
export { SymbolFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/symbolFlags.enum.js";
export { SyntaxKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/syntaxKind.enum.js";
export { TokenFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/tokenFlags.enum.js";
export { TypeFlags } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/typeFlags.enum.js";

import { NewLineKind as TsgoNewLineKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/newLineKind.enum.js";

/**
 * Which characters end a line.
 *
 * Unlike the enums above this is not a verbatim re-export, because
 * `NewLineKind` is part of ts-morph's own public surface: it is the type of
 * `ManipulationSettings.newLineKind`. tsgo renamed both members and added a
 * `None`, so the classic names are kept here as aliases of the tsgo members.
 *
 * The *values* still had to shift, and that shift is dangerous rather than
 * merely inconvenient: `typescript` had `CarriageReturnLineFeed = 0` and
 * `LineFeed = 1`, whereas tsgo has `None = 0`, `CRLF = 1` and `LF = 2`. Code
 * that names the member is unaffected; code that hard-codes the number now
 * means something else. Passing the old `0` therefore lands on `None`, which
 * `newLineKindToString` rejects with an explanatory error rather than silently
 * emitting the wrong line ending.
 */
export const NewLineKind: typeof TsgoNewLineKind & {
  readonly CarriageReturnLineFeed: TsgoNewLineKind.CRLF;
  readonly LineFeed: TsgoNewLineKind.LF;
} = {
  ...TsgoNewLineKind,
  CarriageReturnLineFeed: TsgoNewLineKind.CRLF,
  LineFeed: TsgoNewLineKind.LF,
};
export type NewLineKind = TsgoNewLineKind;

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

import type { CompilerOptions as TsgoCompilerOptions } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/compilerOptions.js";

/**
 * Compiler options, as tsgo parses and reports them.
 *
 * `configFilePath` is set by tsgo when the options come from a tsconfig, but its
 * generated TypeScript declaration omits it, so it is added back here.
 */
export interface CompilerOptions extends TsgoCompilerOptions {
  configFilePath?: string;
}

// Token-inclusive children (which the tsgo AST does not store) are not part of
// this namespace; import them from ./getChildren directly.

/**
 * How a node is printed. tsgo prints via the API's `printNode`, which has no
 * hint parameter, so this exists to keep the shape ts-morph exposes; the values
 * are inert.
 *
 * Breaking change: this is a const object rather than an enum, so it is not a
 * nominal type — `EmitHint` is the union `0 | 1 | … | 7`, and any numeric
 * literal in range is assignable where the `typescript` package required a
 * member reference. The member names and values are otherwise unchanged.
 */
export const EmitHint = {
  SourceFile: 0,
  Expression: 1,
  IdentifierName: 2,
  MappedTypeParameter: 3,
  Unspecified: 4,
  EmbeddedStatement: 5,
  JsxAttributeValue: 6,
  ImportTypeNodeAttributes: 7,
} as const;
export type EmitHint = typeof EmitHint[keyof typeof EmitHint];

/**
 * Formatting settings, as accepted by the formatter.
 *
 * Breaking change: this is a reduced form of the `typescript` package's
 * `EditorSettings`, and matches tsgo's `FormattingOptions` exactly — tab size,
 * spaces-versus-tabs, and trailing whitespace trimming, and nothing else. Note
 * that `insertSpaces` is `convertTabsToSpaces` under its tsgo name; the two mean
 * the same thing. `indentStyle`, `indentSize` and `newLineCharacter` are gone.
 */
export interface EditorSettings {
  tabSize?: number;
  insertSpaces?: boolean;
  trimTrailingWhitespace?: boolean;
}

/**
 * Flags controlling how a type is rendered as text.
 *
 * Breaking change: tsgo's `typeToString` takes NodeBuilderFlags, so that is what
 * this is. The `typescript` package's separate TypeFormatFlags enum has no
 * counterpart, and the alias is not a faithful stand-in:
 *
 *   - Six members are gone: `AddUndefined`, `WriteArrowStyleSignature`,
 *     `InArrayType`, `InElementType`, `InFirstTypeArgument`,
 *     `NodeBuilderFlagsMask`.
 *   - Five of their values are live in NodeBuilderFlags under other meanings, so
 *     a numeric literal or a persisted bitmask silently changes behaviour:
 *       131072  AddUndefined             -> AllowAnonymousIdentifier
 *       262144  WriteArrowStyleSignature -> AllowEmptyUnionOrIntersection
 *       524288  InArrayType              -> AllowEmptyTuple
 *       2097152 InElementType            -> AllowEmptyIndexInfoType
 *       4194304 InFirstTypeArgument      -> InObjectTypeLiteral
 *   - Being an alias rather than a distinct enum, TypeFormatFlags and
 *     NodeBuilderFlags are now the same nominal type and mutually assignable.
 *
 * The members ts-morph itself passes by default (`UseTypeOfFunction`,
 * `NoTruncation`, `UseFullyQualifiedType`, `WriteTypeArgumentsOfSignature`,
 * `InTypeAlias`) have identical values in both enums.
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

/** Gets the text of a JS doc comment, flattening links to their text. */
export { getTextOfJSDocComment } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/jsdoc.js";

/** tsgo names this after the declaration union it narrows to. */
export { isClassLikeDeclaration as isClassLike } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/is.js";

/*
 * Small node helpers the `typescript` package exposes as free functions. tsgo
 * keeps the same information on the nodes themselves — decorators live in the
 * `modifiers` array, modifier flags are precomputed per node — so these are
 * derived rather than reimplemented.
 */
import { isDecorator, isVariableDeclarationList, isVariableStatement } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/is.js";
import { SyntaxKind as SyntaxKindValue } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/syntaxKind.enum.js";
import { ModifierFlags as ModifierFlagsValue } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/modifierFlags.enum.js";
import type {
  Decorator as TsgoDecorator,
  ExclamationToken as ExclamationTokenType,
  ModifiersBase,
  QuestionToken as QuestionTokenType,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.generated.js";

/** Whether the node is one that can carry decorators — i.e. one that has a modifier list. */
export function canHaveDecorators(node: Node): node is ModifiersBase {
  return (node as ModifiersBase).modifiers !== undefined;
}

/** The node's decorators, which tsgo stores interleaved with its modifiers. */
export function getDecorators(node: Node): readonly TsgoDecorator[] | undefined {
  if (!canHaveDecorators(node))
    return undefined;
  const decorators = node.modifiers!.filter(isDecorator);
  return decorators.length === 0 ? undefined : decorators;
}

/** Whether the node is a JS doc comment or a part of one. */
export function isJSDocCommentContainingNode(node: Node): boolean {
  switch (node.kind) {
    case SyntaxKindValue.JSDoc:
    case SyntaxKindValue.JSDocNameReference:
    case SyntaxKindValue.JSDocText:
    case SyntaxKindValue.JSDocLink:
    case SyntaxKindValue.JSDocLinkCode:
    case SyntaxKindValue.JSDocLinkPlain:
    case SyntaxKindValue.JSDocTypeLiteral:
    case SyntaxKindValue.JSDocSignature:
      return true;
    default:
      return node.kind >= SyntaxKindValue.FirstJSDocTagNode && node.kind <= SyntaxKindValue.LastJSDocTagNode;
  }
}

/**
 * The node's modifier flags, including those a variable declaration inherits
 * from the statement that declares it.
 */
export function getCombinedModifierFlags(node: Node): ModifierFlagsValue {
  let current: Node | undefined = node;
  let flags = ModifierFlagsValue.None;
  while (current != null) {
    flags |= (current as ModifiersBase).modifierFlags ?? ModifierFlagsValue.None;
    if (!isVariableDeclarationList(current) && !isVariableStatement(current) && current.kind !== SyntaxKindValue.VariableDeclaration)
      break;
    current = current.parent;
  }
  return flags;
}

/**
 * The node's question token.
 *
 * tsgo collapsed the separate `questionToken` and `exclamationToken` fields of a
 * class or object member into a single `postfixToken`, keeping a dedicated
 * `questionToken` only where nothing else can appear (parameters, mapped types).
 * This reads whichever of the two the node has.
 */
export function getQuestionToken(node: Node): QuestionTokenType | undefined {
  return getPostfixTokenOfKind(node, SyntaxKindValue.QuestionToken) as QuestionTokenType | undefined;
}

/** The node's exclamation token, from either `exclamationToken` or `postfixToken`. */
export function getExclamationToken(node: Node): ExclamationTokenType | undefined {
  return getPostfixTokenOfKind(node, SyntaxKindValue.ExclamationToken) as ExclamationTokenType | undefined;
}

function getPostfixTokenOfKind(node: Node, kind: SyntaxKindValue) {
  const withTokens = node as { questionToken?: Node; exclamationToken?: Node; postfixToken?: Node };
  const dedicated = kind === SyntaxKindValue.QuestionToken ? withTokens.questionToken : withTokens.exclamationToken;
  if (dedicated != null)
    return dedicated.kind === kind ? dedicated : undefined;
  return withTokens.postfixToken?.kind === kind ? withTokens.postfixToken : undefined;
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
 *   and `resolveModuleName`. tsgo exposes `parseConfigFile` on the API instead,
 *   which reads the file system through the API's own FileSystem callbacks —
 *   there is no `ParseConfigHost`.
 * - Binder internals ts-morph reads off nodes (`.symbol`, `.locals`,
 *   `.emitNode`), which must be routed through the checker.
 */

export type { Diagnostic } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/types.js";

import type { Diagnostic as TsgoDiagnostic } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/types.js";

/**
 * A diagnostic that belongs to a file.
 *
 * tsgo has no distinct type for this: every `Diagnostic` carries `pos` and
 * `end`, and only `fileName` may be absent, so locating a diagnostic is exactly
 * a matter of whether it names a file.
 */
export type DiagnosticWithLocation = TsgoDiagnostic & { readonly fileName: string };

import type { Program as TsgoProgram } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/api.js";

/**
 * Every diagnostic the compiler reports before an emit, optionally for one file.
 *
 * tsgo has no `getPreEmitDiagnostics`: the program reports each category
 * separately, so this concatenates them in the order the `typescript` package
 * used to.
 */
export function getPreEmitDiagnostics(program: TsgoProgram, sourceFile?: { readonly fileName: string }): TsgoDiagnostic[] {
  const fileName = sourceFile?.fileName;
  return [
    ...program.getConfigFileParsingDiagnostics(),
    ...program.getProgramDiagnostics(),
    ...program.getSyntacticDiagnostics(fileName),
    ...program.getGlobalDiagnostics(),
    ...program.getSemanticDiagnostics(fileName),
  ];
}

/*
 * Names ts-morph asks of the compiler namespace that tsgo spells differently.
 * The abstract expression hierarchy carries a `Base` suffix here, and a few
 * declarations are suffixed `Declaration`; the rest simply live in other modules.
 */
export type {
  NodeHandle,
  Program,
  ReferencedSymbolEntry as CompilerReferencedSymbolEntry,
  Signature,
  Symbol,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/api.js";

/** tsgo names the type checker `Checker`. */
export type { Checker as TypeChecker } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/api.js";

/**
 * The compiler object the language service operations hang off.
 *
 * Breaking change: tsgo has no `LanguageService`. Formatting, organize-imports,
 * rename, definitions, implementations and code fixes are methods on the
 * session's project, and the program and checker hang off it too, so the tsgo
 * `Project` is what `LanguageService#compilerObject` now returns.
 */
export type { Project as LanguageService } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/api.js";

/**
 * Which files an emit is restricted to. Replaces the `typescript` package's
 * `emitOnlyDtsFiles` boolean, which had no way to say "JS only".
 */
export { EmitOnly } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/emitOnly.enum.js";

/*
 * Plain request/response shapes of the tsgo session. A `DocumentIdentifier` is
 * how tsgo names a file, and edits and spans are character offsets (`pos`/`end`)
 * rather than the `typescript` package's `{start, length}` spans.
 */
export type {
  DocumentIdentifier,
  FileSpan,
  FileTextEdits,
  FormattingOptions,
  OrganizeImportsMode,
  TextEdit,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/proto.js";

export type {
  EmitResult,
  InterfaceType,
  // tsgo folds the `GenericType` shape into `InterfaceType`, which already extends `TypeReference`.
  InterfaceType as GenericType,
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
  IterationStatementBase as IterationStatement,
  JSDocTypeBase as JSDocType,
  MemberExpressionBase as MemberExpression,
  MethodSignatureDeclaration as MethodSignature,
  NodeWithTypeArgumentsBase as NodeWithTypeArguments,
  PrimaryExpressionBase as PrimaryExpression,
  PropertySignatureDeclaration as PropertySignature,
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
  Identifier,
  LeftHandSideExpression,
  ObjectLiteralExpression,
  PropertyAccessExpression,
  StringLiteral,
  SuperExpression as TsgoSuperExpression,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.generated.js";

/*
 * Unions and narrowings tsgo spells with a different name, or does not name at all.
 */
export type { ClassLikeDeclaration as ClassLikeDeclarationBase } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.generated.js";

import type {
  ConstructorTypeNode,
  FunctionTypeNode,
  JsxOpeningFragment,
  JsxOpeningLikeElement,
  Token,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.generated.js";
import type { SyntaxKind as SyntaxKindEnum } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/syntaxKind.enum.js";

export type FunctionOrConstructorTypeNode = FunctionTypeNode | ConstructorTypeNode;
export type JsxCallLike = JsxOpeningLikeElement | JsxOpeningFragment;
export type AssertionKey = Identifier | StringLiteral;

/** `x instanceof y` — tsgo does not narrow the binary expression by operator. */
export interface InstanceofExpression extends BinaryExpression {
  readonly operatorToken: Token<SyntaxKindEnum.InstanceOfKeyword>;
}

/**
 * Anything the scanner can read text out of. The `typescript` package uses this
 * for positions APIs; only the text is ever needed.
 */
export interface SourceFileLike {
  readonly text: string;
}

/*
 * Nodes tsgo places lower in the expression hierarchy than the `typescript`
 * package does. ts-morph's class tree mirrors the `typescript` hierarchy —
 * `ThisExpression` extends `PrimaryExpression`, `ExpressionWithTypeArguments`
 * is a type node — so the shape is restated here. An explicit export shadows
 * the same name coming through the `export type *` above.
 */
import type {
  BigIntLiteral,
  ComputedPropertyName,
  DeclarationBase as TsgoDeclarationBase,
  Expression,
  PrivateIdentifier,
  MemberExpressionBase,
  NodeWithTypeArgumentsBase,
  NumericLiteral,
  PrimaryExpressionBase,
  RegularExpressionLiteral,
  TemplateExpression,
  TemplateLiteralLikeNodeBase as TsgoTemplateLiteralLikeNodeBase,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.generated.js";

/** tsgo parses the keyword expressions as one `KeywordExpression` off `ExpressionBase`. */
export interface ThisExpression extends PrimaryExpressionBase {
  readonly kind: SyntaxKindEnum.ThisKeyword;
}

export interface SuperExpression extends PrimaryExpressionBase {
  readonly kind: SyntaxKindEnum.SuperKeyword;
}

export interface ImportExpression extends PrimaryExpressionBase {
  readonly kind: SyntaxKindEnum.ImportKeyword;
}

export interface NullLiteral extends PrimaryExpressionBase {
  readonly kind: SyntaxKindEnum.NullKeyword;
}

export interface TrueLiteral extends PrimaryExpressionBase {
  readonly kind: SyntaxKindEnum.TrueKeyword;
}

export interface FalseLiteral extends PrimaryExpressionBase {
  readonly kind: SyntaxKindEnum.FalseKeyword;
}

export type BooleanLiteral = TrueLiteral | FalseLiteral;

/**
 * tsgo puts this straight on `ExpressionBase` rather than on the
 * primary-expression chain, unlike the `typescript` package, which would leave
 * ts-morph's `LiteralExpression` (a `PrimaryExpression`) unable to describe it.
 * The node is restated here on the chain it belongs to; the real fix is in the
 * fork's generated AST, and the unions naming it are restated below so they
 * keep referring to the same node.
 */
export interface NoSubstitutionTemplateLiteral extends PrimaryExpressionBase, TsgoTemplateLiteralLikeNodeBase, TsgoDeclarationBase {
  readonly kind: SyntaxKindEnum.NoSubstitutionTemplateLiteral;
}

export type LiteralExpression = StringLiteral | NumericLiteral | BigIntLiteral | RegularExpressionLiteral | NoSubstitutionTemplateLiteral;
export type TemplateLiteral = TemplateExpression | NoSubstitutionTemplateLiteral;
export type StringLiteralLike = StringLiteral | NoSubstitutionTemplateLiteral;
export type StringLiteralLikeNode = StringLiteralLike;
export type PropertyName =
  | Identifier
  | StringLiteral
  | NoSubstitutionTemplateLiteral
  | NumericLiteral
  | ComputedPropertyName
  | PrivateIdentifier
  | BigIntLiteral;

export interface ExpressionWithTypeArguments extends MemberExpressionBase, NodeWithTypeArgumentsBase {
  readonly kind: SyntaxKindEnum.ExpressionWithTypeArguments;
  readonly expression: Expression;
}

/*
 * Unions whose tsgo spelling drops members the `typescript` package includes.
 * They are restated here so ts-morph's aliases keep describing the same set of
 * nodes; each one is written exactly as the `typescript` package declares it.
 */
import type {
  BindingPattern,
  CallExpression,
  Decorator,
  ElementAccessExpression as TsgoElementAccessExpression,
  JsxAttributeName,
  JsxNamespacedName,
  NewExpression,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.generated.js";
import type { EntityNameExpression } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.js";

export type CallLikeExpression = CallExpression | NewExpression | TaggedTemplateExpression | Decorator | JsxCallLike | InstanceofExpression;

export type DeclarationName =
  | PropertyName
  | JsxAttributeName
  | StringLiteralLikeNode
  | TsgoElementAccessExpression
  | BindingPattern
  | EntityNameExpression;

export interface JsxTagNamePropertyAccess extends PropertyAccessExpression {
  readonly expression: Identifier | ThisExpression | JsxTagNamePropertyAccess;
}

export type JsxTagNameExpression = Identifier | ThisExpression | JsxTagNamePropertyAccess | JsxNamespacedName;

/*
 * Positions tsgo types more loosely than the `typescript` package. The parser
 * only ever puts the narrower node there, so ts-morph's accessors keep their
 * precise return types by restating the shape here.
 */
import type {
  ForInStatement as TsgoForInStatement,
  ForOfStatement as TsgoForOfStatement,
  ForStatement as TsgoForStatement,
  JSDocParameterTag as TsgoJSDocParameterTag,
  JSDocPropertyTag as TsgoJSDocPropertyTag,
  JSDocTypeExpression,
  JSDocTypeTag as TsgoJSDocTypeTag,
  QuestionDotToken,
  TaggedTemplateExpression as TsgoTaggedTemplateExpression,
  TypeNode,
  TypeNodeBase,
  UnaryExpressionBase,
  UpdateExpressionBase,
  VariableDeclarationList as TsgoVariableDeclarationList,
  VariableStatement,
} from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.generated.js";
import type { NodeArray } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.js";

export interface PrefixUnaryExpression extends UpdateExpressionBase {
  readonly kind: SyntaxKindEnum.PrefixUnaryExpression;
  readonly operator:
    | SyntaxKindEnum.PlusToken
    | SyntaxKindEnum.MinusToken
    | SyntaxKindEnum.TildeToken
    | SyntaxKindEnum.ExclamationToken
    | SyntaxKindEnum.PlusPlusToken
    | SyntaxKindEnum.MinusMinusToken;
  readonly operand: UnaryExpressionBase;
}

export interface PostfixUnaryExpression extends UpdateExpressionBase {
  readonly kind: SyntaxKindEnum.PostfixUnaryExpression;
  readonly operand: LeftHandSideExpression;
  readonly operator: SyntaxKindEnum.PlusPlusToken | SyntaxKindEnum.MinusMinusToken;
}

export interface TaggedTemplateExpression extends Omit<TsgoTaggedTemplateExpression, "tag"> {
  readonly tag: LeftHandSideExpression;
}

export interface LiteralTypeNode extends TypeNodeBase {
  readonly kind: SyntaxKindEnum.LiteralType;
  readonly literal: NullLiteral | BooleanLiteral | LiteralExpression | PrefixUnaryExpression;
}

/** tsgo also allows a `MissingDeclaration` here, which is only ever produced for erroneous code. */
export type ForInitializer = VariableDeclarationList | Expression;

/**
 * Note that tsgo gives every node a `parent: Node`, so unlike the `typescript`
 * package it does not narrow parents per node type. This one is restated
 * because `Node#getParent()` on a declaration list is a common enough call that
 * losing the union would be felt; every other node type's parent is `Node`.
 */
export interface VariableDeclarationList extends Omit<TsgoVariableDeclarationList, "parent"> {
  readonly parent: VariableStatement | ForStatement | ForOfStatement | ForInStatement;
}

export interface ForStatement extends Omit<TsgoForStatement, "initializer"> {
  readonly initializer?: ForInitializer;
}

export interface ForInStatement extends Omit<TsgoForInStatement, "initializer"> {
  readonly initializer: ForInitializer;
}

export interface ForOfStatement extends Omit<TsgoForOfStatement, "initializer"> {
  readonly initializer: ForInitializer;
}

export interface JSDocParameterTag extends Omit<TsgoJSDocParameterTag, "typeExpression"> {
  readonly typeExpression?: JSDocTypeExpression;
}

export interface JSDocPropertyTag extends Omit<TsgoJSDocPropertyTag, "typeExpression"> {
  readonly typeExpression?: JSDocTypeExpression;
}

export interface JSDocTypeTag extends Omit<TsgoJSDocTypeTag, "typeExpression"> {
  readonly typeExpression: JSDocTypeExpression;
}

export type JSDocPropertyLikeTag = JSDocParameterTag | JSDocPropertyTag;


export interface SuperPropertyAccessExpression extends PropertyAccessExpression {
  readonly expression: TsgoSuperExpression;
}

export interface SuperElementAccessExpression extends ElementAccessExpression {
  readonly expression: TsgoSuperExpression;
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

/**
 * Breaking change: `kind` and `displayParts` are gone. tsgo reports an
 * implementation as a file span and nothing else.
 */
export interface ImplementationLocation extends DocumentSpan {
}

export interface ReferenceEntry extends DocumentSpan {
  isWriteAccess: boolean;
  isInString?: true;
}

export interface ReferencedSymbolEntry extends ReferenceEntry {
  isDefinition: boolean;
}

/**
 * What kind of program element a definition names.
 *
 * Breaking change: this is a const object rather than a string enum, and only
 * the members ts-morph can still produce are declared. tsgo does not classify
 * definitions at all, so the kind is derived from the definition symbol's flags;
 * the `typescript` package's remaining members (`primitiveType`, `jsxAttribute`,
 * `label`, `directory`, `string`, `keyword`, …) have no source of truth here.
 * The declared values are unchanged from the `typescript` package.
 */
export const ScriptElementKind = {
  unknown: "",
  alias: "alias",
  class: "class",
  constElement: "const",
  constructorImplementationElement: "constructor",
  enumElement: "enum",
  enumMemberElement: "enum member",
  functionElement: "function",
  interfaceElement: "interface",
  letElement: "let",
  memberFunctionElement: "method",
  memberGetAccessorElement: "getter",
  memberSetAccessorElement: "setter",
  memberVariableElement: "property",
  moduleElement: "module",
  parameterElement: "parameter",
  typeElement: "type",
  typeParameterElement: "type parameter",
  variableElement: "var",
} as const;
export type ScriptElementKind = typeof ScriptElementKind[keyof typeof ScriptElementKind];

/**
 * Breaking change: `displayParts` is gone. tsgo does not build the highlighted
 * signature text the `typescript` package returned alongside a definition.
 */
export interface ReferencedSymbolDefinitionInfo extends DefinitionInfo {
}

export interface ReferencedSymbol {
  definition: ReferencedSymbolDefinitionInfo;
  references: readonly ReferencedSymbolEntry[];
}

export interface RenameLocation extends DocumentSpan {
  readonly prefixText?: string;
  readonly suffixText?: string;
}

export interface CodeAction {
  description: string;
  changes: FileTextChanges[];
}

/**
 * Breaking change: `fixName`, `fixId` and `fixAllDescription` are gone. tsgo
 * returns a description and the edits, and does not group fixes into fix-alls,
 * so there is no id to report or to feed back in.
 */
export interface CodeFixAction extends CodeAction {
}

/*
 * Emit output comes straight from tsgo. Note that `outputFiles` is a
 * `ReadonlyMap` keyed by output path, not an array, and an `EmitOutputFile`
 * carries only its text and the source file it came from — tsgo does not model a
 * byte order mark at all.
 */
export type { EmitOutput, EmitOutputFile as OutputFile } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/types.js";

/*
 * There is no separate `DiagnosticMessageChain`: tsgo chains diagnostics by
 * nesting `Diagnostic`s under `messageChain`, so a chain element is a
 * `Diagnostic` with `text` (not `messageText`) and no `next`.
 */

/**
 * Editor and user preferences accepted by the language service operations.
 *
 * Breaking change: these list what tsgo actually reads. An index signature would
 * accept every option the `typescript` package used to define, none of which
 * tsgo can honour, turning a loud breaking change into a silent no-op.
 */
export interface UserPreferences {
  readonly quotePreference?: "auto" | "double" | "single";
  readonly providePrefixAndSuffixTextForRename?: boolean;
}

/**
 * Formatting settings, as accepted by the formatter.
 *
 * Breaking change: tsgo's formatter takes only what {@link EditorSettings}
 * declares, so this adds nothing. The `typescript` package's several dozen
 * `insertSpace…` / `placeOpenBraceOnNewLine…` / `semicolons` options are gone.
 */
export interface FormatCodeSettings extends EditorSettings {
}
