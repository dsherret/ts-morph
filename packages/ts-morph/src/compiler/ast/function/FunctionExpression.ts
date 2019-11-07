import { ts } from "@ts-morph/common";
import { AsyncableNode, BodiedNode, GeneratorableNode, JSDocableNode, ModifierableNode, NameableNode, SignaturedDeclaration, TextInsertableNode,
    TypeParameteredNode } from "../base";
import { PrimaryExpression } from "../expression";
import { StatementedNode } from "../statement";

const createFunctionExpressionBase = <T extends typeof PrimaryExpression>(ctor: T) => JSDocableNode(
    TextInsertableNode(BodiedNode(AsyncableNode(GeneratorableNode(StatementedNode(
        TypeParameteredNode(SignaturedDeclaration(ModifierableNode(NameableNode(ctor))))
    )))))
);
export const FunctionExpressionBase = createFunctionExpressionBase(PrimaryExpression);
export class FunctionExpression extends FunctionExpressionBase<ts.FunctionExpression> {
}
