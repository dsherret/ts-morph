import * as compiler from "./index";
import { ts } from "../../typescript";
import { ImplementedKindToNodeMappings } from "./kindToNodeMappings";

export type CompilerNodeToWrappedType<T extends ts.Node> =
    T extends ts.ObjectDestructuringAssignment ? compiler.ObjectDestructuringAssignment :
    T extends ts.ArrayDestructuringAssignment ? compiler.ArrayDestructuringAssignment :
    T extends ts.SuperElementAccessExpression ? compiler.SuperElementAccessExpression :
    T extends ts.SuperPropertyAccessExpression ? compiler.SuperPropertyAccessExpression :
    T extends ts.AssignmentExpression<infer U> ? compiler.AssignmentExpression<ts.AssignmentExpression<U>> :
    T["kind"] extends keyof ImplementedKindToNodeMappings ? ImplementedKindToNodeMappings[T["kind"]] :
    T extends ts.SyntaxList ? compiler.SyntaxList :
    T extends ts.JSDocTypeExpression ? compiler.JSDocTypeExpression :
    T extends ts.TypeNode ? compiler.TypeNode :
    T extends ts.TypeElement ? compiler.TypeElement :
    T extends ts.JSDocTag ? compiler.JSDocTag :
    T extends ts.LiteralExpression ? compiler.LiteralExpression :
    T extends ts.PrimaryExpression ? compiler.PrimaryExpression :
    T extends ts.MemberExpression ? compiler.MemberExpression :
    T extends ts.LeftHandSideExpression ? compiler.LeftHandSideExpression :
    T extends ts.UpdateExpression ? compiler.UpdateExpression :
    T extends ts.UnaryExpression ? compiler.UnaryExpression :
    T extends ts.Expression ? compiler.Expression :
    T extends ts.IterationStatement ? compiler.IterationStatement :
    T extends ts.Statement ? compiler.Statement :
    compiler.Node<T>;
