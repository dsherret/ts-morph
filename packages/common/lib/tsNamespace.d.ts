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
export { DiagnosticCategory } from "./tsgo/enums/diagnosticCategory.enum";
export { LanguageVariant } from "./tsgo/enums/languageVariant.enum";
export { ModifierFlags } from "./tsgo/enums/modifierFlags.enum";
export { ModuleKind } from "./tsgo/enums/moduleKind.enum";
export { ModuleResolutionKind } from "./tsgo/enums/moduleResolutionKind.enum";
export { NodeFlags } from "./tsgo/enums/nodeFlags.enum";
export { ObjectFlags } from "./tsgo/enums/objectFlags.enum";
export { ScriptKind } from "./tsgo/enums/scriptKind.enum";
export { ScriptTarget } from "./tsgo/enums/scriptTarget.enum";
export { SymbolFlags } from "./tsgo/enums/symbolFlags.enum";
export { SyntaxKind } from "./tsgo/enums/syntaxKind.enum";
export { TokenFlags } from "./tsgo/enums/tokenFlags.enum";
export { TypeFlags } from "./tsgo/enums/typeFlags.enum";
import { NewLineKind as TsgoNewLineKind } from "./tsgo/enums/newLineKind.enum";
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
export declare const NewLineKind: typeof TsgoNewLineKind & {
    readonly CarriageReturnLineFeed: TsgoNewLineKind.CRLF;
    readonly LineFeed: TsgoNewLineKind.LF;
};
export type NewLineKind = TsgoNewLineKind;
export type * from "./tsgo/ast/ast";
export * from "./tsgo/ast/is";
export { createScanner, getLeadingCommentRanges, getShebang, getTrailingCommentRanges, isIdentifierText, skipTrivia, tokenToString, } from "./tsgo/ast/scanner";
export { escapeLeadingUnderscores, formatSyntaxKind, unescapeLeadingUnderscores, } from "./tsgo/ast/utils";
export { addSyntheticLeadingComment, addSyntheticTrailingComment, getSyntheticLeadingComments, getSyntheticTrailingComments, setSyntheticLeadingComments, setSyntheticTrailingComments, } from "./tsgo/ast/comments";
export type { SynthesizedComment } from "./tsgo/ast/comments";
export { visitEachChild, visitNode, visitNodes } from "./tsgo/ast/visitor";
export type { Visitor } from "./tsgo/ast/visitor";
/**
 * The node factory, adapted to the shape ts-morph's callers expect.
 *
 * tsgo ships a complete factory of free `createX`/`updateX` functions. Three
 * things differ from the object `typescript` handed a transformer, and this
 * reconciles them:
 *
 *   - A name is always a node there. Classic accepted a bare string almost
 *     everywhere a name is taken, so a string argument is turned into an
 *     identifier before the call, except in the functions whose arguments really
 *     are text.
 *   - The literal creators take token flags. Classic did not have them, so they
 *     default to none.
 *   - `updateX` builds a fresh node instead of re-ranging the original, so it
 *     loses the position the node held and with it the comments and doc comments
 *     the printer reads out of the file. Each `updateX` therefore carries the
 *     original's range and parent over, which is what `factory.update()` did.
 */
