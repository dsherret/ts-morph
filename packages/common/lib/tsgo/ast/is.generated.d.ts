import { SyntaxKind } from "../enums/syntaxKind.enum";
import type { NodeHandle as AsyncNodeHandle } from "../api/async/api";
import type { NodeHandle as SyncNodeHandle } from "../api/sync/api";
import type { AbstractKeyword, AccessExpression, AccessorDeclaration, AccessorKeyword, AdditiveOperator, AdditiveOperatorOrHigher, AnyImportSyntax, ArrayBindingElement, ArrayBindingPattern, ArrayDestructuringAssignment, ArrayLiteralExpression, ArrayTypeNode, ArrowFunction, AsExpression, AssertionExpression, AssertKeyword, AssertsKeyword, AssignmentOperator, AssignmentOperatorOrHigher, AssignmentOperatorToken, AsteriskToken, AsyncKeyword, AwaitExpression, AwaitKeyword, BigIntLiteral, BinaryExpression, BinaryOperator, BinaryOperatorToken, BindingElement, BindingName, BitwiseOperator, BitwiseOperatorOrHigher, Block, BooleanLiteral, BreakOrContinueStatement, BreakStatement, CallExpression, CallLikeExpression, CallOrNewExpression, CallSignatureDeclaration, CaseBlock, CaseClause, CaseKeyword, CatchClause, ClassDeclaration, ClassExpression, ClassLikeDeclaration, ClassStaticBlockDeclaration, ColonToken, CompoundAssignmentOperator, ComputedPropertyName, ConditionalExpression, ConditionalTypeNode, ConstKeyword, ConstructorDeclaration, ConstructorTypeNode, ConstructSignatureDeclaration, ContinueStatement, DebuggerStatement, DeclarationName, DeclareKeyword, Decorator, DefaultClause, DefaultKeyword, DeleteExpression, DestructuringAssignment, DoStatement, DotDotDotToken, DotToken, ElementAccessExpression, EmptyStatement, EndOfFile, EntityName, EnumDeclaration, EnumMember, EqualityOperator, EqualityOperatorOrHigher, EqualsGreaterThanToken, EqualsToken, ExclamationToken, ExponentiationOperator, ExportAssignment, ExportDeclaration, ExportKeyword, ExportSpecifier, ExpressionStatement, ExpressionWithTypeArguments, ExternalModuleReference, FalseLiteral, ForInStatement, ForOfStatement, ForStatement, FunctionBody, FunctionDeclaration, FunctionExpression, FunctionLikeDeclaration, FunctionTypeNode, GetAccessorDeclaration, HeritageClause, HeritageClauseElement, Identifier, IfStatement, ImportAttribute, ImportAttributeName, ImportAttributes, ImportClause, ImportClauseOrBindingPattern, ImportDeclaration, ImportEqualsDeclaration, ImportExpression, ImportPhaseModifierSyntaxKind, ImportSpecifier, ImportTypeNode, IndexedAccessTypeNode, IndexSignatureDeclaration, InferTypeNode, InKeyword, InterfaceDeclaration, IntersectionTypeNode, JSDoc, JSDocAllType, JSDocAugmentsTag, JSDocCallbackTag, JSDocComment, JSDocDeprecatedTag, JSDocFullName, JSDocImplementsTag, JSDocImportTag, JSDocLink, JSDocLinkCode, JSDocLinkPlain, JSDocNameReference, JSDocNonNullableType, JSDocNullableType, JSDocOptionalType, JSDocOverloadTag, JSDocOverrideTag, JSDocParameterTag, JSDocPrivateTag, JSDocPropertyTag, JSDocProtectedTag, JSDocPublicTag, JSDocReadonlyTag, JSDocReturnTag, JSDocSatisfiesTag, JSDocSeeTag, JSDocSignature, JSDocTemplateTag, JSDocText, JSDocThisTag, JSDocThrowsTag, JSDocTypedefTag, JSDocTypeExpression, JSDocTypeLiteral, JSDocTypeTag, JSDocUnknownTag, JSDocVariadicType, JsxAttribute, JsxAttributeLike, JsxAttributeName, JsxAttributes, JsxAttributeValue, JsxChild, JsxClosingElement, JsxClosingFragment, JsxElement, JsxExpression, JsxFragment, JsxNamespacedName, JsxOpeningElement, JsxOpeningFragment, JsxOpeningLikeElement, JsxSelfClosingElement, JsxSpreadAttribute, JsxText, JsxTokenSyntaxKind, KeywordExpression, KeywordExpressionSyntaxKind, KeywordTypeNode, KeywordTypeSyntaxKind, LabeledStatement, LiteralExpression, LiteralLikeNode, LiteralToken, LiteralTypeNode, LogicalOperator, LogicalOperatorOrHigher, LogicalOrCoalescingAssignmentOperator, MappedTypeNode, MemberName, MetaProperty, MethodDeclaration, MethodSignatureDeclaration, MinusToken, MissingDeclaration, Modifier, ModifierLike, ModifierSyntaxKind, ModuleBlock, ModuleBody, ModuleDeclaration, ModuleExportName, ModuleName, ModuleReference, MultiplicativeOperator, MultiplicativeOperatorOrHigher, NamedExportBindings, NamedExports, NamedImportBindings, NamedImports, NamedImportsOrExports, NamedTupleMember, NamespaceExport, NamespaceExportDeclaration, NamespaceImport, NewExpression, Node, NonNullExpression, NoSubstitutionTemplateLiteral, NotEmittedStatement, NotEmittedTypeElement, NullLiteral, NumericLiteral, NumericOrStringLikeLiteral, ObjectBindingPattern, ObjectDestructuringAssignment, ObjectLiteralElementLike, ObjectLiteralExpression, ObjectLiteralLikeNode, ObjectTypeDeclaration, OmittedExpression, OptionalTypeNode, OutKeyword, OverrideKeyword, ParameterDeclaration, ParenthesizedExpression, ParenthesizedTypeNode, PartiallyEmittedExpression, PlusToken, PostfixUnaryExpression, PostfixUnaryOperator, PrefixUnaryExpression, PrefixUnaryOperator, PrivateIdentifier, PrivateKeyword, PropertyAccessExpression, PropertyAssignment, PropertyDeclaration, PropertyName, PropertyNameLiteral, PropertySignatureDeclaration, ProtectedKeyword, PseudoLiteralSyntaxKind, PseudoLiteralToken, PublicKeyword, QualifiedName, QuestionDotToken, QuestionToken, ReadonlyKeyword, RegularExpressionLiteral, RelationalOperator, RelationalOperatorOrHigher, RestTypeNode, ReturnStatement, SatisfiesExpression, SemicolonClassElement, SetAccessorDeclaration, ShiftOperator, ShiftOperatorOrHigher, ShorthandPropertyAssignment, SignatureDeclaration, SourceFile, SpreadAssignment, SpreadElement, StaticKeyword, StringLiteral, StringLiteralLikeNode, SuperExpression, SwitchStatement, SyntaxList, SyntheticExpression, SyntheticReferenceExpression, TaggedTemplateExpression, TemplateExpression, TemplateHead, TemplateLiteral, TemplateLiteralLikeNode, TemplateLiteralToken, TemplateLiteralTypeNode, TemplateLiteralTypeSpan, TemplateMiddle, TemplateMiddleOrTail, TemplateSpan, TemplateTail, ThisExpression, ThisTypeNode, ThrowStatement, Token, TriviaSyntaxKind, TrueLiteral, TryStatement, TupleTypeNode, TypeAliasDeclaration, TypeAssertion, TypeLiteralNode, TypeOfExpression, TypeOperatorNode, TypeParameterDeclaration, TypePredicateNode, TypePredicateParameterName, TypeQueryNode, TypeReferenceNode, UnionOrIntersectionTypeNode, UnionTypeNode, VariableDeclaration, VariableDeclarationList, VariableOrParameterDeclaration, VariableOrPropertyDeclaration, VariableStatement, VoidExpression, WhileStatement, WithStatement, YieldExpression } from "./ast";
type NodeHandleLike<out T extends Node> = {
    kind: SyntaxKind;
    resolve(...args: any): any;
};
type SpecializeNodeHandle<T extends NodeHandleLike<Node>, U extends Node> = T extends AsyncNodeHandle<any> ? AsyncNodeHandle<U> & T : SyncNodeHandle<U> & T;
export declare function isToken(node: Node): node is Token;
export declare namespace isToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, Token>;
}
export declare function isIdentifier(node: Node): node is Identifier;
export declare namespace isIdentifier {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, Identifier>;
}
export declare function isPrivateIdentifier(node: Node): node is PrivateIdentifier;
export declare namespace isPrivateIdentifier {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PrivateIdentifier>;
}
export declare function isQualifiedName(node: Node): node is QualifiedName;
export declare namespace isQualifiedName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, QualifiedName>;
}
export declare function isComputedPropertyName(node: Node): node is ComputedPropertyName;
export declare namespace isComputedPropertyName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ComputedPropertyName>;
}
export declare function isDecorator(node: Node): node is Decorator;
export declare namespace isDecorator {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, Decorator>;
}
export declare function isEmptyStatement(node: Node): node is EmptyStatement;
export declare namespace isEmptyStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, EmptyStatement>;
}
export declare function isIfStatement(node: Node): node is IfStatement;
export declare namespace isIfStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, IfStatement>;
}
export declare function isDoStatement(node: Node): node is DoStatement;
export declare namespace isDoStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, DoStatement>;
}
export declare function isWhileStatement(node: Node): node is WhileStatement;
export declare namespace isWhileStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, WhileStatement>;
}
export declare function isForStatement(node: Node): node is ForStatement;
export declare namespace isForStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ForStatement>;
}
export declare function isBreakStatement(node: Node): node is BreakStatement;
export declare namespace isBreakStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, BreakStatement>;
}
export declare function isContinueStatement(node: Node): node is ContinueStatement;
export declare namespace isContinueStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ContinueStatement>;
}
export declare function isReturnStatement(node: Node): node is ReturnStatement;
export declare namespace isReturnStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ReturnStatement>;
}
export declare function isWithStatement(node: Node): node is WithStatement;
export declare namespace isWithStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, WithStatement>;
}
export declare function isSwitchStatement(node: Node): node is SwitchStatement;
export declare namespace isSwitchStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SwitchStatement>;
}
export declare function isCaseBlock(node: Node): node is CaseBlock;
export declare namespace isCaseBlock {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, CaseBlock>;
}
export declare function isThrowStatement(node: Node): node is ThrowStatement;
export declare namespace isThrowStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ThrowStatement>;
}
export declare function isTryStatement(node: Node): node is TryStatement;
export declare namespace isTryStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TryStatement>;
}
export declare function isCatchClause(node: Node): node is CatchClause;
export declare namespace isCatchClause {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, CatchClause>;
}
export declare function isDebuggerStatement(node: Node): node is DebuggerStatement;
export declare namespace isDebuggerStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, DebuggerStatement>;
}
export declare function isLabeledStatement(node: Node): node is LabeledStatement;
export declare namespace isLabeledStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, LabeledStatement>;
}
export declare function isExpressionStatement(node: Node): node is ExpressionStatement;
export declare namespace isExpressionStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ExpressionStatement>;
}
export declare function isBlock(node: Node): node is Block;
export declare namespace isBlock {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, Block>;
}
export declare function isVariableStatement(node: Node): node is VariableStatement;
export declare namespace isVariableStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, VariableStatement>;
}
export declare function isVariableDeclaration(node: Node): node is VariableDeclaration;
export declare namespace isVariableDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, VariableDeclaration>;
}
export declare function isVariableDeclarationList(node: Node): node is VariableDeclarationList;
export declare namespace isVariableDeclarationList {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, VariableDeclarationList>;
}
export declare function isParameterDeclaration(node: Node): node is ParameterDeclaration;
export declare namespace isParameterDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ParameterDeclaration>;
}
export declare function isBindingElement(node: Node): node is BindingElement;
export declare namespace isBindingElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, BindingElement>;
}
export declare function isMissingDeclaration(node: Node): node is MissingDeclaration;
export declare namespace isMissingDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, MissingDeclaration>;
}
export declare function isFunctionDeclaration(node: Node): node is FunctionDeclaration;
export declare namespace isFunctionDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, FunctionDeclaration>;
}
export declare function isClassDeclaration(node: Node): node is ClassDeclaration;
export declare namespace isClassDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ClassDeclaration>;
}
export declare function isClassExpression(node: Node): node is ClassExpression;
export declare namespace isClassExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ClassExpression>;
}
export declare function isHeritageClause(node: Node): node is HeritageClause;
export declare namespace isHeritageClause {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, HeritageClause>;
}
export declare function isInterfaceDeclaration(node: Node): node is InterfaceDeclaration;
export declare namespace isInterfaceDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, InterfaceDeclaration>;
}
export declare function isTypeAliasDeclaration(node: Node): node is TypeAliasDeclaration;
export declare namespace isTypeAliasDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TypeAliasDeclaration>;
}
export declare function isEnumMember(node: Node): node is EnumMember;
export declare namespace isEnumMember {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, EnumMember>;
}
export declare function isEnumDeclaration(node: Node): node is EnumDeclaration;
export declare namespace isEnumDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, EnumDeclaration>;
}
export declare function isModuleBlock(node: Node): node is ModuleBlock;
export declare namespace isModuleBlock {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ModuleBlock>;
}
export declare function isNotEmittedStatement(node: Node): node is NotEmittedStatement;
export declare namespace isNotEmittedStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NotEmittedStatement>;
}
export declare function isNotEmittedTypeElement(node: Node): node is NotEmittedTypeElement;
export declare namespace isNotEmittedTypeElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NotEmittedTypeElement>;
}
export declare function isImportDeclaration(node: Node): node is ImportDeclaration;
export declare namespace isImportDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ImportDeclaration>;
}
export declare function isExternalModuleReference(node: Node): node is ExternalModuleReference;
export declare namespace isExternalModuleReference {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ExternalModuleReference>;
}
export declare function isNamespaceImport(node: Node): node is NamespaceImport;
export declare namespace isNamespaceImport {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NamespaceImport>;
}
export declare function isNamedImports(node: Node): node is NamedImports;
export declare namespace isNamedImports {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NamedImports>;
}
export declare function isExportAssignment(node: Node): node is ExportAssignment;
export declare namespace isExportAssignment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ExportAssignment>;
}
export declare function isNamespaceExportDeclaration(node: Node): node is NamespaceExportDeclaration;
export declare namespace isNamespaceExportDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NamespaceExportDeclaration>;
}
export declare function isNamespaceExport(node: Node): node is NamespaceExport;
export declare namespace isNamespaceExport {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NamespaceExport>;
}
export declare function isNamedExports(node: Node): node is NamedExports;
export declare namespace isNamedExports {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NamedExports>;
}
export declare function isExportSpecifier(node: Node): node is ExportSpecifier;
export declare namespace isExportSpecifier {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ExportSpecifier>;
}
export declare function isCallSignatureDeclaration(node: Node): node is CallSignatureDeclaration;
export declare namespace isCallSignatureDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, CallSignatureDeclaration>;
}
export declare function isConstructSignatureDeclaration(node: Node): node is ConstructSignatureDeclaration;
export declare namespace isConstructSignatureDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ConstructSignatureDeclaration>;
}
export declare function isConstructorDeclaration(node: Node): node is ConstructorDeclaration;
export declare namespace isConstructorDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ConstructorDeclaration>;
}
export declare function isGetAccessorDeclaration(node: Node): node is GetAccessorDeclaration;
export declare namespace isGetAccessorDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, GetAccessorDeclaration>;
}
export declare function isSetAccessorDeclaration(node: Node): node is SetAccessorDeclaration;
export declare namespace isSetAccessorDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SetAccessorDeclaration>;
}
export declare function isIndexSignatureDeclaration(node: Node): node is IndexSignatureDeclaration;
export declare namespace isIndexSignatureDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, IndexSignatureDeclaration>;
}
export declare function isMethodSignatureDeclaration(node: Node): node is MethodSignatureDeclaration;
export declare namespace isMethodSignatureDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, MethodSignatureDeclaration>;
}
export declare function isMethodDeclaration(node: Node): node is MethodDeclaration;
export declare namespace isMethodDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, MethodDeclaration>;
}
export declare function isPropertySignatureDeclaration(node: Node): node is PropertySignatureDeclaration;
export declare namespace isPropertySignatureDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PropertySignatureDeclaration>;
}
export declare function isPropertyDeclaration(node: Node): node is PropertyDeclaration;
export declare namespace isPropertyDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PropertyDeclaration>;
}
export declare function isSemicolonClassElement(node: Node): node is SemicolonClassElement;
export declare namespace isSemicolonClassElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SemicolonClassElement>;
}
export declare function isClassStaticBlockDeclaration(node: Node): node is ClassStaticBlockDeclaration;
export declare namespace isClassStaticBlockDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ClassStaticBlockDeclaration>;
}
export declare function isOmittedExpression(node: Node): node is OmittedExpression;
export declare namespace isOmittedExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, OmittedExpression>;
}
export declare function isKeywordExpression(node: Node): node is KeywordExpression;
export declare namespace isKeywordExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, KeywordExpression>;
}
export declare function isStringLiteral(node: Node): node is StringLiteral;
export declare namespace isStringLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, StringLiteral>;
}
export declare function isNumericLiteral(node: Node): node is NumericLiteral;
export declare namespace isNumericLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NumericLiteral>;
}
export declare function isBigIntLiteral(node: Node): node is BigIntLiteral;
export declare namespace isBigIntLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, BigIntLiteral>;
}
export declare function isRegularExpressionLiteral(node: Node): node is RegularExpressionLiteral;
export declare namespace isRegularExpressionLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, RegularExpressionLiteral>;
}
export declare function isNoSubstitutionTemplateLiteral(node: Node): node is NoSubstitutionTemplateLiteral;
export declare namespace isNoSubstitutionTemplateLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NoSubstitutionTemplateLiteral>;
}
export declare function isBinaryExpression(node: Node): node is BinaryExpression;
export declare namespace isBinaryExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, BinaryExpression>;
}
export declare function isPrefixUnaryExpression(node: Node): node is PrefixUnaryExpression;
export declare namespace isPrefixUnaryExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PrefixUnaryExpression>;
}
export declare function isPostfixUnaryExpression(node: Node): node is PostfixUnaryExpression;
export declare namespace isPostfixUnaryExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PostfixUnaryExpression>;
}
export declare function isYieldExpression(node: Node): node is YieldExpression;
export declare namespace isYieldExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, YieldExpression>;
}
export declare function isArrowFunction(node: Node): node is ArrowFunction;
export declare namespace isArrowFunction {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ArrowFunction>;
}
export declare function isFunctionExpression(node: Node): node is FunctionExpression;
export declare namespace isFunctionExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, FunctionExpression>;
}
export declare function isAsExpression(node: Node): node is AsExpression;
export declare namespace isAsExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AsExpression>;
}
export declare function isSatisfiesExpression(node: Node): node is SatisfiesExpression;
export declare namespace isSatisfiesExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SatisfiesExpression>;
}
export declare function isConditionalExpression(node: Node): node is ConditionalExpression;
export declare namespace isConditionalExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ConditionalExpression>;
}
export declare function isPropertyAccessExpression(node: Node): node is PropertyAccessExpression;
export declare namespace isPropertyAccessExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PropertyAccessExpression>;
}
export declare function isElementAccessExpression(node: Node): node is ElementAccessExpression;
export declare namespace isElementAccessExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ElementAccessExpression>;
}
export declare function isCallExpression(node: Node): node is CallExpression;
export declare namespace isCallExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, CallExpression>;
}
export declare function isNewExpression(node: Node): node is NewExpression;
export declare namespace isNewExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NewExpression>;
}
export declare function isMetaProperty(node: Node): node is MetaProperty;
export declare namespace isMetaProperty {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, MetaProperty>;
}
export declare function isNonNullExpression(node: Node): node is NonNullExpression;
export declare namespace isNonNullExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NonNullExpression>;
}
export declare function isSpreadElement(node: Node): node is SpreadElement;
export declare namespace isSpreadElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SpreadElement>;
}
export declare function isTemplateExpression(node: Node): node is TemplateExpression;
export declare namespace isTemplateExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateExpression>;
}
export declare function isTemplateSpan(node: Node): node is TemplateSpan;
export declare namespace isTemplateSpan {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateSpan>;
}
export declare function isTaggedTemplateExpression(node: Node): node is TaggedTemplateExpression;
export declare namespace isTaggedTemplateExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TaggedTemplateExpression>;
}
export declare function isParenthesizedExpression(node: Node): node is ParenthesizedExpression;
export declare namespace isParenthesizedExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ParenthesizedExpression>;
}
export declare function isArrayLiteralExpression(node: Node): node is ArrayLiteralExpression;
export declare namespace isArrayLiteralExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ArrayLiteralExpression>;
}
export declare function isObjectLiteralExpression(node: Node): node is ObjectLiteralExpression;
export declare namespace isObjectLiteralExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ObjectLiteralExpression>;
}
export declare function isSpreadAssignment(node: Node): node is SpreadAssignment;
export declare namespace isSpreadAssignment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SpreadAssignment>;
}
export declare function isPropertyAssignment(node: Node): node is PropertyAssignment;
export declare namespace isPropertyAssignment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PropertyAssignment>;
}
export declare function isShorthandPropertyAssignment(node: Node): node is ShorthandPropertyAssignment;
export declare namespace isShorthandPropertyAssignment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ShorthandPropertyAssignment>;
}
export declare function isDeleteExpression(node: Node): node is DeleteExpression;
export declare namespace isDeleteExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, DeleteExpression>;
}
export declare function isTypeOfExpression(node: Node): node is TypeOfExpression;
export declare namespace isTypeOfExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TypeOfExpression>;
}
export declare function isVoidExpression(node: Node): node is VoidExpression;
export declare namespace isVoidExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, VoidExpression>;
}
export declare function isAwaitExpression(node: Node): node is AwaitExpression;
export declare namespace isAwaitExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AwaitExpression>;
}
export declare function isTypeAssertion(node: Node): node is TypeAssertion;
export declare namespace isTypeAssertion {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TypeAssertion>;
}
export declare function isKeywordTypeNode(node: Node): node is KeywordTypeNode;
export declare namespace isKeywordTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, KeywordTypeNode>;
}
export declare function isUnionTypeNode(node: Node): node is UnionTypeNode;
export declare namespace isUnionTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, UnionTypeNode>;
}
export declare function isIntersectionTypeNode(node: Node): node is IntersectionTypeNode;
export declare namespace isIntersectionTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, IntersectionTypeNode>;
}
export declare function isConditionalTypeNode(node: Node): node is ConditionalTypeNode;
export declare namespace isConditionalTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ConditionalTypeNode>;
}
export declare function isTypeOperatorNode(node: Node): node is TypeOperatorNode;
export declare namespace isTypeOperatorNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TypeOperatorNode>;
}
export declare function isInferTypeNode(node: Node): node is InferTypeNode;
export declare namespace isInferTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, InferTypeNode>;
}
export declare function isArrayTypeNode(node: Node): node is ArrayTypeNode;
export declare namespace isArrayTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ArrayTypeNode>;
}
export declare function isIndexedAccessTypeNode(node: Node): node is IndexedAccessTypeNode;
export declare namespace isIndexedAccessTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, IndexedAccessTypeNode>;
}
export declare function isTypeReferenceNode(node: Node): node is TypeReferenceNode;
export declare namespace isTypeReferenceNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TypeReferenceNode>;
}
export declare function isExpressionWithTypeArguments(node: Node): node is ExpressionWithTypeArguments;
export declare namespace isExpressionWithTypeArguments {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ExpressionWithTypeArguments>;
}
export declare function isLiteralTypeNode(node: Node): node is LiteralTypeNode;
export declare namespace isLiteralTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, LiteralTypeNode>;
}
export declare function isThisTypeNode(node: Node): node is ThisTypeNode;
export declare namespace isThisTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ThisTypeNode>;
}
export declare function isTypePredicateNode(node: Node): node is TypePredicateNode;
export declare namespace isTypePredicateNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TypePredicateNode>;
}
export declare function isImportAttribute(node: Node): node is ImportAttribute;
export declare namespace isImportAttribute {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ImportAttribute>;
}
export declare function isImportAttributes(node: Node): node is ImportAttributes;
export declare namespace isImportAttributes {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ImportAttributes>;
}
export declare function isTypeQueryNode(node: Node): node is TypeQueryNode;
export declare namespace isTypeQueryNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TypeQueryNode>;
}
export declare function isMappedTypeNode(node: Node): node is MappedTypeNode;
export declare namespace isMappedTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, MappedTypeNode>;
}
export declare function isTypeLiteralNode(node: Node): node is TypeLiteralNode;
export declare namespace isTypeLiteralNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TypeLiteralNode>;
}
export declare function isTupleTypeNode(node: Node): node is TupleTypeNode;
export declare namespace isTupleTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TupleTypeNode>;
}
export declare function isNamedTupleMember(node: Node): node is NamedTupleMember;
export declare namespace isNamedTupleMember {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NamedTupleMember>;
}
export declare function isOptionalTypeNode(node: Node): node is OptionalTypeNode;
export declare namespace isOptionalTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, OptionalTypeNode>;
}
export declare function isRestTypeNode(node: Node): node is RestTypeNode;
export declare namespace isRestTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, RestTypeNode>;
}
export declare function isParenthesizedTypeNode(node: Node): node is ParenthesizedTypeNode;
export declare namespace isParenthesizedTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ParenthesizedTypeNode>;
}
export declare function isFunctionTypeNode(node: Node): node is FunctionTypeNode;
export declare namespace isFunctionTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, FunctionTypeNode>;
}
export declare function isConstructorTypeNode(node: Node): node is ConstructorTypeNode;
export declare namespace isConstructorTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ConstructorTypeNode>;
}
export declare function isTemplateHead(node: Node): node is TemplateHead;
export declare namespace isTemplateHead {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateHead>;
}
export declare function isTemplateMiddle(node: Node): node is TemplateMiddle;
export declare namespace isTemplateMiddle {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateMiddle>;
}
export declare function isTemplateTail(node: Node): node is TemplateTail;
export declare namespace isTemplateTail {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateTail>;
}
export declare function isTemplateLiteralTypeNode(node: Node): node is TemplateLiteralTypeNode;
export declare namespace isTemplateLiteralTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateLiteralTypeNode>;
}
export declare function isTemplateLiteralTypeSpan(node: Node): node is TemplateLiteralTypeSpan;
export declare namespace isTemplateLiteralTypeSpan {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateLiteralTypeSpan>;
}
export declare function isSyntheticExpression(node: Node): node is SyntheticExpression;
export declare namespace isSyntheticExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SyntheticExpression>;
}
export declare function isPartiallyEmittedExpression(node: Node): node is PartiallyEmittedExpression;
export declare namespace isPartiallyEmittedExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PartiallyEmittedExpression>;
}
export declare function isJsxElement(node: Node): node is JsxElement;
export declare namespace isJsxElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxElement>;
}
export declare function isJsxAttributes(node: Node): node is JsxAttributes;
export declare namespace isJsxAttributes {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxAttributes>;
}
export declare function isJsxNamespacedName(node: Node): node is JsxNamespacedName;
export declare namespace isJsxNamespacedName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxNamespacedName>;
}
export declare function isJsxOpeningElement(node: Node): node is JsxOpeningElement;
export declare namespace isJsxOpeningElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxOpeningElement>;
}
export declare function isJsxSelfClosingElement(node: Node): node is JsxSelfClosingElement;
export declare namespace isJsxSelfClosingElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxSelfClosingElement>;
}
export declare function isJsxFragment(node: Node): node is JsxFragment;
export declare namespace isJsxFragment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxFragment>;
}
export declare function isJsxOpeningFragment(node: Node): node is JsxOpeningFragment;
export declare namespace isJsxOpeningFragment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxOpeningFragment>;
}
export declare function isJsxClosingFragment(node: Node): node is JsxClosingFragment;
export declare namespace isJsxClosingFragment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxClosingFragment>;
}
export declare function isJsxAttribute(node: Node): node is JsxAttribute;
export declare namespace isJsxAttribute {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxAttribute>;
}
export declare function isJsxSpreadAttribute(node: Node): node is JsxSpreadAttribute;
export declare namespace isJsxSpreadAttribute {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxSpreadAttribute>;
}
export declare function isJsxClosingElement(node: Node): node is JsxClosingElement;
export declare namespace isJsxClosingElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxClosingElement>;
}
export declare function isJsxExpression(node: Node): node is JsxExpression;
export declare namespace isJsxExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxExpression>;
}
export declare function isJsxText(node: Node): node is JsxText;
export declare namespace isJsxText {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxText>;
}
export declare function isSyntaxList(node: Node): node is SyntaxList;
export declare namespace isSyntaxList {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SyntaxList>;
}
export declare function isJSDoc(node: Node): node is JSDoc;
export declare namespace isJSDoc {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDoc>;
}
export declare function isJSDocTypeExpression(node: Node): node is JSDocTypeExpression;
export declare namespace isJSDocTypeExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocTypeExpression>;
}
export declare function isJSDocNonNullableType(node: Node): node is JSDocNonNullableType;
export declare namespace isJSDocNonNullableType {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocNonNullableType>;
}
export declare function isJSDocNullableType(node: Node): node is JSDocNullableType;
export declare namespace isJSDocNullableType {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocNullableType>;
}
export declare function isJSDocAllType(node: Node): node is JSDocAllType;
export declare namespace isJSDocAllType {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocAllType>;
}
export declare function isJSDocVariadicType(node: Node): node is JSDocVariadicType;
export declare namespace isJSDocVariadicType {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocVariadicType>;
}
export declare function isJSDocOptionalType(node: Node): node is JSDocOptionalType;
export declare namespace isJSDocOptionalType {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocOptionalType>;
}
export declare function isJSDocTypeTag(node: Node): node is JSDocTypeTag;
export declare namespace isJSDocTypeTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocTypeTag>;
}
export declare function isJSDocUnknownTag(node: Node): node is JSDocUnknownTag;
export declare namespace isJSDocUnknownTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocUnknownTag>;
}
export declare function isJSDocTemplateTag(node: Node): node is JSDocTemplateTag;
export declare namespace isJSDocTemplateTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocTemplateTag>;
}
export declare function isJSDocReturnTag(node: Node): node is JSDocReturnTag;
export declare namespace isJSDocReturnTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocReturnTag>;
}
export declare function isJSDocPublicTag(node: Node): node is JSDocPublicTag;
export declare namespace isJSDocPublicTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocPublicTag>;
}
export declare function isJSDocPrivateTag(node: Node): node is JSDocPrivateTag;
export declare namespace isJSDocPrivateTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocPrivateTag>;
}
export declare function isJSDocProtectedTag(node: Node): node is JSDocProtectedTag;
export declare namespace isJSDocProtectedTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocProtectedTag>;
}
export declare function isJSDocReadonlyTag(node: Node): node is JSDocReadonlyTag;
export declare namespace isJSDocReadonlyTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocReadonlyTag>;
}
export declare function isJSDocOverrideTag(node: Node): node is JSDocOverrideTag;
export declare namespace isJSDocOverrideTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocOverrideTag>;
}
export declare function isJSDocDeprecatedTag(node: Node): node is JSDocDeprecatedTag;
export declare namespace isJSDocDeprecatedTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocDeprecatedTag>;
}
export declare function isJSDocSeeTag(node: Node): node is JSDocSeeTag;
export declare namespace isJSDocSeeTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocSeeTag>;
}
export declare function isJSDocImplementsTag(node: Node): node is JSDocImplementsTag;
export declare namespace isJSDocImplementsTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocImplementsTag>;
}
export declare function isJSDocAugmentsTag(node: Node): node is JSDocAugmentsTag;
export declare namespace isJSDocAugmentsTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocAugmentsTag>;
}
export declare function isJSDocSatisfiesTag(node: Node): node is JSDocSatisfiesTag;
export declare namespace isJSDocSatisfiesTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocSatisfiesTag>;
}
export declare function isJSDocThrowsTag(node: Node): node is JSDocThrowsTag;
export declare namespace isJSDocThrowsTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocThrowsTag>;
}
export declare function isJSDocThisTag(node: Node): node is JSDocThisTag;
export declare namespace isJSDocThisTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocThisTag>;
}
export declare function isJSDocImportTag(node: Node): node is JSDocImportTag;
export declare namespace isJSDocImportTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocImportTag>;
}
export declare function isJSDocCallbackTag(node: Node): node is JSDocCallbackTag;
export declare namespace isJSDocCallbackTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocCallbackTag>;
}
export declare function isJSDocOverloadTag(node: Node): node is JSDocOverloadTag;
export declare namespace isJSDocOverloadTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocOverloadTag>;
}
export declare function isJSDocTypedefTag(node: Node): node is JSDocTypedefTag;
export declare namespace isJSDocTypedefTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocTypedefTag>;
}
export declare function isJSDocSignature(node: Node): node is JSDocSignature;
export declare namespace isJSDocSignature {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocSignature>;
}
export declare function isJSDocNameReference(node: Node): node is JSDocNameReference;
export declare namespace isJSDocNameReference {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocNameReference>;
}
export declare function isSourceFile(node: Node): node is SourceFile;
export declare namespace isSourceFile {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SourceFile>;
}
export declare function isModuleDeclaration(node: Node): node is ModuleDeclaration;
export declare namespace isModuleDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ModuleDeclaration>;
}
export declare function isImportEqualsDeclaration(node: Node): node is ImportEqualsDeclaration;
export declare namespace isImportEqualsDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ImportEqualsDeclaration>;
}
export declare function isExportDeclaration(node: Node): node is ExportDeclaration;
export declare namespace isExportDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ExportDeclaration>;
}
export declare function isImportTypeNode(node: Node): node is ImportTypeNode;
export declare namespace isImportTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ImportTypeNode>;
}
export declare function isImportClause(node: Node): node is ImportClause;
export declare namespace isImportClause {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ImportClause>;
}
export declare function isImportSpecifier(node: Node): node is ImportSpecifier;
export declare namespace isImportSpecifier {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ImportSpecifier>;
}
export declare function isJSDocText(node: Node): node is JSDocText;
export declare namespace isJSDocText {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocText>;
}
export declare function isJSDocLink(node: Node): node is JSDocLink;
export declare namespace isJSDocLink {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocLink>;
}
export declare function isJSDocLinkPlain(node: Node): node is JSDocLinkPlain;
export declare namespace isJSDocLinkPlain {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocLinkPlain>;
}
export declare function isJSDocLinkCode(node: Node): node is JSDocLinkCode;
export declare namespace isJSDocLinkCode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocLinkCode>;
}
export declare function isTypeParameterDeclaration(node: Node): node is TypeParameterDeclaration;
export declare namespace isTypeParameterDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TypeParameterDeclaration>;
}
export declare function isSyntheticReferenceExpression(node: Node): node is SyntheticReferenceExpression;
export declare namespace isSyntheticReferenceExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SyntheticReferenceExpression>;
}
export declare function isJSDocTypeLiteral(node: Node): node is JSDocTypeLiteral;
export declare namespace isJSDocTypeLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocTypeLiteral>;
}
export declare function isForInStatement(node: Node): node is ForInStatement;
export declare namespace isForInStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ForInStatement>;
}
export declare function isForOfStatement(node: Node): node is ForOfStatement;
export declare namespace isForOfStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ForOfStatement>;
}
export declare function isCaseClause(node: Node): node is CaseClause;
export declare namespace isCaseClause {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, CaseClause>;
}
export declare function isDefaultClause(node: Node): node is DefaultClause;
export declare namespace isDefaultClause {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, DefaultClause>;
}
export declare function isObjectBindingPattern(node: Node): node is ObjectBindingPattern;
export declare namespace isObjectBindingPattern {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ObjectBindingPattern>;
}
export declare function isArrayBindingPattern(node: Node): node is ArrayBindingPattern;
export declare namespace isArrayBindingPattern {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ArrayBindingPattern>;
}
export declare function isJSDocParameterTag(node: Node): node is JSDocParameterTag;
export declare namespace isJSDocParameterTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocParameterTag>;
}
export declare function isJSDocPropertyTag(node: Node): node is JSDocPropertyTag;
export declare namespace isJSDocPropertyTag {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocPropertyTag>;
}
export declare function isHeritageClauseElement(node: Node): node is HeritageClauseElement;
export declare namespace isHeritageClauseElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, HeritageClauseElement>;
}
export declare function isAccessExpression(node: Node): node is AccessExpression;
export declare namespace isAccessExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AccessExpression>;
}
export declare function isDeclarationName(node: Node): node is DeclarationName;
export declare namespace isDeclarationName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, DeclarationName>;
}
export declare function isModuleName(node: Node): node is ModuleName;
export declare namespace isModuleName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ModuleName>;
}
export declare function isModuleExportName(node: Node): node is ModuleExportName;
export declare namespace isModuleExportName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ModuleExportName>;
}
export declare function isPropertyName(node: Node): node is PropertyName;
export declare namespace isPropertyName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PropertyName>;
}
export declare function isModuleBody(node: Node): node is ModuleBody;
export declare namespace isModuleBody {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ModuleBody>;
}
export declare function isJSDocFullName(node: Node): node is JSDocFullName;
export declare namespace isJSDocFullName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocFullName>;
}
export declare function isModuleReference(node: Node): node is ModuleReference;
export declare namespace isModuleReference {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ModuleReference>;
}
export declare function isNamedImportBindings(node: Node): node is NamedImportBindings;
export declare namespace isNamedImportBindings {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NamedImportBindings>;
}
export declare function isNamedExportBindings(node: Node): node is NamedExportBindings;
export declare namespace isNamedExportBindings {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NamedExportBindings>;
}
export declare function isMemberName(node: Node): node is MemberName;
export declare namespace isMemberName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, MemberName>;
}
export declare function isEntityName(node: Node): node is EntityName;
export declare namespace isEntityName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, EntityName>;
}
export declare function isBindingName(node: Node): node is BindingName;
export declare namespace isBindingName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, BindingName>;
}
export declare function isModifierLike(node: Node): node is ModifierLike;
export declare namespace isModifierLike {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ModifierLike>;
}
export declare function isJsxChild(node: Node): node is JsxChild;
export declare namespace isJsxChild {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxChild>;
}
export declare function isJsxAttributeLike(node: Node): node is JsxAttributeLike;
export declare namespace isJsxAttributeLike {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxAttributeLike>;
}
export declare function isJsxAttributeName(node: Node): node is JsxAttributeName;
export declare namespace isJsxAttributeName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxAttributeName>;
}
export declare function isJsxAttributeValue(node: Node): node is JsxAttributeValue;
export declare namespace isJsxAttributeValue {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxAttributeValue>;
}
export declare function isClassLikeDeclaration(node: Node): node is ClassLikeDeclaration;
export declare namespace isClassLikeDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ClassLikeDeclaration>;
}
export declare function isAccessorDeclaration(node: Node): node is AccessorDeclaration;
export declare namespace isAccessorDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AccessorDeclaration>;
}
export declare function isLiteralLikeNode(node: Node): node is LiteralLikeNode;
export declare namespace isLiteralLikeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, LiteralLikeNode>;
}
export declare function isLiteralExpression(node: Node): node is LiteralExpression;
export declare namespace isLiteralExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, LiteralExpression>;
}
export declare function isUnionOrIntersectionTypeNode(node: Node): node is UnionOrIntersectionTypeNode;
export declare namespace isUnionOrIntersectionTypeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, UnionOrIntersectionTypeNode>;
}
export declare function isTemplateLiteralLikeNode(node: Node): node is TemplateLiteralLikeNode;
export declare namespace isTemplateLiteralLikeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateLiteralLikeNode>;
}
export declare function isTemplateMiddleOrTail(node: Node): node is TemplateMiddleOrTail;
export declare namespace isTemplateMiddleOrTail {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateMiddleOrTail>;
}
export declare function isTemplateLiteral(node: Node): node is TemplateLiteral;
export declare namespace isTemplateLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateLiteral>;
}
export declare function isTypePredicateParameterName(node: Node): node is TypePredicateParameterName;
export declare namespace isTypePredicateParameterName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TypePredicateParameterName>;
}
export declare function isImportAttributeName(node: Node): node is ImportAttributeName;
export declare namespace isImportAttributeName {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ImportAttributeName>;
}
export declare function isJSDocComment(node: Node): node is JSDocComment;
export declare namespace isJSDocComment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JSDocComment>;
}
export declare function isSignatureDeclaration(node: Node): node is SignatureDeclaration;
export declare namespace isSignatureDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SignatureDeclaration>;
}
export declare function isStringLiteralLikeNode(node: Node): node is StringLiteralLikeNode;
export declare namespace isStringLiteralLikeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, StringLiteralLikeNode>;
}
export declare function isNumericOrStringLikeLiteral(node: Node): node is NumericOrStringLikeLiteral;
export declare namespace isNumericOrStringLikeLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NumericOrStringLikeLiteral>;
}
export declare function isObjectLiteralLikeNode(node: Node): node is ObjectLiteralLikeNode;
export declare namespace isObjectLiteralLikeNode {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ObjectLiteralLikeNode>;
}
export declare function isObjectTypeDeclaration(node: Node): node is ObjectTypeDeclaration;
export declare namespace isObjectTypeDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ObjectTypeDeclaration>;
}
export declare function isJsxOpeningLikeElement(node: Node): node is JsxOpeningLikeElement;
export declare namespace isJsxOpeningLikeElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, JsxOpeningLikeElement>;
}
export declare function isNamedImportsOrExports(node: Node): node is NamedImportsOrExports;
export declare namespace isNamedImportsOrExports {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NamedImportsOrExports>;
}
export declare function isBreakOrContinueStatement(node: Node): node is BreakOrContinueStatement;
export declare namespace isBreakOrContinueStatement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, BreakOrContinueStatement>;
}
export declare function isCallLikeExpression(node: Node): node is CallLikeExpression;
export declare namespace isCallLikeExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, CallLikeExpression>;
}
export declare function isFunctionLikeDeclaration(node: Node): node is FunctionLikeDeclaration;
export declare namespace isFunctionLikeDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, FunctionLikeDeclaration>;
}
export declare function isVariableOrParameterDeclaration(node: Node): node is VariableOrParameterDeclaration;
export declare namespace isVariableOrParameterDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, VariableOrParameterDeclaration>;
}
export declare function isVariableOrPropertyDeclaration(node: Node): node is VariableOrPropertyDeclaration;
export declare namespace isVariableOrPropertyDeclaration {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, VariableOrPropertyDeclaration>;
}
export declare function isCallOrNewExpression(node: Node): node is CallOrNewExpression;
export declare namespace isCallOrNewExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, CallOrNewExpression>;
}
export declare function isImportClauseOrBindingPattern(node: Node): node is ImportClauseOrBindingPattern;
export declare namespace isImportClauseOrBindingPattern {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ImportClauseOrBindingPattern>;
}
export declare function isAnyImportSyntax(node: Node): node is AnyImportSyntax;
export declare namespace isAnyImportSyntax {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AnyImportSyntax>;
}
export declare function isArrayBindingElement(node: Node): node is ArrayBindingElement;
export declare namespace isArrayBindingElement {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ArrayBindingElement>;
}
export declare function isAssertionExpression(node: Node): node is AssertionExpression;
export declare namespace isAssertionExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AssertionExpression>;
}
export declare function isBooleanLiteral(node: Node): node is BooleanLiteral;
export declare namespace isBooleanLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, BooleanLiteral>;
}
export declare function isDestructuringAssignment(node: Node): node is DestructuringAssignment;
export declare namespace isDestructuringAssignment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, DestructuringAssignment>;
}
export declare function isLiteralToken(node: Node): node is LiteralToken;
export declare namespace isLiteralToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, LiteralToken>;
}
export declare function isModifier(node: Node): node is Modifier;
export declare namespace isModifier {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, Modifier>;
}
export declare function isObjectLiteralElementLike(node: Node): node is ObjectLiteralElementLike;
export declare namespace isObjectLiteralElementLike {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ObjectLiteralElementLike>;
}
export declare function isPropertyNameLiteral(node: Node): node is PropertyNameLiteral;
export declare namespace isPropertyNameLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PropertyNameLiteral>;
}
export declare function isPseudoLiteralToken(node: Node): node is PseudoLiteralToken;
export declare namespace isPseudoLiteralToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PseudoLiteralToken>;
}
export declare function isTemplateLiteralToken(node: Node): node is TemplateLiteralToken;
export declare namespace isTemplateLiteralToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TemplateLiteralToken>;
}
export declare function isArrayDestructuringAssignment(node: Node): node is ArrayDestructuringAssignment;
export declare namespace isArrayDestructuringAssignment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ArrayDestructuringAssignment>;
}
export declare function isObjectDestructuringAssignment(node: Node): node is ObjectDestructuringAssignment;
export declare namespace isObjectDestructuringAssignment {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ObjectDestructuringAssignment>;
}
export declare function isFunctionBody(node: Node): node is FunctionBody;
export declare namespace isFunctionBody {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, FunctionBody>;
}
export declare function isTriviaKind(kind: SyntaxKind): kind is TriviaSyntaxKind;
export declare function isPseudoLiteralKind(kind: SyntaxKind): kind is PseudoLiteralSyntaxKind;
export declare function isModifierKind(kind: SyntaxKind): kind is ModifierSyntaxKind;
export declare function isKeywordTypeKind(kind: SyntaxKind): kind is KeywordTypeSyntaxKind;
export declare function isKeywordExpressionKind(kind: SyntaxKind): kind is KeywordExpressionSyntaxKind;
export declare function isJsxTokenKind(kind: SyntaxKind): kind is JsxTokenSyntaxKind;
export declare function isImportPhaseModifierKind(kind: SyntaxKind): kind is ImportPhaseModifierSyntaxKind;
export declare function isPostfixUnaryOperator(kind: SyntaxKind): kind is PostfixUnaryOperator;
export declare function isPrefixUnaryOperator(kind: SyntaxKind): kind is PrefixUnaryOperator;
export declare function isAssignmentOperator(kind: SyntaxKind): kind is AssignmentOperator;
export declare function isBinaryOperator(kind: SyntaxKind): kind is BinaryOperator;
export declare function isExponentiationOperator(kind: SyntaxKind): kind is ExponentiationOperator;
export declare function isMultiplicativeOperator(kind: SyntaxKind): kind is MultiplicativeOperator;
export declare function isMultiplicativeOperatorOrHigher(kind: SyntaxKind): kind is MultiplicativeOperatorOrHigher;
export declare function isAdditiveOperator(kind: SyntaxKind): kind is AdditiveOperator;
export declare function isAdditiveOperatorOrHigher(kind: SyntaxKind): kind is AdditiveOperatorOrHigher;
export declare function isShiftOperator(kind: SyntaxKind): kind is ShiftOperator;
export declare function isShiftOperatorOrHigher(kind: SyntaxKind): kind is ShiftOperatorOrHigher;
export declare function isRelationalOperator(kind: SyntaxKind): kind is RelationalOperator;
export declare function isRelationalOperatorOrHigher(kind: SyntaxKind): kind is RelationalOperatorOrHigher;
export declare function isEqualityOperator(kind: SyntaxKind): kind is EqualityOperator;
export declare function isEqualityOperatorOrHigher(kind: SyntaxKind): kind is EqualityOperatorOrHigher;
export declare function isBitwiseOperator(kind: SyntaxKind): kind is BitwiseOperator;
export declare function isBitwiseOperatorOrHigher(kind: SyntaxKind): kind is BitwiseOperatorOrHigher;
export declare function isLogicalOperator(kind: SyntaxKind): kind is LogicalOperator;
export declare function isLogicalOperatorOrHigher(kind: SyntaxKind): kind is LogicalOperatorOrHigher;
export declare function isCompoundAssignmentOperator(kind: SyntaxKind): kind is CompoundAssignmentOperator;
export declare function isAssignmentOperatorOrHigher(kind: SyntaxKind): kind is AssignmentOperatorOrHigher;
export declare function isLogicalOrCoalescingAssignmentOperator(kind: SyntaxKind): kind is LogicalOrCoalescingAssignmentOperator;
export declare function isLiteralKind(kind: SyntaxKind): boolean;
export declare function isPunctuationKind(kind: SyntaxKind): boolean;
export declare function isKeywordKind(kind: SyntaxKind): boolean;
export declare function isTokenKind(kind: SyntaxKind): boolean;
export declare function isJSDocNodeKind(kind: SyntaxKind): boolean;
export declare function isEndOfFile(node: Node): node is EndOfFile;
export declare namespace isEndOfFile {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, EndOfFile>;
}
export declare function isDotToken(node: Node): node is DotToken;
export declare namespace isDotToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, DotToken>;
}
export declare function isDotDotDotToken(node: Node): node is DotDotDotToken;
export declare namespace isDotDotDotToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, DotDotDotToken>;
}
export declare function isQuestionToken(node: Node): node is QuestionToken;
export declare namespace isQuestionToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, QuestionToken>;
}
export declare function isExclamationToken(node: Node): node is ExclamationToken;
export declare namespace isExclamationToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ExclamationToken>;
}
export declare function isColonToken(node: Node): node is ColonToken;
export declare namespace isColonToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ColonToken>;
}
export declare function isEqualsToken(node: Node): node is EqualsToken;
export declare namespace isEqualsToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, EqualsToken>;
}
export declare function isAsteriskToken(node: Node): node is AsteriskToken;
export declare namespace isAsteriskToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AsteriskToken>;
}
export declare function isEqualsGreaterThanToken(node: Node): node is EqualsGreaterThanToken;
export declare namespace isEqualsGreaterThanToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, EqualsGreaterThanToken>;
}
export declare function isPlusToken(node: Node): node is PlusToken;
export declare namespace isPlusToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PlusToken>;
}
export declare function isMinusToken(node: Node): node is MinusToken;
export declare namespace isMinusToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, MinusToken>;
}
export declare function isQuestionDotToken(node: Node): node is QuestionDotToken;
export declare namespace isQuestionDotToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, QuestionDotToken>;
}
export declare function isAssertsKeyword(node: Node): node is AssertsKeyword;
export declare namespace isAssertsKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AssertsKeyword>;
}
export declare function isAssertKeyword(node: Node): node is AssertKeyword;
export declare namespace isAssertKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AssertKeyword>;
}
export declare function isAwaitKeyword(node: Node): node is AwaitKeyword;
export declare namespace isAwaitKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AwaitKeyword>;
}
export declare function isCaseKeyword(node: Node): node is CaseKeyword;
export declare namespace isCaseKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, CaseKeyword>;
}
export declare function isAbstractKeyword(node: Node): node is AbstractKeyword;
export declare namespace isAbstractKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AbstractKeyword>;
}
export declare function isAccessorKeyword(node: Node): node is AccessorKeyword;
export declare namespace isAccessorKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AccessorKeyword>;
}
export declare function isAsyncKeyword(node: Node): node is AsyncKeyword;
export declare namespace isAsyncKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AsyncKeyword>;
}
export declare function isConstKeyword(node: Node): node is ConstKeyword;
export declare namespace isConstKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ConstKeyword>;
}
export declare function isDeclareKeyword(node: Node): node is DeclareKeyword;
export declare namespace isDeclareKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, DeclareKeyword>;
}
export declare function isDefaultKeyword(node: Node): node is DefaultKeyword;
export declare namespace isDefaultKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, DefaultKeyword>;
}
export declare function isExportKeyword(node: Node): node is ExportKeyword;
export declare namespace isExportKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ExportKeyword>;
}
export declare function isInKeyword(node: Node): node is InKeyword;
export declare namespace isInKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, InKeyword>;
}
export declare function isPrivateKeyword(node: Node): node is PrivateKeyword;
export declare namespace isPrivateKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PrivateKeyword>;
}
export declare function isProtectedKeyword(node: Node): node is ProtectedKeyword;
export declare namespace isProtectedKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ProtectedKeyword>;
}
export declare function isPublicKeyword(node: Node): node is PublicKeyword;
export declare namespace isPublicKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, PublicKeyword>;
}
export declare function isReadonlyKeyword(node: Node): node is ReadonlyKeyword;
export declare namespace isReadonlyKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ReadonlyKeyword>;
}
export declare function isOutKeyword(node: Node): node is OutKeyword;
export declare namespace isOutKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, OutKeyword>;
}
export declare function isOverrideKeyword(node: Node): node is OverrideKeyword;
export declare namespace isOverrideKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, OverrideKeyword>;
}
export declare function isStaticKeyword(node: Node): node is StaticKeyword;
export declare namespace isStaticKeyword {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, StaticKeyword>;
}
export declare function isBinaryOperatorToken(node: Node): node is BinaryOperatorToken;
export declare namespace isBinaryOperatorToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, BinaryOperatorToken>;
}
export declare function isAssignmentOperatorToken(node: Node): node is AssignmentOperatorToken;
export declare namespace isAssignmentOperatorToken {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, AssignmentOperatorToken>;
}
export declare function isNullLiteral(node: Node): node is NullLiteral;
export declare namespace isNullLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, NullLiteral>;
}
export declare function isTrueLiteral(node: Node): node is TrueLiteral;
export declare namespace isTrueLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, TrueLiteral>;
}
export declare function isFalseLiteral(node: Node): node is FalseLiteral;
export declare namespace isFalseLiteral {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, FalseLiteral>;
}
export declare function isThisExpression(node: Node): node is ThisExpression;
export declare namespace isThisExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ThisExpression>;
}
export declare function isSuperExpression(node: Node): node is SuperExpression;
export declare namespace isSuperExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, SuperExpression>;
}
export declare function isImportExpression(node: Node): node is ImportExpression;
export declare namespace isImportExpression {
    function Handle<T extends NodeHandleLike<Node>>(node: T): node is SpecializeNodeHandle<T, ImportExpression>;
}
export {};
