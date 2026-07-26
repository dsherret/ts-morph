import { OuterExpressionKinds } from "../enums/outerExpressionKinds.enum";
import type { AsExpression, BindingPattern, BlockOrExpression, BooleanLiteral, ConciseBody, ExclamationToken, Expression, ExpressionWithTypeArguments, ForInitializer, Identifier, JSDocTypeExpression, JSDocTypeLiteral, JsxTagNameExpression, LeftHandSideExpression, LiteralExpression, MinusToken, ModuleDeclaration, Node, NonNullExpression, NullLiteral, ParenthesizedExpression, PartiallyEmittedExpression, PlusToken, PrefixUnaryExpression, QuestionToken, ReadonlyKeyword, SatisfiesExpression, Statement, TemplateMiddle, TemplateTail, ThisTypeNode, TypeAssertion, TypeNode, UnaryExpressionBase } from "./ast";
export * from "./is.generated";
type JSDocNamespaceDeclaration = ModuleDeclaration;
type WrappedExpression<T extends Expression> = ParenthesizedExpression | TypeAssertion | AsExpression | SatisfiesExpression | ExpressionWithTypeArguments | NonNullExpression | PartiallyEmittedExpression;
type OuterExpression = WrappedExpression<Expression>;
export declare function isTypeNode(node: Node): node is TypeNode;
export declare function isStatement(node: Node): node is Statement;
export declare function isExpression(node: Node): node is Expression;
export declare function isValidTypeOnlyAliasUseSite(useSite: Node): boolean;
export declare function isBlockOrExpression(node: Node): node is BlockOrExpression;
export declare function isLeftHandSideExpression(node: Node): node is LeftHandSideExpression;
export declare function skipPartiallyEmittedExpressions(node: Expression): Expression;
export declare function skipPartiallyEmittedExpressions(node: Node): Node;
export declare function isUnaryExpression(node: Node): node is UnaryExpressionBase;
/** @internal */
export declare function isOuterExpression(node: Node, kinds?: OuterExpressionKinds): node is OuterExpression;
/** @internal */
export declare function skipOuterExpressions<T extends Expression>(node: WrappedExpression<T>): T;
/** @internal */
export declare function skipOuterExpressions(node: Expression, kinds?: OuterExpressionKinds): Expression;
/** @internal */
export declare function skipOuterExpressions(node: Node, kinds?: OuterExpressionKinds): Node;
export declare function isBindingPattern(node: Node): node is BindingPattern;
export declare function isConciseBody(node: Node): node is ConciseBody;
export declare function isForInitializer(node: Node): node is ForInitializer;
export declare function isQuestionOrExclamationToken(node: Node): node is QuestionToken | ExclamationToken;
export declare function isIdentifierOrThisTypeNode(node: Node): node is Identifier | ThisTypeNode;
export declare function isReadonlyKeywordOrPlusOrMinusToken(node: Node): node is ReadonlyKeyword | PlusToken | MinusToken;
export declare function isQuestionOrPlusOrMinusToken(node: Node): node is QuestionToken | PlusToken | MinusToken;
export declare function isTemplateMiddleOrTemplateTail(node: Node): node is TemplateMiddle | TemplateTail;
export declare function isLiteralTypeLiteral(node: Node): node is NullLiteral | BooleanLiteral | LiteralExpression | PrefixUnaryExpression;
export declare function isIdentifierOrJSDocNamespaceDeclaration(node: Node): node is Identifier | JSDocNamespaceDeclaration;
export declare function isJSDocTypeExpressionOrJSDocTypeLiteral(node: Node): node is JSDocTypeExpression | JSDocTypeLiteral;
export declare function isJsxTagNameExpression(node: Node): node is JsxTagNameExpression;
//# sourceMappingURL=is.d.ts.map