import type { Identifier as TsgoIdentifier } from "./tsgo/ast/ast";
import * as generatedFactory from "./tsgo/ast/factory.generated";
import { TokenFlags as TsgoTokenFlags } from "./tsgo/enums/tokenFlags.enum";
type GeneratedFactory = typeof generatedFactory;
/** Widens the parameters that name a node so a bare string is accepted. */
type AcceptsNames<T> = T extends (...args: infer TArgs) => infer TReturn ? (...args: NameArgs<TArgs>) => TReturn : T;
type NameArgs<TArgs extends readonly unknown[]> = {
    [K in keyof TArgs]: [TsgoIdentifier] extends [TArgs[K]] ? TArgs[K] | string : TArgs[K];
};
/** The literal creators, whose token flags classic TypeScript did not have. */
interface OptionalTokenFlags {
    createStringLiteral(text: string, tokenFlags?: TsgoTokenFlags): ReturnType<GeneratedFactory["createStringLiteral"]>;
    createNumericLiteral(text: string, tokenFlags?: TsgoTokenFlags): ReturnType<GeneratedFactory["createNumericLiteral"]>;
    createBigIntLiteral(text: string, tokenFlags?: TsgoTokenFlags): ReturnType<GeneratedFactory["createBigIntLiteral"]>;
    createRegularExpressionLiteral(text: string, tokenFlags?: TsgoTokenFlags): ReturnType<GeneratedFactory["createRegularExpressionLiteral"]>;
}
/** The names of the functions whose string arguments really are text. */
type TextTaking = Extract<"createIdentifier" | "createPrivateIdentifier" | "createStringLiteral" | "createNumericLiteral" | "createBigIntLiteral" | "createRegularExpressionLiteral" | "createNoSubstitutionTemplateLiteral" | "createTemplateHead" | "createTemplateMiddle" | "createTemplateTail" | "createJsxText" | "createJSDocText" | "createJSDocLink" | "createJSDocLinkPlain" | "createJSDocLinkCode" | "createSourceFile", keyof GeneratedFactory>;
export type NodeFactory = {
    [K in Exclude<keyof GeneratedFactory, TextTaking | keyof OptionalTokenFlags>]: K extends `create${string}` | `update${string}` ? AcceptsNames<GeneratedFactory[K]> : GeneratedFactory[K];
} & {
    [K in Exclude<TextTaking, keyof OptionalTokenFlags>]: GeneratedFactory[K];
} & OptionalTokenFlags;
/** The factory a transform hands to its visitor. */
export declare const factory: NodeFactory;
import type { CompilerOptions as TsgoCompilerOptions } from "./tsgo/api/compilerOptions";
/**
 * Compiler options, as tsgo parses and reports them.
 *
 * `configFilePath` is set by tsgo when the options come from a tsconfig, but its
 * generated TypeScript declaration omits it, so it is added back here.
 */
export interface CompilerOptions extends TsgoCompilerOptions {
    configFilePath?: string;
}
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
export declare const EmitHint: {
    readonly SourceFile: 0;
    readonly Expression: 1;
    readonly IdentifierName: 2;
    readonly MappedTypeParameter: 3;
    readonly Unspecified: 4;
    readonly EmbeddedStatement: 5;
    readonly JsxAttributeValue: 6;
    readonly ImportTypeNodeAttributes: 7;
};
export type EmitHint = typeof EmitHint[keyof typeof EmitHint];
/** How the formatter indents a new line. */
export declare const IndentStyle: {
    readonly None: 0;
    readonly Block: 1;
    readonly Smart: 2;
};
export type IndentStyle = typeof IndentStyle[keyof typeof IndentStyle];
/**
 * Formatting settings, as accepted by the formatter.
 *
 * Every member is read by tsgo's formatter: `tabSize` and `convertTabsToSpaces`
 * shape the indentation text, `indentSize` is the step it grows by,
 * `indentStyle` picks between no, block and smart indentation, and
 * `newLineCharacter` is the line ending inserted text is written with. Note that
 * the wire form of `convertTabsToSpaces` is tsgo's `insertSpaces` — the two mean
 * the same thing.
 *
 * Breaking change: `baseIndentSize` is not accepted. tsgo's formatter has the
 * field but the API does not carry it, as nothing in ts-morph set it.
 */
