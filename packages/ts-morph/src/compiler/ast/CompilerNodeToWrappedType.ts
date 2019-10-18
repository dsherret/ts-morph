import { ts } from "@ts-morph/common";
import * as compiler from "./index";
import { CompilerCommentNode, CompilerCommentStatement, CompilerCommentClassElement, CompilerCommentObjectLiteralElement, CompilerCommentTypeElement,
    CompilerCommentEnumMember } from "./comment";
import { ImplementedKindToNodeMappings } from "./kindToNodeMappings";

export type CompilerNodeToWrappedType<T extends ts.Node> = T extends ts.ObjectDestructuringAssignment ? compiler.ObjectDestructuringAssignment
    : T extends ts.ArrayDestructuringAssignment ? compiler.ArrayDestructuringAssignment
    : T extends ts.SuperElementAccessExpression ? compiler.SuperElementAccessExpression
    : T extends ts.SuperPropertyAccessExpression ? compiler.SuperPropertyAccessExpression
    : T extends ts.AssignmentExpression<infer U> ? compiler.AssignmentExpression<ts.AssignmentExpression<U>>
    : T["kind"] extends keyof ImplementedKindToNodeMappings ? ImplementedKindToNodeMappings[T["kind"]]
    : T extends ts.SyntaxList ? compiler.SyntaxList
    : T extends ts.JSDocTypeExpression ? compiler.JSDocTypeExpression
    : T extends ts.JSDocType ? compiler.JSDocType
    : T extends ts.TypeNode ? compiler.TypeNode
    : T extends ts.JSDocTag ? compiler.JSDocTag
    : T extends ts.LiteralExpression ? compiler.LiteralExpression
    : T extends ts.PrimaryExpression ? compiler.PrimaryExpression
    : T extends ts.MemberExpression ? compiler.MemberExpression
    : T extends ts.LeftHandSideExpression ? compiler.LeftHandSideExpression
    : T extends ts.UpdateExpression ? compiler.UpdateExpression
    : T extends ts.UnaryExpression ? compiler.UnaryExpression
    : T extends ts.Expression ? compiler.Expression
    : T extends ts.IterationStatement ? compiler.IterationStatement
    : T extends CompilerCommentStatement ? compiler.CommentStatement
    : T extends CompilerCommentClassElement ? compiler.CommentClassElement
    : T extends CompilerCommentTypeElement ? compiler.CommentTypeElement
    : T extends CompilerCommentObjectLiteralElement ? compiler.CommentObjectLiteralElement
    : T extends CompilerCommentEnumMember ? compiler.CommentEnumMember
    : T extends ts.TypeElement ? compiler.TypeElement
    : T extends ts.Statement ? compiler.Statement
    : T extends ts.ClassElement ? compiler.ClassElement
    : T extends ts.ObjectLiteralElement ? compiler.ObjectLiteralElement
    : compiler.Node<T>;