export interface EditorSettings {
    tabSize?: number;
    indentSize?: number;
    convertTabsToSpaces?: boolean;
    indentStyle?: IndentStyle;
    newLineCharacter?: string;
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
export { NodeBuilderFlags, NodeBuilderFlags as TypeFormatFlags, } from "./tsgo/enums/nodeBuilderFlags.enum";
import type { Node } from "./tsgo/ast/ast";
/**
 * Visits each stored child of a node, mirroring the free `ts.forEachChild`.
 * Tokens and syntax lists are not stored in the tree; use {@link getChildren}
 * for those.
 */
export declare function forEachChild<T>(node: Node, cbNode: (node: Node) => T | undefined): T | undefined;
/** Gets the text of a JS doc comment, flattening links to their text. */
export { getTextOfJSDocComment } from "./tsgo/ast/jsdoc";
/** tsgo names this after the declaration union it narrows to. */
export { isClassLikeDeclaration as isClassLike } from "./tsgo/ast/is";
import type { Decorator as TsgoDecorator, ExclamationToken as ExclamationTokenType, ModifiersBase, QuestionToken as QuestionTokenType } from "./tsgo/ast/ast.generated";
import { ModifierFlags as ModifierFlagsValue } from "./tsgo/enums/modifierFlags.enum";
/** Whether the node is one that can carry decorators — i.e. one that has a modifier list. */
export declare function canHaveDecorators(node: Node): node is ModifiersBase;
/** The node's decorators, which tsgo stores interleaved with its modifiers. */
export declare function getDecorators(node: Node): readonly TsgoDecorator[] | undefined;
/** Whether the node is a JS doc comment or a part of one. */
export declare function isJSDocCommentContainingNode(node: Node): boolean;
/**
 * The node's modifier flags, including those a variable declaration inherits
 * from the statement that declares it.
 */
export declare function getCombinedModifierFlags(node: Node): ModifierFlagsValue;
/**
 * The node's question token.
 *
 * tsgo collapsed the separate `questionToken` and `exclamationToken` fields of a
 * class or object member into a single `postfixToken`, keeping a dedicated
 * `questionToken` only where nothing else can appear (parameters, mapped types).
 * This reads whichever of the two the node has.
 */
export declare function getQuestionToken(node: Node): QuestionTokenType | undefined;
/** The node's exclamation token, from either `exclamationToken` or `postfixToken`. */
export declare function getExclamationToken(node: Node): ExclamationTokenType | undefined;
import type { PrintNodeOptions } from "./tsgo/api/sync/api";
import type { SourceFile as TsgoSourceFile } from "./tsgo/ast/index";
import { ScriptKind as ScriptKindValue } from "./tsgo/enums/scriptKind.enum";
/**
 * Parses text into a source file that belongs to no project of the caller's.
 *
 * tsgo parses on the server and every server-side parse belongs to a project, so
 * there is no free-standing parser to call. What there is instead is a project
 * nobody else uses: the scratch session below, which holds only the files handed
 * to this function. Parsing is the only thing asked of it, so it opens no
 * checker, resolves no modules and loads no lib files.
 *
 * Breaking changes against the `typescript` package's `createSourceFile`:
 *
 *   - `languageVersion` is ignored. tsgo records no per-file script target —
 *     `ast.SourceFileParseOptions` carries only the file name, its path and the
 *     module-detection options — and its scanner always scans at the latest
 *     target.
 *   - `setParentNodes` is ignored. tsgo's parser always links parents, so a node
 *     from here always has one.
 *   - The result is valid until {@link scratchFileLimit} further calls have been
 *     made, at which point its path is reparsed and its nodes go stale.
 */
export declare function createSourceFile(fileName: string, sourceText: string, languageVersion?: unknown, setParentNodes?: boolean, scriptKind?: ScriptKindValue): TsgoSourceFile;
export type { PrintNodeOptions };
/**
 * Prints a node with the compiler's printer, outside any project of the caller's.
 *
 * Printing is the one compiler service that needs no program: the node travels to
 * the server as its own encoded subtree and is printed there, so which session
 * does the printing is not observable. This uses the same scratch session
 * {@link createSourceFile} parses in, which is why a node parsed by that function
 * can be printed without a project ever being opened.
 *
 * Comments and original token text are read off `options.sourceText`, so a node
 * printed without it prints structurally, without its comments.
 */
export declare function printNode(node: Node, options?: PrintNodeOptions): string;
/**
 * The compiler's version, e.g. `7.1.0-dev`.
 *
 * This is the Go compiler's own version, read from the session rather than from a
 * `package.json`, so it says what is actually doing the compiling.
 *
 * Breaking change: this is a function where the `typescript` package had a
 * `version` constant. The version comes from the compiler, and reaching it means
 * having a session to ask — which is not something to do at module load.
 */
export declare function getVersion(): string;
export type { Diagnostic } from "./tsgo/api/sync/types";
import type { Diagnostic as TsgoDiagnostic } from "./tsgo/api/sync/types";
/**
 * A diagnostic that belongs to a file.
 *
 * tsgo has no distinct type for this: every `Diagnostic` carries `pos` and
 * `end`, and only `fileName` may be absent, so locating a diagnostic is exactly
 * a matter of whether it names a file.
 */
export type DiagnosticWithLocation = TsgoDiagnostic & {
    readonly fileName: string;
};
/**
 * The file system questions module resolution asks.
 *
 * tsgo resolves modules inside the compiler and answers those questions through
 * its own delegated file system, so it declares no such interface. The shape is
 * kept because it is ts-morph's public contract for
 * `Project#getModuleResolutionHost()`, and it is the classic
 * `ts.ModuleResolutionHost` verbatim.
 */
export interface ModuleResolutionHost {
    fileExists(fileName: string): boolean;
    readFile(fileName: string, encoding?: string): string | undefined;
    trace?(s: string): void;
    directoryExists?(directoryName: string): boolean;
    /**
     * Resolves a symlink to its realpath. Used to compute the shortest path to a
     * module, and to detect the same file reached by two paths.
     */
    realpath?(path: string): string;
    getCurrentDirectory?(): string;
    getDirectories?(path: string): string[];
}
/**
 * A run of text in a rendered documentation comment or JSDoc tag.
 *
 * Breaking change: tsgo renders documentation as a single plain string rather
 * than a classified part list, so every part produced from it has kind `"text"`.
 * The shape is kept because it is ts-morph's public contract for
 * `Signature#getDocumentationComments()` and `JSDocTagInfo#getText()`.
 */
export interface SymbolDisplayPart {
    text: string;
    kind: string;
}
import type { Program as TsgoProgram } from "./tsgo/api/sync/api";
/**
 * Every diagnostic the compiler reports before an emit, optionally for one file.
 *
 * tsgo has no `getPreEmitDiagnostics`: the program reports each category
 * separately, so this concatenates them in the order the `typescript` package
 * used to.
 */
export declare function getPreEmitDiagnostics(program: TsgoProgram, sourceFile?: {
    readonly fileName: string;
}): TsgoDiagnostic[];
export type { FreshableType, NodeHandle, Program, ReferencedSymbolEntry as CompilerReferencedSymbolEntry, Signature, Symbol, } from "./tsgo/api/sync/api";
/** tsgo names the type checker `Checker`. */
export type { Checker as TypeChecker } from "./tsgo/api/sync/api";
/**
 * The compiler object the language service operations hang off.
 *
 * Breaking change: tsgo has no `LanguageService`. Formatting, organize-imports,
 * rename, definitions, implementations and code fixes are methods on the
 * session's project, and the program and checker hang off it too, so the tsgo
 * `Project` is what `LanguageService#compilerObject` now returns.
 */
export type { Project as LanguageService } from "./tsgo/api/sync/api";
/**
 * Which files an emit is restricted to. Replaces the `typescript` package's
 * `emitOnlyDtsFiles` boolean, which had no way to say "JS only".
 */
export { EmitOnly } from "./tsgo/enums/emitOnly.enum";
export type { DocumentIdentifier, FileSpan, FileTextEdits, FormattingOptions, OrganizeImportsMode, QuotePreference, TextEdit, } from "./tsgo/api/proto";
export type { EmitResult, InterfaceType, InterfaceType as GenericType, IntersectionType, JSDocTagInfo, LiteralType, NumberLiteralType, ObjectType, StringLiteralType, TemplateLiteralType, TupleType, Type, TypeParameter, TypeReference, UnionOrIntersectionType, UnionType, } from "./tsgo/api/sync/types";
export type { IterationStatementBase as IterationStatement, JSDocTypeBase as JSDocType, MemberExpressionBase as MemberExpression, MethodSignatureDeclaration as MethodSignature, NodeWithTypeArgumentsBase as NodeWithTypeArguments, PrimaryExpressionBase as PrimaryExpression, PropertySignatureDeclaration as PropertySignature, UnaryExpressionBase as UnaryExpression, UpdateExpressionBase as UpdateExpression, } from "./tsgo/ast/ast.generated";
export type { CommentKind, CommentRange } from "./tsgo/ast/scanner";
import type { ArrayLiteralExpression, AssignmentOperatorToken, BinaryExpression, ElementAccessExpression, EqualsToken, Identifier, LeftHandSideExpression, ObjectLiteralExpression, PropertyAccessExpression, StringLiteral, SuperExpression as TsgoSuperExpression } from "./tsgo/ast/ast.generated";
export type { ClassLikeDeclaration as ClassLikeDeclarationBase } from "./tsgo/ast/ast.generated";
import type { ConstructorTypeNode, FunctionTypeNode, JsxOpeningFragment, JsxOpeningLikeElement, Token } from "./tsgo/ast/ast.generated";
import type { SyntaxKind as SyntaxKindEnum } from "./tsgo/enums/syntaxKind.enum";
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
import type { BigIntLiteral, ComputedPropertyName, DeclarationBase as TsgoDeclarationBase, Expression, MemberExpressionBase, NamedTupleMember, NodeWithTypeArgumentsBase, NumericLiteral, PrimaryExpressionBase, PrivateIdentifier, RegularExpressionLiteral, TemplateExpression, JSDocTagBase as TsgoJSDocTagBase, TemplateLiteralLikeNodeBase as TsgoTemplateLiteralLikeNodeBase, TypeNodeBase as TsgoTypeNodeBase, TypeParameterDeclaration } from "./tsgo/ast/ast.generated";
import type { NodeArray as TsgoNodeArray } from "./tsgo/ast/ast";
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
 * tsgo types a template tag's constraint as a plain `Node`, and as always
 * present. It is a `JSDocTypeExpression` when there is one — verified at
 * runtime — so the shape is restated rather than leaving every caller to cast.
 */
export interface JSDocTemplateTag extends TsgoJSDocTagBase {
    readonly kind: SyntaxKindEnum.JSDocTemplateTag;
    readonly constraint?: JSDocTypeExpression;
    readonly typeParameters: TsgoNodeArray<TypeParameterDeclaration>;
}
/**
 * tsgo types a tuple's elements as plain type nodes. A named member
 * (`[a: string]`) is one at runtime and is returned as one, but the declared
 * type no longer says so, which would leave `TupleTypeNode#getElements()`
 * unable to be narrowed to `NamedTupleMember`. The real fix is in the fork's
 * generated AST.
 */
export interface TupleTypeNode extends TsgoTypeNodeBase {
    readonly kind: SyntaxKindEnum.TupleType;
    readonly elements: TsgoNodeArray<TypeNode | NamedTupleMember>;
}
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
export type PropertyName = Identifier | StringLiteral | NoSubstitutionTemplateLiteral | NumericLiteral | ComputedPropertyName | PrivateIdentifier | BigIntLiteral;
export interface ExpressionWithTypeArguments extends MemberExpressionBase, NodeWithTypeArgumentsBase {
    readonly kind: SyntaxKindEnum.ExpressionWithTypeArguments;
    readonly expression: Expression;
}
import type { BindingPattern, CallExpression, Decorator, ElementAccessExpression as TsgoElementAccessExpression, JsxAttributeName, JsxNamespacedName, NewExpression } from "./tsgo/ast/ast.generated";
import type { EntityNameExpression } from "./tsgo/ast/ast";
export type CallLikeExpression = CallExpression | NewExpression | TaggedTemplateExpression | Decorator | JsxCallLike | InstanceofExpression;
export type DeclarationName = PropertyName | JsxAttributeName | StringLiteralLikeNode | TsgoElementAccessExpression | BindingPattern | EntityNameExpression;
export interface JsxTagNamePropertyAccess extends PropertyAccessExpression {
    readonly expression: Identifier | ThisExpression | JsxTagNamePropertyAccess;
}
export type JsxTagNameExpression = Identifier | ThisExpression | JsxTagNamePropertyAccess | JsxNamespacedName;
import type { ForInStatement as TsgoForInStatement, ForOfStatement as TsgoForOfStatement, ForStatement as TsgoForStatement, JSDocParameterTag as TsgoJSDocParameterTag, JSDocPropertyTag as TsgoJSDocPropertyTag, JSDocTypeExpression, JSDocTypeTag as TsgoJSDocTypeTag, TaggedTemplateExpression as TsgoTaggedTemplateExpression, TypeNode, TypeNodeBase, UnaryExpressionBase, UpdateExpressionBase, VariableDeclarationList as TsgoVariableDeclarationList, VariableStatement } from "./tsgo/ast/ast.generated";
export interface PrefixUnaryExpression extends UpdateExpressionBase {
    readonly kind: SyntaxKindEnum.PrefixUnaryExpression;
    readonly operator: SyntaxKindEnum.PlusToken | SyntaxKindEnum.MinusToken | SyntaxKindEnum.TildeToken | SyntaxKindEnum.ExclamationToken | SyntaxKindEnum.PlusPlusToken | SyntaxKindEnum.MinusMinusToken;
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
export declare const ScriptElementKind: {
    readonly unknown: "";
    readonly alias: "alias";
    readonly class: "class";
    readonly constElement: "const";
    readonly constructorImplementationElement: "constructor";
    readonly enumElement: "enum";
    readonly enumMemberElement: "enum member";
    readonly functionElement: "function";
    readonly interfaceElement: "interface";
    readonly letElement: "let";
    readonly memberFunctionElement: "method";
    readonly memberGetAccessorElement: "getter";
    readonly memberSetAccessorElement: "setter";
    readonly memberVariableElement: "property";
    readonly moduleElement: "module";
    readonly parameterElement: "parameter";
    readonly typeElement: "type";
    readonly typeParameterElement: "type parameter";
    readonly variableElement: "var";
};
export type ScriptElementKind = typeof ScriptElementKind[keyof typeof ScriptElementKind];
export interface ReferencedSymbolDefinitionInfo extends DefinitionInfo {
    displayParts: SymbolDisplayPart[];
}
/**
 * One classified piece of the text that labels a symbol.
 *
 * Breaking change: `kind` is a plain string. tsgo classifies a run with an LSP
 * classification name rather than the `typescript` package's `SymbolDisplayPartKind`,
 * and the two vocabularies do not line up member for member.
 */
export interface SymbolDisplayPart {
    text: string;
    kind: string;
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
/**
 * The result of applying one fix id across a whole file.
 *
 * Breaking change: `commands` is gone. tsgo's combined fixes are edits only.
 */
export interface CombinedCodeActions {
    changes: FileTextChanges[];
}
export type { EmitOutput, EmitOutputFile as OutputFile } from "./tsgo/api/sync/types";
/**
 * Called for each output file in place of writing it.
 *
 * Breaking change: `sourceFiles` holds at most one file. tsgo names a single
 * originating source file per output rather than the whole set that fed it.
 */
export type WriteFileCallback = (fileName: string, text: string, writeByteOrderMark: boolean, onError?: (message: string) => void, sourceFiles?: readonly TsgoSourceFile[]) => void;
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
 * Breaking change: the API carries only what {@link EditorSettings} declares, so
 * this adds nothing. The `typescript` package's several dozen `insertSpace…` /
 * `placeOpenBraceOnNewLine…` / `semicolons` options are gone.
 */
export interface FormatCodeSettings extends EditorSettings {
}
